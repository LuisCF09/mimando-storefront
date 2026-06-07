# Sprint 3 — Plano de melhorias da Mimando

Mantendo a regra: loja própria, apenas a admin cadastra/edita produtos. Nada de marketplace.

## 1. Banco de dados (uma migration)

**Alterar `products`** — adicionar colunas:
- `is_featured boolean not null default false`
- `badge text` (livre: "Novo", "Promo"… opcional)
- *Disponibilidade já existe como `disponivel boolean` — reaproveitar, sem coluna nova.*

**Nova tabela `favorites`**: `id`, `user_id`, `product_id`, `created_at`, unique(user_id, product_id).
- RLS: usuário só vê/insere/remove os próprios.

**Nova tabela `reviews`**: `id`, `user_id`, `product_id`, `rating` (1–5, check), `comment` (text, max 500), `created_at`, unique(user_id, product_id).
- RLS:
  - SELECT: qualquer um (anon + authenticated) — avaliações são públicas.
  - INSERT/UPDATE/DELETE: só o dono (`auth.uid() = user_id`).
  - Admin pode SELECT tudo (já coberto pelo public select) e DELETE (moderação) via `has_role`.

GRANTs explícitos em todas as novas tabelas.

## 2. Catálogo (`/produtos`)

- Manter filtro de categoria existente.
- Adicionar **barra de busca** (nome, categoria, descricao_curta, descricao_completa) — filtragem client-side em cima do que já é carregado.
- Adicionar **ordenação**: relevância (padrão), preço ↑, preço ↓.
- Adicionar filtros: **Disponíveis**, **Em destaque**.
- Em cada card:
  - Botão **coração** (favoritar / desfavoritar) — só funciona logado; deslogado redireciona pra `/auth`.
  - Selo **Esgotado** quando `disponivel=false`; botão "Adicionar ao carrinho" desabilitado; WhatsApp vira "Consultar disponibilidade".
  - Selo **Destaque** quando `is_featured=true`.
  - Selo livre vindo de `badge` quando preenchido.

## 3. Detalhe do produto (`/produtos/$id`)

- Botão favoritar.
- Bloquear "adicionar ao carrinho" se esgotado, com selo visível.
- Nova seção **Avaliações**:
  - Média de estrelas + total.
  - Lista de avaliações (estrelas, nome do cliente, comentário, data).
  - Formulário (só logado, só uma avaliação por produto, editável): seletor 1–5 estrelas + textarea curta com validação Zod (rating 1–5, comment ≤ 500).

## 4. Favoritos (`/favoritos`)

- Rota sob `_authenticated/favoritos.tsx`.
- Lista os produtos favoritados (join `favorites` × `products`) com mesmo card do catálogo e botão "remover".

## 5. Home (`/`)

- Adicionar seção **Produtos em destaque** carregando `is_featured=true and disponivel=true`, limite 8. Esconder a seção se vazia.

## 6. Páginas institucionais

- `/sobre` — já existe; atualizar texto com o copy do briefing e menção ao Sudeste.
- `/contato` — já existe; adicionar **formulário** simples (nome, email, mensagem) com validação Zod. Submissão via server function que apenas grava em `contact_messages` (nova tabela mínima: id, name, email, message, created_at; SELECT só admin, INSERT público com rate-limit por IP via Zod + tamanho) e mostra toast. Mantém botões WhatsApp/Instagram/email.
- `/politicas` — **nova** página estática com seções: pagamento, compra pelo site, compra pelo WhatsApp, prazos, trocas e devoluções, atendimento Sudeste. Linkar no footer.

## 7. Painel admin

- `/admin` (index): cards de resumo
  - total produtos, total pedidos, esgotados, em destaque, últimos 5 pedidos.
  - queries via server function com `requireSupabaseAuth` + checagem `has_role('admin')`.
- Form de produto (`/admin/novo` e `/admin/$id`): adicionar toggles **Em destaque**, **Disponível** e campo **Selo** (texto livre opcional).
- Nova aba `/admin/avaliacoes`: lista todas as reviews com produto/cliente/nota/comentário, botão excluir.

## 8. Visual

- Adicionar componente `<Badge variant="destaque|esgotado|novo">` usando tokens existentes (rosa/lilás).
- Animações suaves: `transition-all`, hover scale nos cards, fade-in nas seções (Tailwind + classes utilitárias já no projeto).
- Sem mudar paleta nem layout geral.

## 9. Segurança (RLS resumida)

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| favorites | dono | dono | — | dono |
| reviews | público | autenticado (próprio) | dono | dono + admin |
| products (novas cols) | público (já existe) | admin | admin | admin |
| contact_messages | admin | público (anon) | — | admin |

Toda mutação de produto (destaque, disponibilidade) continua atrás de `has_role(auth.uid(), 'admin')`.

## 10. Arquivos

**Migration**: 1 arquivo com tudo (alter products + create favorites + reviews + contact_messages + RLS + GRANTs).

**Novos**:
- `src/routes/_authenticated/favoritos.tsx`
- `src/routes/politicas.tsx`
- `src/routes/_authenticated/admin/avaliacoes.tsx`
- `src/lib/favorites.functions.ts`, `src/lib/reviews.functions.ts`, `src/lib/admin-stats.functions.ts`, `src/lib/contact.functions.ts`
- `src/components/ProductBadges.tsx`, `src/components/FavoriteButton.tsx`, `src/components/ReviewsSection.tsx`, `src/components/ContactForm.tsx`

**Editados**:
- `src/routes/produtos.tsx` (busca + ordenação + filtros + selos + favoritar)
- `src/routes/produtos.$id.tsx` (favoritar + esgotado + avaliações)
- `src/routes/index.tsx` (seção destaques)
- `src/routes/sobre.tsx` (copy)
- `src/routes/contato.tsx` (formulário)
- `src/routes/__root.tsx` (link footer p/ políticas)
- `src/routes/_authenticated/admin/index.tsx` (cards de resumo)
- `src/routes/_authenticated/admin/novo.tsx` e `$id.tsx` (campos destaque/disponível/selo)
- `src/components/Header.tsx` (link "Favoritos" quando logado)

## Fora do escopo
- Multi-vendedor, perfis de vendedor, painel de vendedor.
- Pagamento real (segue Mercado Pago atual).
- Mudança de paleta/layout.

Posso seguir para implementação?
