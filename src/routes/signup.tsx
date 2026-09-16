import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { AuthShell, Field } from "./signin";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "免費註冊 / Sign up — Video Speed Reader" },
      {
        name: "description",
        content: "Create a free Video Speed Reader account and get clean transcripts in minutes.",
      },
      { property: "og:title", content: "免費註冊 / Sign up — Video Speed Reader" },
      {
        property: "og:description",
        content: "Create a free Video Speed Reader account and get clean transcripts in minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/app` },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) navigate({ to: "/app", replace: true });
    else navigate({ to: "/signin", replace: true });
  }

  return (
    <AuthShell
      title="免費開始使用"
      subtitle="Create your account — no credit card required"
      footer={
        <>
          已經有帳號？{" "}
          <Link to="/signin" className="text-primary hover:underline">
            登入 / Sign in
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
          {busy ? "建立帳號中…" : "Create account / 註冊"}
        </button>
      </form>
    </AuthShell>
  );
}
