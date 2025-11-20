// Contextos dos projetos - ContextForge
window.CONTEXTS = {
  "guarda-dinheiro": {
    "id": "guarda-dinheiro",
    "nome": "GuardaDinheiro",
    "descricao": "SaaS de gestão financeira pessoal com IA, sistema de tiers (Free/Pro/Premium), 5.000+ usuários",
    "stack": "React 18, Vite 7, Supabase 2.75, Stripe 19",
    
    "project_context": `# GUARDADINHEIRO - CONTEXTO COMPLETO

## SOBRE O PROJETO
- **Tipo:** SaaS B2C de gestão financeira pessoal
- **Status:** Produção com 5.000+ usuários (preparando lançamento público)
- **Desenvolvedor:** Bruno Sena (Brasil)
- **Objetivo Atual:** Estabilizar + polish para lançamento em 3 semanas
- **Modelo de Negócio:** Freemium (Free → Pro R$29/mês → Premium R$99/mês)

## PRINCIPAIS FUNCIONALIDADES
- ✅ Controle de transações (ilimitado, categorização IA, recorrentes)
- ✅ Orçamentos personalizados (5 no Free, ∞ no Pro)
- ✅ Metas financeiras (3 no Free, ∞ no Pro)
- ✅ Insights com IA (PRO/PREMIUM)
- ✅ Assistente IA Sofia (PREMIUM)
- ✅ Gamificação (streaks, conquistas)

## SISTEMA DE TIERS (33 FEATURES)
**FREE:** 8 features básicas
**PRO:** R$29/mês - 15 features
**PREMIUM:** R$99/mês - 17 features

## STACK TÉCNICA
- React 18, Vite 7, TypeScript
- Supabase (PostgreSQL + Auth)
- Stripe (pagamentos)
- Vercel (hosting)
- OpenAI (assistente IA)

## CREDENCIAIS (DEV)
- Email teste: dev@test.com / Senha: Test1234!
- Supabase: https://nldhhkytxdaqaslmczsi.supabase.co`,
    
    "architecture": `# GUARDADINHEIRO - ARQUITETURA

## ESTRUTURA PRINCIPAL
\`\`\`
src/
├── components/ (61 componentes)
│   ├── FeatureUnlock.jsx ⭐ CRÍTICO
│   ├── CheckoutModal.jsx ⭐ CRÍTICO
│   └── TierBadge.jsx
├── hooks/ (9 hooks)
│   ├── useFeatureAccess.js ⭐⭐ CRÍTICO (33 features)
│   └── usePlans.js
├── context/
│   └── TierContext.jsx ⭐ Estado global
├── lib/
│   ├── supabase.js ⭐ Cliente
│   └── stripe.js ⭐ Checkout
├── pages/ (12 páginas)
└── utils/

api/
├── create-checkout-session.js ⭐⭐ CRÍTICO
├── webhooks/stripe.js ⭐⭐ CRÍTICO
└── chat-assistant.js (PREMIUM)
\`\`\`

## DATABASE SCHEMA
- profiles (user, plan_slug, stripe_*)
- transactions (income/expense)
- budgets (category, amount)
- goals (target, progress)

## PADRÕES DE CÓDIGO
- Componentes: PascalCase
- Hooks: camelCase com 'use'
- SEMPRE try-catch com console.error
- SEMPRE verificar { error } do Supabase`,
    
    "changes_guide": `# GUARDADINHEIRO - GUIA DE MUDANÇAS

## ⚠️ NUNCA FAÇA:
1. ❌ Alterar FEATURE_MATRIX (src/hooks/useFeatureAccess.js) sem testar 3 tiers
2. ❌ Remover console.logs de CheckoutModal.jsx (essenciais debug)
3. ❌ Alterar RLS Policies sem testar com 2 users
4. ❌ Usar 'any' em TypeScript
5. ❌ Commitar .env
6. ❌ Deploy sem testar build local

## ARQUIVOS CRÍTICOS:
- src/hooks/useFeatureAccess.js (33 features)
- api/webhooks/stripe.js (sync pagamentos)
- api/create-checkout-session.js (criar checkout)
- .env (credenciais)

## DEBUGGING STRIPE:
- Checkout não abre? Verificar Stripe keys no .env
- User pagou mas não recebeu upgrade? Verificar webhooks no Stripe Dashboard
- Teste mode funciona mas LIVE não? Verificar produtos LIVE existem

## RECURSOS:
- Docs internas: .claude/*.md
- Email teste: dev@test.com / Test1234!`,
    
    "arquivos_principais": [
      "src/App.tsx",
      "src/components/FeatureUnlock.jsx",
      "src/hooks/useFeatureAccess.js",
      "src/context/TierContext.jsx",
      "api/create-checkout-session.js",
      "api/webhooks/stripe.js",
      ".env"
    ],
    
    "padroes": [
      "SEMPRE verificar no inventário se componente já existe antes de criar",
      "SEMPRE usar try-catch com console.error('[GuardaDinheiro] Contexto:', error)",
      "Feature gating: SEMPRE usar <FeatureUnlock featureId='...'> para bloquear features pagas",
      "Supabase queries: SEMPRE verificar { error } retornado",
      "Stripe: NUNCA remover console.logs de checkout/webhooks",
      "FEATURE_MATRIX: NUNCA alterar sem testar 3 tiers (Free/Pro/Premium)",
      ".env: NUNCA commitar"
    ]
  },
  
  "nenem-pneus": {
    "id": "nenem-pneus",
    "nome": "Neném Pneus",
    "descricao": "(Projeto será criado em breve)",
    "stack": "Next.js, TypeScript, Supabase",
    "project_context": "Projeto em planejamento.",
    "architecture": "",
    "changes_guide": "",
    "arquivos_principais": [],
    "padroes": []
  },
  
  "tenha-paz": {
    "id": "tenha-paz",
    "nome": "Tenha Paz",
    "descricao": "App Android bloqueio chamadas",
    "stack": "Kotlin, Jetpack Compose",
    "project_context": "App Android de bloqueio de chamadas indesejadas.",
    "architecture": "",
    "changes_guide": "",
    "arquivos_principais": [],
    "padroes": []
  }
};

console.log('✅ ContextForge: Contextos carregados', Object.keys(window.CONTEXTS));
