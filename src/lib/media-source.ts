// Sources we know will fail, checked before a job is created so the user finds
// out in the form instead of waiting for the worker to give up.

type Check = { ok: true } | { ok: false; reason: string };

const DRM =
  "這個來源有 DRM 保護，無法下載。/ This source is DRM-protected and cannot be downloaded.";

const BLOCKED: { hosts: string[]; reason: string }[] = [
  {
    hosts: ["youtube.com", "youtu.be", "m.youtube.com", "music.youtube.com"],
    reason:
      "YouTube 會封鎖來自伺服器 IP 的下載，目前不支援。請改用直接媒體連結（mp3 / mp4）。/ " +
      "YouTube blocks downloads from server IPs. Use a direct media link instead.",
  },
  {
    hosts: ["spotify.com", "open.spotify.com"],
    reason:
      "Spotify 有 DRM 保護，無法下載。若是 podcast，可以改用原始 RSS feed 裡的 mp3 連結。/ " +
      "Spotify is DRM-protected. For a podcast, use the mp3 from its original RSS feed instead.",
  },
  {
    hosts: [
      "netflix.com",
      "disneyplus.com",
      "hulu.com",
      "primevideo.com",
      "hbomax.com",
      "max.com",
      "appletv.com",
      "music.apple.com",
      "kkbox.com",
    ],
    reason: DRM,
  },
  {
    hosts: ["instagram.com", "tiktok.com", "facebook.com", "fb.watch", "x.com", "twitter.com"],
    reason:
      "這個平台會擋伺服器端下載，目前不支援。請先把檔案下載下來，改用直接媒體連結。/ " +
      "This platform blocks server-side downloads. Use a direct media link instead.",
  },
];

export function checkMediaSource(raw: string): Check {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, reason: "網址格式不正確。/ That is not a valid URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      ok: false,
      reason: "只支援 http / https 連結。/ Only http and https links are supported.",
    };
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  for (const entry of BLOCKED) {
    if (entry.hosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))) {
      return { ok: false, reason: entry.reason };
    }
  }

  return { ok: true };
}
