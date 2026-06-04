import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminListOrders } from "@/lib/orders.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/shop";
import { Package, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos — Mimando Admin" }] }),
  component: AdminPedidos,
});

const statusLabel: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  paid: { label: "Pago", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  canceled: { label: "Cancelado", className: "bg-muted text-muted-foreground" },
  failed: { label: "Falhou", className: "bg-red-100 text-red-800 hover:bg-red-100" },
};

function AdminPedidos() {
  const fn = useServerFn(adminListOrders);
  const { data, isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => fn() });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/admin">
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar ao painel
            </Link>
          </Button>
          <h1 className="mt-2 text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe todas as compras feitas pelo site.</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : (data?.length ?? 0) === 0 ? (
        <Card className="rounded-3xl p-10 text-center shadow-card">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 font-semibold">Nenhum pedido feito ainda.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {data!.map((o) => {
            const s = statusLabel[o.payment_status] ?? statusLabel.pending;
            return (
              <Card key={o.id} className="rounded-2xl p-5 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
                    <p className="font-semibold">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.customer_email} · {o.customer_phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={`rounded-full ${s.className}`}>{s.label}</Badge>
                    <p className="mt-1 text-lg font-bold text-primary">{formatBRL(o.total_price)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
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

                <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Entrega: </span>
                  {o.address_street}, {o.address_number}
                  {o.address_complement ? ` — ${o.address_complement}` : ""} · {o.address_district},{" "}
                  {o.address_city}/{o.address_state} · CEP {o.address_cep}
                </div>
                {o.mercado_pago_payment_id && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    MP payment id: {o.mercado_pago_payment_id}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
