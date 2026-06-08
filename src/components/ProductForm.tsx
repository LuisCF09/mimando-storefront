import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type Categoria } from "@/lib/shop";
import { ImageOff, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type ProductFormValues = {
  nome: string;
  preco: number;
  categoria: Categoria;
  descricao_curta: string;
  descricao_completa: string;
  imagem_url: string;
  disponivel: boolean;
  is_featured: boolean;
  badge: string;
};

export function ProductForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<ProductFormValues>;
  submitLabel: string;
  onSubmit: (v: ProductFormValues) => Promise<void>;
}) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [preco, setPreco] = useState<string>(
    initial?.preco !== undefined ? String(initial.preco) : "",
  );
  const [categoria, setCategoria] = useState<Categoria>(
    (initial?.categoria as Categoria) ?? CATEGORIES[0],
  );
  const [descricaoCurta, setDescricaoCurta] = useState(initial?.descricao_curta ?? "");
  const [descricaoCompleta, setDescricaoCompleta] = useState(initial?.descricao_completa ?? "");
  const [imagemUrl, setImagemUrl] = useState(initial?.imagem_url ?? "");
  const [disponivel, setDisponivel] = useState<boolean>(initial?.disponivel ?? true);
  const [isFeatured, setIsFeatured] = useState<boolean>(initial?.is_featured ?? false);
  const [badge, setBadge] = useState<string>(initial?.badge ?? "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("produtos")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("produtos").getPublicUrl(path);
      setImagemUrl(data.publicUrl);
    } catch {
      toast.error("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precoNum = Number(preco.replace(",", "."));
    if (!nome.trim()) return toast.error("Informe o nome.");
    if (!Number.isFinite(precoNum) || precoNum < 0) return toast.error("Preço inválido.");
    setLoading(true);
    try {
      await onSubmit({
        nome: nome.trim(),
        preco: precoNum,
        categoria,
        descricao_curta: descricaoCurta.trim(),
        descricao_completa: descricaoCompleta.trim(),
        imagem_url: imagemUrl.trim(),
        disponivel,
        is_featured: isFeatured,
        badge: badge.trim(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="grid gap-6 lg:grid-cols-3" onSubmit={submit}>
      <Card className="space-y-4 rounded-2xl p-6 shadow-card lg:col-span-2">
        <div>
          <Label htmlFor="nome">Nome do produto</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input
              id="preco"
              inputMode="decimal"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>
          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as Categoria)}>
              <SelectTrigger id="categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="dc">Descrição curta</Label>
          <Input
            id="dc"
            value={descricaoCurta}
            onChange={(e) => setDescricaoCurta(e.target.value)}
            maxLength={280}
            placeholder="Resumo que aparece no card do produto"
          />
        </div>
        <div>
          <Label htmlFor="dcomp">Descrição completa</Label>
          <Textarea
            id="dcomp"
            value={descricaoCompleta}
            onChange={(e) => setDescricaoCompleta(e.target.value)}
            rows={6}
            maxLength={5000}
          />
        </div>
        <div>
          <Label htmlFor="badge">Selo personalizado (opcional)</Label>
          <Input
            id="badge"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            maxLength={40}
            placeholder='Ex: "Novo", "Promo", "Edição limitada"'
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Aparece como etiqueta colorida no card. Deixe vazio para não mostrar.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-3">
            <Switch checked={disponivel} onCheckedChange={setDisponivel} id="disp" />
            <span className="text-sm">
              <span className="block font-medium">Produto disponível</span>
              <span className="text-xs text-muted-foreground">Desligue para marcar como esgotado.</span>
            </span>
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-3">
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} id="feat" />
            <span className="text-sm">
              <span className="block font-medium">Produto em destaque</span>
              <span className="text-xs text-muted-foreground">Aparece na seção destaque da home.</span>
            </span>
          </label>
        </div>
      </Card>

      <Card className="space-y-4 rounded-2xl p-6 shadow-card">
        <div>
          <Label>Enviar imagem</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-1 w-full"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Escolher imagem
              </>
            )}
          </Button>
        </div>
        <div>
          <Label htmlFor="img">URL da imagem (alternativa)</Label>
          <Input
            id="img"
            type="url"
            value={imagemUrl}
            onChange={(e) => setImagemUrl(e.target.value)}
            placeholder="https://..."
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Cole o link de uma imagem hospedada.
          </p>
        </div>
        <div className="aspect-square overflow-hidden rounded-2xl bg-secondary/50">
          {imagemUrl ? (
            <img
              src={imagemUrl}
              alt="Pré-visualização"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <ImageOff className="h-10 w-10" />
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-full gradient-primary text-primary-foreground shadow-soft"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </Card>
    </form>
  );
}
