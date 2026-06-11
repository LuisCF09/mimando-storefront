import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ProductForm } from "@/components/ProductForm";
import { createProduct } from "@/lib/admin-products.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/novo")({
  head: () => ({
    meta: [{ title: "Novo produto — Mimando" }],
  }),
  component: NovoProduto,
});

function NovoProduto() {
  const router = useRouter();
  const createFn = useServerFn(createProduct);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Novo produto</h1>
        <p className="text-sm text-muted-foreground">
          Adicione um produto à loja. Você poderá editar a qualquer momento.
        </p>
      </div>
      <ProductForm
        submitLabel="Salvar produto"
        onSubmit={async (v) => {
          try {
            await createFn({ data: v });
            toast.success("Produto criado!");
            router.navigate({ to: "/admin" });
          } catch (e: any) {
            toast.error(e.message ?? "Erro ao criar produto.");
          }
        }}
      />
    </div>
  );
}
