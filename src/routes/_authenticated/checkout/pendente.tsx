import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { getOrder, getLatestOrder } from "@/lib/orders.functions";
import { OrderStatusCard } from "@/components/OrderStatusCard";
import { Button } from "@/components/ui/button";
import { Clock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/checkout/pendente")({
  head: () => ({ meta: [{ title: "Pagamento pendente — Mimando" }] }),
  validateSearch: z.object({ order: z.string().uuid().optional() }).parse,
  component: PendingPage,
});

function PendingPage() {
  const { order: orderId } = useSearch({ from: Route.fullPath });
  const getOrderFn = useServerFn(getOrder);
  const getLatestFn = useServerFn(getLatestOrder);

  const { data, isLoading } = useQuery({
    queryKey: ["order-pending", orderId ?? "latest"],
    queryFn: () =>
      orderId ? getOrderFn({ data: { id: orderId } }) : getLatestFn(),
    refetchInterval: (q) => {
      const o: any = q.state.data;
      return o && o.payment_status === "pending" ? 5000 : false;
    },
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <Clock className="mx-auto h-14 w-14 text-amber-500" />
        <h1 className="mt-4 text-3xl font-bold">Pagamento em análise</h1>
        <p className="mt-2 text-muted-foreground">
          Recebemos seu pedido! Assim que o Mercado Pago confirmar, esta página atualiza sozinha.
        </p>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando pedido…
          </div>
        ) : data ? (
          <OrderStatusCard order={data} />
        ) : null}
      </div>

      <div className="mt-6 flex justify-center">
        <Button asChild className="rounded-full">
          <Link to="/meus-pedidos">Acompanhar pedidos</Link>
        </Button>
      </div>
    </div>
  );
}
