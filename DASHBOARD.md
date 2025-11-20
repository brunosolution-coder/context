# ContextForge Dashboard 🤖

Dashboard em tempo real para monitorar as operações da IA, consumo de tokens e status do sistema.

## 📊 Recursos

### ✅ Status da IA
- **Status Online/Offline**: Indicador visual com pulsação
- **Horário Atualizado**: Mostra a hora atual do servidor
- **Auto-refresh**: Atualiza a cada 2 segundos

### 📈 Métricas em Tempo Real
1. **Tokens Hoje**
   - Total de tokens gastos no dia
   - Número de requisições
   - Atualização automática

2. **Refinamentos**
   - Contagem de refinamentos do dia
   - Desde meia-noite

3. **Taxa de Sucesso**
   - Percentual de refinamentos que funcionaram
   - Baseado em feedback marcado como "Funcionou"

4. **Estatísticas por Tipo**
   - Breakdown de tokens por tipo de refinamento
   - Específico, Contexto, Alternativa, Correção, Refinar

### ⚡ Operações em Tempo Real
- **Últimas 5 Operações**: Mostra em tempo real as requisições sendo processadas
- **Status Visual**:
  - 🔵 Processando (menos de 5 segundos)
  - 🟢 Completado (menos de 5 minutos)
  - ⚫ Idle (mais de 5 minutos)
- **Informações**: Tipo, Projeto, Tokens, Hora, Status

### 📊 Gráficos
1. **Tokens por Tipo** (Gráfico de Pizza)
   - Distribuição de tokens gastos por tipo de refinamento
   - Cores diferentes para cada tipo

2. **Refinamentos por Tipo** (Gráfico de Barras)
   - Contagem de refinamentos por tipo
   - Comparação visual

### 📜 Histórico Detalhado
Tabela com todas as operações do dia:
- **Hora**: Timestamp exato
- **Projeto**: GuardaDinheiro, Neném, Tenha Paz
- **Tipo**: Específico, Contexto, Alternativa, Correção, Refinar
- **Tokens**: Quantidade de tokens usados
- **Status**: ✅ Funcionou / ❌ Falhou / ⏳ Pendente

## 🚀 Como Usar

### Acesso Local
```bash
# Simplesmente abra no navegador
open dashboard.html
# Ou
start dashboard.html
```

### Acesso em Produção (Vercel)
```
https://seu-projeto.vercel.app/dashboard.html
```

### Compartilhar com Equipe
- Hospede o dashboard em um servidor web
- Acesse de qualquer lugar
- Monitore as operações em tempo real

## 🔄 Como Funciona

### Fonte de Dados
O dashboard lê dados diretamente do Supabase:
- **Tabela**: `refinamentos`
- **Filtro**: Refinamentos de hoje (desde 00:00)
- **Atualização**: A cada 2 segundos

### Fluxo de Dados
```
[ContextForge API]
       ↓
[Salva em refinamentos]
       ↓
[Supabase Database]
       ↓
[Dashboard lê dados]
       ↓
[Mostra em tempo real]
```

## 📋 Campos Monitorados

### Da Tabela `refinamentos`
- `id`: UUID único
- `projeto_id`: Qual projeto
- `problema_original`: O problema descrito
- `tipo_refinamento`: Tipo de refinamento aplicado
- `tokens_usados`: Tokens consumidos
- `created_at`: Quando foi criado
- `resolvido`: Se funcionou (null/true/false)

## 🎯 Casos de Uso

### 1. Monitorar Custo de Tokens
```
Ver em tempo real quanto está gastando com a IA
Total Tokens Today: 15,234 tokens
```

### 2. Rastrear Performance
```
Taxa de Sucesso: 85%
Refinamentos que funcionaram na 1ª tentativa
```

### 3. Debug de Operações
```
Se algo não funcionou, veja:
- Qual tipo de refinamento foi usado
- Quantos tokens foram gastos
- Se marcou como "Funcionou" ou "Falhou"
```

### 4. Análise de Padrões
```
Qual tipo de refinamento usa mais tokens?
Qual tipo tem melhor taxa de sucesso?
```

## 🎨 Status Visuais

