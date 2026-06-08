import { useEffect, useRef, useState } from "react";
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
  const listRef = useRef<HTMLDivElement>(null);

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

  const distribution = (() => {
    const d = [0, 0, 0, 0, 0];
    data?.reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) d[r.rating - 1]++;
    });
    return d;
  })();
  const total = data?.count ?? 0;

  const scrollToList = () => {
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="mt-10" id="avaliacoes">
      <h2 className="text-xl font-bold">Avaliações</h2>

      {/* Resumo */}
      <Card className="mt-4 rounded-2xl p-5 shadow-card">
        {total > 0 && data ? (
          <div className="grid gap-6 sm:grid-cols-[auto,1fr] sm:items-center">
            <button
              type="button"
              onClick={scrollToList}
              className="flex flex-col items-center rounded-2xl px-4 py-2 text-center transition hover:bg-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Ver todas as avaliações"
            >
              <span className="text-4xl font-extrabold text-primary leading-none">
                {data.avg.toFixed(1)}
              </span>
              <div className="mt-2">
                <Stars value={Math.round(data.avg)} size={22} />
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                {total} {total === 1 ? "avaliação" : "avaliações"}
              </span>
            </button>

            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((n) => {
                const count = distribution[n - 1];
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={scrollToList}
                    className="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-xs text-muted-foreground transition hover:bg-secondary/40"
                  >
                    <span className="w-8 shrink-0 text-left">{n}★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right tabular-nums">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            Ainda não há avaliações. Seja a primeira a comentar ♡
          </div>
        )}
      </Card>

      {/* Form */}
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

      {/* Lista */}
      <div ref={listRef} id="lista-avaliacoes" className="mt-4 space-y-3 scroll-mt-24">
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
        ) : null}
      </div>
    </section>
  );
}
