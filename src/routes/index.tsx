import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Sparkles, Gift, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mimando Papelaria Fofa e Presentes Criativos" },
      {
        name: "description",
        content:
          "Presentes criativos, fofos e especiais para mimar quem você ama. Atendemos principalmente o Sudeste brasileiro.",
      },
      { property: "og:title", content: "Mimando Papelaria Fofa e Presentes Criativos" },
      {
        property: "og:description",
        content: "Presentes criativos, fofos e especiais para mimar quem você ama.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Mimando Papelaria
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Presentes criativos, fofos e especiais
              <span className="block bg-gradient-to-r from-primary to-purple-soft bg-clip-text text-transparent">
                para mimar quem você ama.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Canecas, garrafas, camisas, laços, papelaria e personalizados feitos com carinho
              para deixar qualquer momento ainda mais especial.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
              >
                <Link to="/produtos">
                  <Gift className="mr-2 h-5 w-5" /> Ver produtos
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/auth">Criar conta</Link>
              </Button>
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-4 py-2 text-sm text-foreground shadow-card">
              <MapPin className="h-4 w-4 text-primary" />
              Atendemos principalmente o <strong className="font-semibold">Sudeste</strong> (SP, RJ, MG, ES e região).
            </div>
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

      {/* CTA FINAL */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl gradient-soft p-8 text-center shadow-card sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Pronta para mimar alguém especial?</h2>
          <p className="mt-2 text-muted-foreground">
            Confira nosso catálogo e demonstre interesse pelos produtos que mais te encantam.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
          >
            <Link to="/produtos">Explorar produtos</Link>
          </Button>
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
