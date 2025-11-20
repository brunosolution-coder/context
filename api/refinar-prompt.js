/**
 * api/refinar-prompt.js
 *
 * Vercel Serverless Function
 * Refina prompts usando Claude Sonnet com memória de soluções
 *
 * Request:
 *   POST /api/refinar-prompt
 *   {
 *     promptOriginal: string,
 *     contexto: string,
 *     tipo: 'especifico' | 'contexto' | 'alternativa' | 'correcao' | 'refinar',
 *     problema: string,
 *     memoria: array
 *   }
 *
 * Response:
 *   {
 *     promptRefinado: string,
 *     tokens: number,
 *     razao: string
 *   }
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// ============================================
// INICIALIZAÇÃO DE CLIENTES
// ============================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================
// CONSTANTES E CONFIGURAÇÃO
// ============================================

const RATE_LIMIT_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const requestCounts = new Map();

const SYSTEM_PROMPTS = {
  especifico: `Você é um especialista em engenharia de prompts para Claude.
Seu trabalho é refinar prompts para serem MUITO MAIS ESPECÍFICOS e TÉCNICOS.

Análise o prompt original e:
1. Identifique o problema central
2. Adicione detalhes técnicos que faltam
3. Peça informações mais precisas (ex: "Qual é exatamente o erro?")
4. Mencione tech stack específico (linguagem, framework, versão)
5. Passe instruções PASSO-A-PASSO bem claras

Retorne APENAS o prompt refinado, sem explicações.`,

  contexto: `Você é um especialista em engenharia de prompts para Claude.
Seu trabalho é adicionar MAIS CONTEXTO ao prompt.

Análise o prompt original e:
1. Identifique o contexto que falta
2. Adicione informações sobre o projeto (estrutura, patterns, padrões)
3. Inclua dependências e ferramentas usadas
4. Descreva o estado atual do código
5. Explique qual é o objetivo MAIOR (não só o problema imediato)

Retorne APENAS o prompt refinado, sem explicações.`,

  alternativa: `Você é um especialista em engenharia de prompts para Claude.
Seu trabalho é REFRAMING O PROBLEMA com uma abordagem alternativa.

Análise o prompt original e:
1. Identifique o que foi pedido
2. Sugira uma abordagem DIFERENTE para resolver
3. Questione as suposições
4. Pense "e se fizéssemos de outro jeito?"
5. Explore alternativas que não foram consideradas

Retorne APENAS o prompt refinado, sem explicações.`,

  correcao: `Você é um especialista em engenharia de prompts para Claude.
Seu trabalho é CLARIFICAR mal-entendidos.

Análise o prompt original e:
1. Identifique o que pode ter sido mal interpretado
2. Reformule o problema com CLAREZA absoluta
3. Elimine ambiguidades
4. Defina termos técnicos
5. Deixe explícito qual é o VERDADEIRO problema

Retorne APENAS o prompt refinado, sem explicações.`,

  refinar: `Você é um especialista em engenharia de prompts para Claude.
Seu trabalho é APRIMORAR a qualidade da solução.

Análise o prompt original e:
1. Identifique como melhorar a resposta esperada
2. Peça melhor estruturação do código/resposta
3. Inclua testes e validações
4. Peça logging/debugging
5. Melhore a qualidade do output final

Retorne APENAS o prompt refinado, sem explicações.`
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Rate limiting por IP
 */
function verificarRateLimit(ip) {
  const agora = Date.now();

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip);
  const requestsRecentes = requests.filter(t => agora - t < RATE_LIMIT_WINDOW_MS);

  if (requestsRecentes.length >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  requestsRecentes.push(agora);
  requestCounts.set(ip, requestsRecentes);
  return true;
}

/**
 * Formata memória de soluções anteriores
 */
function formatarMemoria(memoria) {
  if (!memoria || memoria.length === 0) {
    return 'Nenhuma solução anterior documentada para este padrão.';
  }

  return `Soluções anteriores que funcionaram:\n${memoria
    .map(m => `- ${m.tipo_problema}: ${m.solucao} (usado ${m.vezes_usado}x)`)
    .join('\n')}`;
}

/**
 * Valida inputs
 */
function validarInputs(body) {
  const { promptOriginal, contexto, tipo, problema } = body;

  if (!promptOriginal || typeof promptOriginal !== 'string') {
    return { valido: false, erro: 'promptOriginal é obrigatório' };
  }

  if (!tipo || !Object.keys(SYSTEM_PROMPTS).includes(tipo)) {
    return { valido: false, erro: `tipo inválido. Use: ${Object.keys(SYSTEM_PROMPTS).join(', ')}` };
  }

  if (!problema || typeof problema !== 'string') {
    return { valido: false, erro: 'problema é obrigatório' };
  }

  if (promptOriginal.length > 10000) {
    return { valido: false, erro: 'prompt muito longo (máx 10000 chars)' };
  }

  return { valido: true };
}

