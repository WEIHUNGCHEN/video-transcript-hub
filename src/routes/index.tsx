import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Languages, Timer, Download, ShieldCheck, Check } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Video Speed Reader — 影片轉逐字稿，三分鐘完成" },
      {
        name: "description",
        content:
          "Upload your video and get a clean, accurate transcript in three minutes. Export to TXT, SRT, or Markdown.",
      },
      { property: "og:title", content: "Video Speed Reader — 影片轉逐字稿，三分鐘完成" },
      {
        property: "og:description",
        content:
          "Upload your video and get a clean, accurate transcript in three minutes. Export to TXT, SRT, or Markdown.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const steps = [
  { title: "上傳影片", body: "Upload your video — MP4, MOV, or a link." },
  { title: "AI 自動轉寫", body: "AI transcribes it automatically, with speaker-clean text." },
  { title: "下載逐字稿", body: "Download or copy the transcript in one click." },
];

const features = [
  { icon: Languages, title: "高準確度中英辨識", body: "Accurate Chinese and English recognition, mixed in one pass." },
  { icon: Timer, title: "三分鐘內完成", body: "Most long-form recordings finish in under three minutes." },
  { icon: Download, title: "一鍵匯出 TXT / SRT / Markdown", body: "Export straight into your blog, course notes, or archive." },
  { icon: ShieldCheck, title: "隱私優先，處理完即刪除", body: "Files are deleted as soon as processing completes." },
];

function Landing() {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate({ to: "/app", replace: true });
  }, [session, navigate]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold tracking-tight sm:text-base">
            Video <span className="text-brand-gradient">Speed Reader</span>
          </span>
          <Link
            to="/signin"
            className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition hover:bg-secondary"
          >
            Sign in / 登入
          </Link>
        </div>
      </header>

      <main>
        <section className="hero-glow px-4 pb-20 pt-24 text-center sm:pt-32">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                Video <span className="text-brand-gradient">Speed Reader</span>
              </h1>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-6 text-xl font-medium sm:text-2xl">上傳影片，三分鐘內拿到逐字稿。</p>
              <p className="mt-2 text-base text-muted-foreground">
                Upload your video, get a clean transcript in three minutes.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <Link
                to="/signup"
                className="btn-brand mt-10 inline-flex rounded-xl px-8 py-4 text-base font-semibold"
              >
                免費開始使用 / Get started free
              </Link>
            </Reveal>
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="text-center text-3xl font-semibold tracking-tight">
                How it works / 運作方式
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, i) => (
                <Reveal key={step.title} delay={i * 120}>
                  <div className="h-full rounded-2xl border border-border bg-card p-6">
                    <span className="text-brand-gradient text-4xl font-semibold">{i + 1}</span>
                    <h3 className="mt-3 text-lg font-medium">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="text-center text-3xl font-semibold tracking-tight">
                Features / 功能特色
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {features.map((feature, i) => (
                <Reveal key={feature.title} delay={i * 100}>
                  <div className="h-full rounded-2xl border border-border bg-card p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 text-base font-medium">{feature.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{feature.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <h2 className="text-center text-3xl font-semibold tracking-tight">Pricing / 方案</h2>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Reveal>
                <div className="h-full rounded-2xl border border-border bg-card p-8">
                  <h3 className="text-lg font-medium">Free</h3>
                  <p className="mt-2 text-3xl font-semibold">NT$0</p>
                  <p className="mt-1 text-sm text-muted-foreground">每月 30 分鐘影片</p>
                  <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-primary" /> 中英逐字稿
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-primary" /> TXT 匯出
                    </li>
                  </ul>
                  <Link
                    to="/signup"
                    className="mt-8 block rounded-lg border border-border px-4 py-3 text-center text-sm font-medium transition hover:bg-secondary"
                  >
                    免費開始 / Start free
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="h-full rounded-2xl border border-primary/50 bg-card p-8">
                  <h3 className="text-lg font-medium">Pro</h3>
                  <p className="mt-2 text-3xl font-semibold">NT$299</p>
                  <p className="mt-1 text-sm text-muted-foreground">每月，無限影片</p>
                  <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-primary" /> 無限影片時數
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-primary" /> TXT / SRT / Markdown 匯出
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-primary" /> 優先處理佇列
                    </li>
                  </ul>
                  <Link
                    to="/signup"
                    className="btn-brand mt-8 block rounded-lg px-4 py-3 text-center text-sm font-semibold"
                  >
                    升級 Pro / Get Pro
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <span className="font-medium text-foreground">Video Speed Reader</span>
          <span>© {new Date().getFullYear()} Video Speed Reader. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="transition hover:text-foreground">
              隱私政策
            </a>
            <a href="#" className="transition hover:text-foreground">
              服務條款
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
