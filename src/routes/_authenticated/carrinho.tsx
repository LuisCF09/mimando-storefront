import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/shop";
import { Minus, Plus, Trash2, ShoppingBag, ImageOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/carrinho")({
  head: () => ({ meta: [{ title: "Carrinho — Mimando" }] }),
  component: CarrinhoPage,
});

function CarrinhoPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-muted-foreground">
          Explore nosso catálogo e adicione produtos fofos para mimar quem você ama.
        </p>
        <Button asChild className="mt-6 rounded-full gradient-primary text-primary-foreground shadow-soft">
          <Link to="/produtos">Ver produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Seu carrinho</h1>
      <p className="text-muted-foreground">Revise os itens antes de finalizar.</p>

      <div className="mt-6 grid gap-4">
        {items.map((i) => (
          <Card key={i.productId} className="flex flex-col gap-4 rounded-2xl p-4 shadow-card sm:flex-row sm:items-center">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary/50">
              {i.imagem_url ? (
                <img src={i.imagem_url} alt={i.nome} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground">
                  <ImageOff className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{i.nome}</p>
              <p className="text-primary font-bold">{formatBRL(i.preco)}</p>
              <p className="text-xs text-muted-foreground">Subtotal: {formatBRL(i.preco * i.quantity)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-8 w-8"
                onClick={() => updateQuantity(i.productId, Math.max(1, i.quantity - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-medium">{i.quantity}</span>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-8 w-8"
                onClick={() => updateQuantity(i.productId, Math.min(99, i.quantity + 1))}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full h-8 w-8 text-destructive"
                onClick={() => removeItem(i.productId)}
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-lg">Total</span>
          <span className="text-2xl font-bold text-primary">{formatBRL(total)}</span>
        </div>
        <Button
          size="lg"
          className="mt-4 w-full rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
          onClick={() => router.navigate({ to: "/checkout" })}
        >
          Finalizar compra
        </Button>
        <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
          <Link to="/produtos">Continuar comprando</Link>
        </Button>
      </Card>
    </div>
  );
}
