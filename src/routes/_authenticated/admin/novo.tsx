import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ProductForm } from "@/components/ProductForm";
import { createProduct } from "@/lib/admin-products.functions";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

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
    <div className="container mx-auto px-4 py-10">
      <Link
        to="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao painel
      </Link>
      <h1 className="mb-6 text-3xl font-bold">Novo produto</h1>
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
