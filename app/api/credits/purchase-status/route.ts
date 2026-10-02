import { NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

// Has this checkout session been credited yet? Answered by looking for the
// ledger row the webhook writes, not by watching the balance change — the
// webhook usually lands before the success page even renders, so a
// "balance went up while you watched" check never fires.
export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_balance")
    .eq("id", user.id)
    .maybeSingle();
  const creditsBalance = Number(profile?.credits_balance ?? 0);

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ settled: false, unknown: true, credits_balance: creditsBalance });
  }

  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "session not found" }, { status: 404 });
  }

  // Someone else's session id is none of this user's business.
  if (session.metadata?.user_id !== user.id) {
    return NextResponse.json({ error: "session not found" }, { status: 404 });
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!paymentIntentId) {
    return NextResponse.json({
      settled: false,
      payment_status: session.payment_status,
      credits_balance: creditsBalance,
    });
  }

  // RLS limits this to the caller's own rows.
  const { data: tx } = await supabase
    .from("credit_transactions")
    .select("amount")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  return NextResponse.json({
    settled: Boolean(tx),
    credited: tx ? Number(tx.amount) : null,
    payment_status: session.payment_status,
    credits_balance: creditsBalance,
  });
}
