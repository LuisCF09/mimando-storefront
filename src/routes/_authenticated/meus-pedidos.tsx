import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listMyOrders } from "@/lib/orders.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/shop";
import { Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/meus-pedidos")({
  head: () => ({ meta: [{ title: "Meus pedidos — Mimando" }] }),
  component: MeusPedidos,
});

const statusLabel: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  paid: { label: "Pago", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  canceled: { label: "Cancelado", className: "bg-muted text-muted-foreground" },
  failed: { label: "Falhou", className: "bg-red-100 text-red-800 hover:bg-red-100" },
};

function MeusPedidos() {
  const fn = useServerFn(listMyOrders);
  const { data, isLoading } = useQuery({ queryKey: ["my-orders"], queryFn: () => fn() });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Meus pedidos</h1>
      <p className="text-muted-foreground">Acompanhe o histórico das suas compras.</p>

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Carregando…</p>
      ) : (data?.length ?? 0) === 0 ? (
        <Card className="mt-8 rounded-3xl p-10 text-center shadow-card">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 font-semibold">Você ainda não fez nenhum pedido.</p>
          <Button asChild className="mt-4 rounded-full">
            <Link to="/produtos">Explorar produtos</Link>
          </Button>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4">
          {data!.map((o) => {
            const s = statusLabel[o.payment_status] ?? statusLabel.pending;
            return (
              <Card key={o.id} className="rounded-2xl p-5 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Pedido</p>
                    <p className="font-mono text-sm font-semibold">#{o.id.slice(0, 8)}</p>
                  </div>
                  <Badge className={`rounded-full ${s.className}`}>{s.label}</Badge>
                </div>
                <ul className="mt-3 space-y-1 text-sm">
                  {o.items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-3">
                      <span className="truncate">
                        {i.quantity}× {i.product_name}
                      </span>
                      <span>{formatBRL(i.subtotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="font-bold text-primary">{formatBRL(o.total_price)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
