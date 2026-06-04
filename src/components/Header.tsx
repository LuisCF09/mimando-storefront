import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Heart, ShoppingBag, ShoppingCart, LogOut, User as UserIcon, Sparkles, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyRole } from "@/lib/admin-products.functions";
import { useCart } from "@/lib/cart";

function useSession() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.session?.user.id ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setUserId(s?.user.id ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  return { userId, loading };
}

function NavLinks({ onClick, isAdmin }: { onClick?: () => void; isAdmin: boolean }) {
  return (
    <>
      <Link
        to="/"
        onClick={onClick}
        className="text-sm font-medium hover:text-primary transition"
        activeProps={{ className: "text-primary font-semibold" }}
        activeOptions={{ exact: true }}
      >
        Início
      </Link>
      <Link
        to="/produtos"
        onClick={onClick}
        className="text-sm font-medium hover:text-primary transition"
        activeProps={{ className: "text-primary font-semibold" }}
      >
        Produtos
      </Link>
      {isAdmin && (
        <Link
          to="/admin"
          onClick={onClick}
          className="text-sm font-medium text-primary hover:opacity-80 transition flex items-center gap-1"
          activeProps={{ className: "font-semibold" }}
        >
          <Sparkles className="h-4 w-4" /> Painel
        </Link>
      )}
    </>
  );
}

export function Header() {
  const { userId } = useSession();
  const [open, setOpen] = useState(false);
  const getMyRoleFn = useServerFn(getMyRole);
  const { data: roleData } = useQuery({
    queryKey: ["my-role", userId],
    queryFn: () => getMyRoleFn(),
    enabled: !!userId,
  });
  const isAdmin = !!roleData?.isAdmin;
  const { count } = useCart();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 backdrop-blur-md bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full gradient-primary text-primary-foreground shadow-soft">
            <Heart className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-bold leading-tight">
            Mimando<span className="text-primary"> ♡</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLinks isAdmin={isAdmin} />
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="icon" className="relative rounded-full" aria-label="Carrinho">
            <Link to="/carrinho">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
          {userId ? (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/meus-pedidos">
                  <Package className="mr-1 h-4 w-4" /> Pedidos
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/conta">
                  <UserIcon className="mr-1 h-4 w-4" /> Conta
                </Link>
              </Button>
              <Button onClick={handleLogout} size="sm" variant="outline" className="rounded-full">
                <LogOut className="mr-1 h-4 w-4" /> Sair
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-full gradient-primary text-primary-foreground shadow-soft hover:opacity-90">
              <Link to="/auth">
                <ShoppingBag className="mr-1 h-4 w-4" /> Entrar
              </Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Button asChild variant="ghost" size="icon" className="relative rounded-full" aria-label="Carrinho">
            <Link to="/carrinho">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>


        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-4">
              <NavLinks isAdmin={isAdmin} onClick={() => setOpen(false)} />
              <div className="mt-2 border-t pt-4">
                {userId ? (
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="outline" className="rounded-full">
                      <Link to="/meus-pedidos" onClick={() => setOpen(false)}>
                        <Package className="mr-1 h-4 w-4" /> Meus pedidos
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link to="/conta" onClick={() => setOpen(false)}>
                        <UserIcon className="mr-1 h-4 w-4" /> Minha conta
                      </Link>
                    </Button>
                    <Button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      variant="ghost"
                      className="rounded-full"
                    >
                      <LogOut className="mr-1 h-4 w-4" /> Sair
                    </Button>
                  </div>
                ) : (
                  <Button
                    asChild
                    className="w-full rounded-full gradient-primary text-primary-foreground"
                  >
                    <Link to="/auth" onClick={() => setOpen(false)}>
                      Entrar / Cadastrar
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
