# Sprint Extra — Melhorias para o lançamento

Mantemos a regra: loja exclusiva da Mimando, só a admin cria/edita produtos. Nada de marketplace.

## 1. Banner editável da home

- Nova tabela `site_settings` (singleton, chave `home_banner`) com: `titulo`, `subtitulo`, `botao_texto`, `botao_link`, `imagem_url`, `updated_at`.
- Server fns: `getHomeBanner` (público) e `updateHomeBanner` (admin).
- Página `/admin/banner` no painel: form com pré‑visualização e upload via URL de imagem (mantendo o padrão atual de produtos).
- `src/routes/index.tsx` passa a ler o banner do banco em vez do texto fixo (fallback para os textos atuais se vazio).

## 2. Cupons de desconto

- Tabela `coupons`: `codigo` (único, upper), `tipo` (`percent` | `fixed`), `valor` (numeric), `validade` (date null = sem validade), `ativo` (bool), `min_subtotal` (opcional).
- RLS: SELECT público apenas via server fn (admin elevado); INSERT/UPDATE/DELETE só admin.
- Server fns:
  - `validateCoupon({ codigo, subtotal })` → retorna `{ valido, desconto, motivo }`.
  - CRUD admin: `listCoupons`, `createCoupon`, `updateCoupon`, `deleteCoupon`, `toggleCoupon`.
- Painel: `/admin/cupons` com tabela + form (criar/editar/ativar/desativar).
- Carrinho (`/_authenticated/carrinho`): input “Cupom de desconto” → aplica via `validateCoupon`, mostra linha de desconto e novo total. Cupom guardado no estado do carrinho.
- Checkout: persiste `cupom_codigo` e `desconto` no pedido (adiciona colunas em `orders`).

## 3. Controle de estoque

- A coluna `estoque` já existe em `products`. Vamos:
  - Exibir e editar `estoque` no `ProductForm` (input numérico).
  - Quando `estoque <= 0`, tratar como esgotado independente de `disponivel`.
  - Atualizar `isSoldOut(p)` em `src/lib/shop.ts` (helper único usado em cards, detalhe, favoritos).
  - Cards e página de detalhe: bloqueiam botão “Adicionar ao carrinho” quando esgotado e trocam o texto do WhatsApp para “Consultar disponibilidade” (mensagem específica).
  - Decrementar estoque ao concluir pedido aprovado (no fluxo atual de webhook do Mercado Pago, dentro de transação simples por item).

## 4. Produto personalizável

- Nova coluna `is_personalizavel boolean default false` em `products`.
- Form admin: checkbox “Produto personalizável”.
- `ProductBadges`: novo `PersonalizavelBadge` (rosa/lilás).
- Página de detalhe: aviso destacado + botão WhatsApp com mensagem pronta:
  > “Olá! Tenho interesse em personalizar o produto [nome] que vi no site Mimando Papelaria Fofa e Presentes Criativos.”
- Helper `whatsappPersonalizadoLink(nome)` em `src/lib/shop.ts`.

## 5. Selos extras e “Mais queridinhos da loja”

- Novas colunas em `products`: `is_bestseller`, `is_novidade`, `is_promocao` (bool). Mantemos `is_featured` (Destaque) e `badge` custom.
- Form admin: switches para cada selo.
- Componentes em `ProductBadges.tsx`: `BestsellerBadge`, `NovidadeBadge`, `PromocaoBadge` (+ os já existentes).
- Home: nova seção **“Mais queridinhos da loja”** entre Destaques e Categorias, listando `is_bestseller = true` (server fn `listBestsellers`).
- Selos aparecem em cards (catálogo, home, favoritos) e na página de detalhe, com prioridade visual: Esgotado > Promoção > Destaque > Mais vendido > Novidade/Novo > Personalizável > custom.

## 6. Presentes por ocasião

- Nova tabela `occasions` (`slug`, `nome`, `ordem`) — seed: Aniversário, Dia dos Namorados, Amiga especial, Professores, Mãe, Pai, Natal, Volta às aulas.
- Tabela de junção `product_occasions` (`product_id`, `occasion_slug`).
- Server fns: `listOccasions`, `listProductsByOccasion(slug)`, e admin `setProductOccasions(productId, slugs[])`.
- Form admin: grupo de checkboxes “Ocasiões”.
- Home: seção **“Escolha por ocasião”** com cards/chips coloridos linkando para `/ocasioes/$slug`.
- Nova rota `src/routes/ocasioes.$slug.tsx` listando produtos da ocasião (mesmo grid do catálogo).
- Catálogo `/produtos`: novo filtro “Ocasião” (select) que usa o mesmo server fn.

## 7. Painel admin — atualizações

Sidebar/cabeçalho do `/admin` ganha atalhos: **Banner**, **Cupons**, **Avaliações**, **Pedidos**, **Adicionar produto**. Lista de produtos passa a mostrar estoque e ícones dos novos selos.

## Detalhes técnicos

- Migrações (uma migration única):
  - `ALTER TABLE products ADD COLUMN is_personalizavel/is_bestseller/is_novidade/is_promocao bool default false`.
  - `CREATE TABLE site_settings`, `coupons`, `occasions`, `product_occasions` + GRANTs + RLS (leitura pública para `site_settings`/`occasions`/`product_occasions`; escrita só admin via `has_role`). `coupons` sem leitura pública.
  - `ALTER TABLE orders ADD COLUMN cupom_codigo text, desconto numeric default 0`.
  - Seed das ocasiões.
- Arquivos novos:
  - `src/lib/site-settings.functions.ts`
  - `src/lib/coupons.functions.ts`
  - `src/lib/occasions.functions.ts`
  - `src/routes/_authenticated/admin/banner.tsx`
  - `src/routes/_authenticated/admin/cupons.tsx`
  - `src/routes/ocasioes.$slug.tsx`
  - Componentes: novos badges, `CouponInput.tsx`, `OccasionPicker.tsx`.
- Arquivos editados:
  - `src/lib/shop.ts` (helpers de estoque, WhatsApp personalizado, lista de ocasiões).
  - `src/lib/products.functions.ts` e `admin-products.functions.ts` (novas colunas + ocasiões + `listBestsellers`).
  - `src/components/ProductForm.tsx`, `ProductBadges.tsx`.
  - `src/routes/index.tsx` (banner dinâmico + Mais queridinhos + Ocasiões).
  - `src/routes/produtos.tsx` e `produtos.$id.tsx` (selos, estoque, personalizável, filtro de ocasião).
  - `src/routes/_authenticated/carrinho.tsx` e `checkout/index.tsx` (cupom + desconto).
  - `src/routes/_authenticated/admin/index.tsx` (atalhos + estoque na lista).
  - `src/routes/_authenticated/favoritos.tsx` (novos selos).
  - Webhook Mercado Pago: decremento de estoque.

## Fora de escopo

- Upload nativo de imagens (continua por URL). Posso adicionar storage bucket num próximo sprint se quiser.
- Cupom de “frete grátis” real (sem cálculo de frete no projeto). Tratamos `FRETEGRATIS` como cupom de valor fixo configurável.
- Marketplace, múltiplos vendedores, painel de vendedor — explicitamente excluído.
