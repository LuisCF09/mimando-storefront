import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { adminListOrders } from "@/lib/orders.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatBRL } from "@/lib/shop";
import { Package, Search, BadgePercent } from "lucide-react";

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

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    const list = data ?? [];
    const needle = q.trim().toLowerCase();
    return list.filter((o) => {
      if (status !== "all" && o.payment_status !== status) return false;
      if (!needle) return true;
      return (
        o.customer_name.toLowerCase().includes(needle) ||
        o.customer_email.toLowerCase().includes(needle) ||
        o.id.toLowerCase().startsWith(needle)
      );
    });
  }, [data, q, status]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe todas as compras feitas pelo site.
        </p>
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl p-4 shadow-card">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, e-mail ou ID…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="canceled">Cancelados</SelectItem>
            <SelectItem value="failed">Falharam</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : filtered.length === 0 ? (
        <Card className="rounded-3xl p-10 text-center shadow-card">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 font-semibold">
            {(data?.length ?? 0) === 0
              ? "Nenhum pedido feito ainda."
              : "Nenhum pedido para esses filtros."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((o) => {
            const s = statusLabel[o.payment_status] ?? statusLabel.pending;
            return (
              <Link
                key={o.id}
                to="/pedido/$id"
                params={{ id: o.id }}
                className="block"
              >
                <Card className="rounded-2xl p-5 shadow-card transition-shadow hover:shadow-soft">
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

                  {(o.cupom_codigo || o.desconto > 0) && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                      <BadgePercent className="h-4 w-4" />
                      <span>
                        Cupom <span className="font-mono font-semibold">{o.cupom_codigo}</span>{" "}
                        — desconto de {formatBRL(o.desconto)}
                      </span>
                    </div>
                  )}

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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
