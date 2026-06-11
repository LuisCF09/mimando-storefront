## Confirmações

- Não vou criar cupons fictícios. O passo de QA do plano anterior fica descartado. Cupons só existem se a administradora cadastrar em `/admin/cupons`.
- Vou revisar o painel admin com foco em consistência visual, navegação e atalhos. Sem mudar regras (continua acesso só da dona via `_authenticated/admin` + `has_role('admin')`).

## Revisão do painel admin

### 1. Layout compartilhado para todas as páginas do admin
- `src/routes/_authenticated/admin/route.tsx` (hoje só `<Outlet/>`): vira layout real com:
  - Cabeçalho fofo "Painel da Mimando ♡" + breadcrumb simples.
  - Barra de navegação por abas (sticky no mobile, lateral no desktop a partir de `lg`): Visão geral, Produtos, Pedidos, Cupons, Avaliações, Banner. Aba ativa destacada via `activeProps`.
  - Botão de atalho "Ver loja" (abre `/` em nova aba) e "Adicionar produto".
- Cada subpágina passa a focar só no conteúdo (some o cabeçalho duplicado dentro de cada arquivo).

### 2. Dashboard (`/admin`)
- Reorganiza em 4 stat cards já existentes + 2 novos: Pedidos pagos (mês), Faturamento (mês, soma `total_price` com `payment_status=paid`).
- Tabela "Últimos pedidos" ganha link clicável para `/pedido/$id` (reuso da página criada agora) e badge de status traduzida ("Pago", "Pendente"...).
- Lista de produtos vira tabela responsiva com colunas: imagem, nome+categoria, preço, estoque (com cor: vermelho 0, amarelo ≤5), badges, ações. Filtro por nome/categoria e ordenação por estoque/preço (estado em search params).

### 3. Página `/admin/pedidos`
- Filtros: status (todos/pendente/pago/cancelado/falhou) e busca por nome/email.
- Cada linha clicável → `/pedido/$id`.
- Exibe cupom usado e desconto.

### 4. Página `/admin/cupons`
- Mantém CRUD, mas:
  - Validação Zod no formulário (código maiúsculo, tipo, valor, validade, mínimo).
  - Mostra estado "Expirado" automaticamente quando `validade < hoje`.
  - Botão "Copiar código" e dica "Use em /carrinho".
  - Sem seed/exemplo. Estado vazio explica como criar o primeiro.

### 5. Página `/admin/banner`
- Pequenos ajustes: preview ao vivo do banner já existe; adiciono validação de URL da imagem (Zod), placeholder com sugestão, e botão "Restaurar padrão" (limpa o registro e a home volta ao texto fixo).

### 6. Página `/admin/avaliacoes`
- Adiciono filtro "pendentes/aprovadas/ocultas" e ação rápida de aprovar/ocultar inline. (Já existe a parte de listar, só ajustar UI.)

### 7. Cadastro/edição de produto
- `ProductForm`: agrupa campos em seções ("Informações", "Imagem", "Visibilidade & destaque", "Ocasiões"). Mensagens de erro Zod inline.
- Aviso visual quando `estoque = 0` lembrando que ficará como "Esgotado" no site.

### Fora do escopo
- Nenhuma alteração de schema, RLS, ou de regras de cliente/marketplace.
- Nenhum cupom de exemplo no banco.

## Arquivos afetados

Criar: nenhum.
Editar: `src/routes/_authenticated/admin/route.tsx`, `index.tsx`, `pedidos.tsx`, `cupons.tsx`, `banner.tsx`, `avaliacoes.tsx`, `$id.tsx`, `novo.tsx`, `src/components/ProductForm.tsx`.
