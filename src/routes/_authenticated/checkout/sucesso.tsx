import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { getOrder, getLatestOrder } from "@/lib/orders.functions";
import { OrderStatusCard } from "@/components/OrderStatusCard";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/checkout/sucesso")({
  head: () => ({ meta: [{ title: "Pedido confirmado — Mimando" }] }),
  validateSearch: z.object({ order: z.string().uuid().optional() }).parse,
  component: SuccessPage,
});

function SuccessPage() {
  const { order: orderId } = useSearch({ from: Route.fullPath });
  const getOrderFn = useServerFn(getOrder);
  const getLatestFn = useServerFn(getLatestOrder);

  const { data, isLoading } = useQuery({
    queryKey: ["order-confirmation", orderId ?? "latest"],
    queryFn: () =>
      orderId ? getOrderFn({ data: { id: orderId } }) : getLatestFn(),
    refetchInterval: (q) => {
      const o: any = q.state.data;
      return o && o.payment_status === "pending" ? 4000 : false;
    },
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
        <h1 className="mt-4 text-3xl font-bold">Obrigada pela compra! ♡</h1>
        <p className="mt-2 text-muted-foreground">
          Seu pedido foi registrado. Confira os detalhes abaixo.
        </p>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando pedido…
          </div>
        ) : data ? (
          <OrderStatusCard order={data} />
        ) : (
          <p className="text-center text-muted-foreground">
            Não encontramos seu pedido. Veja em "Meus pedidos".
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild className="rounded-full gradient-primary text-primary-foreground">
          <Link to="/meus-pedidos">Ver meus pedidos</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/produtos">Continuar comprando</Link>
        </Button>
      </div>
    </div>
  );
}
