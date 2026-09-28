import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import BuyCreditsButton from "@/components/BuyCreditsButton";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "點數 / Credits — Video Speed Reader",
  description: "Your credit balance, top-up tiers and transaction history.",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

type Product = {
  id: string;
  name: string;
  credits: number;
  price_usd: number;
  stripe_price_id: string | null;
};

type Transaction = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
};

const TYPE_STYLES: Record<string, string> = {
  purchase: "text-primary",
  signup_bonus: "text-accent",
  deduction: "text-muted-foreground",
  admin_grant: "text-accent",
};

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: profile }, { data: productRows }, { data: txRows }] = await Promise.all([
    supabase.from("profiles").select("credits_balance").eq("id", user.id).maybeSingle(),
    supabase
      .from("credit_products")
      .select("id, name, credits, price_usd, stripe_price_id")
      .eq("active", true)
      .order("price_usd"),
    supabase
      .from("credit_transactions")
      .select("id, amount, type, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const balance = Number(profile?.credits_balance ?? 0);
  const products = (productRows ?? []) as Product[];
  const transactions = (txRows ?? []) as Transaction[];

  // The cheapest tier sets the baseline rate; anything better than it earns a
  // bonus badge, so the discount story is visible without hard-coding numbers.
  const baselineRate = products.length
    ? Math.max(...products.map((p) => Number(p.price_usd) / Number(p.credits)))
    : 0;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/app" className="text-sm font-semibold tracking-tight sm:text-base">
            Video <span className="text-brand-gradient">Speed Reader</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className="rounded-lg border border-border px-3 py-1.5 text-sm transition hover:bg-secondary"
            >
              上傳影片 / Upload
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-10 px-4 py-10">
        <section className="hero-glow rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">目前點數 / Your balance</p>
          <p className="mt-2 text-5xl font-semibold">{balance}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            1 點 = 1 分鐘影片 / 1 credit = 1 minute of video
          </p>
        </section>

        <section>
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            購買點數 / Buy credits
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {products.map((product) => {
              const credits = Number(product.credits);
              const price = Number(product.price_usd);
              const rate = price / credits;
              const bonusPct = baselineRate ? Math.round((1 - rate / baselineRate) * 100) : 0;

              return (
                <div
                  key={product.id}
                  className="flex h-full flex-col rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    {bonusPct > 0 && (
                      <span className="rounded-full bg-primary/20 px-2.5 py-1 text-xs font-medium text-primary">
                        +{bonusPct}%
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-3xl font-semibold">${price.toFixed(2)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {credits} 點 · ${rate.toFixed(3)} / 點
                  </p>
                  <div className="mt-auto">
                    <BuyCreditsButton
                      productId={product.id}
                      disabled={!product.stripe_price_id}
                      label={product.stripe_price_id ? "購買 / Buy" : "尚未開放 / Not linked"}
                    />
                    {!product.stripe_price_id && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        這個方案還沒連結 Stripe 價格。
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-muted-foreground">交易紀錄 / History</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
            {transactions.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No transactions yet.
              </p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-3 text-sm last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate">{tx.description ?? tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-medium ${TYPE_STYLES[tx.type] ?? "text-foreground"}`}
                  >
                    {Number(tx.amount) > 0 ? "+" : ""}
                    {Number(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
