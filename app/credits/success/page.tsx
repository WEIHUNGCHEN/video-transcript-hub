import type { Metadata } from "next";
import { redirect } from "next/navigation";

import PurchaseSuccess from "@/components/PurchaseSuccess";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "付款完成 / Payment complete — Video Speed Reader",
  description: "Your credit purchase is being confirmed.",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_balance")
    .eq("id", user.id)
    .maybeSingle();

  // This page never grants credits — the webhook does. It only waits for the
  // balance to move, so a buyer who closes the tab still gets credited.
  return <PurchaseSuccess initialBalance={Number(profile?.credits_balance ?? 0)} />;
}
