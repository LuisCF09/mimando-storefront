import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type Product = {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  descricao_curta: string;
  descricao_completa: string;
  imagem_url: string | null;
  disponivel: boolean;
  is_featured: boolean;
  is_personalizavel: boolean;
  is_bestseller: boolean;
  is_novidade: boolean;
  is_promocao: boolean;
  badge: string | null;
  created_at: string | null;
  estoque: number;
  occasions?: string[];
};

function mapRow(r: any, occasions?: string[]): Product {
  return {
    id: r.id,
    nome: r.nome,
    preco: Number(r.preco),
    categoria: r.categoria,
    descricao_curta: r.descricao_curta ?? "",
    descricao_completa: r.descricao_completa ?? "",
    imagem_url: r.imagem_url ?? null,
    disponivel: !!r.disponivel,
    is_featured: !!r.is_featured,
    is_personalizavel: !!r.is_personalizavel,
    is_bestseller: !!r.is_bestseller,
    is_novidade: !!r.is_novidade,
    is_promocao: !!r.is_promocao,
    badge: (r.badge ?? null) as string | null,
    created_at: (r.created_at ?? null) as string | null,
    estoque: r.estoque !== null && r.estoque !== undefined ? Number(r.estoque) : 0,
    occasions,
  };
}

const SELECT =
  "id,nome,preco,categoria,descricao_curta,descricao_completa,imagem_url,disponivel,is_featured,is_personalizavel,is_bestseller,is_novidade,is_promocao,badge,created_at,estoque";

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((input: { categoria?: string; occasion?: string } | undefined) =>
    z.object({ categoria: z.string().optional(), occasion: z.string().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let productIds: string[] | null = null;
    if (data.occasion) {
      const { data: rels, error: re } = await supabaseAdmin
        .from("product_occasions")
        .select("product_id")
        .eq("occasion_slug", data.occasion);
      if (re) throw new Error(re.message);
      productIds = (rels ?? []).map((r: any) => r.product_id);
      if (productIds.length === 0) return [];
    }
    let q = supabaseAdmin
      .from("products")
      .select(SELECT)
      .order("created_at", { ascending: false });
    if (data.categoria) q = q.eq("categoria", data.categoria);
    if (productIds) q = q.in("id", productIds);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => mapRow(r));
  });

export const listFeaturedProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(SELECT)
      .eq("is_featured", true)
      .eq("disponivel", true)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => mapRow(r));
  });

export const listBestsellers = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(SELECT)
      .eq("is_bestseller", true)
      .eq("disponivel", true)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => mapRow(r));
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .select(SELECT)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const { data: occ } = await supabaseAdmin
      .from("product_occasions")
      .select("occasion_slug")
      .eq("product_id", data.id);
    const occasions = (occ ?? []).map((o: any) => o.occasion_slug as string);
    return mapRow(row, occasions);
  });
