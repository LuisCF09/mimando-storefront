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
  badge: string | null;
};

function mapRow(r: any): Product {
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
    badge: (r.badge ?? null) as string | null,
  };
}

const SELECT = "id,nome,preco,categoria,descricao_curta,descricao_completa,imagem_url,disponivel,is_featured,badge,created_at";

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((input: { categoria?: string } | undefined) =>
    z.object({ categoria: z.string().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("products")
      .select(SELECT)
      .order("created_at", { ascending: false });
    if (data.categoria) q = q.eq("categoria", data.categoria);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []).map(mapRow);
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
    return (data ?? []).map(mapRow);
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
    return row ? mapRow(row) : null;
  });
