import { useQueryClient } from "@tanstack/react-query";
import { FileVideo } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentMeta } from "@/lib/use-document-meta";

export default function AppDashboard() {
  useDocumentMeta({
    title: "Dashboard — Video Speed Reader",
    description: "Your Video Speed Reader transcripts dashboard.",
    robots: "noindex",
    twitterCard: "summary",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const email = user?.email ?? "";

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/signin", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/app" className="text-sm font-semibold tracking-tight sm:text-base">
            Video <span className="text-brand-gradient">Speed Reader</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[180px] truncate text-sm text-muted-foreground sm:inline">
              {email}
            </span>
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-border px-3 py-1.5 text-sm transition hover:bg-secondary"
            >
              Sign out / 登出
            </button>
          </div>
        </div>
      </header>

      {/* Single column for v1; a sidebar can slot in beside <main> later. */}
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
        <main className="min-w-0 flex-1 space-y-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">嗨，{email}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back. Your transcripts will live here.
            </p>
          </div>

          <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <FileVideo className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-4 text-lg font-medium">還沒有任何影片</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload your first video to get a transcript.
            </p>
            <button
              disabled
              className="mt-5 cursor-not-allowed rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-muted-foreground"
            >
              上傳影片 / Upload video · Coming soon
            </button>
          </section>

          <section>
            <h2 className="text-sm font-medium text-muted-foreground">
              最近的逐字稿 / Recent transcripts
            </h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="grid grid-cols-3 gap-4 border-b border-border px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                <span>影片 / Video</span>
                <span>長度 / Length</span>
                <span>狀態 / Status</span>
              </div>
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No transcripts yet.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
