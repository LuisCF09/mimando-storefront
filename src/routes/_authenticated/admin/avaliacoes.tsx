import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminDeleteReview, adminListReviews } from "@/lib/reviews.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
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

export const Route = createFileRoute("/_authenticated/admin/avaliacoes")({
  head: () => ({ meta: [{ title: "Avaliações — Painel Mimando" }] }),
  component: AdminReviews,
});

function AdminReviews() {
  const listFn = useServerFn(adminListReviews);
  const delFn = useServerFn(adminDeleteReview);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => listFn(),
  });

  const handleDelete = async (id: string) => {
    try {
      await delFn({ data: { id } });
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Avaliação removida.");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao remover.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <Link
        to="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao painel
      </Link>
      <h1 className="mb-6 text-3xl font-bold">Avaliações dos clientes</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : error ? (
        <p className="text-destructive">{(error as Error).message}</p>
      ) : !data || data.length === 0 ? (
        <Card className="rounded-3xl p-10 text-center shadow-card">
          <p className="font-semibold">Ainda não há avaliações.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Quando seus clientes avaliarem produtos, aparecerá aqui.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {data.map((r) => (
            <Card key={r.id} className="flex flex-col gap-2 rounded-2xl p-4 shadow-card sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to="/produtos/$id"
                    params={{ id: r.product_id }}
                    className="font-semibold hover:text-primary"
                  >
                    {r.product_name}
                  </Link>
                  <span className="text-xs text-muted-foreground">por {r.author_name}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={
                          "h-3.5 w-3.5 " +
                          (n <= r.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/40")
                        }
                      />
                    ))}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {r.comment && (
                  <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                )}
              </div>
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
                    <AlertDialogTitle>Excluir avaliação?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(r.id)}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
