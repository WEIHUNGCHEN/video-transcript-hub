"""
M1 worker: polls one job at a time, downloads the video, runs Whisper,
writes TXT back to job_sessions.subtitle_txt_content.

Started by distributor.py (one Popen per pending job). Reads JOB_ID from env.
Reads OPENAI_API_KEY / SUPABASE_URL / SUPABASE_SECRET_KEY from AWS Secrets
Manager — the EC2's IAM instance profile grants `secretsmanager:GetSecretValue`
on exactly those three secret names, so no credentials ever live on disk.

Every external call has a timeout. Without one, a stalled download or a hung
ffmpeg leaves the job in 'downloading' forever and the process never exits.
On any failure the job lands in 'failed' with a short reason in
jobs.error_message, which the /upload page shows.
"""
import os
import sys
import math
import subprocess
import tempfile
import traceback
from pathlib import Path

import boto3
from openai import OpenAI
from supabase import create_client

# Timeouts, in seconds. Generous enough for a long recording on a t3.small,
# short enough that a stuck job fails the same day.
DOWNLOAD_TIMEOUT = 1800  # 30 min
CONVERT_TIMEOUT = 1800  # 30 min
CHUNK_TIMEOUT = 600  # 10 min per chunk split
PROBE_TIMEOUT = 60
OPENAI_TIMEOUT = 600  # per Whisper request

# jobs.error_message is shown in the UI, so keep it short and readable.
ERROR_MESSAGE_LIMIT = 500


def _get_secret(client, name: str) -> str:
    """Fetch one Secrets Manager secret by name (returns the SecretString)."""
    return client.get_secret_value(SecretId=name)["SecretString"]


def _load_secrets() -> dict[str, str]:
    """Pull the three M1 secrets from AWS Secrets Manager."""
    sm = boto3.client("secretsmanager")
    return {
        "OPENAI_API_KEY": _get_secret(sm, "openai-api-key"),
        "SUPABASE_URL": _get_secret(sm, "supabase-url"),
        "SUPABASE_SECRET_KEY": _get_secret(sm, "supabase-secret-key"),
    }


_secrets = _load_secrets()
db = create_client(_secrets["SUPABASE_URL"], _secrets["SUPABASE_SECRET_KEY"])
openai_client = OpenAI(api_key=_secrets["OPENAI_API_KEY"], timeout=OPENAI_TIMEOUT, max_retries=2)

# OpenAI Whisper has a 25 MB file-size limit. 10 minutes of 64 kbps mono mp3 ~= 4.8 MB,
# safely under the limit. Long videos get split into 600-second chunks.
CHUNK_SECONDS = 600


class JobError(Exception):
    """A failure with a message worth showing the user."""


def run(cmd: list[str], *, timeout: int, what: str, capture: bool = True):
    """subprocess.run with a timeout and a user-facing error message."""
    try:
        return subprocess.run(cmd, check=True, timeout=timeout, capture_output=capture, text=capture)
    except subprocess.TimeoutExpired:
        raise JobError(f"{what} timed out after {timeout}s") from None
    except subprocess.CalledProcessError as e:
        tail = (e.stderr or "").strip().splitlines()[-3:]
        detail = " / ".join(tail) if tail else f"exit code {e.returncode}"
        raise JobError(f"{what} failed: {detail}") from None


def get_job(job_id: str) -> dict:
    return db.table("jobs").select("*").eq("id", job_id).single().execute().data


def update_job(job_id: str, **fields) -> None:
    db.table("jobs").update({**fields, "updated_at": "now()"}).eq("id", job_id).execute()


def update_session(session_id: str, **fields) -> None:
    db.table("job_sessions").update(fields).eq("id", session_id).execute()


def fail_job(job_id: str, message: str) -> None:
    update_job(job_id, status="failed", error_message=message[:ERROR_MESSAGE_LIMIT])


