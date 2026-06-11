import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type HomeBanner = {
  titulo: string;
  subtitulo: string;
  botao_texto: string;
  botao_link: string;
  imagem_url: string | null;
};

const KEY = "home_banner";

export const getHomeBanner = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("titulo,subtitulo,botao_texto,botao_link,imagem_url")
    .eq("key", KEY)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    titulo: (data.titulo ?? "") as string,
    subtitulo: (data.subtitulo ?? "") as string,
    botao_texto: (data.botao_texto ?? "") as string,
    botao_link: (data.botao_link ?? "") as string,
    imagem_url: (data.imagem_url ?? null) as string | null,
  } satisfies HomeBanner;
});

const bannerSchema = z.object({
  titulo: z.string().trim().max(200).default(""),
  subtitulo: z.string().trim().max(400).default(""),
  botao_texto: z.string().trim().max(60).default(""),
  botao_link: z.string().trim().max(500).default(""),
  imagem_url: z.string().trim().max(2048).or(z.literal("")).default(""),
});

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso restrito à administradora.");
}

export const updateHomeBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => bannerSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const payload = {
      key: KEY,
      titulo: data.titulo,
      subtitulo: data.subtitulo,
      botao_texto: data.botao_texto,
      botao_link: data.botao_link,
      imagem_url: data.imagem_url || null,
    };
    const { error } = await supabase.from("site_settings").upsert(payload, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resetHomeBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("site_settings").delete().eq("key", KEY);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

