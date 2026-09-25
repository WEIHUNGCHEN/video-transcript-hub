"use client";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-lg border border-border px-3 py-1.5 text-sm transition hover:bg-secondary"
    >
      Sign out / 登出
    </button>
  );
}
