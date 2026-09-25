import type { Metadata } from "next";
import { redirect } from "next/navigation";

import DashboardShell from "@/components/DashboardShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard — Video Speed Reader",
  description: "Your Video Speed Reader transcripts dashboard.",
  robots: { index: false },
  twitter: { card: "summary" },
};

export default async function Page() {
  // Server-side auth gate: replaces the client-side RequireAuth guard the
  // Vite SPA used, so an unauthenticated request never renders the dashboard.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return <DashboardShell email={user.email ?? ""} />;
}
