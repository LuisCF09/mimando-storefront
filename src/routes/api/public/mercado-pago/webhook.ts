import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/mercado-pago/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        if (!accessToken) {
          return new Response("Mercado Pago not configured", { status: 503 });
        }

        let body: any = {};
        try {
          body = await request.json();
        } catch {
          body = {};
        }

        const url = new URL(request.url);
        const queryType = url.searchParams.get("type") ?? url.searchParams.get("topic");
        const queryId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

        const type = body?.type ?? body?.action ?? queryType;
        const paymentId = body?.data?.id ?? queryId;

        if (!type || !String(type).includes("payment") || !paymentId) {
          return new Response("ignored", { status: 200 });
        }

        try {
          const { MercadoPagoConfig, Payment } = await import("mercadopago");
          const client = new MercadoPagoConfig({ accessToken });
          const payment = await new Payment(client).get({ id: String(paymentId) });

          const status = payment.status;
          const orderId =
            (payment.external_reference as string | undefined) ||
            (payment.metadata as any)?.order_id;
          if (!orderId) return new Response("no external_reference", { status: 200 });

          const mapped =
            status === "approved"
              ? "paid"
              : status === "rejected"
                ? "failed"
                : status === "cancelled" || status === "refunded"
                  ? "canceled"
                  : "pending";

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Verifica status anterior para evitar decremento duplicado
          const { data: prev } = await supabaseAdmin
            .from("orders")
            .select("payment_status")
            .eq("id", orderId)
            .maybeSingle();
          const wasAlreadyPaid = prev?.payment_status === "paid";

          await supabaseAdmin
            .from("orders")
            .update({
              payment_status: mapped,
              mercado_pago_payment_id: String(payment.id),
            })
            .eq("id", orderId);

          // Decrementa estoque uma única vez quando o pedido vira "paid"
          if (mapped === "paid" && !wasAlreadyPaid) {
            const { data: items } = await supabaseAdmin
              .from("order_items")
              .select("product_id,quantity")
              .eq("order_id", orderId);
            for (const it of items ?? []) {
              if (!it.product_id) continue;
              const { data: prod } = await supabaseAdmin
                .from("products")
                .select("estoque")
                .eq("id", it.product_id)
                .maybeSingle();
              const current = prod?.estoque ?? 0;
              const next = Math.max(0, Number(current) - Number(it.quantity));
              await supabaseAdmin
                .from("products")
                .update({ estoque: next })
                .eq("id", it.product_id);
            }
          }

          return new Response("ok", { status: 200 });
        } catch (err: any) {
          console.error("MP webhook error:", err);
          return new Response("error", { status: 500 });
        }
      },
      GET: async () =>
        new Response(JSON.stringify({ ok: true }), {
          headers: { "content-type": "application/json" },
        }),
    },
  },
});
