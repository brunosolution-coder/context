# ContextForge - Checklist de Verificação Vercel

## ✅ Como Verificar as Variáveis de Ambiente no Vercel

### Passo 1: Acesse o Vercel Dashboard
1. Vá para https://vercel.com/dashboard
2. Clique no projeto **ContextForge** (ou **context**)
3. Clique em **Settings** (engrenagem)
4. Clique em **Environment Variables** no menu esquerdo

---

## 🔑 Variáveis que Devem Existir

### ✅ 1. ANTHROPIC_API_KEY
- **Nome:** `ANTHROPIC_API_KEY`
- **Valor:** `sk-ant-v3-...` (começa com `sk-ant-v3-`)
- **Status:** ✅ Você confirmou que já está configurada
- **Escopo:** Production, Preview, Development

**Como obter:**
- Vá para https://console.anthropic.com/account/keys
- Copie uma chave ou crie uma nova
- Cole em Vercel

### ✅ 2. SUPABASE_URL
- **Nome:** `SUPABASE_URL`
- **Valor:** `https://wicrpmtwrctukxxyjgxz.supabase.co`
- **Status:** ❓ Verifique se existe
- **Escopo:** Production, Preview, Development

**Como obter:**
- Vá para [Supabase Dashboard](https://app.supabase.com/)
- Clique no seu projeto
- Vá para **Settings → API**
- Copie a **Project URL**

### ✅ 3. SUPABASE_SERVICE_ROLE_KEY
- **Nome:** `SUPABASE_SERVICE_ROLE_KEY`
- **Valor:** `eyJhbGci...` (JWT token longo)
- **Status:** ❓ Verifique se existe
- **Escopo:** Production, Preview, Development
- **⚠️ IMPORTANTE:** Este é um secret - nunca exponha

**Como obter:**
- Vá para [Supabase Dashboard](https://app.supabase.com/)
- Clique no seu projeto
- Vá para **Settings → API**
- Copie a **Service Role Key** (com permissões totais)

### ✅ 4. NODE_ENV (opcional)
- **Nome:** `NODE_ENV`
- **Valor:** `production`
- **Status:** ✅ Geralmente já vem configurado

---

## 🔍 Checklist de Verificação

Execute este script no console do navegador (F12) após fazer deploy no Vercel:

```javascript
// Verificar se API consegue acessar variáveis de ambiente
const testConfig = async () => {
  try {
    const response = await fetch('/api/refinar-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promptOriginal: 'teste',
        contexto: 'teste',
        tipo: 'especifico',
        problema: 'teste',
        memoria: []
      })
    });

    const data = await response.json();
    console.log('✅ API respondeu:', data);

    // Se tiver erro 401, é chave inválida
    if (response.status === 401) {
      console.error('❌ API Key inválida ou ausente');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
};

testConfig();
```

---

## 📋 Checklist Final (Para o Vercel)

- [ ] ANTHROPIC_API_KEY configurada (começa com `sk-ant-v3-`)
- [ ] SUPABASE_URL configurada
- [ ] SUPABASE_SERVICE_ROLE_KEY configurada
- [ ] Todas as 3 variáveis têm escopo: Production, Preview, Development
- [ ] Deploy foi feito APÓS adicionar as variáveis
- [ ] Nenhuma variável tem espaços extras no início/fim
- [ ] Nenhuma variável está com valor "COLE_SUA..." (do template)

---

## 🚀 Se Tudo Estiver Configurado

Você deve conseguir chamar a API de refinamento:

```bash
# Test na linha de comando
curl -X POST https://seu-projeto.vercel.app/api/refinar-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "promptOriginal": "Como consertar um bug?",
    "contexto": "Projeto React com TypeScript",
    "tipo": "especifico",
    "problema": "Erro de type mismatch",
    "memoria": []
  }'
```

**Resultado esperado:**
```json
{
  "promptRefinado": "...",
  "tokens": 1250,
  "inputTokens": 500,
  "outputTokens": 750,
  "tipo": "especifico",
  "timestamp": "2024-11-20T10:30:00.000Z"
}
```

---

## 🐛 Troubleshooting

### ❌ Erro 401 - API Key inválida
```
error: API key inválida. Verifique .env
```
**Solução:**
1. Verifique se `ANTHROPIC_API_KEY` está certo
2. Não deve ter espaços extras
3. Deve começar com `sk-ant-v3-`
4. Refaça o deploy (`vercel --prod`)

### ❌ Erro 429 - Rate limit excedido
```
error: Rate limit da Claude API excedido. Tente mais tarde.
```
**Solução:**
- Anthropic permite ~100 requests/min
- Aguarde alguns minutos
- Verifique em https://console.anthropic.com/usage

### ❌ Erro 503 - Supabase indisponível
```
error: Claude API indisponível. Tente novamente.
```
**Solução:**
1. Verificar status do Supabase: https://status.supabase.com/
2. Verificar status do Anthropic: https://status.anthropic.com/
3. Tente novamente em alguns minutos

### ❌ Erro na gravação Supabase
```
[Supabase] Erro ao salvar refinamento
```
**Solução:**
1. Verifique se `SUPABASE_SERVICE_ROLE_KEY` está correto
2. Verifique se tabela `refinamentos` existe (rode VERIFICAR_SCHEMA.sql)
3. Verifique se não tem RLS policy bloqueando insert

---

## ✅ Próximo Passo

Após confirmar todas as variáveis no Vercel:

1. Acesse sua URL do ContextForge (ex: https://context.vercel.app)
2. Selecione "GuardaDinheiro"
3. Digite um problema no textarea
4. Clique "Gerar Prompt"
5. Clique um dos botões de refinamento (ex: "Refinar Prompt")
6. Deve retornar um prompt refinado em 3-5 segundos

Se funcionar, ContextForge está 100% operacional! 🚀
