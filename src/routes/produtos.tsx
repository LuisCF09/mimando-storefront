import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listProducts, type Product } from "@/lib/products.functions";
import { CATEGORIES, formatBRL, whatsappLink } from "@/lib/shop";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ImageOff, MessageCircle, PackageOpen, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

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

type PriceRange = "all" | "lt30" | "30to60" | "gt60";
type Availability = "all" | "available";

const PRICE_LABELS: Record<PriceRange, string> = {
  all: "Todos os preços",
  lt30: "Até R$ 30",
  "30to60": "R$ 30 a R$ 60",
  gt60: "Acima de R$ 60",
};

function matchesPrice(p: number, r: PriceRange) {
  if (r === "lt30") return p < 30;
  if (r === "30to60") return p >= 30 && p <= 60;
  if (r === "gt60") return p > 60;
  return true;
}

function ProductsPage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [price, setPrice] = useState<PriceRange>("all");
  const [availability, setAvailability] = useState<Availability>("all");

  const query = searchQuery.trim().toLowerCase();
  const filtered = products
    .filter((p) => (filter ? p.categoria === filter : true))
    .filter((p) => (query ? p.nome.toLowerCase().includes(query) : true))
    .filter((p) => matchesPrice(Number(p.preco), price))
    .filter((p) => (availability === "available" ? p.disponivel : true));

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
            placeholder="Buscar produtos..."
            aria-label="Buscar produtos por nome"
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

      <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Preço:</span>
          <select
            value={price}
            onChange={(e) => setPrice(e.target.value as PriceRange)}
            className="rounded-full border border-input bg-card px-3 py-1.5"
          >
            {(Object.keys(PRICE_LABELS) as PriceRange[]).map((k) => (
              <option key={k} value={k}>{PRICE_LABELS[k]}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Disponibilidade:</span>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value as Availability)}
            className="rounded-full border border-input bg-card px-3 py-1.5"
          >
            <option value="all">Todos</option>
            <option value="available">Apenas disponíveis</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState all={products.length === 0} hasSearch={query.length > 0} />
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
  return (
    <Card className="group flex flex-col overflow-hidden rounded-3xl border-border/60 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <Link to="/produtos/$id" params={{ id: p.id }}>
        <div className="aspect-square overflow-hidden bg-secondary/50">
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
          {!p.disponivel && (
            <Badge variant="outline" className="text-xs">
              Indisponível
            </Badge>
          )}
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <Button
            disabled={!p.disponivel}
            className="w-full rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
            onClick={() => {
              addItem({ productId: p.id, nome: p.nome, preco: Number(p.preco), imagem_url: p.imagem_url });
              toast.success("Adicionado ao carrinho ♡", { description: p.nome });
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Adicionar ao carrinho
          </Button>
          <Button asChild variant="outline" className="w-full rounded-full">
            <a href={whatsappLink(p.nome)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" /> Comprar pelo WhatsApp
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
