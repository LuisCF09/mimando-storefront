import { createFileRoute, Outlet, redirect, isRedirect, Link } from "@tanstack/react-router";
import { getMyRole } from "@/lib/admin-products.functions";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BadgePercent,
  Star,
  Image as ImageIcon,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await getMyRole();
      if (!isAdmin) throw redirect({ to: "/" });
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { to: "/admin/cupons", label: "Cupons", icon: BadgePercent },
  { to: "/admin/avaliacoes", label: "Avaliações", icon: Star },
  { to: "/admin/banner", label: "Banner", icon: ImageIcon },
] as const;

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full gradient-primary text-primary-foreground shadow-soft">
              <Package className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Painel da Mimando ♡</p>
              <p className="text-[11px] text-muted-foreground">
                Área exclusiva da administradora
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-3.5 w-3.5" /> Ver loja
              </a>
            </Button>
            <Button asChild size="sm" className="rounded-full gradient-primary text-primary-foreground shadow-soft">
              <Link to="/admin/novo">
                <Plus className="mr-1 h-3.5 w-3.5" /> Novo produto
              </Link>
            </Button>
          </div>
        </div>
        <nav className="container mx-auto -mb-px flex gap-1 overflow-x-auto px-4 pb-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                activeOptions={{ exact: t.exact ?? false }}
                className="group flex shrink-0 items-center gap-1.5 rounded-t-xl border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{
                  className:
                    "flex shrink-0 items-center gap-1.5 rounded-t-xl border-b-2 border-primary px-3 py-2 text-sm font-medium text-primary",
                }}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
