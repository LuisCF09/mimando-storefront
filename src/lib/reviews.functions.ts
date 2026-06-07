import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ReviewPublic = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  author_name: string;
};

export const listProductReviews = createServerFn({ method: "GET" })
  .inputValidator((input: { productId: string }) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("reviews")
      .select("id,rating,comment,created_at,user_id")
      .eq("product_id", data.productId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const reviews = rows ?? [];
    let names: Record<string, string> = {};
    if (reviews.length > 0) {
      const ids = Array.from(new Set(reviews.map((r: any) => r.user_id)));
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id,nome,email")
        .in("id", ids);
      for (const p of profs ?? []) {
        const n = (p as any).nome?.trim() || ((p as any).email?.split("@")[0] ?? "Cliente");
        names[(p as any).id] = n;
      }
    }
    const out: ReviewPublic[] = reviews.map((r: any) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? "",
      created_at: r.created_at,
      user_id: r.user_id,
      author_name: names[r.user_id] ?? "Cliente",
    }));
    const avg =
      out.length === 0 ? 0 : out.reduce((s, r) => s + r.rating, 0) / out.length;
    return { reviews: out, avg, count: out.length };
  });

export const upsertMyReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        productId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().trim().max(500).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("reviews")
      .upsert(
        {
          user_id: userId,
          product_id: data.productId,
          rating: data.rating,
          comment: data.comment,
        },
        { onConflict: "user_id,product_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMyReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ productId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", data.productId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListReviews = createServerFn({ method: "GET" })
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
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("id,rating,comment,created_at,user_id,product_id,products(nome),profiles(nome,email)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? "",
      created_at: r.created_at,
      user_id: r.user_id,
      product_id: r.product_id,
      product_name: r.products?.nome ?? "—",
      author_name:
        (r.profiles?.nome?.trim?.() || r.profiles?.email?.split?.("@")[0]) ?? "Cliente",
    }));
  });

export const adminDeleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Acesso restrito à administradora.");
    const { error } = await supabase.from("reviews").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
