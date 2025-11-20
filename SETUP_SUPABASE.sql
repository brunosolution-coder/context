-- ============================================
-- CONTEXTFORGE - SCHEMA SUPABASE
-- Execute TUDO isto no Supabase SQL Editor
-- ============================================

-- ============================================
-- TABELA: refinamentos
-- Histórico de todos os prompts refinados
-- ============================================

CREATE TABLE IF NOT EXISTS refinamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id TEXT NOT NULL,
  problema_original TEXT NOT NULL,
  prompt_original TEXT NOT NULL,
  prompt_refinado TEXT NOT NULL,
  tipo_refinamento TEXT NOT NULL,  -- 'especifico' | 'contexto' | 'alternativa' | 'correcao' | 'refinar'
  resolvido BOOLEAN DEFAULT NULL,   -- NULL = feedback pendente, TRUE = funcionou, FALSE = não funcionou
  tokens_usados INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABELA: solucoes_efetivas
-- Memória de soluções que funcionaram
-- ============================================

CREATE TABLE IF NOT EXISTS solucoes_efetivas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id TEXT NOT NULL,
  tipo_problema TEXT NOT NULL,
  contexto TEXT NOT NULL,          -- Prompt completo que funcionou
  solucao TEXT NOT NULL,           -- Descrição da solução
  tipo_refinamento TEXT,           -- Qual tipo de refinamento funcionou
  vezes_usado INTEGER DEFAULT 1,
  taxa_sucesso FLOAT DEFAULT 100,  -- Percentual de sucesso
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABELA: analytics
-- Métricas de uso do ContextForge
-- ============================================

CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id TEXT NOT NULL,
  total_prompts_gerados INTEGER DEFAULT 0,
  total_refinamentos INTEGER DEFAULT 0,
  total_tokens_usados INTEGER DEFAULT 0,
  taxa_sucesso_primeira_tentativa FLOAT DEFAULT 0,
  tempo_medio_resolucao_minutos INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_refinamentos_projeto
ON refinamentos(projeto_id);

CREATE INDEX IF NOT EXISTS idx_refinamentos_resolvido
ON refinamentos(resolvido);

CREATE INDEX IF NOT EXISTS idx_refinamentos_tipo
ON refinamentos(tipo_refinamento);

CREATE INDEX IF NOT EXISTS idx_solucoes_projeto
ON solucoes_efetivas(projeto_id);

CREATE INDEX IF NOT EXISTS idx_solucoes_tipo
ON solucoes_efetivas(tipo_problema);

CREATE INDEX IF NOT EXISTS idx_analytics_projeto
ON analytics(projeto_id);

-- ============================================
-- VIEWS (Consultas úteis)
-- ============================================

-- Vista: Taxa de sucesso por projeto
CREATE OR REPLACE VIEW vw_taxa_sucesso_por_projeto AS
SELECT
  projeto_id,
  COUNT(CASE WHEN resolvido = true THEN 1 END) as resolvidos,
  COUNT(CASE WHEN resolvido IS NOT NULL THEN 1 END) as total_com_feedback,
  ROUND(
    (100.0 * COUNT(CASE WHEN resolvido = true THEN 1 END) /
    NULLIF(COUNT(CASE WHEN resolvido IS NOT NULL THEN 1 END), 0))::numeric,
    2
  ) as taxa_sucesso_percentual
FROM refinamentos
GROUP BY projeto_id;

-- Vista: Tipos de refinamento mais efetivos
CREATE OR REPLACE VIEW vw_refinamentos_mais_efetivos AS
SELECT
  tipo_refinamento,
  COUNT(*) as total_usado,
  COUNT(CASE WHEN resolvido = true THEN 1 END) as vezes_resolveu,
  ROUND(
    (100.0 * COUNT(CASE WHEN resolvido = true THEN 1 END) /
    NULLIF(COUNT(*), 0))::numeric,
    2
  ) as taxa_sucesso_percentual
FROM refinamentos
WHERE resolvido IS NOT NULL
GROUP BY tipo_refinamento
ORDER BY taxa_sucesso_percentual DESC;

-- Vista: Top soluções por projeto
CREATE OR REPLACE VIEW vw_top_solucoes AS
SELECT
  projeto_id,
  tipo_problema,
  tipo_refinamento,
  COUNT(*) as vezes_usado,
  ROUND(taxa_sucesso::numeric, 2) as taxa_sucesso_pct
FROM solucoes_efetivas
GROUP BY projeto_id, tipo_problema, tipo_refinamento, taxa_sucesso
ORDER BY projeto_id, vezes_usado DESC;

-- ============================================
-- DADOS INICIAIS (Opcional)
-- ============================================

-- Inserir projeto de exemplo
INSERT INTO analytics (projeto_id, total_prompts_gerados)
VALUES
  ('guarda-dinheiro', 0),
  ('nenem-pneus', 0),
  ('tenha-paz', 0)
ON CONFLICT DO NOTHING;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE refinamentos IS 'Histórico de todos os refinamentos de prompts gerados pela IA';
COMMENT ON TABLE solucoes_efetivas IS 'Memória de soluções que funcionaram - usada para melhorar sugestões futuras';
COMMENT ON TABLE analytics IS 'Métricas agregadas de uso por projeto';

-- ============================================
-- ✅ SCHEMA CRIADO COM SUCESSO
-- ============================================

-- Executar isto para verificar se tudo foi criado:
-- SELECT * FROM refinamentos;
-- SELECT * FROM solucoes_efetivas;
-- SELECT * FROM analytics;
-- SELECT * FROM vw_taxa_sucesso_por_projeto;