### Badges de Operação
- 🔵 **Processando**: Operação iniciada há menos de 5 segundos
- 🟢 **Completado**: Operação completada há menos de 5 minutos
- ⚫ **Idle**: Nenhuma operação recente

### Badges de Feedback
- ✅ **Funcionou**: User marcou como sucesso
- ❌ **Falhou**: User marcou como falha
- ⏳ **Pendente**: Sem feedback ainda

### Indicador Principal
- 🟢 **Online**: IA está operacional
- 🔴 **Offline**: Problema de conexão (vai mostrar apenas histórico)

## 🔧 Configuração

### Variáveis Necessárias (já configuradas)
```javascript
const SUPABASE_URL = 'https://wicrpmtwrctukxxyjgxz.supabase.co';
const SUPABASE_ANON_KEY = '...'; // Chave anôn do Supabase
```

### Intervalo de Atualização
```javascript
setInterval(atualizarDados, 2000); // Muda para atualizar a cada X ms
```

### Limite de Operações Mostradas
```javascript
refinamentos.slice(0, 5) // Mostra últimas 5, muda o número aqui
```

## 📱 Responsivo

O dashboard é totalmente responsivo:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

## 🔒 Segurança

- Usa **Supabase Anon Key** (chave pública)
- Apenas lê dados (SELECT)
- Nenhum secret ou credential exposto
- Safe to use publicly

## 🐛 Troubleshooting

### Dashboard não carrega
```
Verificar:
1. Console do navegador (F12 → Console)
2. Conexão com internet
3. Se Supabase está online
```

### Dados não atualizam
```
Verificar:
1. Se refinamentos foram salvos no Supabase
2. Se a API está funcionando
3. Recarregar página (F5)
```

### Números incorretos
```
Verificar:
1. Se o filtro de data está certo
2. Se os refinamentos têm tokens_usados preenchido
3. Se o resolvido está sendo marcado corretamente
```

## 📊 Exemplos de Leitura

### Cenário 1: Taxa Alta de Tokens
```
Tokens Hoje: 50,000
Refinamentos: 20
Média: 2,500 tokens/refinamento

Análise:
- Refinamentos "Específico" usam 3,000 tokens cada
- Refinamentos "Contexto" usam 2,000 tokens cada
- Refine a estratégia
```

### Cenário 2: Taxa de Sucesso Baixa
```
Taxa: 40%
8 funcionaram, 12 falharam

Análise:
- Tipo "Alternativa" tem 0% de sucesso
- Tipo "Contexto" tem 80% de sucesso
- Prefira "Contexto"
```

### Cenário 3: Picos de Uso
```
⚡ Operações em Tempo Real: 3 processando
Última operação: 15:32:45

Análise:
- Muitos acessos simultâneos
- IA conseguindo processar tudo
- Performance OK
```

## 📈 Métricas Recomendadas para Acompanhar

1. **Tokens/Dia**
   - Custo direto da IA
   - Tendência de crescimento
   - Otimização

2. **Taxa de Sucesso**
   - Qualidade das respostas
   - Efetividade dos tipos de refinamento
   - Feedback dos usuários

3. **Tipo Mais Usado**
   - Qual estratégia é mais popular
   - Qual gasta mais tokens
   - ROI por tipo

4. **Picos de Uso**
   - Horários de maior uso
   - Capacidade necessária
   - Padrões de comportamento

## 🚀 Próximos Passos

### Melhorias Futuras
- [ ] Exportar relatórios (CSV, PDF)
- [ ] Alertas de limite de tokens
- [ ] Histórico de 7 dias / 30 dias
- [ ] Comparação com período anterior
- [ ] Detecção de anomalias
- [ ] Sugestões de otimização automáticas

### Integrações
- [ ] Slack notifications
- [ ] Email alerts
- [ ] Webhooks customizados
- [ ] Google Analytics

## 📞 Suporte

Se o dashboard não funcionar:
1. Abra F12 (Developer Tools)
2. Vá para Console
3. Veja a mensagem de erro
4. Compartilhe o erro

Common errors:
- **"supabase is not defined"**: Vercel precisa fazer deploy
- **"CORS error"**: Problema de cross-origin (vai precisar mudar config)
- **"No data"**: Refinamentos não estão sendo salvos no Supabase
