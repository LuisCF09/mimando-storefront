
# Plano de melhorias — Mimando Papelaria

Vou apenas **melhorar** o que já existe. Nada de refazer do zero, remover login, carrinho, checkout ou painel admin. Sem transformar em marketplace. Sem mexer no banco de dados nem em RLS (a estrutura de admin/cliente já está correta).

## 1. Página inicial (`src/routes/index.tsx`)
- Novo título: **"Mimos especiais para presentear quem você ama"**
- Novo subtítulo conforme briefing (canecas, garrafas, camisas, laços, papelaria…)
- 3 botões na primeira dobra:
  - "Ver produtos" → `/produtos`
  - "Comprar pelo site" → `/produtos` (mesmo destino, CTA comercial)
  - "Comprar pelo WhatsApp" → link WhatsApp com mensagem genérica de interesse
- Manter seções de propostas (Feito com carinho / Personalizados / Atendimento) e CTA final.
- Adicionar uma nova seção curta **"Sobre a Mimando"** com o texto exato do briefing, com link "Saiba mais" para `/sobre`.
- Faixa de **categorias em destaque** logo abaixo do hero, com chips clicáveis levando a `/produtos`.

## 2. Header (`src/components/Header.tsx`)
- Menu desktop e mobile: **Início, Produtos, Categorias, Sobre, Contato** (além de Painel quando admin).
- Quando logado: mostrar primeiro nome do usuário ao lado do ícone de Conta.
- Adicionar **botão discreto de WhatsApp** (ícone) na barra (desktop e mobile).
- Manter ícone do carrinho funcional como já está.

## 3. Catálogo (`src/routes/produtos.tsx`)
- Manter busca por nome e filtro por categoria existentes.
- Adicionar **filtro por disponibilidade** (Todos / Disponíveis).
- Adicionar **filtro por faixa de preço** (Todos / Até R$30 / R$30–R$60 / Acima de R$60).
- Adicionar botão **"Comprar pelo WhatsApp"** em cada card, junto ao "Ver detalhes".
- Adicionar botão **"Adicionar ao carrinho"** direto no card (usa `useCart`), quando disponível.

## 4. Categorias da loja (`src/lib/shop.ts`)
Atualizar a lista de categorias para refletir o briefing (mantendo retrocompatibilidade — categorias já cadastradas continuam funcionando):
Papelaria, Canetas, Garrafas, Copos, Canecas, Camisas, Laços de cabelo, Presentes criativos, Personalizados, Outros.

Adicionar helper `whatsappCartLink(items, total)` para a mensagem do carrinho:
```
Olá! Gostaria de finalizar este pedido:
- 2× Caneca Coração — R$ 60,00
- 1× Laço Rosa — R$ 18,00
Total: R$ 78,00
Poderia me passar as informações para pagamento via Pix?
```

## 5. Carrinho (`src/routes/_authenticated/carrinho.tsx`)
- Adicionar segundo botão **"Finalizar pelo WhatsApp"** abaixo de "Finalizar compra", usando `whatsappCartLink`.
- Mostrar **subtotal por item** (já existe) e **total** (já existe). Layout mantido.

## 6. Checkout (`src/routes/_authenticated/checkout/index.tsx`)
- Adicionar campo opcional **"Observações do pedido"** (textarea) no formulário (apenas frontend; persistido se o backend já aceitar, senão fica enviado junto na mensagem).
- Manter integração Mercado Pago como está. Sem novas migrações.

## 7. Novas páginas públicas
- **`/sobre`** (`src/routes/sobre.tsx`): texto do briefing, com seção "Por que escolher a Mimando", CTAs para `/produtos` e WhatsApp. `head()` próprio.
- **`/contato`** (`src/routes/contato.tsx`): bloco com WhatsApp (link direto), Instagram (link), horário de atendimento, frase "Fale com a Mimando e encontre o presente perfeito…". `head()` próprio.
- **`/categorias`** (`src/routes/categorias.tsx`): grid das categorias com ícone/cor, cada uma leva a `/produtos?categoria=...` (ou clica e seta filtro). `head()` próprio.

## 8. Footer (`src/routes/__root.tsx`)
- Texto: **"© 2026 Mimando Papelaria Fofa e Presentes Criativos"** (ano fixo conforme briefing).
- Adicionar link **Contato** ao lado de Privacidade e Termos.
- Pequeno bloco com WhatsApp + Instagram.

## 9. Visual / polimento
- Verificar `src/styles.css` para garantir que o gradiente `gradient-primary` (rosa→lilás) e `gradient-soft` estão presentes; ajustar tokens se o fundo estiver branco puro (deixar `--background` rosa-claro bem sutil).
- Cards arredondados e sombra suave já estão padronizados — apenas garantir consistência nas páginas novas.

## O que NÃO será alterado
- Esquema do banco, RLS, roles, `has_role`, `handle_new_user`.
- Fluxo de autenticação (`/auth`, `/reset-password`).
- Painel admin (`/admin/*`) — clientes já não têm acesso (gate via `getMyRole`).
- Páginas `/privacidade`, `/termos`, `/meus-pedidos`, `/conta`, webhook do Mercado Pago.
- Integração real do Mercado Pago (já está com a estrutura pronta).

## Arquivos afetados (resumo técnico)
- Editar: `src/routes/index.tsx`, `src/components/Header.tsx`, `src/routes/produtos.tsx`, `src/routes/_authenticated/carrinho.tsx`, `src/routes/_authenticated/checkout/index.tsx`, `src/lib/shop.ts`, `src/routes/__root.tsx`, possivelmente `src/styles.css`.
- Criar: `src/routes/sobre.tsx`, `src/routes/contato.tsx`, `src/routes/categorias.tsx`.

Posso aplicar?
