import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MessageCircle, Instagram, Clock, Mail } from "lucide-react";
import {
  whatsappGenericLink,
  INSTAGRAM_URL,
  HORARIO_ATENDIMENTO,
  WHATSAPP_NUMBER,
  EMAIL_LOJA,
} from "@/lib/shop";
import { ContactForm } from "@/components/ContactForm";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Mimando Papelaria" },
      {
        name: "description",
        content:
          "Fale com a Mimando pelo WhatsApp, Instagram ou pelo formulário de contato.",
      },
      { property: "og:title", content: "Contato — Mimando" },
      { property: "og:description", content: "Atendimento humano e rápido pelo WhatsApp." },
    ],
  }),
  component: ContatoPage,
});

function formatPhone(n: string) {
  const d = n.replace(/\D/g, "");
  if (d.length < 12) return n;
  return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
}

function ContatoPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Fale com a Mimando</h1>
        <p className="mt-3 text-muted-foreground sm:text-lg">
          Dúvidas sobre produtos, entregas e encomendas podem ser tiradas direto pelo WhatsApp.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <a
            href={whatsappGenericLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
              <MessageCircle className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-semibold">WhatsApp</h2>
            <p className="mt-1 text-sm text-muted-foreground">{formatPhone(WHATSAPP_NUMBER)}</p>
            <p className="mt-1 text-xs text-primary group-hover:underline">Iniciar conversa</p>
          </a>

          <a
            href={`mailto:${EMAIL_LOJA}`}
            className="group rounded-2xl bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-semibold">E-mail</h2>
            <p className="mt-1 break-all text-sm text-muted-foreground">{EMAIL_LOJA}</p>
            <p className="mt-1 text-xs text-primary group-hover:underline">Enviar mensagem</p>
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
              <Instagram className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-semibold">Instagram</h2>
            <p className="mt-1 text-sm text-muted-foreground">@mimando_presentescriativos</p>
            <p className="mt-1 text-xs text-primary group-hover:underline">Ver perfil</p>
          </a>

          <div className="rounded-2xl bg-card p-5 shadow-card sm:col-span-2 lg:col-span-1">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
              <Clock className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-semibold">Horário de atendimento</h2>
            <p className="mt-1 text-sm text-muted-foreground">{HORARIO_ATENDIMENTO}</p>
          </div>
        </div>

        <ContactForm />
      </div>

      <div className="mt-10 text-center">
        <Button
          asChild
          size="lg"
          className="rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
        >
          <a href={whatsappGenericLink()} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" /> Chamar no WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
