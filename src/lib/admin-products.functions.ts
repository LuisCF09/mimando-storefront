import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CATEGORIES } from "@/lib/shop";

const productSchema = z.object({
  nome: z.string().trim().min(1).max(200),
  preco: z.number().min(0).max(10_000_000),
  categoria: z.enum(CATEGORIES as unknown as [string, ...string[]]),
  descricao_curta: z.string().trim().max(280).default(""),
  descricao_completa: z.string().trim().max(5000).default(""),
  imagem_url: z.string().trim().url().max(2048).or(z.literal("")).optional().nullable(),
  disponivel: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_personalizavel: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_novidade: z.boolean().default(false),
  is_promocao: z.boolean().default(false),
  badge: z.string().trim().max(40).or(z.literal("")).optional().nullable(),
  estoque: z.number().int().min(0).max(100000).default(0),
  occasions: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
});

const SELECT =
  "id,nome,preco,categoria,descricao_curta,descricao_completa,imagem_url,disponivel,is_featured,is_personalizavel,is_bestseller,is_novidade,is_promocao,badge,created_at,estoque";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso restrito à administradora.");
}

async function setOccasions(supabase: any, productId: string, slugs: string[]) {
  await supabase.from("product_occasions").delete().eq("product_id", productId);
  if (slugs.length > 0) {
    const rows = slugs.map((slug) => ({ product_id: productId, occasion_slug: slug }));
    const { error } = await supabase.from("product_occasions").insert(rows);
    if (error) throw new Error(error.message);
  }
}

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    const roles = (data ?? []).map((r: any) => r.role as string);
    return { isAdmin: roles.includes("admin"), roles };
  });

export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { occasions, ...rest } = data;
    const payload = {
      ...rest,
      imagem_url: rest.imagem_url || null,
      badge: rest.badge ? rest.badge : null,
    };
    const { data: row, error } = await supabase
      .from("products")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await setOccasions(supabase, row!.id as string, occasions);
    return { id: row!.id as string };
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => productSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { id, occasions, ...rest } = data;
    const payload = {
      ...rest,
      imagem_url: rest.imagem_url || null,
      badge: rest.badge ? rest.badge : null,
    };
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
    await setOccasions(supabase, id, occasions);
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleDisponivel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), disponivel: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase
      .from("products")
      .update({ disponivel: data.disponivel })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleFeatured = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), is_featured: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase
      .from("products")
      .update({ is_featured: data.is_featured })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("products")
      .select(SELECT)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({
      id: r.id as string,
      nome: r.nome as string,
      preco: Number(r.preco),
      categoria: r.categoria as string,
      descricao_curta: (r.descricao_curta ?? "") as string,
      descricao_completa: (r.descricao_completa ?? "") as string,
      imagem_url: (r.imagem_url ?? null) as string | null,
      disponivel: !!r.disponivel,
      is_featured: !!r.is_featured,
      is_personalizavel: !!r.is_personalizavel,
      is_bestseller: !!r.is_bestseller,
      is_novidade: !!r.is_novidade,
      is_promocao: !!r.is_promocao,
      badge: (r.badge ?? null) as string | null,
      estoque: r.estoque !== null && r.estoque !== undefined ? Number(r.estoque) : 0,
    }));
  });

export const adminGetProduct = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: row, error } = await supabase
      .from("products")
      .select(SELECT)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Produto não encontrado");
    const { data: occ } = await supabase
      .from("product_occasions")
      .select("occasion_slug")
      .eq("product_id", data.id);
    return {
      id: row.id as string,
      nome: row.nome as string,
      preco: Number(row.preco),
      categoria: row.categoria as string,
      descricao_curta: (row.descricao_curta ?? "") as string,
      descricao_completa: (row.descricao_completa ?? "") as string,
      imagem_url: (row.imagem_url ?? null) as string | null,
      disponivel: !!row.disponivel,
      is_featured: !!row.is_featured,
      is_personalizavel: !!row.is_personalizavel,
      is_bestseller: !!row.is_bestseller,
      is_novidade: !!row.is_novidade,
      is_promocao: !!row.is_promocao,
      badge: (row.badge ?? null) as string | null,
      estoque: row.estoque !== null && row.estoque !== undefined ? Number(row.estoque) : 0,
      occasions: (occ ?? []).map((o: any) => o.occasion_slug as string),
    };
  });
