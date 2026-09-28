"use client";

import { useState } from "react";

export default function BuyCreditsButton({
  productId,
  disabled,
  label,
}: {
  productId: string;
  disabled?: boolean;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setError(null);

    const res = await fetch("/api/credits/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok || !body.url) {
      setBusy(false);
      setError(body.error ?? `Checkout failed (${res.status})`);
      return;
    }

    window.location.href = body.url;
  }

  return (
    <>
      <button
        onClick={buy}
        disabled={busy || disabled}
        className="btn-brand mt-6 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "前往 Stripe…" : label}
      </button>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </>
  );
}
