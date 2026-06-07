import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  MessageCircle,
  ShoppingBag,
  Clock,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { whatsappGenericLink } from "@/lib/shop";

export const Route = createFileRoute("/politicas")({
  head: () => ({
    meta: [
      { title: "Políticas da loja — Mimando Papelaria" },
      {
        name: "description",
        content:
          "Formas de pagamento, prazos, trocas e devoluções da Mimando Papelaria Fofa e Presentes Criativos.",
      },
      { property: "og:title", content: "Políticas da loja — Mimando" },
      {
        property: "og:description",
        content: "Tudo o que você precisa saber para comprar na Mimando.",
      },
    ],
  }),
  component: PoliticasPage,
});

const items: { icon: any; title: string; text: string }[] = [
  {
    icon: CreditCard,
    title: "Formas de pagamento",
    text: "Aceitamos pagamento online pelo site via Mercado Pago (cartão de crédito, débito e Pix) e Pix combinado direto com a vendedora pelo WhatsApp.",
  },
  {
    icon: ShoppingBag,
    title: "Compra pelo site",
    text: "Adicione os produtos ao carrinho, faça login, preencha o endereço e finalize o pagamento online de forma rápida e segura.",
  },
  {
    icon: MessageCircle,
    title: "Compra pelo WhatsApp",
    text: "Prefere combinar tudo no chat? Clique em “Comprar pelo WhatsApp” em qualquer produto e finalize com a vendedora.",
  },
  {
    icon: Clock,
    title: "Prazos",
    text: "Os prazos de produção e envio são combinados diretamente com a vendedora, de acordo com o produto e a região de entrega.",
  },
  {
    icon: RefreshCw,
    title: "Trocas e devoluções",
    text: "Recebeu algo com defeito ou diferente do anunciado? Fale com a gente em até 7 dias e resolvemos juntinhas, com todo carinho.",
  },
  {
    icon: MapPin,
    title: "Atendimento e envios",
    text: "Atendemos principalmente o Sudeste brasileiro. Para outras regiões, consulte a vendedora pelo WhatsApp para verificar a viabilidade do envio.",
  },
];

function PoliticasPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Políticas da loja</h1>
        <p className="mt-3 text-muted-foreground">
          Aqui você encontra as informações principais para comprar com tranquilidade na Mimando.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl bg-card p-5 shadow-card transition hover:shadow-soft">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full gradient-primary text-primary-foreground shadow-soft">
          <Link to="/produtos">Ver produtos</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <a href={whatsappGenericLink()} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" /> Falar no WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
