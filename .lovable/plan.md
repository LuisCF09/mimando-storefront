
# Plano — Finalização do Sprint 3

## 1. Publicação
- Abrir o diálogo de publicação para o site entrar no ar com as novidades (favoritos, avaliações, /sobre, /politicas, /contato).
- Após publicar, conferir a URL `*.lovable.app` carregando home, `/produtos`, `/favoritos`, `/sobre`, `/politicas`.

## 2. Validação das rotas
- `/favoritos` (rota protegida em `_authenticated/favoritos`): confirmar redirecionamento para `/auth` quando deslogado e listagem correta quando logado.
- `/sobre` e `/politicas`: páginas públicas — checar SSR, title/description e links do header/footer.
- Smoke test rápido via `invoke-server-function` em rotas SSR para garantir 200.

## 3. Validação de RLS (somente leitura no banco)
Verificar via `supabase--read_query` em `pg_policies` que:
- `products`: SELECT público, INSERT/UPDATE/DELETE somente `has_role(auth.uid(),'admin')`.
- `reviews`: SELECT público, INSERT/UPDATE/DELETE restritos a `auth.uid() = user_id` (cliente só mexe na própria) e admin pode moderar.
- `favorites`: tudo restrito a `auth.uid() = user_id`.
- `contact_messages`: INSERT público, SELECT só admin.
Se alguma policy estiver frouxa, abrir migration corretiva no momento (sem alterar nada que já esteja correto).

## 4. Selos nos cards do catálogo e favoritos
Hoje os selos `FeaturedBadge`, `SoldOutBadge` e `CustomBadge` já existem e aparecem em `/favoritos` e na página de detalhe, mas o card de `/produtos` mostra apenas “Esgotado”. Adicionar selo **Novo** (produtos com `created_at` nos últimos 14 dias), **Destaque** (`is_featured`) e **Esgotado** (`!disponivel`) também em:
- `src/routes/produtos.tsx` (grid de cards)
- `src/routes/index.tsx` (seção “Produtos em destaque”)
- Garantir consistência com `/favoritos` (já usa os três).

Implementação:
- Criar `NewBadge` em `src/components/ProductBadges.tsx` (ícone Sparkle/Tag com cor accent).
- Helper `isNew(createdAt)` em `src/lib/shop.ts` (`< 14 dias`).
- Expor `created_at` no `Product` type e no SELECT de `products.functions.ts` (já incluído no SELECT, falta no tipo/map).
- Renderizar pilha de badges no canto superior esquerdo dos cards, mesma diagramação do `/favoritos`.

## 5. Resumo e média clicável nas avaliações
Em `src/components/ReviewsSection.tsx`:
- Manter o cabeçalho com média + total, mas transformá-lo em **resumo visual fixo no topo**:
  - Nota grande (ex.: `4.7`), estrelas grandes (24px), e total “(12 avaliações)”.
  - Distribuição por estrelas (5→1) com barrinhas de proporção (sem libs novas — divs com largura `%`).
- Tornar a média **clicável**: ao clicar, faz scroll suave para a lista de avaliações (anchor `#lista-avaliacoes`) e foca o primeiro item.
- Quando não houver avaliações, mostrar estado vazio amigável no lugar do resumo.

## Detalhes técnicos
- Nenhum schema novo necessário; reaproveita `reviews`, `products.created_at`, `is_featured`, `disponivel`, `badge`.
- Sem alteração de conceito: continua loja própria, admin-only para produtos/moderação.
- Sem novas dependências.

## Arquivos a editar
- `src/components/ProductBadges.tsx` (novo `NewBadge`)
- `src/lib/shop.ts` (helper `isNew`)
- `src/lib/products.functions.ts` (incluir `created_at` no tipo `Product` e no `mapRow`)
- `src/routes/produtos.tsx` (badges no card)
- `src/routes/index.tsx` (badges na seção destaque)
- `src/routes/_authenticated/favoritos.tsx` (adicionar `NewBadge` para consistência)
- `src/components/ReviewsSection.tsx` (resumo + média clicável + distribuição)

## Fora do escopo
- Marketplace, múltiplos vendedores, mudança de paleta/layout, novo gateway de pagamento.
