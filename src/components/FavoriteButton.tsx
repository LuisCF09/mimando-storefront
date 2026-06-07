import { Heart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  addFavorite,
  listMyFavoriteIds,
  removeFavorite,
} from "@/lib/favorites.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useIsAuthed() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setAuthed(!!data.session?.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setAuthed(!!s?.user),
    );
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  return authed;
}

export function FavoriteButton({
  productId,
  variant = "card",
}: {
  productId: string;
  variant?: "card" | "detail";
}) {
  const authed = useIsAuthed();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listMyFavoriteIds);
  const addFn = useServerFn(addFavorite);
  const removeFn = useServerFn(removeFavorite);

  const { data: ids } = useQuery({
    queryKey: ["my-favorite-ids"],
    queryFn: () => listFn(),
    enabled: !!authed,
  });

  const isFav = (ids ?? []).includes(productId);

  const handle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authed) {
      toast("Faça login para favoritar ♡");
      navigate({ to: "/auth" });
      return;
    }
    try {
      if (isFav) {
        await removeFn({ data: { productId } });
        toast("Removido dos favoritos");
      } else {
        await addFn({ data: { productId } });
        toast.success("Adicionado aos favoritos ♡");
      }
      qc.invalidateQueries({ queryKey: ["my-favorite-ids"] });
      qc.invalidateQueries({ queryKey: ["my-favorites"] });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao atualizar favoritos.");
    }
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-label={isFav ? "Remover dos favoritos" : "Favoritar"}
        className={cn(
          "absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/90 shadow-soft backdrop-blur transition hover:scale-110",
          isFav ? "text-primary" : "text-muted-foreground hover:text-primary",
        )}
      >
        <Heart className={cn("h-4 w-4 transition", isFav && "fill-current")} />
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={handle}
      className="w-full rounded-full"
    >
      <Heart className={cn("mr-2 h-5 w-5", isFav && "fill-primary text-primary")} />
      {isFav ? "Remover dos favoritos" : "Favoritar"}
    </Button>
  );
}