def download_video(url: str, dest_dir: Path) -> Path:
    """yt-dlp for URLs; pass through for local file paths."""
    if url.startswith(("http://", "https://")):
        out_template = str(dest_dir / "video.%(ext)s")
        run(
            ["yt-dlp", "--socket-timeout", "30", "--retries", "3", "-o", out_template, url],
            timeout=DOWNLOAD_TIMEOUT,
            what="download",
        )
        downloaded = sorted(dest_dir.glob("video.*"))
        if not downloaded:
            raise JobError("download produced no file — is the URL a direct media link?")
        return downloaded[0]
    return Path(url).expanduser().resolve()


def to_mp3(video_path: Path, dest_dir: Path) -> Path:
    """Convert any video/audio container to 64 kbps mono 16 kHz mp3 (Whisper-friendly)."""
    mp3 = dest_dir / "audio.mp3"
    run(
        [
            "ffmpeg", "-y", "-i", str(video_path),
            "-vn", "-ac", "1",
            "-ar", "16000", "-ab", "64k",
            "-acodec", "libmp3lame",
            str(mp3),
        ],
        timeout=CONVERT_TIMEOUT,
        what="audio conversion",
    )
    return mp3


def get_duration_seconds(audio_path: Path) -> float:
    out = run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(audio_path)],
        timeout=PROBE_TIMEOUT,
        what="duration probe",
    )
    return float(out.stdout.strip())


def split_chunks(mp3_path: Path, dest_dir: Path) -> list[Path]:
    """Split into CHUNK_SECONDS-second chunks (re-encode to keep sizes predictable)."""
    duration = get_duration_seconds(mp3_path)
    n_chunks = max(1, math.ceil(duration / CHUNK_SECONDS))
    chunks = []
    for i in range(n_chunks):
        chunk = dest_dir / f"chunk_{i:03d}.mp3"
        run(
            [
                "ffmpeg", "-y", "-i", str(mp3_path),
                "-ss", str(i * CHUNK_SECONDS),
                "-t", str(CHUNK_SECONDS),
                "-acodec", "libmp3lame",
                "-ab", "64k",
                str(chunk),
            ],
            timeout=CHUNK_TIMEOUT,
            what=f"splitting chunk {i + 1}/{n_chunks}",
        )
        chunks.append(chunk)
    return chunks


def transcribe_chunk(chunk_path: Path, language: str) -> str:
    try:
        with open(chunk_path, "rb") as f:
            return openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                response_format="text",
                language=language,
            )
    except Exception as e:
        raise JobError(f"transcription failed: {type(e).__name__}: {e}") from None


def process(job_id: str) -> None:
    job = get_job(job_id)
    session_id = job["current_session_id"]
    if not session_id:
        raise JobError("job has no session row")

    update_job(job_id, status="downloading")
    print(f"[{job_id}] downloading {job['video_source_url']}", flush=True)

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        video = download_video(job["video_source_url"], tmp_path)
        mp3 = to_mp3(video, tmp_path)

        update_job(job_id, status="transcribe")
        chunks = split_chunks(mp3, tmp_path)
        print(f"[{job_id}] transcribing {len(chunks)} chunk(s)", flush=True)

        full_text = "\n\n".join(transcribe_chunk(c, job["language"]) for c in chunks)

        update_session(session_id, subtitle_txt_content=full_text)
        update_job(job_id, status="done", error_message=None)

    print(f"[{job_id}] done — {len(full_text)} chars", flush=True)


def main() -> None:
    job_id = os.environ["JOB_ID"]
    try:
        process(job_id)
    except JobError as e:
        print(f"[{job_id}] failed: {e}", file=sys.stderr, flush=True)
        fail_job(job_id, str(e))
        sys.exit(1)
    except Exception as e:
        # Unexpected: log the whole trace for us, show the user one line.
        traceback.print_exc()
        fail_job(job_id, f"unexpected error: {type(e).__name__}: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
