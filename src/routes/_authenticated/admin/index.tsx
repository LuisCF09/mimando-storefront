import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  adminListProducts,
  deleteProduct,
  toggleDisponivel,
  toggleFeatured,
} from "@/lib/admin-products.functions";
import { getAdminStats } from "@/lib/admin-stats.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatBRL } from "@/lib/shop";
import {
  Plus, Pencil, Trash2, ImageOff, Package, PackageX, Sparkles,
  Star, ShoppingBag, DollarSign, Search,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [{ title: "Painel — Mimando" }, { name: "description", content: "Painel administrativo." }],
  }),
  component: AdminDashboard,
});

const statusLabel: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  paid: { label: "Pago", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  canceled: { label: "Cancelado", className: "bg-muted text-muted-foreground" },
  failed: { label: "Falhou", className: "bg-red-100 text-red-800 hover:bg-red-100" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <Card className="flex items-center gap-3 rounded-2xl p-4 shadow-card">
      <span
        className={
          "grid h-11 w-11 place-items-center rounded-full text-primary " +
          (accent ?? "bg-secondary")
        }
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-xl font-bold">{value}</p>
      </div>
    </Card>
  );
}

function AdminDashboard() {
  const router = useRouter();
  const listFn = useServerFn(adminListProducts);
  const delFn = useServerFn(deleteProduct);
  const toggleFn = useServerFn(toggleDisponivel);
  const toggleFeatFn = useServerFn(toggleFeatured);
  const statsFn = useServerFn(getAdminStats);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listFn(),
  });
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => statsFn(),
  });

  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "stock" | "price">("recent");

  const refresh = () => {
    refetch();
    refetchStats();
  };

  const handleDelete = async (id: string) => {
    try {
      await delFn({ data: { id } });
      toast.success("Produto excluído.");
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao excluir.");
    }
  };

  const handleToggle = async (id: string, value: boolean) => {
    try {
      await toggleFn({ data: { id, disponivel: value } });
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao atualizar.");
    }
  };

  const handleToggleFeatured = async (id: string, value: boolean) => {
    try {
      await toggleFeatFn({ data: { id, is_featured: value } });
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao atualizar destaque.");
    }
  };

  const filtered = useMemo(() => {
    const list = data ?? [];
    const needle = q.trim().toLowerCase();
    const f = needle
      ? list.filter(
          (p) =>
            p.nome.toLowerCase().includes(needle) ||
            p.categoria.toLowerCase().includes(needle),
        )
      : list;
    const arr = [...f];
    if (sortBy === "stock") arr.sort((a, b) => a.estoque - b.estoque);
    else if (sortBy === "price") arr.sort((a, b) => b.preco - a.preco);
    return arr;
  }, [data, q, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Visão geral</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seus produtos com carinho ♡
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Package} label="Produtos" value={stats?.totalProducts ?? "—"} />
        <StatCard icon={ShoppingBag} label="Pedidos totais" value={stats?.totalOrders ?? "—"} />
        <StatCard icon={DollarSign} label="Pagos no mês" value={stats?.pedidosPagosMes ?? "—"} />
        <StatCard
          icon={DollarSign}
          label="Faturamento no mês"
          value={stats ? formatBRL(stats.faturamentoMes) : "—"}
          accent="bg-primary/10"
        />
        <StatCard icon={PackageX} label="Esgotados" value={stats?.esgotados ?? "—"} />
        <StatCard icon={Sparkles} label="Em destaque" value={stats?.destaques ?? "—"} />
      </div>

      {stats && stats.ultimosPedidos.length > 0 && (
        <Card className="mb-8 rounded-2xl p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Últimos pedidos</h2>
            <Link to="/admin/pedidos" className="text-sm text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-2">
            {stats.ultimosPedidos.map((o) => {
              const s = statusLabel[o.payment_status] ?? statusLabel.pending;
              return (
                <Link
                  key={o.id}
                  to="/pedido/$id"
                  params={{ id: o.id }}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 px-3 py-2 text-sm transition-colors hover:bg-secondary/70"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`rounded-full text-xs ${s.className}`}>{s.label}</Badge>
                    <span className="font-semibold text-primary">
                      {formatBRL(o.total_price)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl p-4 shadow-card">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou categoria…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-[180px] rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="stock">Menor estoque</SelectItem>
            <SelectItem value="price">Maior preço</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => router.navigate({ to: "/admin/novo" })}
          size="sm"
          className="rounded-full gradient-primary text-primary-foreground shadow-soft"
        >
          <Plus className="mr-1 h-4 w-4" /> Adicionar
        </Button>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : filtered.length === 0 ? (
        <Card className="rounded-3xl p-10 text-center shadow-card">
          <p className="font-semibold">
            {q ? "Nenhum produto encontrado." : "Nenhum produto cadastrado ainda."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {q ? "Tente outra busca." : "Clique em “Adicionar” para começar."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p) => {
            const stockClass =
              p.estoque <= 0
                ? "text-destructive"
                : p.estoque <= 5
                ? "text-amber-600"
                : "text-muted-foreground";
            return (
              <Card
                key={p.id}
                className="flex flex-col gap-4 rounded-2xl p-4 shadow-card sm:flex-row sm:items-center"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary/50">
                  {p.imagem_url ? (
                    <img src={p.imagem_url} alt={p.nome} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground">
                      <ImageOff className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold">{p.nome}</h3>
                    <Badge variant="secondary" className="rounded-full">
                      {p.categoria}
                    </Badge>
                    {p.is_featured && (
                      <Badge className="rounded-full bg-gradient-to-r from-primary to-purple-soft text-primary-foreground">
                        <Sparkles className="mr-1 h-3 w-3" /> Destaque
                      </Badge>
                    )}
                    {p.badge && (
                      <Badge variant="outline" className="rounded-full">
                        {p.badge}
                      </Badge>
                    )}
                    {!p.disponivel && (
                      <Badge variant="outline" className="rounded-full text-muted-foreground">
                        Indisponível
                      </Badge>
                    )}
                    <Badge variant="outline" className={`rounded-full ${stockClass}`}>
                      Estoque: {p.estoque}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-primary">{formatBRL(p.preco)}</p>
                  {p.descricao_curta && (
                    <p className="truncate text-sm text-muted-foreground">{p.descricao_curta}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 text-xs">
                    <Switch
                      checked={p.disponivel}
                      onCheckedChange={(v) => handleToggle(p.id, v)}
                    />
                    Disponível
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Switch
                      checked={p.is_featured}
                      onCheckedChange={(v) => handleToggleFeatured(p.id, v)}
                    />
                    Destaque
                  </label>
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to="/admin/$id" params={{ id: p.id }}>
                      <Pencil className="mr-1 h-4 w-4" /> Editar
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O produto “{p.nome}” será removido.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(p.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
