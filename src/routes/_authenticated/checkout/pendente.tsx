import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/checkout/pendente")({
  head: () => ({ meta: [{ title: "Pagamento pendente — Mimando" }] }),
  component: () => (
    <div className="container mx-auto max-w-xl px-4 py-16 text-center">
      <Clock className="mx-auto h-14 w-14 text-amber-500" />
      <h1 className="mt-4 text-3xl font-bold">Pagamento em análise</h1>
      <p className="mt-2 text-muted-foreground">
        Recebemos seu pedido! Assim que o Mercado Pago confirmar o pagamento, ele aparecerá como pago em "Meus pedidos".
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/meus-pedidos">Acompanhar pedido</Link>
      </Button>
    </div>
  ),
});
