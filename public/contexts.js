/**
 * contexts.js
 * Carrega contextos dos projetos JSON
 * Cada projeto é um arquivo em contexts/[projeto].json
 */

window.CONTEXTS = {
  // Placeholder - será populado dinamicamente
  'guarda-dinheiro': {
    id: 'guarda-dinheiro',
    nome: 'GuardaDinheiro',
    descricao: 'SaaS de gestão financeira pessoal',
    stack: 'React 18, Vite 7, Supabase',
    project_context: '',
    architecture: '',
    changes_guide: '',
    arquivos_principais: [],
    padroes: []
  },
  'nenem-pneus': {
    id: 'nenem-pneus',
    nome: 'Neném Pneus',
    descricao: 'Sistema de gerenciamento de pneus',
    stack: 'Node.js, Express, MongoDB',
    project_context: '',
    architecture: '',
    changes_guide: '',
    arquivos_principais: [],
    padroes: []
  },
  'tenha-paz': {
    id: 'tenha-paz',
    nome: 'Tenha Paz',
    descricao: 'Plataforma de bem-estar e meditação',
    stack: 'Next.js, Tailwind CSS, Supabase',
    project_context: '',
    architecture: '',
    changes_guide: '',
    arquivos_principais: [],
    padroes: []
  }
};

/**
 * Carrega contexto de um projeto
 * Tenta carregar de: contexts/[projeto-id].json
 */
async function carregarContexto(projetoId) {
  try {
    const response = await fetch(`/contexts/${projetoId}.json`);
    if (!response.ok) {
      console.warn(`[Contextos] Não encontrado: ${projetoId}.json`);
      return window.CONTEXTS[projetoId] || null;
    }

    const data = await response.json();
    window.CONTEXTS[projetoId] = {
      ...window.CONTEXTS[projetoId],
      ...data
    };

    return window.CONTEXTS[projetoId];
  } catch (error) {
    console.error(`[Contextos] Erro ao carregar ${projetoId}:`, error);
    return window.CONTEXTS[projetoId] || null;
  }
}

/**
 * Carrega todos os contextos
 */
async function carregarTodosContextos() {
  const ids = Object.keys(window.CONTEXTS);
  const promessas = ids.map(id => carregarContexto(id));
  await Promise.all(promessas);
  console.log('[Contextos] Todos os contextos carregados');
}

// Carrega ao inicializar
document.addEventListener('DOMContentLoaded', carregarTodosContextos);
