import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/checkout/falha")({
  head: () => ({ meta: [{ title: "Pagamento não concluído — Mimando" }] }),
  component: () => (
    <div className="container mx-auto max-w-xl px-4 py-16 text-center">
      <XCircle className="mx-auto h-14 w-14 text-destructive" />
      <h1 className="mt-4 text-3xl font-bold">Não conseguimos processar o pagamento</h1>
      <p className="mt-2 text-muted-foreground">
        Tente novamente ou fale com a vendedora pelo WhatsApp para finalizar manualmente.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild className="rounded-full">
          <Link to="/carrinho">Voltar ao carrinho</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/meus-pedidos">Meus pedidos</Link>
        </Button>
      </div>
    </div>
  ),
});
