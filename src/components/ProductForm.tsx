import { useState } from "react";
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
import { ImageOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type ProductFormValues = {
  nome: string;
  preco: number;
  categoria: Categoria;
  descricao_curta: string;
  descricao_completa: string;
  imagem_url: string;
  disponivel: boolean;
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
  const [loading, setLoading] = useState(false);

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
        <div className="flex items-center gap-3">
          <Switch checked={disponivel} onCheckedChange={setDisponivel} id="disp" />
          <Label htmlFor="disp" className="cursor-pointer">
            Produto disponível
          </Label>
        </div>
      </Card>

      <Card className="space-y-4 rounded-2xl p-6 shadow-card">
        <div>
          <Label htmlFor="img">URL da imagem</Label>
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
