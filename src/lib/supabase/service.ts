import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

// Service-role client for callers that are not a signed-in user — today, the
// Stripe webhook. It bypasses RLS, so every query must re-impose its own
// ownership filter.
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
}
