export const CATEGORIES = [
  "Papelaria",
  "Canetas",
  "Garrafas",
  "Copos",
  "Canecas",
  "Camisas",
  "Laços de cabelo",
  "Presentes criativos",
  "Personalizados",
  "Outros",
] as const;

export type Categoria = (typeof CATEGORIES)[number];

export const WHATSAPP_NUMBER = "5511984399180";
export const INSTAGRAM_URL = "https://www.instagram.com/mimando_presentescriativos/";
export const EMAIL_LOJA = "contato@mimandopresentescriativos.com.br";
export const HORARIO_ATENDIMENTO = "Segunda a sábado, das 9h às 18h";

export const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function whatsappLink(productName: string) {
  return waLink(
    `Olá! Tenho interesse no produto: ${productName}. Poderia me passar mais informações?`,
  );
}

export function whatsappGenericLink() {
  return waLink(
    "Olá, Mimando! Gostaria de saber mais sobre os produtos da loja. ♡",
  );
}

export type WhatsAppCartItem = { nome: string; quantity: number; preco: number };

export function whatsappCartLink(items: WhatsAppCartItem[], total: number) {
  const lista = items
    .map((i) => `- ${i.quantity}× ${i.nome} — ${formatBRL(i.preco * i.quantity)}`)
    .join("\n");
  const msg = `Olá! Gostaria de finalizar este pedido:\n${lista}\n\nTotal: ${formatBRL(total)}\n\nPoderia me passar as informações para pagamento via Pix?`;
  return waLink(msg);
}
