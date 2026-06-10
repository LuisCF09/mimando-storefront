## Objetivo

Validar de ponta a ponta o fluxo de cupom e o controle de estoque (sem alterar regras) e entregar uma página de confirmação/status de pedido para a cliente acompanhar a compra após o pagamento.

## 1. Verificação do fluxo de cupom (somente teste, sem alterar lógica)

Roteiro de teste no preview, com print/relato do resultado:

1. Logar como administradora → `/admin/cupons` → criar cupom `MIMA10` (percent, 10%, sem mínimo, ativo, validade futura) e `FRETE20` (fixed, R$ 20, mínimo R$ 100).
2. Logar como cliente → adicionar 2 produtos no carrinho → `/carrinho`.
3. Aplicar `MIMA10`: confirmar toast, linha "Desconto (MIMA10)" e novo total = `subtotal − round(subtotal*0.1, 2)`.
4. Alterar quantidades: o desconto recalcula automaticamente (já implementado em `cart.tsx`).
5. Tentar `FRETE20` com subtotal < R$ 100 → deve recusar com motivo do servidor.
6. Aplicar com subtotal ≥ R$ 100 → desconto de R$ 20.
7. Ir a `/checkout` → confirmar que o resumo mostra cupom e total descontado.
8. Submeter o formulário → consultar a tabela `orders` (read_query) confirmando `cupom_codigo`, `desconto` e `total` salvos coerentes; conferir `order_items` e o valor enviado ao Mercado Pago (linha de log/initPoint) bate com o total.
9. Caso o servidor recalcule diferente do cliente, o erro é registrado e reportado (sem mexer no código nesta etapa).

Saída: relato curto com ✅/❌ por passo. Se algum passo falhar, abro um plano específico de correção.

## 2. Verificação do controle de estoque (somente teste)

1. Em `/admin`, editar um produto e definir `estoque = 0` (mantendo `disponivel = true`).
2. Conferir no card de `/produtos`, em `/favoritos`, na home e na página `/produtos/$id`:
   - Selo "Esgotado" aparece com prioridade sobre os outros.
   - Botão "Adicionar ao carrinho" desabilitado.
   - Botão de WhatsApp usa `whatsappConsultarLink` ("consultar disponibilidade").
3. Aumentar estoque para 3 → selo some, botões voltam ao normal.
4. Simular pedido pago via webhook de teste → estoque decrementa conforme quantidade.

Saída: relato ✅/❌. Correções entram em plano à parte se necessário.

## 3. Página de confirmação/status do pedido (entrega de código)

Hoje `/checkout/sucesso` é estático e não mostra qual pedido foi pago. Vou ligá-la ao último pedido da cliente e criar uma rota de detalhe reutilizável.

### Novos/alterados

- `src/lib/orders.functions.ts` — adicionar:
  - `getOrderById({ id })` (com `requireSupabaseAuth`): retorna o pedido + itens apenas se `user_id = auth.uid()` (RLS já garante; valida também no código). Inclui status do pagamento, total, desconto, cupom, endereço, itens com nome/qtd/preço.
  - `getLatestOrder()` (com `requireSupabaseAuth`): retorna o pedido mais recente do usuário (usado quando o Mercado Pago redireciona sem `order_id`).

- `src/components/OrderStatusCard.tsx` — componente compartilhado: badge de status (Aguardando pagamento / Aprovado / Pendente / Recusado / Cancelado), data, total com desconto destacado, lista de itens, endereço de entrega, código do pedido, link de WhatsApp para tirar dúvida.

- `src/routes/_authenticated/pedido.$id.tsx` (nova): página "Detalhes do pedido". Usa `useSuspenseQuery` com `getOrderById`. `notFoundComponent` e `errorComponent` definidos.

- `src/routes/_authenticated/checkout/sucesso.tsx` (atualizar): lê `?order_id=` da URL (quando o webhook/MP retornar) ou cai em `getLatestOrder`. Mostra mensagem de agradecimento + `OrderStatusCard`. Botões: "Ver meus pedidos" e "Continuar comprando". Polling leve (refetch a cada 4s por até 1 min) para o status mudar de `pending` → `paid` assim que o webhook processar.

- `src/routes/_authenticated/checkout/pendente.tsx` e `falha.tsx` (atualizar): reaproveitar `OrderStatusCard` com mensagens adequadas e link "Tentar novamente" / "Falar no WhatsApp".

- `src/routes/_authenticated/meus-pedidos.tsx` (atualizar): cada item da lista vira `<Link to="/pedido/$id">` para abrir o detalhe.

- `src/lib/orders.functions.ts` (`createCheckoutPreference`): incluir `order_id` nas URLs `back_urls` do Mercado Pago (`/checkout/sucesso?order_id=...`, idem `pendente` e `falha`) para a confirmação saber qual pedido exibir.

- E-mail de confirmação: fora do escopo deste sprint (sem provedor configurado). A "confirmação clara para o cliente" é entregue pela página de sucesso + página de detalhe + lista "Meus pedidos", todas mostrando o status atual sincronizado pelo webhook.

### Regras mantidas

- Só a dona cria/edita cupons e produtos (RLS + `has_role('admin')`).
- Nenhuma alteração de schema.
- Sem marketplace, sem painel de vendedor.

## Resumo do que entra em código

Apenas os arquivos do item 3 acima. Itens 1 e 2 são testes de QA com relato no chat; qualquer bug encontrado vira um plano de correção próprio.
