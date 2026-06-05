import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar ou cadastrar — Mimando" },
      { name: "description", content: "Crie sua conta ou entre para acompanhar suas escolhas." },
      { property: "og:title", content: "Entrar ou cadastrar" },
      { property: "og:description", content: "Acesse sua conta na Mimando Papelaria." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("E-mail inválido").max(255);
const passSchema = z.string().min(8, "Senha deve ter ao menos 8 caracteres").max(72);

function AuthPage() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/conta", replace: true });
    });
  }, [navigate]);

  return (
    <div className="container mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <div className="mb-6 text-center">
        <span className="inline-grid h-12 w-12 place-items-center rounded-full gradient-primary text-primary-foreground shadow-soft">
          <Heart className="h-5 w-5" />
        </span>
        <h1 className="mt-3 text-2xl font-bold">Bem-vinda à Mimando ♡</h1>
        <p className="text-sm text-muted-foreground">
          Entre ou crie sua conta para mimar quem você ama.
        </p>
      </div>

      <Card className="w-full rounded-3xl p-6 shadow-card">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 rounded-full">
            <TabsTrigger value="login" className="rounded-full">
              Entrar
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-full">
              Cadastrar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-6">
            <LoginForm onDone={() => navigate({ to: "/conta", replace: true })} />
          </TabsContent>
          <TabsContent value="signup" className="mt-6">
            <SignupForm />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ep = emailSchema.safeParse(email);
    if (!ep.success) return toast.error(ep.error.issues[0].message);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: ep.data, password });
      if (error) throw error;
      toast.success("Bem-vinda de volta!");
      onDone();
    } catch (err: any) {
      toast.error(err.message ?? "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const ep = emailSchema.safeParse(email);
    if (!ep.success) return toast.error(ep.error.issues[0].message);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(ep.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Enviamos um e-mail com o link para redefinir sua senha.");
      setForgot(false);
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao enviar e-mail.");
    } finally {
      setLoading(false);
    }
  };

  if (forgot) {
    return (
      <form className="space-y-4" onSubmit={sendReset}>
        <div>
          <Label htmlFor="reset-email">E-mail</Label>
          <Input
            id="reset-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-full gradient-primary text-primary-foreground"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar link de recuperação
        </Button>
        <button
          type="button"
          onClick={() => setForgot(false)}
          className="block w-full text-center text-sm text-muted-foreground hover:text-primary"
        >
          Voltar
        </button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="login-pass">Senha</Label>
        <Input
          id="login-pass"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full gradient-primary text-primary-foreground"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Entrar
      </Button>
      <button
        type="button"
        onClick={() => setForgot(true)}
        className="block w-full text-center text-sm text-muted-foreground hover:text-primary"
      >
        Esqueci minha senha
      </button>
    </form>
  );
}

function SignupForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      return toast.error("Você precisa aceitar a Política de Privacidade e os Termos de Uso.");
    }
    const ep = emailSchema.safeParse(email);
    if (!ep.success) return toast.error(ep.error.issues[0].message);
    const pp = passSchema.safeParse(password);
    if (!pp.success) return toast.error(pp.error.issues[0].message);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: ep.data,
        password: pp.data,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { nome: nome.trim() },
        },
      });
      if (error) throw error;
      toast.success("Cadastro realizado! Confira seu e-mail para confirmar.");
      setDone(true);
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm">
          Enviamos um e-mail de confirmação para <strong>{email}</strong>. Confirme para entrar.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/produtos">Ver produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <Label htmlFor="su-nome">Nome</Label>
        <Input id="su-nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="su-email">E-mail</Label>
        <Input
          id="su-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="su-pass">Senha</Label>
        <Input
          id="su-pass"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="su-consent"
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          className="mt-0.5"
        />
        <Label htmlFor="su-consent" className="text-xs leading-relaxed font-normal">
          Li e aceito a{" "}
          <Link to="/privacidade" target="_blank" className="text-primary underline">
            Política de Privacidade
          </Link>{" "}
          e os{" "}
          <Link to="/termos" target="_blank" className="text-primary underline">
            Termos de Uso
          </Link>
          .
        </Label>
      </div>
      <Button
        type="submit"
        disabled={loading || !consent}
        className="w-full rounded-full gradient-primary text-primary-foreground"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Criar conta
      </Button>
    </form>
  );
}
