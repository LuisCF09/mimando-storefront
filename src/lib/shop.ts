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

export function isNew(createdAt?: string | null, days = 14): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < days * 24 * 60 * 60 * 1000;
}

export function isSoldOut(p: {
  disponivel: boolean;
  estoque?: number | null;
}): boolean {
  if (!p.disponivel) return true;
  if (p.estoque !== undefined && p.estoque !== null && p.estoque <= 0) return true;
  return false;
}

function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function whatsappLink(productName: string) {
  return waLink(
    `Olá! Tenho interesse no produto: ${productName}. Poderia me passar mais informações?`,
  );
}

export function whatsappPersonalizadoLink(productName: string) {
  return waLink(
    `Olá! Tenho interesse em personalizar o produto ${productName} que vi no site Mimando Papelaria Fofa e Presentes Criativos.`,
  );
}

export function whatsappConsultarLink(productName: string) {
  return waLink(
    `Olá! Gostaria de consultar a disponibilidade do produto ${productName} da Mimando Papelaria.`,
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

export const OCCASIONS_FALLBACK = [
  { slug: "aniversario", nome: "Aniversário" },
  { slug: "dia-dos-namorados", nome: "Dia dos Namorados" },
  { slug: "amiga-especial", nome: "Amiga especial" },
  { slug: "professores", nome: "Professores" },
  { slug: "mae", nome: "Mãe" },
  { slug: "pai", nome: "Pai" },
  { slug: "natal", nome: "Natal" },
  { slug: "volta-as-aulas", nome: "Volta às aulas" },
] as const;
