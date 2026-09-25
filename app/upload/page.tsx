import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import SignOutButton from "@/components/SignOutButton";
import UploadForm from "@/components/UploadForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "上傳影片 / Upload — Video Speed Reader",
  description: "Submit a video URL and get a transcript back.",
  robots: { index: false },
};

// Always read fresh rows: a job's status changes while the page is open.
export const dynamic = "force-dynamic";

type Job = {
  id: string;
  created_at: string;
  video_source_url: string;
  status: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-secondary text-muted-foreground",
  downloading: "bg-secondary text-muted-foreground",
  transcribe: "bg-accent/20 text-accent",
  done: "bg-primary/20 text-primary",
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function truncate(value: string, max = 50) {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data } = await supabase
    .from("jobs")
    .select("id, created_at, video_source_url, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const jobs = (data ?? []) as Job[];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/app" className="text-sm font-semibold tracking-tight sm:text-base">
            Video <span className="text-brand-gradient">Speed Reader</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[180px] truncate text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-10 px-4 py-10">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            上傳影片 / Upload a video
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste a direct media URL and we&apos;ll transcribe it in the background.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-muted-foreground">
            你的逐字稿 / Your transcriptions
          </h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 border-b border-border px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
              <span>Created</span>
              <span>URL</span>
              <span>Status</span>
              <span>Transcript</span>
            </div>
            {jobs.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No transcriptions yet. Submit your first video below.
              </p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b border-border/60 px-4 py-3 text-sm last:border-b-0"
                >
                  <span className="text-muted-foreground">{relativeTime(job.created_at)}</span>
                  <span className="truncate" title={job.video_source_url}>
                    {truncate(job.video_source_url)}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      STATUS_STYLES[job.status] ?? "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {job.status}
                  </span>
                  {job.status === "done" ? (
                    <a
                      href={`/api/jobs/${job.id}/transcript`}
                      download={`transcript-${job.id.slice(0, 8)}.txt`}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                      .txt
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <UploadForm />
      </main>
    </div>
  );
}
