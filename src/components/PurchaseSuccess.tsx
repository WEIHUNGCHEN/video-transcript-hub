"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Polls until the webhook has credited the account. Typical webhook latency is
// well under a second, but the buyer can land here first.
const POLL_MS = 2000;
const MAX_POLLS = 15;

export default function PurchaseSuccess({ initialBalance }: { initialBalance: number }) {
  const [balance, setBalance] = useState(initialBalance);
  const [settled, setSettled] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let polls = 0;
    const id = setInterval(async () => {
      polls += 1;
      try {
        const res = await fetch("/api/credits", { cache: "no-store" });
        const body = await res.json();
        if (typeof body.credits_balance === "number" && body.credits_balance > initialBalance) {
          setBalance(body.credits_balance);
          setSettled(true);
          clearInterval(id);
          return;
        }
      } catch {
        // Transient network error — keep polling until MAX_POLLS.
      }
      if (polls >= MAX_POLLS) {
        setGaveUp(true);
        clearInterval(id);
      }
    }, POLL_MS);

    return () => clearInterval(id);
  }, [initialBalance]);

  return (
    <main className="hero-glow flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {settled ? "付款完成 / Payment complete" : "確認付款中 / Confirming…"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {settled
            ? "點數已入帳。/ Your credits have landed."
            : "Stripe 正在通知我們，通常一兩秒。/ Waiting for Stripe to confirm."}
        </p>

        <p className="mt-8 text-5xl font-semibold">{balance}</p>
        <p className="mt-2 text-sm text-muted-foreground">目前點數 / credits</p>

        {gaveUp && !settled && (
          <p className="mt-6 text-sm text-destructive">
            還沒收到入帳通知。付款若已成功，點數通常很快就會到；稍後重新整理看看。/ No confirmation
            yet — if the payment went through, refresh in a moment.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/upload" className="btn-brand rounded-lg px-4 py-2.5 text-sm font-semibold">
            上傳影片 / Upload
          </Link>
          <Link
            href="/credits"
            className="rounded-lg border border-border px-4 py-2.5 text-sm transition hover:bg-secondary"
          >
            回到點數頁 / Credits
          </Link>
        </div>
      </div>
    </main>
  );
}
