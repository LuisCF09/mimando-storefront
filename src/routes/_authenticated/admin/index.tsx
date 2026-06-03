import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListProducts,
  deleteProduct,
  toggleDisponivel,
} from "@/lib/admin-products.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatBRL } from "@/lib/shop";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
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

function AdminDashboard() {
  const router = useRouter();
  const listFn = useServerFn(adminListProducts);
  const delFn = useServerFn(deleteProduct);
  const toggleFn = useServerFn(toggleDisponivel);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listFn(),
  });

  const handleDelete = async (id: string) => {
    try {
      await delFn({ data: { id } });
      toast.success("Produto excluído.");
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao excluir.");
    }
  };

  const handleToggle = async (id: string, value: boolean) => {
    try {
      await toggleFn({ data: { id, disponivel: value } });
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao atualizar.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Painel da loja</h1>
          <p className="text-muted-foreground">Gerencie seus produtos com carinho ♡</p>
        </div>
        <Button
          onClick={() => router.navigate({ to: "/admin/novo" })}
          className="rounded-full gradient-primary text-primary-foreground shadow-soft"
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar produto
        </Button>
      </div>

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
                </div>
                <p className="text-lg font-bold text-primary">{formatBRL(p.preco)}</p>
                {p.descricao_curta && (
                  <p className="truncate text-sm text-muted-foreground">{p.descricao_curta}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={p.disponivel}
                    onCheckedChange={(v) => handleToggle(p.id, v)}
                  />
                  {p.disponivel ? "Disponível" : "Indisponível"}
                </label>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
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
