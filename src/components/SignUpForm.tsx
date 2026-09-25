"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthShell, Field } from "@/components/AuthShell";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/lib/supabase/client";

export default function SignUp() {

  const router = useRouter();
  const { session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) router.replace("/app");
  }, [session, router]);

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
    if (data.session) router.replace("/app");
    else router.replace("/sign-in");
  }

  return (
    <AuthShell
      title="免費開始使用"
      subtitle="Create your account — no credit card required"
      footer={
        <>
          已經有帳號？{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
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
