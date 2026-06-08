import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyFavorites, removeFavorite } from "@/lib/favorites.functions";
import { formatBRL, whatsappLink } from "@/lib/shop";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ImageOff, MessageCircle, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { CustomBadge, FeaturedBadge, NewBadge, SoldOutBadge } from "@/components/ProductBadges";
import { isNew } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/favoritos")({
  head: () => ({
    meta: [{ title: "Meus favoritos — Mimando" }],
  }),
  component: FavoritosPage,
});

function FavoritosPage() {
  const listFn = useServerFn(listMyFavorites);
  const removeFn = useServerFn(removeFavorite);
  const qc = useQueryClient();
  const { addItem } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ["my-favorites"],
    queryFn: () => listFn(),
  });

  const remove = async (productId: string) => {
    try {
      await removeFn({ data: { productId } });
      qc.invalidateQueries({ queryKey: ["my-favorites"] });
      qc.invalidateQueries({ queryKey: ["my-favorite-ids"] });
      toast("Removido dos favoritos");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao remover.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold sm:text-4xl">
          <Heart className="h-7 w-7 fill-primary text-primary" /> Meus favoritos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Seus mimos salvos para olhar com calma depois ♡
        </p>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Carregando…</p>
      ) : !data || data.length === 0 ? (
        <div className="mx-auto max-w-lg rounded-3xl bg-card/80 p-10 text-center shadow-card">
          <Heart className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-3 text-lg font-semibold">Você ainda não favoritou nenhum produto.</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Toque no ♡ no produto que mais te conquistar.
          </p>
          <Button asChild className="mt-5 rounded-full gradient-primary text-primary-foreground shadow-soft">
            <Link to="/produtos">Explorar produtos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map(({ product: p }) => {
            const esgotado = !p.disponivel;
            return (
              <Card
                key={p.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border-border/60 shadow-card transition hover:-translate-y-1 hover:shadow-soft"
              >
                <Link to="/produtos/$id" params={{ id: p.id }}>
                  <div className="relative aspect-square overflow-hidden bg-secondary/50">
                    {p.imagem_url ? (
                      <img
                        src={p.imagem_url}
                        alt={p.nome}
                        loading="lazy"
                        className={
                          "h-full w-full object-cover transition duration-500 group-hover:scale-105 " +
                          (esgotado ? "opacity-60" : "")
                        }
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground">
                        <ImageOff className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex flex-col gap-1">
                      {esgotado && <SoldOutBadge />}
                      {p.is_featured && !esgotado && <FeaturedBadge />}
                      {p.badge && <CustomBadge label={p.badge} />}
                    </div>
                  </div>
                </Link>
                <CardContent className="flex flex-1 flex-col space-y-2 p-4">
                  <Badge variant="secondary" className="w-fit rounded-full font-normal">
                    {p.categoria}
                  </Badge>
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
                        {esgotado ? "Consultar disponibilidade" : "Comprar pelo WhatsApp"}
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full rounded-full text-xs text-destructive hover:text-destructive"
                      onClick={() => remove(p.id)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Remover dos favoritos
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
