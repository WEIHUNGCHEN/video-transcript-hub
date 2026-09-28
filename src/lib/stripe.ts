import Stripe from "stripe";

let client: Stripe | undefined;

// Built lazily: `next build` loads route modules to collect their config, and a
// module-level throw would fail the build on any machine without the key.
// Missing config still fails fast — on the first request that needs Stripe.
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is required");
    // Pin the API version: the SDK floats on every install and Stripe ships
    // breaking changes behind this pin.
    client = new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
  }
  return client;
}
