# MVP — Mimando Papelaria Fofa e Presentes Criativos

Loja virtual single-tenant (uma única dona/admin), em rosa/roxo/lilás/branco, responsiva, com catálogo público e painel admin protegido. Sem checkout: interesse vai por WhatsApp para **+55 11 98439-9180**.

## Stack e backend
- TanStack Start + Tailwind v4 (tokens em `src/styles.css`).
- Lovable Cloud (Supabase) ativado para auth, banco e RLS.
- Admin única: `lucianaap.costa82@gmail.com` (papel `admin` em `user_roles`).
- Imagens de produto: **URL da imagem** (campo de texto, sem storage).

## Design system (em `src/styles.css`)
- Tokens semânticos em `oklch`: rosa principal, lilás, roxo suave, branco/off-white, foreground escuro suave.
- Cards arredondados (`--radius` ~1rem), sombras suaves, gradiente rosa→lilás para hero e CTA.
- Fontes modernas (Quicksand/Poppins via Google Fonts).
- Componentes shadcn já presentes (Button, Card, Input, Dialog, Select, Form, Sonner, etc.).

## Rotas (file-based em `src/routes/`)
Públicas:
- `index.tsx` — Home: hero com nome, frase “Presentes criativos, fofos e especiais para mimar quem você ama.”, CTA para catálogo, seção “Nossa proposta”, destaque “Atendemos principalmente o Sudeste 🇧🇷 (SP, RJ, MG, ES e região)”.
- `produtos.tsx` — Catálogo com filtro por categoria (chips). Cards: imagem, nome, preço, categoria, descrição curta, botão “Ver detalhes”. Estado vazio: “Nenhum produto cadastrado ainda. A loja está preparando novidades fofas para você.”
- `produtos.$id.tsx` — Detalhes: imagem grande, nome, preço, categoria, descrição completa, badge disponibilidade, botão “Tenho interesse” → `https://wa.me/5511984399180?text=Olá, tenho interesse no produto [nome].`
- `auth.tsx` — Login + Cadastro (tabs) com e-mail/senha; link “Esqueci minha senha”.
- `reset-password.tsx` — Define nova senha após link de recuperação.

Protegidas (sob `_authenticated/`, layout client-rendered gerenciado pela integração):
- `_authenticated/conta.tsx` — Página simples do cliente (nome, e-mail, logout).
- `_authenticated/admin.tsx` — Layout admin (gate extra: exige role `admin`, senão redireciona para `/`).
- `_authenticated/admin/index.tsx` — Dashboard: lista de produtos, botão “Adicionar produto”, ações editar/excluir, toggle disponibilidade.
- `_authenticated/admin/novo.tsx` — Formulário criar produto.
- `_authenticated/admin/$id.tsx` — Formulário editar produto.

Header responsivo (logo, links Home/Produtos/Conta, botão Entrar/Sair, link Admin só se for admin). Menu mobile com Sheet.

## Banco de dados (migration Supabase)
- Enum `app_role`: `admin`, `cliente`.
- `profiles` (id uuid PK = auth.users.id, nome text, email text, created_at). Trigger `on_auth_user_created` cria profile automático.
- `user_roles` (id, user_id FK auth.users, role app_role, unique(user_id, role)). Função SECURITY DEFINER `has_role(uuid, app_role)`.
- `products` (id uuid, nome, preco numeric(10,2), categoria text, descricao_curta, descricao_completa, imagem_url, disponivel boolean default true, created_at, updated_at). Trigger `updated_at`.
- Enum/constraint de categoria aceitando: Canecas, Garrafas, Camisas, Laços de cabelo, Papelaria, Presentes criativos, Personalizados, Outros.
- GRANTs explícitos a `anon` (SELECT em products) e `authenticated`/`service_role`.
- RLS:
  - `products`: SELECT público (anon + authenticated); INSERT/UPDATE/DELETE só `has_role(auth.uid(),'admin')`.
  - `profiles`: SELECT/UPDATE só dono; admin pode SELECT tudo.
  - `user_roles`: SELECT do próprio usuário; nenhuma escrita via API (gerenciada por seed/admin).
- Seed: insere role `admin` para o usuário com email `lucianaap.costa82@gmail.com` (executado idempotente; se ainda não existir em auth.users, cria registro em tabela `admin_emails` e o trigger de signup atribui role ao criar conta com esse email).

## Server functions (`src/lib/*.functions.ts`)
- `products.functions.ts`: `listProducts({categoria?})`, `getProduct(id)` (públicos via `supabaseAdmin` com projeção segura, chamados pelos loaders).
- `admin-products.functions.ts`: `createProduct`, `updateProduct`, `deleteProduct`, `toggleDisponivel` — todos com `requireSupabaseAuth` + checagem `has_role`.
- `me.functions.ts`: `getMyRole()` para o header decidir mostrar link Admin.

Loaders públicos usam `queryOptions` + `ensureQueryData` + `useSuspenseQuery`. Cada rota tem `errorComponent` e `notFoundComponent`.

## Auth (browser)
- `signUp` com `emailRedirectTo: window.location.origin`.
- `signInWithPassword`, `signOut`.
- `resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`.
- Listener `onAuthStateChange` no `__root.tsx` invalida router + queries.
- Validação com Zod (email, senha mín. 8).

## Painel admin
- Tabela responsiva (Table no desktop, cards no mobile) com: imagem mini, nome, categoria, preço, status, ações.
- Form (criar/editar) com campos: nome, preço (number), categoria (Select), descrição curta (Input), descrição completa (Textarea), URL da imagem (Input com preview), disponível (Switch). Validação Zod, toasts via Sonner.

## SEO e meta
- `head()` por rota: title, description, og:title, og:description distintos.
- H1 único por página, alt em imagens, viewport responsivo.

## Detalhes técnicos
- Categoria como string com lista constante em `src/lib/categories.ts` (reaproveitada no filtro e no form).
- Formatação de preço em pt-BR (`Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'})`).
- WhatsApp link constante `WHATSAPP_NUMBER = '5511984399180'`.
- Sem `useEffect` para fetch inicial — sempre loader + Query.
- Sem dados fictícios persistidos; estado vazio amigável.

## Itens fora de escopo deste sprint
- Carrinho/checkout, pagamento, frete.
- Upload de arquivo de imagem (fica como evolução futura).
- Múltiplas imagens por produto, variações, estoque.