/**
 * Chama Claude Sonnet para refinar
 */
async function refinarComClaude(promptOriginal, contexto, tipo, memoria) {
  const systemPrompt = SYSTEM_PROMPTS[tipo];

  const userMessage = `PROMPT ORIGINAL:
${promptOriginal}

CONTEXTO DO PROJETO:
${contexto || 'Não disponível'}

MEMÓRIA DE SOLUÇÕES ANTERIORES:
${formatarMemoria(memoria)}

---

Por favor, refine este prompt tornando-o ${tipo === 'especifico' ? 'MUITO MAIS ESPECÍFICO E TÉCNICO' : tipo === 'contexto' ? 'COM MAIS CONTEXTO' : tipo === 'alternativa' ? 'COM UMA ABORDAGEM DIFERENTE' : tipo === 'correcao' ? 'TOTALMENTE CLARO' : 'DE MELHOR QUALIDADE'}.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage
      }
    ]
  });

  const promptRefinado = response.content[0].type === 'text' ? response.content[0].text : '';
  const tokensClaude = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

  return {
    promptRefinado,
    tokens: tokensClaude,
    inputTokens: response.usage?.input_tokens || 0,
    outputTokens: response.usage?.output_tokens || 0
  };
}

/**
 * Salva refinamento no Supabase
 */
async function salvarRefinamento(projeto_id, problema, promptOriginal, promptRefinado, tipo, tokens) {
  try {
    const { error } = await supabase
      .from('refinamentos')
      .insert({
        projeto_id,
        problema_original: problema,
        prompt_original: promptOriginal,
        prompt_refinado: promptRefinado,
        tipo_refinamento: tipo,
        tokens_usados: tokens
      });

    if (error) {
      console.error('[Supabase] Erro ao salvar refinamento:', error);
      // Não falhar a request, apenas logar
    }
  } catch (error) {
    console.error('[Supabase] Erro inesperado:', error);
  }
}

// ============================================
// HANDLER PRINCIPAL
// ============================================

export default async function handler(req, res) {
  // ============================================
  // CORS
  // ============================================
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ============================================
  // APENAS POST
  // ============================================
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // ============================================
  // RATE LIMITING
  // ============================================
  const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
             req.headers['x-real-ip'] ||
             req.socket?.remoteAddress ||
             'unknown';

  if (!verificarRateLimit(ip)) {
    return res.status(429).json({ error: 'Muito rápido! Aguarde 1 minuto.' });
  }

  // ============================================
  // VALIDAÇÃO
  // ============================================
  const validacao = validarInputs(req.body);
  if (!validacao.valido) {
    return res.status(400).json({ error: validacao.erro });
  }

  const { promptOriginal, contexto, tipo, problema, memoria = [] } = req.body;

  try {
    console.log(`[Refinar] Iniciando refinamento tipo="${tipo}" do IP="${ip}"`);
    console.log(`[Refinar] Tokens de entrada estimados: ${promptOriginal.length / 4}`);

    // ============================================
    // CHAMAR CLAUDE
    // ============================================
    const resultado = await refinarComClaude(
      promptOriginal,
      contexto,
      tipo,
      memoria
    );

    console.log(`[Refinar] Claude respondeu. Tokens gastos: ${resultado.tokens}`);

    // ============================================
    // SALVAR NO SUPABASE (ASYNC, não bloqueia)
    // ============================================
    salvarRefinamento(
      req.body.projeto_id || 'desconhecido',
      problema,
      promptOriginal,
      resultado.promptRefinado,
      tipo,
      resultado.tokens
    ).catch(err => console.error('[Salvar] Erro:', err));

    // ============================================
    // RESPOSTA
    // ============================================
    return res.status(200).json({
      promptRefinado: resultado.promptRefinado,
      tokens: resultado.tokens,
      inputTokens: resultado.inputTokens,
      outputTokens: resultado.outputTokens,
      tipo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Refinar] ERRO:', error);

    // Detectar tipo de erro
    if (error.status === 401) {
      return res.status(401).json({ error: 'API key inválida. Verifique .env' });
    }

    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit da Claude API excedido. Tente mais tarde.' });
    }

    if (error.status === 500) {
      return res.status(503).json({ error: 'Claude API indisponível. Tente novamente.' });
    }

    return res.status(500).json({
      error: 'Erro ao refinar prompt',
      details: error.message || 'Erro desconhecido'
    });
  }
}
