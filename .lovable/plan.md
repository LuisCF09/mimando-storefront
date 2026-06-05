## Objetivo
Adicionar elementos básicos de conformidade com a LGPD sem alterar funcionalidades existentes da loja.

## Alterações

### 1. Páginas de conteúdo legal
Criar duas novas rotas públicas com textos simples em português:
- `/privacidade` → Política de Privacidade
  - Explica que coletamos nome, e-mail e CEP para atendimento.
  - Não compartilhamos dados sem autorização.
  - O cliente pode pedir exclusão dos dados pelo WhatsApp.
- `/termos` → Termos de Uso
  - Texto breve e claro sobre uso do site.

Ambas terão metadados de SEO (`title`, `description`) e layout consistente com o resto do site.

### 2. Checkbox de consentimento no cadastro
- No formulário de cadastro em `/auth` (`src/routes/auth.tsx`), adicionar um checkbox obrigatório.
- Label: "Li e aceito a Política de Privacidade e os Termos de Uso" (com links para `/privacidade` e `/termos`).
- Submissão do formulário será bloqueada se o checkbox não estiver marcado.
- Sem alterar campos existentes (nome, e-mail, senha).

### 3. Links no rodapé
- No footer de `src/routes/__root.tsx`, adicionar links para `/privacidade` e `/termos` ao lado do texto de copyright.
- Manter todo o restante do rodapé inalterado.

## Arquivos a criar
- `src/routes/privacidade.tsx`
- `src/routes/termos.tsx`

## Arquivos a editar
- `src/routes/auth.tsx` (adicionar checkbox e validação)
- `src/routes/__root.tsx` (adicionar links no footer)

## O que NÃO será alterado
- Nenhuma funcionalidade de login, carrinho, checkout, produtos, admin ou pedidos.
- Nenhuma migration ou tabela de banco de dados.
- Nenhum estilo global ou design token.

---

Aprovar para seguir para implementação.