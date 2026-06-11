import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "@/components/ProductForm";
import { adminGetProduct, updateProduct } from "@/lib/admin-products.functions";
import { toast } from "sonner";

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Editar produto</h1>
        {data && (
          <p className="text-sm text-muted-foreground">{data.nome}</p>
        )}
      </div>
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
            is_featured: data.is_featured,
            is_personalizavel: data.is_personalizavel,
            is_bestseller: data.is_bestseller,
            is_novidade: data.is_novidade,
            is_promocao: data.is_promocao,
            badge: data.badge ?? "",
            estoque: data.estoque,
            occasions: data.occasions,
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
