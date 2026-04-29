import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { ShopGrid } from "./ShopGrid";

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: products }, { data: txs }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: false })
      .order("price_points", { ascending: true }),
    supabase.from("point_transactions").select("amount").eq("trainer_id", user.id),
  ]);

  const balance = (txs ?? []).reduce(
    (sum, t) => sum + (t.amount as number),
    0,
  );

  return (
    <ShopGrid products={(products ?? []) as Product[]} balance={balance} />
  );
}
