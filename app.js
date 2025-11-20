// ===== STATE =====
let currentPrompt = null;
let currentHistoryId = null;

// ===== DOM ELEMENTS =====
const form = document.getElementById('promptForm');
const projectSelect = document.getElementById('projeto');
const problemInput = document.getElementById('problema');
const fileInput = document.getElementById('arquivo');
const promptSection = document.getElementById('promptSection');
const promptOutput = document.getElementById('promptOutput');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const closePromptBtn = document.getElementById('closePromptBtn');
const historyContainer = document.getElementById('historyContainer');
const toastContainer = document.getElementById('toastContainer');

// ===== INITIALIZATION =====
function init() {
    loadProjectsToSelect();
    loadHistory();
    attachEventListeners();
}

// ===== LOAD PROJECTS =====
function loadProjectsToSelect() {
    const projects = Object.values(window.CONTEXTS);

    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = `${project.nome} (${project.stack})`;
        projectSelect.appendChild(option);
    });
}

// ===== FORM SUBMISSION =====
form.addEventListener('submit', (e) => {
    e.preventDefault();
    generatePrompt();
});

// ===== GENERATE PROMPT =====
function generatePrompt() {
    // Validations
    if (!projectSelect.value) {
        showToast('❌ Selecione um projeto', 'error');
        return;
    }

    const problema = problemInput.value.trim();
    if (problema.length < 20) {
        showToast('❌ Problema deve ter no mínimo 20 caracteres', 'error');
        return;
    }

    // Get context
    const context = window.CONTEXTS[projectSelect.value];
    const arquivo = fileInput.value.trim();

    // Generate prompt
    const arquivosText = context.arquivos_principais && context.arquivos_principais.length > 0
        ? context.arquivos_principais.map(a => `- \`${a}\``).join('\n')
        : '- Consulte a documentação do projeto';

    const padroesText = context.padroes && context.padroes.length > 0
        ? context.padroes.map(p => `- ${p}`).join('\n')
        : '- Seguir padrões do projeto';

    const prompt = `# ${context.nome.toUpperCase()} - RESOLVER PROBLEMA

## 📋 PROBLEMA
${problema}${arquivo ? `\n**Arquivo Principal:** ${arquivo}` : ''}

---

## 📚 CONTEXTO DO PROJETO
${context.project_context || '(Contexto não preenchido)'}

---

## 🏗️ ARQUITETURA
${context.architecture || '(Arquitetura não preenchida)'}

---

## ✅ PADRÕES A SEGUIR
${padroesText}

---

## 🔍 ARQUIVOS PRINCIPAIS
${arquivosText}

---

## 📝 GUIA DE MUDANÇAS
${context.changes_guide || '(Guia não preenchido)'}

---

## 🎯 INSTRUÇÕES PARA CLAUDE

1. ANTES: Ler TODO contexto, entender padrões
2. DURANTE: Seguir padrões, adicionar logs
3. DEPOIS: Testar, validar, documentar
4. SE TRAVAR: Consultar guia de mudanças

**Gerado por ContextForge** ✨`;

    // Store and display
    currentPrompt = prompt;
    promptOutput.textContent = prompt;
    promptSection.classList.remove('hidden');

    // Smooth scroll to prompt
    setTimeout(() => {
        promptSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    showToast('✅ Prompt gerado com sucesso!', 'success');
}

// ===== COPY TO CLIPBOARD =====
copyBtn.addEventListener('click', async () => {
    if (!currentPrompt) return;

    try {
        await navigator.clipboard.writeText(currentPrompt);
        showToast('📋 Copiado para a área de transferência!', 'success');
    } catch (err) {
        showToast('❌ Erro ao copiar', 'error');
    }
});

// ===== SAVE TO HISTORY =====
saveBtn.addEventListener('click', () => {
    if (!currentPrompt || !projectSelect.value) return;

    const history = getHistory();
    const entry = {
        id: Date.now(),
        projeto: window.CONTEXTS[projectSelect.value].nome,
        problema: problemInput.value.substring(0, 100),
        arquivo: fileInput.value.trim() || null,
        resolvido: false,
        criado_em: new Date().toISOString(),
        tempo_resolucao: null
    };

    history.unshift(entry);
    // Keep only last 50
    if (history.length > 50) {
        history.pop();
    }

    saveHistory(history);
    currentHistoryId = entry.id;
    loadHistory();
    showToast('💾 Salvo no histórico!', 'success');
});

// ===== CLOSE PROMPT SECTION =====
closePromptBtn.addEventListener('click', () => {
    promptSection.classList.add('hidden');
    currentPrompt = null;
    currentHistoryId = null;
});

// ===== LOAD HISTORY =====
function loadHistory() {
    const history = getHistory();

    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum prompt gerado ainda. Crie um para começar!</p>';
        return;
    }

    historyContainer.innerHTML = history.map(entry => {
        const data = new Date(entry.criado_em);
        const dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const statusBadge = entry.resolvido
            ? `<span class="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">✅ Resolvido</span>`
            : `<span class="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">⏳ Pendente</span>`;

        const tempoTexto = entry.resolvido && entry.tempo_resolucao
            ? `<p class="text-xs text-gray-500 mt-1">⏱️ Resolvido em ${entry.tempo_resolucao}min</p>`
            : '';

        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <p class="font-bold text-gray-900">${entry.projeto}</p>
                        <p class="text-sm text-gray-600 mt-1">"${entry.problema}${entry.problema.length >= 100 ? '...' : ''}"</p>
                        ${tempoTexto}
                    </div>
                    ${statusBadge}
                </div>
                <p class="text-xs text-gray-400">${dataFormatada}</p>
                ${!entry.resolvido ? `<button class="markResolvedBtn mt-3 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold px-3 py-1 rounded transition" data-id="${entry.id}">✅ Marcar Resolvido</button>` : ''}
            </div>
        `;
    }).join('');

    // Attach event listeners to "Mark Resolved" buttons
    document.querySelectorAll('.markResolvedBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            markResolved(id);
        });
    });
}

// ===== MARK AS RESOLVED =====
function markResolved(id) {
    const minutos = prompt('⏱️ Quanto tempo levou para resolver? (em minutos)');

    if (minutos === null) return; // User cancelled
    if (isNaN(minutos) || parseInt(minutos) < 0) {
        showToast('❌ Digite um número válido', 'error');
        return;
    }

    const history = getHistory();
    const entry = history.find(h => h.id === id);

    if (entry) {
        entry.resolvido = true;
        entry.tempo_resolucao = parseInt(minutos);
        saveHistory(history);
        loadHistory();
        showToast('🎉 Problema marcado como resolvido!', 'success');
    }
}

// ===== LOCALSTORAGE HELPERS =====
function getHistory() {
    const stored = localStorage.getItem('contextforge_history');
    return stored ? JSON.parse(stored) : [];
}

function saveHistory(history) {
    localStorage.setItem('contextforge_history', JSON.stringify(history));
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg mb-2`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== ATTACH EVENT LISTENERS =====
function attachEventListeners() {
    // Form validations
    problemInput.addEventListener('input', () => {
        if (problemInput.value.length < 20) {
            problemInput.classList.add('border-red-500');
        } else {
            problemInput.classList.remove('border-red-500');
        }
    });
}

// ===== SUPABASE CLIENT =====
const supabase = window.supabase.createClient(
  'https://wicrpmtwrctukxxyjgxz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpY3JwbXR3cmN0dWt4eHlqZ3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MDkwMjMsImV4cCI6MjA3OTE4NTAyM30.uFwQH-ylDwf8OZvcPD_TkjqiTtCcUXkNdyOtYTjY6Fw'
);

// ===== REFINEMENT STATE =====
let currentRefinamentoId = null;

// ===== REFINAR COM IA =====
async function refinarComIA(tipo) {
  const promptOriginal = currentPrompt;
  const projeto = projectSelect.value;
  const contexto = window.CONTEXTS[projeto];
  const problema = problemInput.value;

  if (!promptOriginal || !projeto) {
    showToast('❌ Erro: Gere um prompt primeiro', 'error');
    return;
  }

  // Mostra seção de refinamento
  const refinementSection = document.getElementById('refinementSection');
  const refinementStatus = document.getElementById('refinementStatus');
  const feedbackSection = document.getElementById('feedbackSection');
  const refinementButtons = document.getElementById('refinementButtons');

  refinementSection.classList.remove('hidden');
  refinementStatus.classList.remove('hidden');
  feedbackSection.classList.add('hidden');
  refinementButtons.disabled = true;

  // Desabilita botões durante processamento
  document.querySelectorAll('#refinementButtons button').forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.5';
  });

  try {
    console.log('[Refinar] Iniciando refinamento tipo:', tipo);

    // Busca memória de soluções anteriores
    const { data: memoriaData, error: memoriaError } = await supabase
      .from('solucoes_efetivas')
      .select('*')
      .eq('projeto_id', projeto)
      .order('vezes_usado', { ascending: false })
      .limit(5);

    if (memoriaError) {
      console.warn('[Supabase] Erro ao buscar memória:', memoriaError);
    }

    const memoria = memoriaData || [];
    console.log('[Refinar] Memória encontrada:', memoria.length, 'soluções');

    // Chama API de refinamento
    const response = await fetch('/api/refinar-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projeto_id: projeto,
        promptOriginal,
        contexto: contexto?.project_context || '',
        tipo,
        problema,
        memoria
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const { promptRefinado, tokens } = await response.json();
    console.log('[Refinar] Claude respondeu com', tokens, 'tokens');

    // Atualiza prompt
    currentPrompt = promptRefinado;
    document.getElementById('promptOutput').textContent = promptRefinado;

    // Salva no Supabase
    const { data: refinamentoData, error: saveError } = await supabase
      .from('refinamentos')
      .insert({
        projeto_id: projeto,
        problema_original: problema,
        prompt_original: promptOriginal,
        prompt_refinado: promptRefinado,
        tipo_refinamento: tipo,
        tokens_usados: tokens
      })
      .select()
      .single();

    if (saveError) {
      console.warn('[Supabase] Erro ao salvar refinamento:', saveError);
    } else {
      currentRefinamentoId = refinamentoData?.id;
      console.log('[Refinar] Refinamento salvo:', currentRefinamentoId);
    }

    // Esconde loading, mostra feedback
    refinementStatus.classList.add('hidden');
    feedbackSection.classList.remove('hidden');

    showToast(`✨ Prompt refinado! (${tokens} tokens usados)`, 'success');

    // Scroll suave para o prompt
    document.getElementById('promptSection').scrollIntoView({ behavior: 'smooth', block: 'center' });

  } catch (error) {
    console.error('[Refinar] ERRO:', error);
    refinementStatus.classList.add('hidden');
    showToast(`❌ Erro ao refinar: ${error.message}`, 'error');

  } finally {
    // Reabilita botões
    document.querySelectorAll('#refinementButtons button').forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  }
}

// ===== MARCAR RESOLUÇÃO =====
async function marcarResolucao(funcionou) {
  if (!currentRefinamentoId) {
    console.warn('[Feedback] Sem refinamentoId');
    return;
  }

  try {
    // Atualiza refinamento
    const { error: updateError } = await supabase
      .from('refinamentos')
      .update({ resolvido: funcionou })
      .eq('id', currentRefinamentoId);

    if (updateError) {
      console.error('[Supabase] Erro ao atualizar:', updateError);
    } else {
      console.log('[Feedback] Refinamento marcado:', funcionou ? 'resolvido' : 'não resolvido');
    }

    // Se funcionou, salva como solução efetiva
    if (funcionou) {
      const projeto = projectSelect.value;

      const { error: solError } = await supabase
        .from('solucoes_efetivas')
        .insert({
          projeto_id: projeto,
          tipo_problema: problemInput.value.substring(0, 100),
          contexto: currentPrompt,
          solucao: 'Refinamento funcionou - IA conseguiu refinar o prompt de forma efetiva',
          tipo_refinamento: 'geral',
          vezes_usado: 1,
          taxa_sucesso: 100
        });

      if (solError) {
        console.warn('[Supabase] Erro ao salvar solução:', solError);
      } else {
        console.log('[Feedback] Solução efetiva salva na memória');
      }

      showToast('🎉 Ótimo! Salvamos isso para melhorar futuras sugestões', 'success');
    } else {
      showToast('👍 Obrigado pelo feedback! Continue refinando', 'info');
    }

    // Esconde feedback após 2 segundos
    setTimeout(() => {
      document.getElementById('feedbackSection').classList.add('hidden');
    }, 2000);

  } catch (error) {
    console.error('[Feedback] ERRO:', error);
  }
}

// ===== START =====
document.addEventListener('DOMContentLoaded', init);
