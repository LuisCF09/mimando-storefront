import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Acesso restrito à administradora.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [
      totalProducts,
      totalOrders,
      esgotados,
      destaques,
      ultimos,
    ] = await Promise.all([
      supabaseAdmin.from("products").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("disponivel", false),
      supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("is_featured", true),
      supabaseAdmin
        .from("orders")
        .select("id,customer_name,total_price,payment_status,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    return {
      totalProducts: totalProducts.count ?? 0,
      totalOrders: totalOrders.count ?? 0,
      esgotados: esgotados.count ?? 0,
      destaques: destaques.count ?? 0,
      ultimosPedidos: (ultimos.data ?? []).map((o: any) => ({
        id: o.id,
        customer_name: o.customer_name,
        total_price: Number(o.total_price),
        payment_status: o.payment_status,
        created_at: o.created_at,
      })),
    };
  });
