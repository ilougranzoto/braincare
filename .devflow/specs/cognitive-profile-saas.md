# 🧠 Cognitive Profile SaaS — Documento Completo (Produto + Técnico + Growth + Auth)

---

## 📌 1. VISÃO GERAL

Plataforma SaaS de testes cognitivos rápidos que entrega:

- Perfil de foco
- Raciocínio lógico
- Comportamento cognitivo
- Recomendações práticas

---

## ⚠️ 2. LIMITAÇÕES LEGAIS (OBRIGATÓRIO)

Este produto:

- NÃO fornece diagnóstico médico
- NÃO substitui profissionais de saúde
- NÃO fornece QI oficial

### Disclaimer obrigatório:

"Este produto é apenas para fins informativos e não substitui avaliação profissional."

---

## 🎯 3. OBJETIVOS

- Produto viralizável
- Alta conversão
- Monetização via relatórios
- Base para expansão futura

---

## 🧠 4. POSICIONAMENTO

### ❌ NÃO USAR:
- Diagnóstico
- TDAH confirmado
- QI oficial

### ✅ USAR:
- Perfil cognitivo
- Autoavaliação
- Insights comportamentais

---

## 🧑‍💻 5. STACK

- Next.js (App Router)
- PostgreSQL (Neon)
- Vercel
- Stripe
- Tailwind
- Zustand

---

## 🔐 6. VARIÁVEIS DE AMBIENTE

- DATABASE_URL
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_BASE_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

---

## 🧭 7. JORNADA DO USUÁRIO

### 7.1 Landing

CTA: "Começar teste grátis"

---

### 7.2 Teste

- Sem login
- Sessão anônima

---

### 7.3 Execução

Estados:
- Loading → "Preparando seu teste..."
- Pergunta ativa
- Timeout → "Tempo esgotado"
- Erro

---

### 7.4 Finalização

"Analisando seus resultados..."

---

### 7.5 Resultado Parcial

Mostrar:
- Score parcial
- Percentil

Exemplo:
"Você está acima de 65% das pessoas"

---

### 7.6 Paywall

Título:
"Desbloqueie seu perfil completo"

CTA:
"Desbloquear relatório"

---

## 🔐 8. AUTENTICAÇÃO (CRÍTICO PARA CONVERSÃO)

### REGRA PRINCIPAL:

❌ NÃO exigir login no início
✅ Exigir login SOMENTE após o resultado parcial

---

### Momento do login:

Quando usuário clica em:
👉 "Desbloquear relatório"

---

### Tela de autenticação

#### Mensagem:

"Salve seu resultado e continue"

---

### Opções:

#### 1. Login com Google (PRINCIPAL)

- 1 clique
- Botão: "Continuar com Google"

---

#### 2. Email (fallback)

- Magic link
- Sem senha

Botão:
"Receber link por email"

---

### ❌ NÃO FAZER:

- Formulário com senha
- Muitos campos
- Exigir login antes do teste

---

## 🧠 9. FLUXO COMPLETO COM AUTH

1. Usuário faz teste (anônimo)
2. Vê resultado parcial
3. Clica em desbloquear
4. Faz login (Google ou email)
5. Sistema associa sessão ao usuário
6. Redireciona para pagamento
7. Após pagamento:
   - libera relatório

---

## 🗂️ 10. BANCO DE DADOS (ATUALIZADO)

### users
- id
- email
- provider (google | email)
- created_at

---

### test_sessions
- id
- user_id (nullable → preenchido após login)
- status

---

### results
- session_id
- score
- percentil

---

### reports
- result_id
- is_paid
- stripe_session_id

---

## 🔌 11. STRIPE

Fluxo:

1. Criar checkout
2. Associar:
   - user_id
   - result_id

3. Webhook:
   - liberar relatório

---

## 🧪 12. TESTES

### Atenção
### Lógica

---

## ⚙️ 13. CONFIG DINÂMICA

```json
{
  "questionDifficulty": "adaptive"
}
```
