import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/checkout/sucesso")({
  head: () => ({ meta: [{ title: "Pagamento aprovado — Mimando" }] }),
  component: () => (
    <div className="container mx-auto max-w-xl px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
      <h1 className="mt-4 text-3xl font-bold">Pagamento aprovado! ♡</h1>
      <p className="mt-2 text-muted-foreground">
        Obrigada pela compra! Em breve a Mimando entrará em contato para combinar o envio.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild className="rounded-full gradient-primary text-primary-foreground">
          <Link to="/meus-pedidos">Ver meus pedidos</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/produtos">Continuar comprando</Link>
        </Button>
      </div>
    </div>
  ),
});
