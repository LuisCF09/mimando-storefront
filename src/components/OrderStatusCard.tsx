import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL, whatsappGenericLink } from "@/lib/shop";
import { MessageCircle, MapPin, Package } from "lucide-react";
import type { Order } from "@/lib/orders.functions";

const STATUS: Record<
  string,
  { label: string; className: string; description: string }
> = {
  pending: {
    label: "Aguardando pagamento",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    description:
      "Assim que o Mercado Pago confirmar o pagamento, atualizamos esta página automaticamente.",
  },
  paid: {
    label: "Pagamento aprovado",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
    description:
      "Recebemos seu pagamento! A Mimando entrará em contato em breve para combinar o envio.",
  },
  canceled: {
    label: "Cancelado",
    className: "bg-muted text-muted-foreground",
    description: "Este pedido foi cancelado.",
  },
  failed: {
    label: "Pagamento recusado",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
    description:
      "O pagamento não foi concluído. Você pode tentar novamente ou falar com a vendedora pelo WhatsApp.",
  },
};

export function OrderStatusCard({ order }: { order: Order }) {
  const s = STATUS[order.payment_status] ?? STATUS.pending;
  const subtotal = order.items.reduce((a, i) => a + i.subtotal, 0);
  const desconto = Math.max(0, subtotal - order.total_price);

  return (
    <Card className="rounded-3xl p-6 shadow-card text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Pedido</p>
          <p className="font-mono text-sm font-semibold">#{order.id.slice(0, 8)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <Badge className={`rounded-full ${s.className}`}>{s.label}</Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>

      <div className="mt-5">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Package className="h-4 w-4 text-primary" /> Itens
        </p>
        <ul className="space-y-1 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span className="truncate">
                {i.quantity}× {i.product_name}
              </span>
              <span>{formatBRL(i.subtotal)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 space-y-1 border-t pt-3 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatBRL(subtotal)}</span>
        </div>
        {desconto > 0 && (
          <div className="flex items-center justify-between text-primary">
            <span>Desconto</span>
            <span>−{formatBRL(desconto)}</span>
          </div>
        )}
        <div className="mt-1 flex items-center justify-between border-t pt-2">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-primary">{formatBRL(order.total_price)}</span>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-primary" /> Entrega
        </p>
        <p className="text-sm text-muted-foreground">
          {order.customer_name} — {order.customer_phone}
          <br />
          {order.address_street}, {order.address_number}
          {order.address_complement ? ` — ${order.address_complement}` : ""}
          <br />
          {order.address_district}, {order.address_city}/{order.address_state} — CEP {order.address_cep}
        </p>
      </div>

      <Button
        asChild
        variant="outline"
        className="mt-5 w-full rounded-full border-primary/40 text-primary hover:bg-primary/5"
      >
        <a href={whatsappGenericLink()} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="mr-2 h-4 w-4" /> Falar no WhatsApp sobre este pedido
        </a>
      </Button>
    </Card>
  );
}
