import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, ShoppingBag, Mail, UserIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({
    meta: [{ title: "Minha conta — Mimando" }, { name: "description", content: "Sua conta na Mimando Papelaria." }],
  }),
  component: ContaPage,
});

function ContaPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setNome((data.user?.user_metadata as any)?.nome ?? null);
    });
  }, []);
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Card className="rounded-3xl p-8 shadow-card">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full gradient-primary text-primary-foreground shadow-soft">
            <UserIcon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">{nome || "Minha conta"}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {email}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="rounded-full gradient-primary text-primary-foreground">
            <Link to="/produtos">
              <ShoppingBag className="mr-2 h-4 w-4" /> Ver produtos
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </Card>
    </div>
  );
}
