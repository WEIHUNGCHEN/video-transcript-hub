import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/integrations/supabase/types";

// Browser-side client. Reads the publishable (RLS-gated) key, which is safe to
// ship in the bundle. Never reference SUPABASE_SECRET_KEY from here.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

export const supabase = createClient();
