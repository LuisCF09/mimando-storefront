import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
};

export type Order = {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_cep: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_district: string;
  address_city: string;
  address_state: string;
  total_price: number;
  payment_status: "pending" | "paid" | "canceled" | "failed";
  payment_method: string;
  mercado_pago_preference_id: string | null;
  mercado_pago_payment_id: string | null;
  created_at: string;
  items: OrderItem[];
};

function mapOrder(o: any, items: any[]): Order {
  return {
    id: o.id,
    user_id: o.user_id,
    customer_name: o.customer_name,
    customer_email: o.customer_email,
    customer_phone: o.customer_phone,
    address_cep: o.address_cep,
    address_street: o.address_street,
    address_number: o.address_number,
    address_complement: o.address_complement ?? "",
    address_district: o.address_district,
    address_city: o.address_city,
    address_state: o.address_state,
    total_price: Number(o.total_price),
    payment_status: o.payment_status,
    payment_method: o.payment_method,
    mercado_pago_preference_id: o.mercado_pago_preference_id ?? null,
    mercado_pago_payment_id: o.mercado_pago_payment_id ?? null,
    created_at: o.created_at,
    items: items
      .filter((i: any) => i.order_id === o.id)
      .map((i: any) => ({
        id: i.id,
        product_id: i.product_id,
        product_name: i.product_name,
        product_price: Number(i.product_price),
        quantity: i.quantity,
        subtotal: Number(i.subtotal),
      })),
  };
}

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso restrito à administradora.");
}

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (orders ?? []).map((o: any) => o.id);
    let items: any[] = [];
    if (ids.length > 0) {
      const { data: it, error: ie } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", ids);
      if (ie) throw new Error(ie.message);
      items = it ?? [];
    }
    return (orders ?? []).map((o: any) => mapOrder(o, items));
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (orders ?? []).map((o: any) => o.id);
    let items: any[] = [];
    if (ids.length > 0) {
      const { data: it, error: ie } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", ids);
      if (ie) throw new Error(ie.message);
      items = it ?? [];
    }
    return (orders ?? []).map((o: any) => mapOrder(o, items));
  });

export const getOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) return null;
    const { data: items, error: ie } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", data.id);
    if (ie) throw new Error(ie.message);
    return mapOrder(order, items ?? []);
  });

export const getLatestOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) return null;
    const { data: items, error: ie } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    if (ie) throw new Error(ie.message);
    return mapOrder(order, items ?? []);
  });

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(8).max(30),
  address_cep: z.string().trim().min(8).max(15),
  address_street: z.string().trim().min(2).max(200),
  address_number: z.string().trim().min(1).max(20),
  address_complement: z.string().trim().max(120).default(""),
  address_district: z.string().trim().min(2).max(120),
  address_city: z.string().trim().min(2).max(120),
  address_state: z.string().trim().min(2).max(2),
  cupom_codigo: z.string().trim().max(40).default(""),
});

