## Busca por nome no catálogo de produtos

### O que será feito
Adicionar uma barra de busca por nome na página `/produtos`, posicionada acima dos chips de categoria. A busca filtra os produtos em tempo real conforme o usuário digita, funcionando em conjunto com o filtro de categoria já existente.

### Escopo
- **Modificar**: `src/routes/produtos.tsx`
- **Não modificar**: layout dos cards, chips de categoria, lógica de carregamento, estilos globais.

### Detalhes técnicos
1. Adicionar estado `searchQuery` (`useState<string>(""`) no componente `ProductsPage`.
2. Inserir um `<input type="text">` estilizado (usando tokens do design system, ex: `bg-secondary`, `border-border`, `rounded-full`) logo acima ou junto aos chips de categoria. Placeholder: "Buscar produtos..."
3. A lógica de filtragem passa a combinar categoria + busca:
   ```
   filtered = products
     .filter(p => !filter || p.categoria === filter)
     .filter(p => !searchQuery || p.nome.toLowerCase().includes(searchQuery.toLowerCase()))
   ```
4. Atualizar o componente `EmptyState` para exibir mensagem adequada quando a busca por nome não retorna resultados (mesmo que a categoria esteja selecionada).

### Resultado esperado
O usuário digita o nome de um produto e a grade atualiza instantaneamente, mantendo o filtro de categoria ativo se houver um selecionado. Nenhuma outra página ou funcionalidade é alterada.