import { Sparkles, PackageX, Tag, Star } from "lucide-react";

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

export function CustomBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
      <Tag className="h-3 w-3" /> {label}
    </span>
  );
}
