import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in / 登入 — Video Speed Reader" },
      {
        name: "description",
        content: "Sign in to Video Speed Reader and turn your videos into clean transcripts.",
      },
      { property: "og:title", content: "Sign in / 登入 — Video Speed Reader" },
      {
        property: "og:description",
        content: "Sign in to Video Speed Reader and turn your videos into clean transcripts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/app", replace: true });
  }, [session, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/app", replace: true });
  }

  return (
    <AuthShell
      title="歡迎回來"
      subtitle="Sign in to your Video Speed Reader account"
      footer={
        <>
          還沒有帳號？{" "}
          <Link to="/signup" className="text-primary hover:underline">
            免費註冊 / Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="密碼 / Password" type="password" value={password} onChange={setPassword} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="btn-brand w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {busy ? "登入中…" : "Sign in / 登入"}
        </button>
      </form>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="hero-glow flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Link to="/" className="mb-8 text-lg font-semibold tracking-tight">
        Video <span className="text-brand-gradient">Speed Reader</span>
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </main>
  );
}

export function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted-foreground">{label}</span>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}
