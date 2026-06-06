import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { CartProvider } from "@/lib/cart";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-7xl font-bold text-primary">404</h1>
          <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A página que você procura não existe ou foi movida.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90"
            >
              Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Esta página não carregou</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Algo deu errado. Tente novamente ou volte para a página inicial.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90"
            >
              Tentar novamente
            </button>
            <a
              href="/"
              className="rounded-full border border-input bg-background px-5 py-2 text-sm font-medium transition hover:bg-accent"
            >
              Início
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mimando Papelaria Fofa e Presentes Criativos" },
      {
        name: "description",
        content:
          "Presentes criativos, fofos e especiais para mimar quem você ama. Canecas, garrafas, papelaria, laços e personalizados. Enviamos para todo Sudeste.",
      },
      { name: "author", content: "Mimando Papelaria" },
      { property: "og:title", content: "Mimando Papelaria Fofa e Presentes Criativos" },
      {
        property: "og:description",
        content: "Presentes fofos e personalizados para mimar quem você ama.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <AuthSync />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
            <div className="font-medium">
              © 2026 Mimando Papelaria Fofa e Presentes Criativos
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-4">
              <Link to="/contato" className="hover:text-primary hover:underline">
                Contato
              </Link>
              <Link to="/privacidade" className="hover:text-primary hover:underline">
                Política de Privacidade
              </Link>
              <Link to="/termos" className="hover:text-primary hover:underline">
                Termos de Uso
              </Link>
            </div>
            <div className="mt-3 flex justify-center gap-4 text-xs">
              <a
                href="https://wa.me/5511984399180"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary hover:underline"
              >
                WhatsApp
              </a>
              <a
                href="https://instagram.com/mimando.papelaria"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary hover:underline"
              >
                Instagram
              </a>
            </div>
          </footer>
        </div>
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}
