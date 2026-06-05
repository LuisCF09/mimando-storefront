import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listProducts, type Product } from "@/lib/products.functions";
import { CATEGORIES, formatBRL } from "@/lib/shop";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ImageOff, PackageOpen, Search } from "lucide-react";

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

function ProductsPage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter ? products.filter((p) => p.categoria === filter) : products;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Nossos produtos</h1>
        <p className="mt-2 text-muted-foreground">
          Escolha o seu favorito e fale com a gente pelo WhatsApp.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <FilterChip active={filter === null} onClick={() => setFilter(null)}>
          Todos
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
            {c}
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState all={products.length === 0} />
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
  return (
    <Card className="group overflow-hidden rounded-3xl border-border/60 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
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
      <CardContent className="space-y-2 p-4">
        <Badge variant="secondary" className="rounded-full font-normal">
          {p.categoria}
        </Badge>
        <h3 className="line-clamp-1 font-semibold">{p.nome}</h3>
        {p.descricao_curta && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{p.descricao_curta}</p>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-primary">{formatBRL(p.preco)}</span>
          {!p.disponivel && (
            <Badge variant="outline" className="text-xs">
              Indisponível
            </Badge>
          )}
        </div>
        <Button
          asChild
          className="mt-2 w-full rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
        >
          <Link to="/produtos/$id" params={{ id: p.id }}>
            Ver detalhes
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState({ all }: { all: boolean }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-card/80 p-10 text-center shadow-card">
      <PackageOpen className="mx-auto h-10 w-10 text-primary" />
      <h2 className="mt-3 text-lg font-semibold">
        {all
          ? "Nenhum produto cadastrado ainda."
          : "Nenhum produto encontrado nessa categoria."}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {all
          ? "A loja está preparando novidades fofas para você. Volte em breve!"
          : "Tente escolher outra categoria no filtro acima."}
      </p>
    </div>
  );
}
