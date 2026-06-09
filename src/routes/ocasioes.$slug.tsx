import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listProducts } from "@/lib/products.functions";
import { listOccasions } from "@/lib/occasions.functions";
import { formatBRL, isNew, isSoldOut, whatsappLink } from "@/lib/shop";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageOff, MessageCircle, ShoppingCart, ArrowLeft, Gift } from "lucide-react";
import { ProductBadgeStack } from "@/components/ProductBadges";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/FavoriteButton";

const occasionsQuery = queryOptions({
  queryKey: ["occasions"],
  queryFn: () => listOccasions(),
});

const productsByOccasion = (slug: string) =>
  queryOptions({
    queryKey: ["products", "occasion", slug],
    queryFn: () => listProducts({ data: { occasion: slug } }),
  });

export const Route = createFileRoute("/ocasioes/$slug")({
  head: ({ loaderData }) => {
    const o = (loaderData as any)?.occasion;
    const nome = o?.nome ?? "Ocasião";
    return {
      meta: [
        { title: `Presentes para ${nome} — Mimando` },
        { name: "description", content: `Ideias de presentes para ${nome} na Mimando Papelaria.` },
        { property: "og:title", content: `Presentes para ${nome}` },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const [occasions, products] = await Promise.all([
      context.queryClient.ensureQueryData(occasionsQuery),
      context.queryClient.ensureQueryData(productsByOccasion(params.slug)),
    ]);
    const occasion = occasions.find((o) => o.slug === params.slug);
    if (!occasion) throw notFound();
    return { occasion, products };
  },
  component: OccasionPage,
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-16 text-center text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Ocasião não encontrada</h1>
      <Button asChild className="mt-6 rounded-full" variant="outline">
        <Link to="/produtos">Ver catálogo</Link>
      </Button>
    </div>
  ),
});

function OccasionPage() {
  const { slug } = Route.useParams();
  const { data: occasions } = useSuspenseQuery(occasionsQuery);
  const { data: products } = useSuspenseQuery(productsByOccasion(slug));
  const occasion = occasions.find((o) => o.slug === slug)!;
  const { addItem } = useCart();

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
          <Gift className="h-3.5 w-3.5" /> Escolha por ocasião
        </span>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Presentes para {occasion.nome}</h1>
        <p className="mt-2 text-muted-foreground">
          Selecionamos mimos perfeitos para esta ocasião especial.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="mx-auto max-w-lg rounded-3xl bg-card/80 p-10 text-center shadow-card">
          <p className="font-semibold">Ainda não temos produtos para esta ocasião.</p>
          <Button asChild className="mt-5 rounded-full" variant="outline">
            <Link to="/produtos">Ver todos os produtos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
            const esgotado = isSoldOut(p);
            return (
              <Card key={p.id} className="group relative flex flex-col overflow-hidden rounded-3xl border-border/60 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
                <FavoriteButton productId={p.id} />
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
                <CardContent className="flex flex-1 flex-col space-y-2 p-4">
                  <Badge variant="secondary" className="w-fit rounded-full font-normal">{p.categoria}</Badge>
                  <Link to="/produtos/$id" params={{ id: p.id }} className="hover:text-primary">
                    <h3 className="line-clamp-1 font-semibold">{p.nome}</h3>
                  </Link>
                  <span className="text-lg font-bold text-primary">{formatBRL(p.preco)}</span>
                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    <Button
                      disabled={esgotado}
                      className="w-full rounded-full gradient-primary text-primary-foreground shadow-soft"
                      onClick={() => {
                        addItem({ productId: p.id, nome: p.nome, preco: p.preco, imagem_url: p.imagem_url });
                        toast.success("Adicionado ao carrinho ♡", { description: p.nome });
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {esgotado ? "Esgotado" : "Adicionar ao carrinho"}
                    </Button>
                    <Button asChild variant="outline" className="w-full rounded-full">
                      <a href={whatsappLink(p.nome)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {esgotado ? "Consultar disponibilidade" : "WhatsApp"}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
