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

    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const startISO = startOfMonth.toISOString();

    const [
      totalProducts,
      totalOrders,
      esgotados,
      destaques,
      ultimos,
      faturamentoMesRows,
    ] = await Promise.all([
      supabaseAdmin.from("products").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("products").select("*", { count: "exact", head: true }).lte("estoque", 0),
      supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("is_featured", true),
      supabaseAdmin
        .from("orders")
        .select("id,customer_name,total_price,payment_status,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabaseAdmin
        .from("orders")
        .select("total_price")
        .eq("payment_status", "paid")
        .gte("created_at", startISO),
    ]);

    const pedidosPagosMes = (faturamentoMesRows.data ?? []).length;
    const faturamentoMes = (faturamentoMesRows.data ?? []).reduce(
      (acc: number, r: any) => acc + Number(r.total_price ?? 0),
      0,
    );

    return {
      totalProducts: totalProducts.count ?? 0,
      totalOrders: totalOrders.count ?? 0,
      esgotados: esgotados.count ?? 0,
      destaques: destaques.count ?? 0,
      pedidosPagosMes,
      faturamentoMes,
      ultimosPedidos: (ultimos.data ?? []).map((o: any) => ({
        id: o.id,
        customer_name: o.customer_name,
        total_price: Number(o.total_price),
        payment_status: o.payment_status,
        created_at: o.created_at,
      })),
    };
  });

