import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteMyReview,
  listProductReviews,
  upsertMyReview,
} from "@/lib/reviews.functions";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

function Stars({
  value,
  size = 16,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={cn(onChange ? "cursor-pointer" : "cursor-default")}
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              "transition",
              n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function useSession() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ? { id: data.session.user.id } : null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ? { id: s.user.id } : null),
    );
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  return user;
}

export function ReviewsSection({ productId }: { productId: string }) {
  const user = useSession();
  const qc = useQueryClient();
  const listFn = useServerFn(listProductReviews);
  const upsertFn = useServerFn(upsertMyReview);
  const delFn = useServerFn(deleteMyReview);

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => listFn({ data: { productId } }),
  });

  const myReview = user ? data?.reviews.find((r) => r.user_id === user.id) : null;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment);
    }
  }, [myReview?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return toast.error("Escolha uma nota de 1 a 5.");
    setSubmitting(true);
    try {
      await upsertFn({ data: { productId, rating, comment: comment.trim() } });
      toast.success(myReview ? "Avaliação atualizada ♡" : "Avaliação enviada ♡");
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao enviar avaliação.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await delFn({ data: { productId } });
      setComment("");
      setRating(5);
      toast("Avaliação removida");
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao remover.");
    }
  };

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl font-bold">Avaliações</h2>
        {data && data.count > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={Math.round(data.avg)} />
            <span>
              {data.avg.toFixed(1)} de 5 ({data.count} {data.count === 1 ? "avaliação" : "avaliações"})
            </span>
          </div>
        )}
      </div>

      <Card className="mt-4 rounded-2xl p-5 shadow-card">
        {user ? (
          <form onSubmit={submit} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Sua nota:</span>
              <Stars value={rating} size={22} onChange={setRating} />
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Conte o que achou do produto (opcional)"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{comment.length}/500</span>
              <div className="flex gap-2">
                {myReview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="rounded-full text-destructive"
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Remover
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                  className="rounded-full gradient-primary text-primary-foreground shadow-soft"
                >
                  {myReview ? "Atualizar avaliação" : "Enviar avaliação"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <Link to="/auth" className="text-primary hover:underline">
              Faça login
            </Link>{" "}
            para avaliar este produto.
          </div>
        )}
      </Card>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando avaliações…</p>
        ) : data && data.reviews.length > 0 ? (
          data.reviews.map((r) => (
            <Card key={r.id} className="rounded-2xl p-4 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{r.author_name}</span>
                <Stars value={r.rating} />
              </div>
              {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
              <p className="mt-1 text-xs text-muted-foreground/70">
                {new Date(r.created_at).toLocaleDateString("pt-BR")}
              </p>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Ainda não há avaliações. Seja a primeira a comentar ♡
          </p>
        )}
      </div>
    </section>
  );
}
