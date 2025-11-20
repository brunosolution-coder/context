# ContextForge - Checklist de Verificação Supabase

## ✅ Como Verificar se Tudo foi Criado Corretamente

### Passo 1: Execute o Script de Verificação
1. Abra [Supabase Dashboard](https://app.supabase.com/)
2. Vá para **SQL Editor**
3. Abra o arquivo `VERIFICAR_SCHEMA.sql` (copie e cole no editor)
4. Execute cada query uma por uma

---

## 📊 O que Verificar

### ✅ 1. TABELAS (devem existir 3)
```
refinamentos
solucoes_efetivas
analytics
```

**Resultado esperado:**
```
| categoria | table_name           |
|-----------|----------------------|
| TABELAS   | refinamentos         |
| TABELAS   | solucoes_efetivas    |
| TABELAS   | analytics            |
```

### ✅ 2. REGISTROS (deve estar tudo vazio ou com dados iniciais)
```
| tabela              | total |
|---------------------|-------|
| refinamentos        | 0     |
| solucoes_efetivas   | 0     |
| analytics           | 3     | ← 3 projetos iniciais
```

### ✅ 3. ESTRUTURA DA TABELA `refinamentos` (11 colunas)
Deve ter estas colunas:
- `id` (UUID)
- `projeto_id` (TEXT)
- `problema_original` (TEXT)
- `prompt_original` (TEXT)
- `prompt_refinado` (TEXT)
- `tipo_refinamento` (TEXT)
- `resolvido` (BOOLEAN)
- `tokens_usados` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### ✅ 4. ESTRUTURA DA TABELA `solucoes_efetivas` (9 colunas)
Deve ter estas colunas:
- `id` (UUID)
- `projeto_id` (TEXT)
- `tipo_problema` (TEXT)
- `contexto` (TEXT)
- `solucao` (TEXT)
- `tipo_refinamento` (TEXT)
- `vezes_usado` (INTEGER)
- `taxa_sucesso` (FLOAT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### ✅ 5. ESTRUTURA DA TABELA `analytics` (7 colunas)
Deve ter estas colunas:
- `id` (UUID)
- `projeto_id` (TEXT)
- `total_prompts_gerados` (INTEGER)
- `total_refinamentos` (INTEGER)
- `total_tokens_usados` (INTEGER)
- `taxa_sucesso_primeira_tentativa` (FLOAT)
- `tempo_medio_resolucao_minutos` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### ✅ 6. ÍNDICES (deve ter 6 índices)
```
| indexname                    | tablename          |
|------------------------------|--------------------|
| idx_refinamentos_projeto     | refinamentos       |
| idx_refinamentos_resolvido   | refinamentos       |
| idx_refinamentos_tipo        | refinamentos       |
| idx_solucoes_projeto         | solucoes_efetivas  |
| idx_solucoes_tipo            | solucoes_efetivas  |
| idx_analytics_projeto        | analytics          |
```

### ✅ 7. VIEWS (deve ter 3 views)
```
vw_taxa_sucesso_por_projeto
vw_refinamentos_mais_efetivos
vw_top_solucoes
```

### ✅ 8. DADOS INICIAIS (analytics table)
```
| projeto_id       | total_prompts_gerados | total_refinamentos | total_tokens_usados |
|------------------|-----------------------|-------------------|---------------------|
| guarda-dinheiro  | 0                     | 0                 | 0                   |
| nenem-pneus      | 0                     | 0                 | 0                   |
| tenha-paz        | 0                     | 0                 | 0                   |
```

### ✅ 9. VIEWS FUNCIONANDO (teste as queries)
As 3 views devem retornar sem erros (podem estar vazias):
- `vw_taxa_sucesso_por_projeto` → mostra taxa de sucesso por projeto
- `vw_refinamentos_mais_efetivos` → mostra quais tipos de refinamento funcionam melhor
- `vw_top_solucoes` → mostra as soluções mais usadas

### ✅ 10. RESUMO FINAL
```
| tabelas_criadas | indices_criados | views_criadas |
|-----------------|-----------------|---------------|
| 3               | 6               | 3             |
```

---

## 🐛 Troubleshooting

### ❌ Erro: "relation 'refinamentos' does not exist"
**Solução:** Execute o `SETUP_SUPABASE.sql` novamente. Verifique se não teve erros na execução anterior.

### ❌ Erro: "function round(double precision, integer) does not exist"
**Solução:** Já foi corrigido! Use o `SETUP_SUPABASE.sql` atualizado com `::numeric` casting.

### ❌ Índices não foram criados
**Solução:** Execute manualmente:
```sql
CREATE INDEX IF NOT EXISTS idx_refinamentos_projeto ON refinamentos(projeto_id);
CREATE INDEX IF NOT EXISTS idx_refinamentos_resolvido ON refinamentos(resolvido);
CREATE INDEX IF NOT EXISTS idx_refinamentos_tipo ON refinamentos(tipo_refinamento);
CREATE INDEX IF NOT EXISTS idx_solucoes_projeto ON solucoes_efetivas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_solucoes_tipo ON solucoes_efetivas(tipo_problema);
CREATE INDEX IF NOT EXISTS idx_analytics_projeto ON analytics(projeto_id);
```

### ❌ Views não funcionam
**Solução:** Verifique se a tabela `refinamentos` existe:
```sql
SELECT * FROM refinamentos LIMIT 1;
```

Se retornar erro, a tabela não foi criada. Execute `SETUP_SUPABASE.sql` novamente.

---

## 📋 Próximos Passos (após verificação ✅)

1. **Testar a API de Refinamento**
   - Certifique que `ANTHROPIC_API_KEY` está no Vercel
   - Certifique que `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão no Vercel
   - Faça um teste POST em `/api/refinar-prompt`

2. **Teste End-to-End**
   - Abra ContextForge no navegador
   - Selecione projeto "GuardaDinheiro"
   - Gere um prompt
   - Clique em "Refinar Prompt" (qualquer tipo)
   - Deve retornar um prompt refinado do Claude

3. **Monitorar Dados**
   - Após refinamentos, a tabela `refinamentos` deve ter registros
   - Execute: `SELECT * FROM refinamentos ORDER BY created_at DESC LIMIT 5;`
   - Após marcar como "funcionou", a tabela `solucoes_efetivas` deve ter registros

---

## 🚨 Checklist Final

- [ ] 3 tabelas criadas (refinamentos, solucoes_efetivas, analytics)
- [ ] 6 índices criados (melhor performance)
- [ ] 3 views criadas (dashboards de análise)
- [ ] 3 projetos iniciais em analytics
- [ ] Nenhum erro ao executar VERIFICAR_SCHEMA.sql
- [ ] Claude API key está no Vercel
- [ ] Supabase credentials estão no Vercel
- [ ] ContextForge consegue acessar /api/refinar-prompt
