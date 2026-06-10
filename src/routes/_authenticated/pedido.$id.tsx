import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getOrder } from "@/lib/orders.functions";
import { OrderStatusCard } from "@/components/OrderStatusCard";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pedido/$id")({
  head: () => ({ meta: [{ title: "Detalhes do pedido — Mimando" }] }),
  component: PedidoDetalhe,
});

function PedidoDetalhe() {
  const { id } = Route.useParams();
  const fn = useServerFn(getOrder);
  const { data, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fn({ data: { id } }),
    refetchInterval: (q) => {
      const o: any = q.state.data;
      return o && o.payment_status === "pending" ? 5000 : false;
    },
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-3 rounded-full">
        <Link to="/meus-pedidos">
          <ArrowLeft className="mr-1 h-4 w-4" /> Meus pedidos
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">Detalhes do pedido</h1>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando…
          </div>
        ) : error ? (
          <p className="text-destructive">Não foi possível carregar este pedido.</p>
        ) : data ? (
          <OrderStatusCard order={data} />
        ) : (
          <p className="text-muted-foreground">Pedido não encontrado.</p>
        )}
      </div>
    </div>
  );
}
