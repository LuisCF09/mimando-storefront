import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Gift, MessageCircle } from "lucide-react";
import { whatsappGenericLink } from "@/lib/shop";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Mimando Papelaria Fofa e Presentes Criativos" },
      {
        name: "description",
        content:
          "Conheça a Mimando: papelaria fofa, canecas, garrafas, camisas, laços e presentes criativos escolhidos com carinho.",
      },
      { property: "og:title", content: "Sobre a Mimando" },
      {
        property: "og:description",
        content: "Mimos especiais para presentear quem você ama.",
      },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Sobre a Mimando
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          Mimos especiais para presentear quem você ama
        </h1>
        <p className="mt-5 text-muted-foreground sm:text-lg">
          A Mimando Papelaria Fofa e Presentes Criativos nasceu para transformar
          pequenos momentos em lembranças especiais. Trabalhamos com papelaria
          fofa, canecas, garrafas, camisas, laços, personalizados e presentes
          criativos, sempre escolhidos com carinho para quem ama surpreender,
          presentear e se mimar.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Heart, title: "Feito com carinho", text: "Cada item é escolhido a dedo para entregar fofura e qualidade." },
          { icon: Gift, title: "Presentes únicos", text: "Personalizados e variados para qualquer ocasião especial." },
          { icon: Sparkles, title: "Atendimento humano", text: "Fale direto com a vendedora pelo WhatsApp, rápido e atencioso." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl bg-card/80 p-5 text-center shadow-card">
            <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90">
          <Link to="/produtos">Ver produtos</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <a href={whatsappGenericLink()} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" /> Falar no WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
