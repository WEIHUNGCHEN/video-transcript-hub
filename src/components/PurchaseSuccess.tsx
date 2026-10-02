"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Settlement is decided by whether this checkout session has a ledger row, not
// by watching the balance climb: the webhook normally lands before this page
// renders, so a delta check would wait forever on a purchase that already
// succeeded.
const POLL_MS = 1500;
const MAX_POLLS = 20;

type State = "waiting" | "settled" | "timed-out";

export default function PurchaseSuccess({
  initialBalance,
  sessionId,
}: {
  initialBalance: number;
  sessionId?: string;
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [state, setState] = useState<State>(sessionId ? "waiting" : "settled");

  useEffect(() => {
    if (!sessionId) return;

    let polls = 0;
    let cancelled = false;

    async function check() {
      polls += 1;
      try {
        const res = await fetch(
          `/api/credits/purchase-status?session_id=${encodeURIComponent(sessionId!)}`,
          { cache: "no-store" },
        );
        const body = await res.json();
        if (cancelled) return;

        if (typeof body.credits_balance === "number") setBalance(body.credits_balance);
        if (body.settled) {
          setState("settled");
          return;
        }
      } catch {
        // Transient network error — keep polling until MAX_POLLS.
      }

      if (cancelled) return;
      if (polls >= MAX_POLLS) {
        setState("timed-out");
        return;
      }
      setTimeout(check, POLL_MS);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <main className="hero-glow flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {state === "waiting" ? "確認付款中 / Confirming…" : "付款完成 / Payment complete"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {state === "waiting"
            ? "Stripe 正在通知我們，通常一兩秒。/ Waiting for Stripe to confirm."
            : "點數已入帳。/ Your credits have landed."}
        </p>

        <p className="mt-8 text-5xl font-semibold">{balance}</p>
        <p className="mt-2 text-sm text-muted-foreground">目前點數 / credits</p>

        {state === "timed-out" && (
          <p className="mt-6 text-sm text-destructive">
            還沒收到這筆付款的入帳通知。款項若已扣，點數通常很快就會補上；稍後重新整理看看。/ No
            confirmation for this payment yet — refresh in a moment.
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
