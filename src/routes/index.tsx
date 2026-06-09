import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart, Sparkles, Gift, Star, MessageCircle, ShoppingBag,
  ImageOff, ShoppingCart, Crown,
} from "lucide-react";
import { CATEGORIES, formatBRL, isNew, isSoldOut, whatsappGenericLink, whatsappLink } from "@/lib/shop";
import { listFeaturedProducts, listBestsellers } from "@/lib/products.functions";
import { getHomeBanner } from "@/lib/site-settings.functions";
import { listOccasions } from "@/lib/occasions.functions";
import { ProductBadgeStack } from "@/components/ProductBadges";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import type { Product } from "@/lib/products.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mimando Papelaria Fofa e Presentes Criativos" },
      { name: "description", content: "Mimos especiais para presentear quem você ama. Canecas, garrafas, camisas, laços, papelaria e presentes criativos." },
      { property: "og:title", content: "Mimando Papelaria Fofa e Presentes Criativos" },
      { property: "og:description", content: "Mimos especiais para presentear quem você ama." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: banner } = useQuery({ queryKey: ["home-banner"], queryFn: () => getHomeBanner() });
  const { data: featured } = useQuery({ queryKey: ["featured-products"], queryFn: () => listFeaturedProducts() });
  const { data: bestsellers } = useQuery({ queryKey: ["bestseller-products"], queryFn: () => listBestsellers() });
  const { data: occasions } = useQuery({ queryKey: ["occasions"], queryFn: () => listOccasions() });

  const titulo = banner?.titulo || "Mimos especiais para presentear quem você ama";
  const subtitulo = banner?.subtitulo || "Canecas, garrafas, camisas, laços, papelaria e presentes criativos escolhidos com carinho.";
  const botaoTexto = banner?.botao_texto || "Ver produtos";
  const botaoLink = banner?.botao_link || "/produtos";
  const isInternal = botaoLink.startsWith("/");

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {banner?.imagem_url && (
          <img src={banner.imagem_url} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20" />
        )}
        <div className="container relative mx-auto px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Mimando Papelaria Fofa e Presentes Criativos
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="block bg-gradient-to-r from-primary to-purple-soft bg-clip-text text-transparent">
                {titulo}
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">{subtitulo}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {isInternal ? (
                <Button asChild size="lg" className="rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90">
                  <a href={botaoLink}><Gift className="mr-2 h-5 w-5" /> {botaoTexto}</a>
                </Button>
              ) : (
                <Button asChild size="lg" className="rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90">
                  <a href={botaoLink} target="_blank" rel="noopener noreferrer"><Gift className="mr-2 h-5 w-5" /> {botaoTexto}</a>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/produtos"><ShoppingBag className="mr-2 h-5 w-5" /> Comprar pelo site</Link>
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
        <ProductsSection
          title="Produtos em destaque"
          subtitle="Selecionados a dedo pela Mimando ♡"
          icon={<Sparkles className="h-6 w-6 text-primary" />}
          products={featured}
        />
      )}

      {/* MAIS QUERIDINHOS DA LOJA */}
      {bestsellers && bestsellers.length > 0 && (
        <ProductsSection
          title="Mais queridinhos da loja"
          subtitle="Os mimos que mais saem ♡"
          icon={<Crown className="h-6 w-6 text-amber-500" />}
          products={bestsellers}
        />
      )}

      {/* ESCOLHA POR OCASIÃO */}
      {occasions && occasions.length > 0 && (
        <section className="container mx-auto px-4 pb-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
                <Gift className="h-3.5 w-3.5" /> Escolha por ocasião
              </span>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Presente certo para cada momento</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
              {occasions.map((o) => (
                <Link
                  key={o.slug}
                  to="/ocasioes/$slug"
                  params={{ slug: o.slug }}
                  className="group rounded-3xl bg-gradient-to-br from-secondary to-card p-6 text-center shadow-card transition hover:-translate-y-1 hover:shadow-soft"
                >
                  <span className="grid h-10 w-10 mx-auto place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <Gift className="h-5 w-5" />
                  </span>
                  <p className="mt-3 font-semibold">{o.nome}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIAS */}
      <section className="container mx-auto px-4 pb-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Explore por categoria</h2>
            <Link to="/categorias" className="text-sm text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link key={c} to="/produtos" className="rounded-full bg-card px-4 py-1.5 text-sm font-medium text-secondary-foreground shadow-card transition hover:bg-secondary">
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
            <Feature icon={<Heart className="h-5 w-5" />} title="Feito com carinho" text="Cada produto é escolhido a dedo para entregar fofura e qualidade em todos os detalhes." />
            <Feature icon={<Sparkles className="h-5 w-5" />} title="Personalizados especiais" text="Itens únicos e personalizados para presentear de um jeito que ninguém esquece." />
            <Feature icon={<Star className="h-5 w-5" />} title="Atendimento humano" text="Tire suas dúvidas e fale diretamente conosco pelo WhatsApp — rápido e atencioso." />
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-card p-8 text-center shadow-card sm:p-10">
          <h2 className="text-2xl font-bold sm:text-3xl">Sobre a Mimando</h2>
          <p className="mt-3 text-muted-foreground">
            A Mimando Papelaria Fofa e Presentes Criativos nasceu para transformar pequenos presentes em momentos especiais.
          </p>
          <div className="mt-5">
            <Button asChild variant="outline" className="rounded-full"><Link to="/sobre">Saiba mais</Link></Button>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl gradient-soft p-8 text-center shadow-card sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Pronta para mimar alguém especial?</h2>
          <p className="mt-2 text-muted-foreground">Confira nosso catálogo e escolha o presente perfeito.</p>
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

function ProductsSection({
  title, subtitle, icon, products,
}: { title: string; subtitle: string; icon: React.ReactNode; products: Product[] }) {
  const { addItem } = useCart();
  return (
    <section className="container mx-auto px-4 pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
              {icon} {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Link to="/produtos" className="hidden text-sm text-primary hover:underline sm:inline">Ver todos →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
            const esgotado = isSoldOut(p);
            return (
              <Card key={p.id} className="group flex flex-col overflow-hidden rounded-3xl border-border/60 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
                <Link to="/produtos/$id" params={{ id: p.id }}>
                  <div className="relative aspect-square overflow-hidden bg-secondary/50">
                    {p.imagem_url ? (
                      <img src={p.imagem_url} alt={p.nome} loading="lazy"
                        className={"h-full w-full object-cover transition duration-500 group-hover:scale-105 " + (esgotado ? "opacity-60" : "")} />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground">
                        <ImageOff className="h-10 w-10" />
                      </div>
                    )}
                    <ProductBadgeStack
                      esgotado={esgotado}
                      promocao={p.is_promocao}
                      destaque={p.is_featured}
                      bestseller={p.is_bestseller}
                      novidade={p.is_novidade}
                      novo={isNew(p.created_at)}
                      personalizavel={p.is_personalizavel}
                      custom={p.badge}
                    />
                  </div>
                </Link>
                <CardContent className="flex flex-1 flex-col gap-2 p-4">
                  <Badge variant="secondary" className="w-fit rounded-full font-normal">{p.categoria}</Badge>
                  <Link to="/produtos/$id" params={{ id: p.id }} className="hover:text-primary">
                    <h3 className="line-clamp-1 font-semibold">{p.nome}</h3>
                  </Link>
                  <span className="text-lg font-bold text-primary">{formatBRL(p.preco)}</span>
                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    <Button
                      size="sm"
                      disabled={esgotado}
                      className="w-full rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
                      onClick={() => {
                        addItem({ productId: p.id, nome: p.nome, preco: p.preco, imagem_url: p.imagem_url });
                        toast.success("Adicionado ao carrinho ♡", { description: p.nome });
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {esgotado ? "Esgotado" : "Adicionar"}
                    </Button>
                    <Button asChild size="sm" variant="outline" className="w-full rounded-full">
                      <a href={whatsappLink(p.nome)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {esgotado ? "Consultar" : "WhatsApp"}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="text-center md:text-left">
      <span className="inline-grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">{icon}</span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
