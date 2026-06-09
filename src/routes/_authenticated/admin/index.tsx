import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
import { formatBRL } from "@/lib/shop";
import {
  Plus, Pencil, Trash2, ImageOff, Package, PackageX, Sparkles,
  Star, ShoppingBag, Image as ImageIcon, BadgePercent,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [{ title: "Painel — Mimando" }, { name: "description", content: "Painel administrativo." }],
  }),
  component: AdminDashboard,
});

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
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
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

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Painel da loja</h1>
          <p className="text-muted-foreground">Gerencie seus produtos com carinho ♡</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/admin/banner"><ImageIcon className="mr-2 h-4 w-4" /> Banner</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/admin/cupons"><BadgePercent className="mr-2 h-4 w-4" /> Cupons</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/admin/avaliacoes"><Star className="mr-2 h-4 w-4" /> Avaliações</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/admin/pedidos"><Package className="mr-2 h-4 w-4" /> Ver pedidos</Link>
          </Button>
          <Button
            onClick={() => router.navigate({ to: "/admin/novo" })}
            className="rounded-full gradient-primary text-primary-foreground shadow-soft"
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar produto
          </Button>
        </div>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Produtos cadastrados" value={stats?.totalProducts ?? "—"} />
        <StatCard icon={ShoppingBag} label="Pedidos totais" value={stats?.totalOrders ?? "—"} />
        <StatCard icon={PackageX} label="Produtos esgotados" value={stats?.esgotados ?? "—"} />
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
            {stats.ultimosPedidos.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {o.payment_status}
                  </Badge>
                  <span className="font-semibold text-primary">
                    {formatBRL(o.total_price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : (data?.length ?? 0) === 0 ? (
        <Card className="rounded-3xl p-10 text-center shadow-card">
          <p className="font-semibold">Nenhum produto cadastrado ainda.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Clique em “Adicionar produto” para começar.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {data!.map((p) => (
            <Card
              key={p.id}
              className="flex flex-col gap-4 rounded-2xl p-4 shadow-card sm:flex-row sm:items-center"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary/50">
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
                  <Badge variant="outline" className={"rounded-full " + (p.estoque <= 0 ? "text-destructive" : p.estoque <= 5 ? "text-amber-600" : "text-muted-foreground")}>
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
          ))}
        </div>
      )}
    </div>
  );
}
