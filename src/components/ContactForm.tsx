import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { sendContactMessage } from "@/lib/contact.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Informe seu nome.").max(100),
  email: z.string().trim().email("E-mail inválido.").max(255),
  message: z.string().trim().min(1, "Escreva uma mensagem.").max(2000),
});

export function ContactForm() {
  const sendFn = useServerFn(sendContactMessage);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Preencha os campos.");
      return;
    }
    setLoading(true);
    try {
      await sendFn({ data: parsed.data });
      toast.success("Mensagem enviada! Vamos responder pelo seu e-mail ♡");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-card p-6 shadow-card">
      <h2 className="font-semibold">Mande uma mensagem</h2>
      <p className="text-xs text-muted-foreground">
        Dúvidas sobre produtos, entregas e encomendas também podem ser tiradas direto pelo WhatsApp.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="cf-name">Nome</Label>
          <Input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
        </div>
        <div>
          <Label htmlFor="cf-email">E-mail</Label>
          <Input id="cf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
        </div>
      </div>
      <div>
        <Label htmlFor="cf-msg">Mensagem</Label>
        <Textarea
          id="cf-msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={2000}
          required
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">{message.length}/2000</p>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full gradient-primary text-primary-foreground shadow-soft"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Enviar mensagem
      </Button>
    </form>
  );
}
