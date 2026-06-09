import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getProduct } from "@/lib/products.functions";
import { formatBRL, isNew, isSoldOut, whatsappConsultarLink, whatsappLink, whatsappPersonalizadoLink } from "@/lib/shop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ImageOff, MessageCircle, ShoppingCart, Wand2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ProductBadgeStack } from "@/components/ProductBadges";
import { ReviewsSection } from "@/components/ReviewsSection";

const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: () => getProduct({ data: { id } }),
  });

export const Route = createFileRoute("/produtos/$id")({
  head: ({ loaderData }) => {
    const d = loaderData as Awaited<ReturnType<typeof getProduct>> | undefined;
    return {
      meta: [
        { title: d ? `${d.nome} — Mimando` : "Produto — Mimando" },
        { name: "description", content: d?.descricao_curta || "Detalhes do produto na Mimando Papelaria." },
        { property: "og:title", content: d?.nome ?? "Produto" },
        { property: "og:description", content: d?.descricao_curta ?? "" },
        ...(d?.imagem_url ? [{ property: "og:image", content: d.imagem_url }] : []),
      ],
    };
  },
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productQuery(params.id));
    if (!data) throw notFound();
    return data;
  },
  component: ProductDetail,
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-16 text-center text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Produto não encontrado</h1>
      <Button asChild className="mt-6 rounded-full" variant="outline">
        <Link to="/produtos">Voltar ao catálogo</Link>
      </Button>
    </div>
  ),
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: p } = useSuspenseQuery(productQuery(id));
  const { addItem } = useCart();
  if (!p) return null;
  const esgotado = isSoldOut(p);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <Link to="/produtos" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-card shadow-card">
          <div className="aspect-square">
            {p.imagem_url ? (
              <img src={p.imagem_url} alt={p.nome}
                className={"h-full w-full object-cover " + (esgotado ? "opacity-60" : "")} />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground">
                <ImageOff className="h-16 w-16" />
              </div>
            )}
          </div>
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

        <div className="flex flex-col">
          <Badge variant="secondary" className="w-fit rounded-full">{p.categoria}</Badge>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{p.nome}</h1>
          <p className="mt-2 text-3xl font-bold text-primary">{formatBRL(p.preco)}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {esgotado ? (
              <Badge variant="outline" className="rounded-full">Esgotado no momento</Badge>
            ) : (
              <>
                <Badge className="rounded-full bg-green-100 text-green-800 hover:bg-green-100">Disponível</Badge>
                {p.estoque > 0 && p.estoque <= 5 && (
                  <Badge variant="outline" className="rounded-full text-amber-600">
                    Últimas {p.estoque} unidades
                  </Badge>
                )}
              </>
            )}
          </div>

          {p.is_personalizavel && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-purple-500/10 p-4 text-sm">
              <Wand2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
              <p>
                <span className="font-semibold">Este produto pode ser personalizado.</span>{" "}
                Fale com a vendedora pelo WhatsApp para combinar os detalhes.
              </p>
            </div>
          )}

          {p.descricao_curta && <p className="mt-5 text-muted-foreground">{p.descricao_curta}</p>}

          {p.descricao_completa && (
            <div className="mt-6 rounded-2xl bg-card/70 p-5 shadow-card">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Descrição</h2>
              <p className="mt-2 whitespace-pre-line text-sm">{p.descricao_completa}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Button
              size="lg"
              disabled={esgotado}
              className="w-full rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
              onClick={() => {
                addItem({ productId: p.id, nome: p.nome, preco: p.preco, imagem_url: p.imagem_url });
                toast.success("Adicionado ao carrinho ♡", { description: p.nome });
              }}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {esgotado ? "Produto esgotado" : "Adicionar ao carrinho"}
            </Button>
            {p.is_personalizavel ? (
              <Button asChild size="lg" variant="outline" className="w-full rounded-full">
                <a href={whatsappPersonalizadoLink(p.nome)} target="_blank" rel="noopener noreferrer">
                  <Wand2 className="mr-2 h-5 w-5" /> Personalizar pelo WhatsApp
                </a>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline" className="w-full rounded-full">
                <a href={esgotado ? whatsappConsultarLink(p.nome) : whatsappLink(p.nome)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {esgotado ? "Consultar disponibilidade" : "Comprar pelo WhatsApp"}
                </a>
              </Button>
            )}
            <FavoriteButton productId={p.id} variant="detail" />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Pague online pelo site (Mercado Pago) ou combine direto com a vendedora pelo WhatsApp.
          </p>
        </div>
      </div>

      <ReviewsSection productId={p.id} />
    </div>
  );
}
