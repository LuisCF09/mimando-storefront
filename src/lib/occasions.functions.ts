import { createServerFn } from "@tanstack/react-start";

export type Occasion = { slug: string; nome: string; ordem: number };

export const listOccasions = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("occasions")
    .select("slug,nome,ordem")
    .order("ordem", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    slug: r.slug as string,
    nome: r.nome as string,
    ordem: Number(r.ordem ?? 0),
  })) as Occasion[];
});
