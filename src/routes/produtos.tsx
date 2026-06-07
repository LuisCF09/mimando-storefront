import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listProducts, type Product } from "@/lib/products.functions";
import { CATEGORIES, formatBRL, whatsappLink } from "@/lib/shop";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ImageOff, MessageCircle, PackageOpen, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CustomBadge, FeaturedBadge, SoldOutBadge } from "@/components/ProductBadges";

const productsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: () => listProducts({ data: {} }),
});

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — Mimando Papelaria" },
      {
        name: "description",
        content: "Veja todos os produtos fofos e criativos disponíveis na Mimando Papelaria.",
      },
      { property: "og:title", content: "Catálogo — Mimando Papelaria" },
      { property: "og:description", content: "Produtos fofos, criativos e personalizados." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: ProductsPage,
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="text-destructive">Não foi possível carregar os produtos: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div>Página não encontrada.</div>,
});

type SortMode = "recent" | "price_asc" | "price_desc";

function ProductsPage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sort, setSort] = useState<SortMode>("recent");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let out = products
      .filter((p) => (filter ? p.categoria === filter : true))
      .filter((p) => {
        if (!q) return true;
        return (
          p.nome.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q) ||
          (p.descricao_curta ?? "").toLowerCase().includes(q) ||
          (p.descricao_completa ?? "").toLowerCase().includes(q)
        );
      })
      .filter((p) => (onlyAvailable ? p.disponivel : true))
      .filter((p) => (onlyFeatured ? p.is_featured : true));

    if (sort === "price_asc") out = [...out].sort((a, b) => a.preco - b.preco);
    else if (sort === "price_desc") out = [...out].sort((a, b) => b.preco - a.preco);
    return out;
  }, [products, filter, searchQuery, onlyAvailable, onlyFeatured, sort]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Nossos produtos</h1>
        <p className="mt-2 text-muted-foreground">
          Escolha o seu favorito, compre pelo site ou chame no WhatsApp.
        </p>
      </div>

      <div className="mx-auto mb-6 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, categoria ou descrição..."
            aria-label="Buscar produtos"
            className="rounded-full pl-9"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap justify-center gap-2">
        <FilterChip active={filter === null} onClick={() => setFilter(null)}>Todos</FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
            {c}
          </FilterChip>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Ordenar:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-full border border-input bg-card px-3 py-1.5"
          >
            <option value="recent">Mais recentes</option>
            <option value="price_asc">Preço: menor para maior</option>
            <option value="price_desc">Preço: maior para menor</option>
          </select>
        </label>
        <FilterChip active={onlyAvailable} onClick={() => setOnlyAvailable((v) => !v)}>
          Disponíveis
        </FilterChip>
        <FilterChip active={onlyFeatured} onClick={() => setOnlyFeatured((v) => !v)}>
          Em destaque
        </FilterChip>
      </div>

      {filtered.length === 0 ? (
        <EmptyState all={products.length === 0} hasSearch={searchQuery.trim().length > 0} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-4 py-1.5 text-sm font-medium transition " +
        (active
          ? "gradient-primary text-primary-foreground shadow-soft"
          : "bg-secondary text-secondary-foreground hover:bg-accent")
      }
    >
      {children}
    </button>
  );
}

function ProductCard({ p }: { p: Product }) {
  const { addItem } = useCart();
  const esgotado = !p.disponivel;
  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-3xl border-border/60 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <FavoriteButton productId={p.id} />
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
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
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
        {p.descricao_curta && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{p.descricao_curta}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-primary">{formatBRL(p.preco)}</span>
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <Button
            disabled={esgotado}
            className="w-full rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
            onClick={() => {
              addItem({ productId: p.id, nome: p.nome, preco: Number(p.preco), imagem_url: p.imagem_url });
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
          <Button asChild variant="ghost" size="sm" className="w-full rounded-full text-xs">
            <Link to="/produtos/$id" params={{ id: p.id }}>Ver detalhes</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ all, hasSearch = false }: { all: boolean; hasSearch?: boolean }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-card/80 p-10 text-center shadow-card">
      <PackageOpen className="mx-auto h-10 w-10 text-primary" />
      <h2 className="mt-3 text-lg font-semibold">
        {all
          ? "Nenhum produto cadastrado ainda."
          : hasSearch
            ? "Nenhum produto encontrado para sua busca."
            : "Nenhum produto encontrado com esses filtros."}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {all
          ? "A loja está preparando novidades fofas para você. Volte em breve!"
          : hasSearch
            ? "Tente outro termo ou remova os filtros."
            : "Tente ajustar os filtros acima."}
      </p>
    </div>
  );
}
