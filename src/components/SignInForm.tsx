"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthShell, Field } from "@/components/AuthShell";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/lib/supabase/client";

export default function SignIn() {

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/app");
  }

  return (
    <AuthShell
      title="歡迎回來"
      subtitle="Sign in to your Video Speed Reader account"
      footer={
        <>
          還沒有帳號？{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
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
