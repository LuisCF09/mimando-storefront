import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Sparkles,
  Gift,
  Star,
  MessageCircle,
  ShoppingBag,
  ImageOff,
  ShoppingCart,
} from "lucide-react";
import { CATEGORIES, formatBRL, whatsappGenericLink, whatsappLink } from "@/lib/shop";
import { listFeaturedProducts } from "@/lib/products.functions";
import { CustomBadge, FeaturedBadge } from "@/components/ProductBadges";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mimando Papelaria Fofa e Presentes Criativos" },
      {
        name: "description",
        content:
          "Mimos especiais para presentear quem você ama. Canecas, garrafas, camisas, laços, papelaria e presentes criativos.",
      },
      { property: "og:title", content: "Mimando Papelaria Fofa e Presentes Criativos" },
      {
        property: "og:description",
        content: "Mimos especiais para presentear quem você ama.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => listFeaturedProducts(),
  });
  const { addItem } = useCart();

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Mimando Papelaria Fofa e Presentes Criativos
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Mimos especiais
              <span className="block bg-gradient-to-r from-primary to-purple-soft bg-clip-text text-transparent">
                para presentear quem você ama
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Canecas, garrafas, camisas, laços, papelaria e presentes criativos
              escolhidos com carinho para deixar qualquer momento mais especial.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90">
                <Link to="/produtos">
                  <Gift className="mr-2 h-5 w-5" /> Ver produtos
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/produtos">
                  <ShoppingBag className="mr-2 h-5 w-5" /> Comprar pelo site
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-primary/40 text-primary hover:bg-primary/5">
                <a href={whatsappGenericLink()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" /> Comprar pelo WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUTOS EM DESTAQUE */}
      {featured && featured.length > 0 && (
        <section className="container mx-auto px-4 pb-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                  <Sparkles className="h-6 w-6 text-primary" /> Produtos em destaque
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Selecionados a dedo pela Mimando ♡
                </p>
              </div>
              <Link to="/produtos" className="hidden text-sm text-primary hover:underline sm:inline">
                Ver todos →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featured.map((p) => (
                <Card
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border-border/60 shadow-card transition hover:-translate-y-1 hover:shadow-soft"
                >
                  <Link to="/produtos/$id" params={{ id: p.id }}>
                    <div className="relative aspect-square overflow-hidden bg-secondary/50">
                      {p.imagem_url ? (
                        <img
                          src={p.imagem_url}
                          alt={p.nome}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground">
                          <ImageOff className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute left-3 top-3 flex flex-col gap-1">
                        <FeaturedBadge />
                        {p.badge && <CustomBadge label={p.badge} />}
                      </div>
                    </div>
                  </Link>
                  <CardContent className="flex flex-1 flex-col gap-2 p-4">
                    <Badge variant="secondary" className="w-fit rounded-full font-normal">
                      {p.categoria}
                    </Badge>
                    <Link to="/produtos/$id" params={{ id: p.id }} className="hover:text-primary">
                      <h3 className="line-clamp-1 font-semibold">{p.nome}</h3>
                    </Link>
                    <span className="text-lg font-bold text-primary">{formatBRL(p.preco)}</span>
                    <div className="mt-auto flex flex-col gap-2 pt-2">
                      <Button
                        size="sm"
                        className="w-full rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
                        onClick={() => {
                          addItem({ productId: p.id, nome: p.nome, preco: p.preco, imagem_url: p.imagem_url });
                          toast.success("Adicionado ao carrinho ♡", { description: p.nome });
                        }}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" /> Adicionar
                      </Button>
                      <Button asChild size="sm" variant="outline" className="w-full rounded-full">
                        <a href={whatsappLink(p.nome)} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Link to="/produtos" className="text-sm text-primary hover:underline">
                Ver todos os produtos →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIAS EM DESTAQUE */}
      <section className="container mx-auto px-4 pb-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Explore por categoria</h2>
            <Link to="/categorias" className="text-sm text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to="/produtos"
                className="rounded-full bg-card px-4 py-1.5 text-sm font-medium text-secondary-foreground shadow-card transition hover:bg-secondary"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROPOSTA */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-5xl rounded-3xl bg-card/80 p-8 shadow-card sm:p-12">
          <div className="grid gap-8 md:grid-cols-3">
            <Feature
              icon={<Heart className="h-5 w-5" />}
              title="Feito com carinho"
              text="Cada produto é escolhido a dedo para entregar fofura e qualidade em todos os detalhes."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              title="Personalizados especiais"
              text="Itens únicos e personalizados para presentear de um jeito que ninguém esquece."
            />
            <Feature
              icon={<Star className="h-5 w-5" />}
              title="Atendimento humano"
              text="Tire suas dúvidas e fale diretamente conosco pelo WhatsApp — rápido e atencioso."
            />
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-card p-8 text-center shadow-card sm:p-10">
          <h2 className="text-2xl font-bold sm:text-3xl">Sobre a Mimando</h2>
          <p className="mt-3 text-muted-foreground">
            A Mimando Papelaria Fofa e Presentes Criativos nasceu para transformar
            pequenos presentes em momentos especiais. Trabalhamos com produtos
            delicados, criativos e cheios de carinho, pensados para mimar quem você ama.
          </p>
          <div className="mt-5">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/sobre">Saiba mais</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl gradient-soft p-8 text-center shadow-card sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Pronta para mimar alguém especial?</h2>
          <p className="mt-2 text-muted-foreground">
            Confira nosso catálogo e escolha o presente perfeito para o seu momento.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90">
              <Link to="/produtos">Explorar produtos</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <a href={whatsappGenericLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" /> Falar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="text-center md:text-left">
      <span className="inline-grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
        {icon}
      </span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
