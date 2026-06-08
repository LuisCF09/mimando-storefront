import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listMyFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("favorites")
      .select("product_id, created_at, products!inner(id,nome,preco,categoria,descricao_curta,imagem_url,disponivel,is_featured,badge,created_at)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({
      product_id: r.product_id as string,
      product: {
        id: r.products.id,
        nome: r.products.nome,
        preco: Number(r.products.preco),
        categoria: r.products.categoria,
        descricao_curta: r.products.descricao_curta ?? "",
        imagem_url: r.products.imagem_url ?? null,
        disponivel: !!r.products.disponivel,
        is_featured: !!r.products.is_featured,
        badge: (r.products.badge ?? null) as string | null,
        created_at: (r.products.created_at ?? null) as string | null,
      },
    }));
  });

export const listMyFavoriteIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("favorites")
      .select("product_id")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => r.product_id as string);
  });

export const addFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ productId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, product_id: data.productId });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const removeFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ productId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", data.productId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
