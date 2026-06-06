import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/shop";
import {
  BookOpen,
  PenTool,
  GlassWater,
  CupSoda,
  Coffee,
  Shirt,
  Ribbon,
  Gift,
  Sparkles,
  Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Papelaria: BookOpen,
  Canetas: PenTool,
  Garrafas: GlassWater,
  Copos: CupSoda,
  Canecas: Coffee,
  Camisas: Shirt,
  "Laços de cabelo": Ribbon,
  "Presentes criativos": Gift,
  Personalizados: Sparkles,
  Outros: Package,
};

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — Mimando Papelaria" },
      {
        name: "description",
        content:
          "Navegue por categorias: papelaria, canetas, garrafas, copos, canecas, camisas, laços, presentes criativos e mais.",
      },
      { property: "og:title", content: "Categorias — Mimando" },
      { property: "og:description", content: "Encontre o mimo certo por categoria." },
    ],
  }),
  component: CategoriasPage,
});

function CategoriasPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Nossas categorias</h1>
        <p className="mt-2 text-muted-foreground">
          Escolha uma categoria e descubra mimos especiais para cada ocasião.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((c) => {
          const Icon = ICONS[c] ?? Package;
          return (
            <Link
              key={c}
              to="/produtos"
              className="group flex flex-col items-center gap-3 rounded-2xl bg-card p-6 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full gradient-soft text-primary shadow-soft">
                <Icon className="h-6 w-6" />
              </span>
              <span className="font-semibold">{c}</span>
              <span className="text-xs text-primary group-hover:underline">Ver produtos</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
