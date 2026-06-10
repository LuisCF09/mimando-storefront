import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { getOrder, getLatestOrder } from "@/lib/orders.functions";
import { OrderStatusCard } from "@/components/OrderStatusCard";
import { Button } from "@/components/ui/button";
import { XCircle, MessageCircle } from "lucide-react";
import { whatsappGenericLink } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/checkout/falha")({
  head: () => ({ meta: [{ title: "Pagamento não concluído — Mimando" }] }),
  validateSearch: z.object({ order: z.string().uuid().optional() }).parse,
  component: FailPage,
});

function FailPage() {
  const { order: orderId } = useSearch({ from: Route.fullPath });
  const getOrderFn = useServerFn(getOrder);
  const getLatestFn = useServerFn(getLatestOrder);

  const { data } = useQuery({
    queryKey: ["order-fail", orderId ?? "latest"],
    queryFn: () =>
      orderId ? getOrderFn({ data: { id: orderId } }) : getLatestFn(),
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <XCircle className="mx-auto h-14 w-14 text-destructive" />
        <h1 className="mt-4 text-3xl font-bold">Não conseguimos processar o pagamento</h1>
        <p className="mt-2 text-muted-foreground">
          Você pode tentar novamente pelo carrinho ou falar com a vendedora pelo WhatsApp.
        </p>
      </div>

      {data && (
        <div className="mt-8">
          <OrderStatusCard order={data} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild className="rounded-full">
          <Link to="/carrinho">Voltar ao carrinho</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <a href={whatsappGenericLink()} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" /> Falar no WhatsApp
          </a>
        </Button>
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/meus-pedidos">Meus pedidos</Link>
        </Button>
      </div>
    </div>
  );
}
