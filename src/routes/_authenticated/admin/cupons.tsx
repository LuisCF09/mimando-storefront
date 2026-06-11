import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  type Coupon,
} from "@/lib/coupons.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Loader2, Pencil, Plus, Trash2, BadgePercent } from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/shop";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin/cupons")({
  head: () => ({ meta: [{ title: "Cupons — Mimando" }] }),
  component: CuponsPage,
});

type FormState = {
  id?: string;
  codigo: string;
  tipo: "percent" | "fixed";
  valor: string;
  validade: string;
  ativo: boolean;
  min_subtotal: string;
};

const empty: FormState = {
  codigo: "",
  tipo: "percent",
  valor: "",
  validade: "",
  ativo: true,
  min_subtotal: "",
};

const couponSchema = z
  .object({
    codigo: z
      .string()
      .trim()
      .min(3, "Mínimo 3 caracteres.")
      .max(40, "Máximo 40 caracteres.")
      .regex(/^[A-Z0-9_-]+$/, "Use apenas letras, números, - ou _."),
    tipo: z.enum(["percent", "fixed"]),
    valor: z.number().positive("Valor deve ser maior que zero."),
    validade: z.string().optional().nullable(),
    ativo: z.boolean(),
    min_subtotal: z.number().min(0),
  })
  .refine((d) => d.tipo !== "percent" || d.valor <= 100, {
    message: "Porcentagem máxima 100.",
    path: ["valor"],
  });

function isExpired(c: Coupon) {
  if (!c.validade) return false;
  const today = new Date().toISOString().slice(0, 10);
  return c.validade < today;
}

function CuponsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listCoupons);
  const createFn = useServerFn(createCoupon);
  const updateFn = useServerFn(updateCoupon);
  const deleteFn = useServerFn(deleteCoupon);
  const toggleFn = useServerFn(toggleCoupon);

  const { data, isLoading } = useQuery({ queryKey: ["admin-coupons"], queryFn: () => listFn() });
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const editing = !!form.id;

  const startEdit = (c: Coupon) => {
    setForm({
      id: c.id,
      codigo: c.codigo,
      tipo: c.tipo,
      valor: String(c.valor),
      validade: c.validade ?? "",
      ativo: c.ativo,
      min_subtotal: String(c.min_subtotal || ""),
    });
  };

  const reset = () => setForm(empty);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-coupons"] });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = couponSchema.safeParse({
      codigo: form.codigo.trim().toUpperCase(),
      tipo: form.tipo,
      valor: Number(form.valor.replace(",", ".")),
      validade: form.validade || null,
      ativo: form.ativo,
      min_subtotal: Number((form.min_subtotal || "0").replace(",", ".")) || 0,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }
    setSaving(true);
    try {
      if (editing && form.id) {
        await updateFn({ data: { ...parsed.data, id: form.id } });
        toast.success("Cupom atualizado!");
      } else {
        await createFn({ data: parsed.data });
        toast.success("Cupom criado!");
      }
      reset();
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteFn({ data: { id } });
      toast.success("Cupom removido.");
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao remover.");
    }
  };

  const toggle = async (id: string, ativo: boolean) => {
    try {
      await toggleFn({ data: { id, ativo } });
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao atualizar.");
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Código ${code} copiado!`);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <BadgePercent className="h-6 w-6 text-primary" /> Cupons de desconto
        </h1>
        <p className="text-sm text-muted-foreground">
          Crie e gerencie os cupons usados pelos clientes no carrinho.
          Os cupons só existem quando você cadastra aqui.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="space-y-3 rounded-2xl p-6 shadow-card">
          <h2 className="font-semibold">{editing ? "Editar cupom" : "Novo cupom"}</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={form.codigo}
                maxLength={40}
                onChange={(e) =>
                  setForm({ ...form, codigo: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })
                }
                placeholder="EX: BEMVINDA"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Apenas letras, números, - ou _.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  inputMode="decimal"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  placeholder={form.tipo === "percent" ? "10" : "20,00"}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="min">Subtotal mínimo (R$)</Label>
              <Input
                id="min"
                inputMode="decimal"
                value={form.min_subtotal}
                onChange={(e) => setForm({ ...form, min_subtotal: e.target.value })}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="val">Validade (opcional)</Label>
              <Input
                id="val"
                type="date"
                value={form.validade}
                onChange={(e) => setForm({ ...form, validade: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 rounded-2xl bg-secondary/40 p-3">
              <Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
              <span className="text-sm">Cupom ativo</span>
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="flex-1 rounded-full gradient-primary text-primary-foreground shadow-soft">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Salvar" : <><Plus className="mr-2 h-4 w-4" /> Criar</>}
              </Button>
              {editing && (
                <Button type="button" variant="outline" className="rounded-full" onClick={reset}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-muted-foreground">Carregando…</p>
          ) : (data?.length ?? 0) === 0 ? (
            <Card className="rounded-2xl p-8 text-center shadow-card">
              <BadgePercent className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-semibold">Nenhum cupom criado ainda.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Preencha o formulário ao lado para criar o primeiro cupom.
                <br />Os clientes vão poder aplicá-lo no <span className="font-medium">carrinho</span>.
              </p>
            </Card>
          ) : (
            data!.map((c) => {
              const expired = isExpired(c);
              return (
                <Card key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl p-4 shadow-card">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyCode(c.codigo)}
                        className="group inline-flex items-center gap-1 font-mono text-lg font-bold tracking-wide text-primary hover:underline"
                        title="Copiar código"
                      >
                        {c.codigo}
                        <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                      </button>
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {c.tipo === "percent" ? `${c.valor}%` : formatBRL(c.valor)}
                      </Badge>
                      {c.validade && (
                        <Badge variant="outline" className="rounded-full text-xs">
                          Até {new Date(c.validade).toLocaleDateString("pt-BR")}
                        </Badge>
                      )}
                      {c.min_subtotal > 0 && (
                        <Badge variant="outline" className="rounded-full text-xs">
                          Mín. {formatBRL(c.min_subtotal)}
                        </Badge>
                      )}
                      {expired && (
                        <Badge variant="outline" className="rounded-full border-destructive/40 text-xs text-destructive">
                          Expirado
                        </Badge>
                      )}
                      {!c.ativo && (
                        <Badge variant="outline" className="rounded-full text-xs text-muted-foreground">
                          Inativo
                        </Badge>
                      )}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <Switch checked={c.ativo} onCheckedChange={(v) => toggle(c.id, v)} /> Ativo
                  </label>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => startEdit(c)}>
                    <Pencil className="mr-1 h-4 w-4" /> Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="rounded-full text-destructive">
                        <Trash2 className="mr-1 h-4 w-4" /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir cupom?</AlertDialogTitle>
                        <AlertDialogDescription>
                          O cupom “{c.codigo}” será removido definitivamente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(c.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
