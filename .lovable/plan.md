
# Sprint 2 — Dois caminhos de compra (WhatsApp + Mercado Pago)

Mantém o modelo de **loja única** (só `lucianaap.costa82@gmail.com` cadastra produtos). Adiciono carrinho, checkout com endereço, pedidos, área "Meus pedidos", aba "Pedidos" no admin e toda a estrutura de Mercado Pago Checkout Pro — o botão "Pagar" fica desabilitado até você adicionar `MERCADO_PAGO_ACCESS_TOKEN` e `MERCADO_PAGO_PUBLIC_KEY`.

## O que muda para o cliente

- Na página do produto, dois botões claros:
  - **Comprar pelo WhatsApp** (já existe, mantém a mensagem pronta)
  - **Adicionar ao carrinho**
- **Carrinho** (`/carrinho`): lista de itens, alterar quantidade, remover, subtotal e total.
- **Checkout** (`/checkout`, exige login): resumo do pedido + formulário de endereço (nome, telefone, CEP, rua, número, complemento, bairro, cidade, UF) + botão **Finalizar pagamento** que cria o pedido como `pending` e redireciona ao Mercado Pago.
- **Meus pedidos** (`/meus-pedidos`): lista só dos pedidos do cliente logado, com número, itens, total, status e data.
- Páginas de retorno `/checkout/sucesso`, `/checkout/pendente`, `/checkout/falha` (callbacks do MP).

## O que muda para a administradora

- Nova aba **Pedidos** no painel (`/admin/pedidos`): todos os pedidos, com cliente, e-mail, itens, total, status, método, data e endereço de entrega.
- CRUD de produtos continua igual.

## Banco de dados (uma migration)

Tabelas novas no schema `public`:
- **orders**: `id`, `user_id` (FK auth.users), `customer_name`, `customer_email`, `customer_phone`, endereço (`address_cep`, `address_street`, `address_number`, `address_complement`, `address_district`, `address_city`, `address_state`), `total_price`, `payment_status` (enum: `pending`/`paid`/`canceled`/`failed`), `payment_method`, `mercado_pago_preference_id`, `mercado_pago_payment_id`, `created_at`, `updated_at`.
- **order_items**: `id`, `order_id` (FK), `product_id` (FK products, ON DELETE SET NULL), `product_name`, `product_price`, `quantity`, `subtotal`, `created_at`.

RLS:
- `orders`: SELECT do próprio cliente OR `has_role(auth.uid(),'admin')`. INSERT pelo próprio cliente. UPDATE só `service_role` (webhook) e admin.
- `order_items`: SELECT/INSERT condicionado a `orders.user_id = auth.uid()` OR admin.
- GRANTs para `authenticated` e `service_role`, conforme padrão do projeto.

## Mercado Pago — estrutura pronta, sem secrets ainda

- Instalo `mercadopago` (SDK oficial Node).
- **Server route** `src/routes/api/mercado-pago/create-preference.ts` (POST, autenticado): valida carrinho com Zod, recalcula preços do banco (nunca confia no cliente), cria `orders` + `order_items` com status `pending`, cria a preferência no MP, salva `mercado_pago_preference_id` e retorna `init_point`.
- **Server route público** `src/routes/api/public/mercado-pago/webhook.ts` (POST): recebe notificações, consulta o pagamento pelo SDK, atualiza `payment_status` e `mercado_pago_payment_id` via `supabaseAdmin`.
- Ambas leem `process.env.MERCADO_PAGO_ACCESS_TOKEN`. Se ausente, `create-preference` retorna 503 com mensagem amigável e o botão "Finalizar pagamento" mostra aviso "Pagamento online ainda não configurado pela loja".
- URL do webhook a configurar no painel MP: `https://project--a2335e50-388d-4d71-9317-3eb4bab5cd68.lovable.app/api/public/mercado-pago/webhook`.

## Carrinho (frontend)

- Contexto `CartProvider` em `src/lib/cart.tsx`, persistido em `localStorage` (chave `mimando-cart`). Itens: `{ productId, nome, preco, imagem_url, quantity }`.
- Hook `useCart()` com `addItem`, `removeItem`, `updateQuantity`, `clear`, `total`, `count`.
- Badge com contador no `Header`.

## Rotas a criar/ajustar

Públicas: já existem `/`, `/produtos`, `/produtos/$id`, `/auth`, `/reset-password`.
Cliente logado (sob `_authenticated/`):
- `carrinho.tsx`, `checkout.tsx`, `meus-pedidos.tsx`, e `checkout.sucesso.tsx` / `.pendente.tsx` / `.falha.tsx`.
- Mantém `conta.tsx`.
Admin (sob `_authenticated/admin/`):
- Novo `pedidos.tsx` (lista) e `pedidos.$id.tsx` (detalhe).
API:
- `api/mercado-pago/create-preference.ts`
- `api/public/mercado-pago/webhook.ts`

Observação: o spec pede `/login`, `/cadastro`, `/carrinho`, `/meus-pedidos`. Vou manter `/auth` (já feito) e usar `/meus-pedidos`, `/carrinho`, `/checkout` em português — alinhado ao restante.

## Server functions

`src/lib/orders.functions.ts`:
- `listMyOrders()` — cliente logado, lista seus pedidos + itens.
- `getMyOrder(id)` — detalhe do próprio pedido.
- `adminListOrders()` — exige `has_role admin`.
- `adminGetOrder(id)` — exige admin.

## Segurança

- Nada de dados de cartão no banco (Checkout Pro hospeda o formulário).
- Preços do pedido recalculados no servidor a partir de `products` (cliente não consegue forjar valor).
- Webhook usa `supabaseAdmin` apenas após consultar o pagamento no MP via SDK (não confia no payload bruto).
- RLS bloqueia cliente A de ver pedido de cliente B.

## O que NÃO entra (mantém a regra anti-marketplace)

- Sem múltiplos vendedores, sem "minha loja", sem painel de vendedor, sem comissão.
- Sem cálculo de frete (endereço só para entrega manual).
- Sem cupons, sem variações de produto, sem estoque.

## Próximo passo depois deste sprint

Quando você criar a conta no Mercado Pago, te peço para colar `MERCADO_PAGO_ACCESS_TOKEN` e `MERCADO_PAGO_PUBLIC_KEY` (sandbox ou produção) via formulário seguro. Aí o checkout passa a funcionar de verdade automaticamente, sem mexer no código.
