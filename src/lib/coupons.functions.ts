import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Coupon = {
  id: string;
  codigo: string;
  tipo: "percent" | "fixed";
  valor: number;
  validade: string | null;
  ativo: boolean;
  min_subtotal: number;
};

function mapCoupon(r: any): Coupon {
  return {
    id: r.id,
    codigo: r.codigo,
    tipo: r.tipo,
    valor: Number(r.valor),
    validade: (r.validade ?? null) as string | null,
    ativo: !!r.ativo,
    min_subtotal: Number(r.min_subtotal ?? 0),
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

// Public: validate a coupon for a given subtotal (uses admin client to bypass RLS, only returns safe fields)
export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator((input: { codigo: string; subtotal: number }) =>
    z
      .object({
        codigo: z.string().trim().min(1).max(40),
        subtotal: z.number().min(0).max(10_000_000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const codigo = data.codigo.trim().toUpperCase();
    const { data: row, error } = await supabaseAdmin
      .from("coupons")
      .select("codigo,tipo,valor,validade,ativo,min_subtotal")
      .eq("codigo", codigo)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { valido: false as const, motivo: "Cupom não encontrado." };
    if (!row.ativo) return { valido: false as const, motivo: "Cupom inativo." };
    if (row.validade && new Date(row.validade) < new Date(new Date().toISOString().slice(0, 10))) {
      return { valido: false as const, motivo: "Cupom expirado." };
    }
    const minSubtotal = Number(row.min_subtotal ?? 0);
    if (minSubtotal > 0 && data.subtotal < minSubtotal) {
      return {
        valido: false as const,
        motivo: `Este cupom exige subtotal mínimo de R$ ${minSubtotal.toFixed(2)}.`,
      };
    }
    const valor = Number(row.valor);
    let desconto = 0;
    if (row.tipo === "percent") {
      desconto = Number(((data.subtotal * valor) / 100).toFixed(2));
    } else {
      desconto = Number(Math.min(valor, data.subtotal).toFixed(2));
    }
    return {
      valido: true as const,
      codigo: row.codigo as string,
      tipo: row.tipo as "percent" | "fixed",
      valor,
      desconto,
    };
  });

const couponSchema = z.object({
  codigo: z.string().trim().min(2).max(40),
  tipo: z.enum(["percent", "fixed"]),
  valor: z.number().min(0).max(10_000_000),
  validade: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).nullable().optional(),
  ativo: z.boolean().default(true),
  min_subtotal: z.number().min(0).max(10_000_000).default(0),
});

export const listCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("coupons")
      .select("id,codigo,tipo,valor,validade,ativo,min_subtotal")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCoupon);
  });

export const createCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => couponSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const payload = {
      codigo: data.codigo.trim().toUpperCase(),
      tipo: data.tipo,
      valor: data.valor,
      validade: data.validade && data.validade.length > 0 ? data.validade : null,
      ativo: data.ativo,
      min_subtotal: data.min_subtotal,
    };
    const { error } = await supabase.from("coupons").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => couponSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { id, ...rest } = data;
    const payload = {
      codigo: rest.codigo.trim().toUpperCase(),
      tipo: rest.tipo,
      valor: rest.valor,
      validade: rest.validade && rest.validade.length > 0 ? rest.validade : null,
      ativo: rest.ativo,
      min_subtotal: rest.min_subtotal,
    };
    const { error } = await supabase.from("coupons").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("coupons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), ativo: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("coupons").update({ ativo: data.ativo }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
