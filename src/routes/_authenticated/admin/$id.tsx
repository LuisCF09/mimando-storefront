import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "@/components/ProductForm";
import { adminGetProduct, updateProduct } from "@/lib/admin-products.functions";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/$id")({
  head: () => ({
    meta: [{ title: "Editar produto — Mimando" }],
  }),
  component: EditarProduto,
});

function EditarProduto() {
  const { id } = Route.useParams();
  const router = useRouter();
  const getFn = useServerFn(adminGetProduct);
  const updFn = useServerFn(updateProduct);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => getFn({ data: { id } }),
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <Link
        to="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao painel
      </Link>
      <h1 className="mb-6 text-3xl font-bold">Editar produto</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : error ? (
        <p className="text-destructive">{(error as Error).message}</p>
      ) : data ? (
        <ProductForm
          submitLabel="Salvar alterações"
          initial={{
            nome: data.nome,
            preco: data.preco,
            categoria: data.categoria as any,
            descricao_curta: data.descricao_curta,
            descricao_completa: data.descricao_completa,
            imagem_url: data.imagem_url ?? "",
            disponivel: data.disponivel,
          }}
          onSubmit={async (v) => {
            try {
              await updFn({ data: { ...v, id } });
              toast.success("Produto atualizado!");
              router.navigate({ to: "/admin" });
            } catch (e: any) {
              toast.error(e.message ?? "Erro ao atualizar produto.");
            }
          }}
        />
      ) : null}
    </div>
  );
}
