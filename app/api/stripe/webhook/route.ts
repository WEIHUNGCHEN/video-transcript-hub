import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

// The webhook is the only thing that grants credits. The success page is UX:
// if the buyer closes the tab after paying, this still runs.
export async function POST(req: NextRequest) {
  // Raw body: Stripe signs the exact byte stream, so parsing JSON first would
  // break verification.
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) return new NextResponse("no signature", { status: 400 });

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("webhook signature verification failed", err);
    return new NextResponse("invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object;
  // Delayed payment methods can complete the session before the money clears.
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, unpaid: true });
  }

  const userId = session.metadata?.user_id;
  const productId = session.metadata?.product_id;
  const credits = Number(session.metadata?.credits);
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!userId || !productId || !credits || !paymentIntentId) {
    console.error("missing required fields", { userId, productId, credits, paymentIntentId });
    return new NextResponse("missing metadata", { status: 400 });
  }

  const svc = createServiceClient();

  // The ledger row lands first and is the source of truth. The unique index on
  // stripe_payment_intent_id is what makes a retried delivery a no-op.
  const { error: insertErr } = await svc.from("credit_transactions").insert({
    user_id: userId,
    amount: credits,
    type: "purchase",
    description: `Purchased ${credits} credits`,
    stripe_payment_intent_id: paymentIntentId,
  });
  if (insertErr) {
    if (insertErr.code === "23505") {
      // Already processed. 200, or Stripe keeps retrying a deliberate no-op.
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("insert failed", insertErr);
    return new NextResponse("db insert failed", { status: 500 });
  }

  const { data: profile } = await svc
    .from("profiles")
    .select("credits_balance")
    .eq("id", userId)
    .single();
  const newBalance = Number(profile?.credits_balance ?? 0) + credits;

  const { error: updateErr } = await svc
    .from("profiles")
    .update({ credits_balance: newBalance })
    .eq("id", userId);
  if (updateErr) {
    console.error("balance update failed", updateErr);
    return new NextResponse("balance update failed", { status: 500 });
  }

  return NextResponse.json({ received: true, credited: credits });
}
