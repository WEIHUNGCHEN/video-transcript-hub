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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
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

  const { session_id: sessionId } = await searchParams;

  // This page never grants credits — the webhook does. It only reports whether
  // this session's payment has been credited yet.
  return (
    <PurchaseSuccess
      initialBalance={Number(profile?.credits_balance ?? 0)}
      {...(sessionId ? { sessionId } : {})}
    />
  );
}