export const createCheckoutPreference = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => checkoutSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Recalcula preços do banco — NUNCA confia no cliente
    const ids = data.items.map((i) => i.productId);
    const { data: products, error: pe } = await supabaseAdmin
      .from("products")
      .select("id,nome,preco,imagem_url,disponivel,estoque")
      .in("id", ids);
    if (pe) throw new Error(pe.message);
    if (!products || products.length !== ids.length) {
      throw new Error("Algum produto não está mais disponível.");
    }
    for (const ci of data.items) {
      const p: any = products.find((x: any) => x.id === ci.productId);
      if (!p.disponivel) throw new Error(`O produto "${p.nome}" está indisponível.`);
      const est = p.estoque !== null && p.estoque !== undefined ? Number(p.estoque) : 0;
      if (est <= 0) throw new Error(`O produto "${p.nome}" está esgotado.`);
      if (ci.quantity > est) {
        throw new Error(`O produto "${p.nome}" tem apenas ${est} unidade(s) em estoque.`);
      }
    }

    const itemsRich = data.items.map((ci) => {
      const p = products.find((x: any) => x.id === ci.productId)!;
      const price = Number((p as any).preco);
      return {
        productId: ci.productId,
        nome: (p as any).nome as string,
        preco: price,
        quantity: ci.quantity,
        subtotal: Number((price * ci.quantity).toFixed(2)),
        imagem_url: ((p as any).imagem_url ?? null) as string | null,
      };
    });
    const subtotal = Number(itemsRich.reduce((a, i) => a + i.subtotal, 0).toFixed(2));

    // Valida cupom no servidor (não confia no cliente)
    let desconto = 0;
    let cupomCodigo: string | null = null;
    if (data.cupom_codigo) {
      const codigo = data.cupom_codigo.trim().toUpperCase();
      const { data: cupom } = await supabaseAdmin
        .from("coupons")
        .select("codigo,tipo,valor,validade,ativo,min_subtotal")
        .eq("codigo", codigo)
        .maybeSingle();
      if (cupom && cupom.ativo) {
        const today = new Date().toISOString().slice(0, 10);
        const valid = !cupom.validade || cupom.validade >= today;
        const minOk = subtotal >= Number(cupom.min_subtotal ?? 0);
        if (valid && minOk) {
          const valor = Number(cupom.valor);
          desconto =
            cupom.tipo === "percent"
              ? Number(((subtotal * valor) / 100).toFixed(2))
              : Number(Math.min(valor, subtotal).toFixed(2));
          cupomCodigo = cupom.codigo as string;
        }
      }
    }
    const total = Math.max(0, Number((subtotal - desconto).toFixed(2)));

    // Cria pedido
    const { data: order, error: oe } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        address_cep: data.address_cep,
        address_street: data.address_street,
        address_number: data.address_number,
        address_complement: data.address_complement,
        address_district: data.address_district,
        address_city: data.address_city,
        address_state: data.address_state.toUpperCase(),
        total_price: total,
        payment_status: "pending",
        payment_method: "mercado_pago",
        cupom_codigo: cupomCodigo,
        desconto,
      })
      .select("id")
      .single();
    if (oe || !order) throw new Error(oe?.message || "Erro ao criar pedido.");

    const { error: ie } = await supabase.from("order_items").insert(
      itemsRich.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        product_name: i.nome,
        product_price: i.preco,
        quantity: i.quantity,
        subtotal: i.subtotal,
      })),
    );
    if (ie) throw new Error(ie.message);

    // Tenta criar preferência no Mercado Pago
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return {
        orderId: order.id,
        configured: false as const,
        message:
          "Pagamento online ainda não foi configurado pela loja. Fale com a vendedora pelo WhatsApp para concluir esse pedido.",
      };
    }

    const { getRequestHost, getRequestHeader } = await import("@tanstack/react-start/server");
    const host = getRequestHost();
    const proto = getRequestHeader("x-forwarded-proto") ?? "https";
    const origin = `${proto}://${host}`;

    const { MercadoPagoConfig, Preference } = await import("mercadopago");
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    // Aplica desconto proporcional aos itens para o total bater com Mercado Pago
    const factor = subtotal > 0 ? total / subtotal : 1;
    const mpItems = itemsRich.map((i) => ({
      id: i.productId,
      title: i.nome,
      quantity: i.quantity,
      unit_price: Number((i.preco * factor).toFixed(2)),
      currency_id: "BRL",
      picture_url: i.imagem_url ?? undefined,
    }));

    try {
      const created = await preference.create({
        body: {
          items: mpItems,
          payer: {
            name: data.customer_name,
            email: data.customer_email,
          },
          external_reference: order.id,
          back_urls: {
            success: `${origin}/checkout/sucesso?order=${order.id}`,
            pending: `${origin}/checkout/pendente?order=${order.id}`,
            failure: `${origin}/checkout/falha?order=${order.id}`,
          },
          auto_return: "approved",
          notification_url: `${origin}/api/public/mercado-pago/webhook`,
          metadata: { order_id: order.id },
        },
      });

      await supabaseAdmin
        .from("orders")
        .update({ mercado_pago_preference_id: created.id })
        .eq("id", order.id);

      return {
        orderId: order.id,
        configured: true as const,
        preferenceId: created.id,
        initPoint: created.init_point ?? created.sandbox_init_point ?? null,
      };
    } catch (err: any) {
      console.error("Mercado Pago error:", err);
      throw new Error("Não foi possível iniciar o pagamento. Tente novamente em instantes.");
    }
  });
