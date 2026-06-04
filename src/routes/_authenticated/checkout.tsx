import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useCart } from "@/lib/cart";
import { createCheckoutPreference } from "@/lib/orders.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL } from "@/lib/shop";
import { toast } from "sonner";
import { Loader2, ShoppingBag } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Mimando" }] }),
  component: CheckoutPage,
});

const schema = z.object({
  customer_name: z.string().trim().min(2, "Informe seu nome"),
  customer_email: z.string().trim().email("E-mail inválido"),
  customer_phone: z.string().trim().min(8, "Telefone inválido"),
  address_cep: z.string().trim().min(8, "CEP inválido"),
  address_street: z.string().trim().min(2, "Informe a rua"),
  address_number: z.string().trim().min(1, "Número"),
  address_complement: z.string().trim().max(120).optional(),
  address_district: z.string().trim().min(2, "Bairro"),
  address_city: z.string().trim().min(2, "Cidade"),
  address_state: z.string().trim().length(2, "UF (2 letras)"),
});

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const createFn = useServerFn(createCheckoutPreference);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    address_cep: "",
    address_street: "",
    address_number: "",
    address_complement: "",
    address_district: "",
    address_city: "",
    address_state: "",
  });

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Carrinho vazio</h1>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/produtos">Ver produtos</Link>
        </Button>
      </div>
    );
  }

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os dados.");
      return;
    }
    setLoading(true);
    try {
      const res = await createFn({
        data: {
          ...parsed.data,
          address_complement: parsed.data.address_complement ?? "",
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
      });
      if (!res.configured) {
        toast.success("Pedido registrado!", { description: res.message });
        clear();
        router.navigate({ to: "/meus-pedidos" });
        return;
      }
      clear();
      if (res.initPoint) {
        window.location.href = res.initPoint;
      } else {
        toast.error("Não foi possível abrir o checkout do Mercado Pago.");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao processar checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Finalizar compra</h1>
      <p className="text-muted-foreground">
        Preencha seus dados e o endereço de entrega. Você será direcionada ao Mercado Pago para o pagamento seguro.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit}>
          <Card className="rounded-2xl p-6 shadow-card">
            <h2 className="font-semibold">Seus dados</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" value={form.customer_name} onChange={update("customer_name")} required />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={form.customer_email} onChange={update("customer_email")} required />
              </div>
              <div>
                <Label htmlFor="tel">Telefone / WhatsApp</Label>
                <Input id="tel" value={form.customer_phone} onChange={update("customer_phone")} placeholder="(11) 9 9999-9999" required />
              </div>
            </div>
          </Card>

          <Card className="mt-4 rounded-2xl p-6 shadow-card">
            <h2 className="font-semibold">Endereço de entrega</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" value={form.address_cep} onChange={update("address_cep")} required />
              </div>
              <div className="sm:col-span-4">
                <Label htmlFor="rua">Rua</Label>
                <Input id="rua" value={form.address_street} onChange={update("address_street")} required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="num">Número</Label>
                <Input id="num" value={form.address_number} onChange={update("address_number")} required />
              </div>
              <div className="sm:col-span-4">
                <Label htmlFor="comp">Complemento</Label>
                <Input id="comp" value={form.address_complement} onChange={update("address_complement")} />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" value={form.address_district} onChange={update("address_district")} required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="cid">Cidade</Label>
                <Input id="cid" value={form.address_city} onChange={update("address_city")} required />
              </div>
              <div className="sm:col-span-1">
                <Label htmlFor="uf">UF</Label>
                <Input id="uf" maxLength={2} value={form.address_state} onChange={(e) => setForm({ ...form, address_state: e.target.value.toUpperCase() })} required />
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="mt-6 w-full rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Pagar {formatBRL(total)} com Mercado Pago
          </Button>
        </form>

        <Card className="h-fit rounded-2xl p-6 shadow-card">
          <h2 className="font-semibold">Resumo</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="truncate">
                  {i.quantity}× {i.nome}
                </span>
                <span className="font-medium">{formatBRL(i.preco * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span>Total</span>
            <span className="text-xl font-bold text-primary">{formatBRL(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
