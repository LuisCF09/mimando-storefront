import { Sparkles, PackageX, Tag, Star, Crown, BadgePercent, Wand2 } from "lucide-react";

export function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-purple-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-soft">
      <Sparkles className="h-3 w-3" /> Destaque
    </span>
  );
}

export function SoldOutBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      <PackageX className="h-3 w-3" /> Esgotado
    </span>
  );
}

export function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-soft">
      <Star className="h-3 w-3" /> Novo
    </span>
  );
}

export function BestsellerBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-950 shadow-soft">
      <Crown className="h-3 w-3" /> Mais vendido
    </span>
  );
}

export function NovidadeBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-pink-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-soft">
      <Star className="h-3 w-3" /> Novidade
    </span>
  );
}

export function PromocaoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-soft">
      <BadgePercent className="h-3 w-3" /> Promoção
    </span>
  );
}

export function PersonalizavelBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-soft">
      <Wand2 className="h-3 w-3" /> Personalizável
    </span>
  );
}

export function CustomBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
      <Tag className="h-3 w-3" /> {label}
    </span>
  );
}

export function ProductBadgeStack({
  esgotado,
  promocao,
  destaque,
  bestseller,
  novidade,
  novo,
  personalizavel,
  custom,
}: {
  esgotado?: boolean;
  promocao?: boolean;
  destaque?: boolean;
  bestseller?: boolean;
  novidade?: boolean;
  novo?: boolean;
  personalizavel?: boolean;
  custom?: string | null;
}) {
  return (
    <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
      {esgotado && <SoldOutBadge />}
      {!esgotado && promocao && <PromocaoBadge />}
      {!esgotado && destaque && <FeaturedBadge />}
      {!esgotado && bestseller && <BestsellerBadge />}
      {!esgotado && novidade && <NovidadeBadge />}
      {!esgotado && novo && !novidade && <NewBadge />}
      {!esgotado && personalizavel && <PersonalizavelBadge />}
      {custom && <CustomBadge label={custom} />}
    </div>
  );
}
