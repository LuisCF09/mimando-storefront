export const CATEGORIES = [
  "Canecas",
  "Garrafas",
  "Camisas",
  "Laços de cabelo",
  "Papelaria",
  "Presentes criativos",
  "Personalizados",
  "Outros",
] as const;

export type Categoria = (typeof CATEGORIES)[number];

export const WHATSAPP_NUMBER = "5511984399180";

export const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export function whatsappLink(productName: string) {
  const text = `Olá, tenho interesse no produto ${productName}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
