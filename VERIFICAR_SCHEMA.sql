-- ============================================
-- CONTEXTFORGE - VERIFICAÇÃO DO SCHEMA
-- Execute isto no Supabase SQL Editor
-- ============================================

-- 1. Verificar tabelas criadas
SELECT 'TABELAS' as categoria, table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('refinamentos', 'solucoes_efetivas', 'analytics')
ORDER BY table_name;

-- 2. Contar registros em cada tabela
SELECT
  'refinamentos' as tabela, COUNT(*) as total
FROM refinamentos
UNION ALL
SELECT
  'solucoes_efetivas' as tabela, COUNT(*) as total
FROM solucoes_efetivas
UNION ALL
SELECT
  'analytics' as tabela, COUNT(*) as total
FROM analytics;

-- 3. Verificar estrutura da tabela refinamentos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'refinamentos'
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela solucoes_efetivas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'solucoes_efetivas'
ORDER BY ordinal_position;

-- 5. Verificar estrutura da tabela analytics
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'analytics'
ORDER BY ordinal_position;

-- 6. Verificar índices criados
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('refinamentos', 'solucoes_efetivas', 'analytics')
ORDER BY tablename, indexname;

-- 7. Verificar views criadas
SELECT viewname FROM pg_views
WHERE schemaname = 'public'
AND viewname LIKE 'vw_%'
ORDER BY viewname;

-- 8. Testar view: taxa de sucesso por projeto
SELECT * FROM vw_taxa_sucesso_por_projeto;

-- 9. Testar view: refinamentos mais efetivos
SELECT * FROM vw_refinamentos_mais_efetivos;

-- 10. Testar view: top soluções
SELECT * FROM vw_top_solucoes LIMIT 5;

-- 11. Verificar dados iniciais de analytics
SELECT * FROM analytics;

-- 12. Resumo final
SELECT
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('refinamentos', 'solucoes_efetivas', 'analytics')) as tabelas_criadas,
  (SELECT COUNT(*) FROM pg_indexes
   WHERE schemaname = 'public'
   AND tablename IN ('refinamentos', 'solucoes_efetivas', 'analytics')) as indices_criados,
  (SELECT COUNT(*) FROM pg_views
   WHERE schemaname = 'public'
   AND viewname LIKE 'vw_%') as views_criadas;
