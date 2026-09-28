import { NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (!body.product_id) {
    return NextResponse.json({ error: "product_id required" }, { status: 400 });
  }

  const { data: product } = await supabase
    .from("credit_products")
    .select("id, name, credits, stripe_price_id, active")
    .eq("id", body.product_id)
    .eq("active", true)
    .maybeSingle();

  if (!product) {
    return NextResponse.json({ error: "product not found" }, { status: 400 });
  }
  if (!product.stripe_price_id) {
    return NextResponse.json(
      { error: "這個方案還沒連結 Stripe 價格。/ This tier has no Stripe price linked yet." },
      { status: 400 },
    );
  }

  // Built from the request origin so the same route keeps working when the
  // custom domain lands in M3.
  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: product.stripe_price_id, quantity: 1 }],
    success_url: `${origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/credits`,
    // The webhook has no other way to know who paid: Stripe knows nothing about
    // auth.users. Set server-side, from the authenticated session, so a buyer
    // cannot forge it.
    metadata: {
      user_id: user.id,
      product_id: product.id,
      credits: String(product.credits),
    },
    client_reference_id: user.id,
  });

  return NextResponse.json({ url: session.url });
}
