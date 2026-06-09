import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getHomeBanner, updateHomeBanner } from "@/lib/site-settings.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/banner")({
  head: () => ({ meta: [{ title: "Banner — Mimando" }] }),
  component: BannerPage,
});

function BannerPage() {
  const router = useRouter();
  const getFn = useServerFn(getHomeBanner);
  const updFn = useServerFn(updateHomeBanner);
  const { data, isLoading } = useQuery({ queryKey: ["home-banner"], queryFn: () => getFn() });

  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [botaoTexto, setBotaoTexto] = useState("");
  const [botaoLink, setBotaoLink] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setTitulo(data.titulo);
    setSubtitulo(data.subtitulo);
    setBotaoTexto(data.botao_texto);
    setBotaoLink(data.botao_link);
    setImagemUrl(data.imagem_url ?? "");
  }, [data]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updFn({
        data: {
          titulo: titulo.trim(),
          subtitulo: subtitulo.trim(),
          botao_texto: botaoTexto.trim(),
          botao_link: botaoLink.trim(),
          imagem_url: imagemUrl.trim(),
        },
      });
      toast.success("Banner atualizado!");
      router.navigate({ to: "/admin" });
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <Link to="/admin" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar ao painel
      </Link>
      <h1 className="mb-2 text-3xl font-bold">Banner da página inicial</h1>
      <p className="mb-6 text-muted-foreground">
        Atualize as frases, o botão e a imagem que aparecem no topo da home.
      </p>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : (
        <form onSubmit={save} className="grid gap-6 md:grid-cols-2">
          <Card className="space-y-4 rounded-2xl p-6 shadow-card">
            <div>
              <Label htmlFor="titulo">Título principal</Label>
              <Input id="titulo" value={titulo} maxLength={200} onChange={(e) => setTitulo(e.target.value)} placeholder="Novidades fofas chegaram!" />
            </div>
            <div>
              <Label htmlFor="subtitulo">Subtítulo</Label>
              <Textarea id="subtitulo" rows={3} maxLength={400} value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} placeholder="Presentes criativos para qualquer ocasião." />
            </div>
            <div>
              <Label htmlFor="bt">Texto do botão</Label>
              <Input id="bt" value={botaoTexto} maxLength={60} onChange={(e) => setBotaoTexto(e.target.value)} placeholder="Ver produtos" />
            </div>
            <div>
              <Label htmlFor="bl">Link do botão</Label>
              <Input id="bl" value={botaoLink} maxLength={500} onChange={(e) => setBotaoLink(e.target.value)} placeholder="/produtos" />
              <p className="mt-1 text-xs text-muted-foreground">Use /produtos, /contato ou qualquer link externo (https://...).</p>
            </div>
            <div>
              <Label htmlFor="img">URL da imagem de fundo (opcional)</Label>
              <Input id="img" value={imagemUrl} maxLength={2048} onChange={(e) => setImagemUrl(e.target.value)} placeholder="https://..." />
            </div>
            <Button type="submit" disabled={saving} className="w-full rounded-full gradient-primary text-primary-foreground shadow-soft">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar banner
            </Button>
          </Card>

          <Card className="space-y-3 rounded-2xl p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pré-visualização</p>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-card p-8 text-center">
              {imagemUrl && (
                <img src={imagemUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
              )}
              <div className="relative">
                <h2 className="text-2xl font-bold sm:text-3xl">{titulo || "Título do banner"}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{subtitulo || "Subtítulo do banner"}</p>
                <Button className="mt-5 rounded-full gradient-primary text-primary-foreground shadow-soft">
                  {botaoTexto || "Texto do botão"}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
