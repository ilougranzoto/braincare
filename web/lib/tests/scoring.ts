import { Answer, ResultData, DetailedProfile, Difficulty, ADHDIndicator } from './types'

// More granular percentile curve (0-20 raw score mapped)
const PERCENTILE_CURVE: Record<number, number> = {
  0: 2, 1: 5, 2: 9, 3: 14, 4: 20, 5: 27, 6: 35, 7: 43, 8: 51,
  9: 58, 10: 64, 11: 70, 12: 75, 13: 80, 14: 84, 15: 88, 16: 91,
  17: 94, 18: 96, 19: 98, 20: 99,
}

function calculateWeightedScore(answers: Answer[]): number {
  let score = 0
  for (const a of answers) {
    if (a.correct) {
      score += a.difficulty
    }
  }
  return score
}

function calculateRawScore(answers: Answer[]): number {
  return answers.filter(a => a.correct).length
}

function estimatePercentile(weightedScore: number, maxWeightedScore: number, rawScore: number, totalQuestions: number, avgResponseTime: number): number {
  // Base percentile from raw score
  const basePercentile = PERCENTILE_CURVE[Math.min(rawScore, 20)] ?? 50

  // Weighted score bonus: harder questions answered correctly give bonus
  const weightRatio = maxWeightedScore > 0 ? weightedScore / maxWeightedScore : 0
  const weightBonus = Math.round((weightRatio - 0.5) * 10) // -5 to +5

  // Speed bonus: faster responses indicate stronger cognition
  const speedBonus = avgResponseTime < 8000 ? 3
    : avgResponseTime < 12000 ? 2
    : avgResponseTime < 16000 ? 1
    : avgResponseTime > 22000 ? -2
    : 0

  return Math.min(99, Math.max(1, basePercentile + weightBonus + speedBonus))
}

function getAvgResponseTime(answers: Answer[]): number {
  if (answers.length === 0) return 0
  return answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / answers.length
}

function getAccuracyByCategory(answers: Answer[], prefix: string, category: string): { correct: number; total: number; accuracy: number; avgTime: number } {
  const filtered = answers.filter(a => a.questionId.startsWith(prefix) && getCategoryFromId(a.questionId, prefix) === category)
  if (filtered.length === 0) return { correct: 0, total: 0, accuracy: 0, avgTime: 0 }
  const correct = filtered.filter(a => a.correct).length
  return {
    correct,
    total: filtered.length,
    accuracy: correct / filtered.length,
    avgTime: getAvgResponseTime(filtered),
  }
}

// Map question IDs to their categories (we need to import and look up)
import { attentionQuestions } from './questions/attention'
import { logicQuestions } from './questions/logic'

const allQuestions = [...attentionQuestions, ...logicQuestions]
const questionCategoryMap = new Map(allQuestions.map(q => [q.id, q.category]))

function getCategoryFromId(questionId: string, _prefix: string): string {
  return questionCategoryMap.get(questionId) || 'unknown'
}

// ===== ATTENTION PROFILE =====

interface CategoryScore {
  score: number
  level: 'excelente' | 'bom' | 'moderado' | 'em_desenvolvimento' | 'inicial'
}

function scoreCategoryAttention(answers: Answer[], category: string): CategoryScore {
  const stats = getAccuracyByCategory(answers, 'att', category)
  if (stats.total === 0) return { score: 50, level: 'moderado' }

  let score = Math.round(stats.accuracy * 100)

  // Time adjustments per category
  if (category === 'sustained') {
    // Sustained attention: consistency matters more
    if (stats.avgTime < 12000) score = Math.min(100, score + 8)
    else if (stats.avgTime > 20000) score = Math.max(0, score - 10)
  } else if (category === 'selective') {
    // Selective: accuracy is key, speed less important
    if (stats.accuracy >= 0.8) score = Math.min(100, score + 5)
  } else if (category === 'divided') {
    // Divided: speed matters a lot
    if (stats.avgTime < 10000) score = Math.min(100, score + 12)
    else if (stats.avgTime < 15000) score = Math.min(100, score + 5)
    else if (stats.avgTime > 20000) score = Math.max(0, score - 8)
  }

  const level = score >= 85 ? 'excelente'
    : score >= 70 ? 'bom'
    : score >= 50 ? 'moderado'
    : score >= 30 ? 'em_desenvolvimento'
    : 'inicial'

  return { score: Math.min(100, Math.max(0, score)), level }
}

const ATTENTION_SUMMARIES: Record<string, Record<string, string>> = {
  sustained: {
    excelente: 'Sua capacidade de manter o foco por períodos prolongados é excepcional.',
    bom: 'Você consegue manter a concentração de forma consistente na maioria das situações.',
    moderado: 'Sua atenção sustentada está na média — há espaço para melhorar em tarefas longas.',
    em_desenvolvimento: 'Você tende a perder o foco em tarefas mais longas ou repetitivas.',
    inicial: 'Manter a concentração por períodos prolongados é um desafio significativo para você.',
  },
  selective: {
    excelente: 'Você filtra distrações com maestria e identifica detalhes relevantes rapidamente.',
    bom: 'Sua capacidade de filtrar informações irrelevantes é acima da média.',
    moderado: 'Você consegue focar no essencial, mas às vezes se distrai com detalhes secundários.',
    em_desenvolvimento: 'Filtrar distrações e focar no que importa pode ser desafiador para você.',
    inicial: 'Você tende a se perder em detalhes irrelevantes com frequência.',
  },
  divided: {
    excelente: 'Você gerencia múltiplas informações simultaneamente com facilidade impressionante.',
    bom: 'Sua capacidade de processar múltiplas tarefas ao mesmo tempo é sólida.',
    moderado: 'Você lida razoavelmente bem com múltiplas demandas, mas pode melhorar.',
    em_desenvolvimento: 'Processar várias informações ao mesmo tempo exige bastante esforço de você.',
    inicial: 'Multitarefa é um ponto que precisa de desenvolvimento significativo.',
  },
}

const ATTENTION_RECOMMENDATIONS: Record<string, Record<string, string[]>> = {
  sustained: {
    excelente: [
      'Continue desafiando-se com tarefas de foco prolongado para manter esse nível',
      'Experimente técnicas avançadas de meditação como Vipassana',
    ],
    bom: [
      'Pratique sessões de foco de 25 minutos com a técnica Pomodoro',
      'Meditação mindfulness por 10 minutos diários pode elevar sua concentração',
    ],
    moderado: [
      'Comece com sessões de foco de 15 minutos e aumente gradualmente',
      'Elimine notificações do celular durante períodos de trabalho',
      'Exercícios de respiração de 3 minutos antes de tarefas importantes',
    ],
    em_desenvolvimento: [
      'Divida tarefas longas em blocos menores de 10 minutos',
      'Use timers visuais para criar senso de urgência',
      'Pratique mindfulness por 5 minutos diários — comece com apps guiados',
      'Identifique seus horários de maior foco e use-os para tarefas importantes',
    ],
    inicial: [
      'Comece com micro-sessões de foco de 5 minutos e aumente aos poucos',
      'Crie um ambiente sem distrações: celular em modo avião, porta fechada',
      'Exercícios físicos regulares melhoram significativamente a atenção',
      'Considere avaliar a qualidade do seu sono — insônia prejudica a atenção',
    ],
  },
  selective: {
    excelente: [
      'Sua habilidade de filtrar informações é um trunfo — aplique em leitura dinâmica',
      'Desafie-se com puzzles visuais complexos como "Onde está Wally?" avançados',
    ],
    bom: [
      'Pratique leitura seletiva: escaneie textos buscando palavras-chave',
      'Jogos de encontrar diferenças exercitam essa habilidade',
    ],
    moderado: [
      'Antes de começar uma tarefa, defina exatamente o que está procurando',
      'Pratique destaque seletivo ao ler artigos — marque só o essencial',
      'Jogos de memória visual podem fortalecer sua atenção seletiva',
    ],
    em_desenvolvimento: [
      'Use checklists para guiar sua atenção para o que realmente importa',
      'Reduza a desordem visual do seu ambiente de trabalho',
      'Pratique exercícios de busca visual com limites de tempo',
      'Organize informações em categorias para facilitar a filtragem',
    ],
    inicial: [
      'Simplifique seu ambiente — menos estímulos visuais facilita o foco seletivo',
      'Use código de cores para organizar e destacar informações importantes',
      'Comece identificando uma única informação por vez antes de expandir',
      'Apps de treinamento cerebral com foco em atenção visual podem ajudar',
    ],
  },
  divided: {
    excelente: [
      'Você é um natural em multitarefa — use isso em atividades que exigem coordenação',
      'Desafie-se com atividades que combinem processamento verbal e numérico',
    ],
    bom: [
      'Continue praticando tarefas que exijam atenção em múltiplas frentes',
      'Cozinhar receitas complexas é um ótimo exercício de atenção dividida',
    ],
    moderado: [
      'Pratique fazer contas mentais enquanto realiza outras atividades simples',
      'Exercícios de dupla tarefa: ouça um podcast enquanto faz uma atividade manual',
      'Gradualmente aumente a complexidade das tarefas simultâneas',
    ],
    em_desenvolvimento: [
      'Foque em uma tarefa de cada vez antes de tentar dividir atenção',
      'Use listas e lembretes externos para liberar sua memória de trabalho',
      'Automatize tarefas rotineiras para liberar capacidade cognitiva',
      'Jogos de coordenação como malabarismo treinam atenção dividida',
    ],
    inicial: [
      'Priorize fazer uma coisa por vez — multitarefa não é eficiente para todos',
      'Quando precisar dividir atenção, alterne entre tarefas ao invés de fazer simultâneo',
      'Use ferramentas de organização (listas, calendários) como apoio externo',
      'Exercícios aeróbicos regulares melhoram a capacidade de processar múltiplos estímulos',
    ],
  },
}

// ===== LOGIC PROFILE =====

function scoreCategoryLogic(answers: Answer[], category: string): CategoryScore {
  const stats = getAccuracyByCategory(answers, 'log', category)
  if (stats.total === 0) return { score: 50, level: 'moderado' }

  let score = Math.round(stats.accuracy * 100)

  if (category === 'deductive') {
    // Deductive: accuracy paramount
    if (stats.accuracy === 1.0) score = Math.min(100, score + 10)
    else if (stats.accuracy < 0.5) score = Math.max(0, score - 5)
  } else if (category === 'inductive') {
    // Inductive: balance of speed and accuracy
    if (stats.accuracy >= 0.7 && stats.avgTime < 16000) score = Math.min(100, score + 8)
  } else if (category === 'pattern') {
    // Pattern recognition: speed is a strong signal
    if (stats.avgTime < 10000) score = Math.min(100, score + 10)
    else if (stats.avgTime < 16000) score = Math.min(100, score + 5)
  }

  const level = score >= 85 ? 'excelente'
    : score >= 70 ? 'bom'
    : score >= 50 ? 'moderado'
    : score >= 30 ? 'em_desenvolvimento'
    : 'inicial'

  return { score: Math.min(100, Math.max(0, score)), level }
}

const LOGIC_SUMMARIES: Record<string, Record<string, string>> = {
  deductive: {
    excelente: 'Seu raciocínio dedutivo é excepcional — você tira conclusões lógicas com precisão.',
    bom: 'Você demonstra boa capacidade de tirar conclusões a partir de premissas dadas.',
    moderado: 'Seu raciocínio dedutivo é adequado, mas pode ser mais preciso em problemas complexos.',
    em_desenvolvimento: 'Você às vezes chega a conclusões que não seguem logicamente das premissas.',
    inicial: 'Raciocínio dedutivo formal é uma área com potencial significativo de melhoria.',
  },
  inductive: {
    excelente: 'Você identifica relações e analogias com facilidade impressionante.',
    bom: 'Sua capacidade de generalizar a partir de exemplos é acima da média.',
    moderado: 'Você consegue fazer analogias básicas, mas pode melhorar em relações mais abstratas.',
    em_desenvolvimento: 'Identificar padrões em relações e analogias é um desafio para você.',
    inicial: 'Raciocínio por analogia precisa de mais prática no seu caso.',
  },
  pattern: {
    excelente: 'Seu reconhecimento de padrões é notável — você percebe sequências complexas rapidamente.',
    bom: 'Você identifica padrões e sequências com boa consistência.',
    moderado: 'Você reconhece padrões simples, mas sequências mais complexas podem escapar.',
    em_desenvolvimento: 'Identificar padrões em sequências exige mais esforço e tempo do que a média.',
    inicial: 'Reconhecimento de padrões é uma habilidade que pode ser muito desenvolvida com prática.',
  },
}

const LOGIC_RECOMMENDATIONS: Record<string, Record<string, string[]>> = {
  deductive: {
    excelente: [
      'Explore lógica formal e problemas de dedução avançados',
      'Aplique pensamento estruturado na tomada de decisões complexas',
    ],
    bom: [
      'Pratique silogismos e problemas de lógica proposicional',
      'Leia sobre falácias lógicas para refinar seu pensamento crítico',
    ],
    moderado: [
      'Comece com quebra-cabeças lógicos de nível intermediário',
      'Ao analisar argumentos, identifique premissas e conclusões separadamente',
      'Pratique o método "Se... então..." em decisões do dia a dia',
    ],
    em_desenvolvimento: [
      'Comece com problemas de lógica simples e vá aumentando a complexidade',
      'Escreva argumentos em formato de premissas + conclusão para clarear o raciocínio',
      'Jogos como Clue/Detetive exercitam dedução de forma divertida',
      'Questione "isso realmente segue disso?" ao ouvir argumentos',
    ],
    inicial: [
      'Comece com silogismos simples: "Todos os X são Y. Z é X. Logo, Z é Y."',
      'Use diagramas de Venn para visualizar relações lógicas',
      'Pratique identificar a conclusão em textos argumentativos',
      'Puzzles de Sudoku fáceis são um bom ponto de partida',
    ],
  },
  inductive: {
    excelente: [
      'Desafie-se com analogias abstratas e transferência de conceitos entre domínios',
      'Sua habilidade é valiosa para resolução criativa de problemas — explore-a',
    ],
    bom: [
      'Pratique analogias entre domínios diferentes para expandir seu repertório',
      'Exercícios de "Complete a relação" ajudam a manter essa habilidade afiada',
    ],
    moderado: [
      'Pratique analogias: "X está para Y assim como A está para..."',
      'Busque padrões em situações cotidianas — "isso é parecido com quê?"',
      'Leitura diversificada ajuda a construir repertório para analogias',
    ],
    em_desenvolvimento: [
      'Comece com analogias concretas antes de avançar para abstratas',
      'Quando aprender algo novo, pergunte "com o que isso se parece?"',
      'Jogos de categorização ajudam: agrupe objetos por características comuns',
      'Pratique classificar coisas por similaridade e diferença',
    ],
    inicial: [
      'Comece identificando similaridades entre objetos do dia a dia',
      'Use metáforas ao explicar conceitos — isso exercita o pensamento analógico',
      'Pratique completar frases como "sapato está para pé como luva está para..."',
      'Jogos de memória por pares exercitam reconhecimento de relações',
    ],
  },
  pattern: {
    excelente: [
      'Explore sequências matemáticas avançadas e fractais',
      'Sua habilidade é ideal para programação e análise de dados — considere explorar',
    ],
    bom: [
      'Pratique com sequências numéricas progressivamente mais complexas',
      'Puzzles como Nonogram e KenKen desafiam reconhecimento de padrões',
    ],
    moderado: [
      'Comece identificando padrões em sequências numéricas simples',
      'Pratique encontrar a "regra" em séries: +2, ×2, alternando...',
      'Jogos como Sudoku intermediário exercitam essa habilidade',
    ],
    em_desenvolvimento: [
      'Comece com sequências simples: 2, 4, 6, 8... e aumente a complexidade',
      'Anote as diferenças entre números consecutivos para encontrar padrões',
      'Jogos de sequência de cores e formas são um bom treino inicial',
      'Pratique com progressões aritméticas antes de avançar',
    ],
    inicial: [
      'Comece reconhecendo repetições simples em sequências visuais',
      'Use papel e caneta para anotar e comparar elementos',
      'Sudoku fácil é um excelente ponto de partida',
      'Apps de treinamento cerebral focados em sequências ajudam muito',
    ],
  },
}

// ===== COGNITIVE STYLE =====

function determineCognitiveStyle(
  overallAccuracy: number,
  avgTime: number,
  attentionAccuracy: number,
  logicAccuracy: number
): string {
  const fast = avgTime < 12000
  const slow = avgTime > 20000
  const highAccuracy = overallAccuracy >= 0.8
  const lowAccuracy = overallAccuracy < 0.5

  const attentionDominant = attentionAccuracy > logicAccuracy + 0.15
  const logicDominant = logicAccuracy > attentionAccuracy + 0.15

  if (highAccuracy && fast) {
    return 'Analítico-Veloz — você processa informações com precisão e rapidez, combinando eficiência com acurácia. Esse perfil é ideal para tomadas de decisão sob pressão.'
  }
  if (highAccuracy && slow) {
    return 'Analítico-Reflexivo — você prioriza a precisão sobre a velocidade, analisando cada detalhe antes de responder. Esse perfil é valioso para decisões complexas que exigem cautela.'
  }
  if (fast && !highAccuracy) {
    return 'Intuitivo-Rápido — você tende a confiar no instinto e responder rapidamente. Isso traz agilidade, mas pode levar a erros em questões mais complexas. Desacelerar em momentos-chave pode melhorar seus resultados.'
  }
  if (attentionDominant && highAccuracy) {
    return 'Observador-Detalhista — sua força está na percepção de detalhes e manutenção do foco. Você se destaca em tarefas que exigem atenção minuciosa e consistência.'
  }
  if (logicDominant && highAccuracy) {
    return 'Estrategista-Lógico — seu raciocínio estruturado é seu maior trunfo. Você é naturalmente bom em problemas que exigem análise sequencial e dedução.'
  }
  if (attentionDominant) {
    return 'Perceptivo — você tem mais facilidade com tarefas de atenção e observação do que com lógica formal. Investir em raciocínio lógico pode equilibrar seu perfil.'
  }
  if (logicDominant) {
    return 'Racional — você se sai melhor em raciocínio lógico do que em tarefas de atenção. Exercícios de foco e mindfulness podem complementar seu perfil analítico.'
  }
  if (overallAccuracy >= 0.6) {
    return 'Equilibrado — você combina atenção e lógica de forma balanceada. Seu perfil é versátil, com potencial para se destacar em diversas áreas cognitivas.'
  }
  if (lowAccuracy && fast) {
    return 'Impulsivo — você responde rapidamente mas sacrifica precisão. Dedicar mais tempo à análise antes de responder pode trazer ganhos significativos.'
  }
  return 'Em Desenvolvimento — seus resultados indicam espaço significativo para crescimento em ambas as áreas. A boa notícia é que habilidades cognitivas podem ser treinadas com prática consistente.'
}

// ===== ADHD INDICATOR =====

function calculateADHDIndicator(answers: Answer[]): ADHDIndicator {
  const attentionAnswers = answers.filter(a => a.questionId.startsWith('att'))
  const times = answers.map(a => a.responseTimeMs)

  // Factor 1: Response time variance (inconsistency is a key ADHD signal)
  const avgTime = times.reduce((s, t) => s + t, 0) / times.length
  const variance = times.reduce((s, t) => s + Math.pow(t - avgTime, 2), 0) / times.length
  const cv = Math.sqrt(variance) / avgTime // coefficient of variation
  const varianceScore = Math.min(30, Math.round(cv * 60)) // 0-30 points

  // Factor 2: Attention accuracy (low accuracy = more ADHD signals)
  const attCorrect = attentionAnswers.filter(a => a.correct).length
  const attAccuracy = attentionAnswers.length > 0 ? attCorrect / attentionAnswers.length : 0.5
  const attentionScore = Math.round((1 - attAccuracy) * 30) // 0-30 points

  // Factor 3: Performance decline over time (fatigue/loss of focus)
  const firstHalf = answers.slice(0, Math.floor(answers.length / 2))
  const secondHalf = answers.slice(Math.floor(answers.length / 2))
  const firstAcc = firstHalf.filter(a => a.correct).length / (firstHalf.length || 1)
  const secondAcc = secondHalf.filter(a => a.correct).length / (secondHalf.length || 1)
  const declineScore = Math.max(0, Math.round((firstAcc - secondAcc) * 25)) // 0-25 points

  // Factor 4: Timeouts and very fast (impulsive) answers
  const timeouts = answers.filter(a => a.answer === -1).length
  const impulsive = answers.filter(a => a.responseTimeMs < 1500 && !a.correct).length
  const impulseScore = Math.min(15, (timeouts + impulsive) * 3) // 0-15 points

  const total = Math.min(100, varianceScore + attentionScore + declineScore + impulseScore)

  const level = total <= 30 ? 'baixo'
    : total <= 60 ? 'moderado'
    : total <= 80 ? 'elevado'
    : 'muito_elevado'

  const labels: Record<string, string> = {
    baixo: 'Poucos sinais de desatenção',
    moderado: 'Alguns sinais de desatenção',
    elevado: 'Sinais elevados de desatenção',
    muito_elevado: 'Sinais muito elevados de desatenção',
  }

  return { score: total, level, label: labels[level] }
}

// ===== COGNITIVE ESTIMATE (QI-like) =====

function calculateCognitiveEstimate(
  weightedScore: number,
  maxWeightedScore: number,
  rawScore: number,
  totalQuestions: number,
  avgResponseTime: number,
  answers: Answer[]
): number {
  // Base: map raw accuracy to IQ-like scale (center at 100)
  const accuracy = totalQuestions > 0 ? rawScore / totalQuestions : 0
  const baseIQ = 70 + Math.round(accuracy * 60) // 70-130 base range

  // Bonus for hard questions answered correctly
  const hardCorrect = answers.filter(a => a.correct && a.difficulty === 3).length
  const hardBonus = hardCorrect * 2 // up to ~16 points

  // Speed bonus
  const speedBonus = avgResponseTime < 8000 ? 5
    : avgResponseTime < 12000 ? 3
    : avgResponseTime > 22000 ? -3
    : 0

  // Weighted score ratio bonus
  const weightRatio = maxWeightedScore > 0 ? weightedScore / maxWeightedScore : 0
  const weightBonus = Math.round((weightRatio - 0.5) * 8) // -4 to +4

  const estimatedIQ = baseIQ + hardBonus + speedBonus + weightBonus

  // Clamp to realistic range and add small random variation (+/- 2)
  const randomOffset = Math.floor(Math.random() * 5) - 2
  return Math.min(145, Math.max(70, estimatedIQ + randomOffset))
}

// ===== MAIN FUNCTION =====

function generateAttentionProfile(answers: Answer[]) {
  const attentionAnswers = answers.filter(a => a.questionId.startsWith('att'))
  if (attentionAnswers.length === 0) return null

  const sustained = scoreCategoryAttention(answers, 'sustained')
  const selective = scoreCategoryAttention(answers, 'selective')
  const divided = scoreCategoryAttention(answers, 'divided')

  // Build summary from individual category summaries
  const parts: string[] = []
  parts.push(ATTENTION_SUMMARIES.sustained[sustained.level])
  parts.push(ATTENTION_SUMMARIES.selective[selective.level])

  // Build recommendations from categories
  const recs: string[] = []
  recs.push(...ATTENTION_RECOMMENDATIONS.sustained[sustained.level])
  recs.push(...ATTENTION_RECOMMENDATIONS.selective[selective.level])
  recs.push(...ATTENTION_RECOMMENDATIONS.divided[divided.level])

  // Deduplicate and limit
  const uniqueRecs = [...new Set(recs)].slice(0, 5)

  return {
    sustained: sustained.score,
    selective: selective.score,
    divided: divided.score,
    summary: parts.join(' '),
    recommendations: uniqueRecs,
  }
}

function generateLogicProfile(answers: Answer[]) {
  const logicAnswers = answers.filter(a => a.questionId.startsWith('log'))
  if (logicAnswers.length === 0) return null

  const deductive = scoreCategoryLogic(answers, 'deductive')
  const inductive = scoreCategoryLogic(answers, 'inductive')
  const pattern = scoreCategoryLogic(answers, 'pattern')

  const parts: string[] = []
  parts.push(LOGIC_SUMMARIES.deductive[deductive.level])
  parts.push(LOGIC_SUMMARIES.pattern[pattern.level])

  const recs: string[] = []
  recs.push(...LOGIC_RECOMMENDATIONS.deductive[deductive.level])
  recs.push(...LOGIC_RECOMMENDATIONS.inductive[inductive.level])
  recs.push(...LOGIC_RECOMMENDATIONS.pattern[pattern.level])

  const uniqueRecs = [...new Set(recs)].slice(0, 5)

  return {
    deductive: deductive.score,
    inductive: inductive.score,
    patternRecognition: pattern.score,
    summary: parts.join(' '),
    recommendations: uniqueRecs,
  }
}

export function calculateResults(answers: Answer[], testType: 'attention' | 'logic' | 'full'): ResultData {
  const rawScore = calculateRawScore(answers)
  const weightedScore = calculateWeightedScore(answers)
  const maxScore = answers.length * 3
  const avgTime = getAvgResponseTime(answers)
  const percentile = estimatePercentile(weightedScore, maxScore, rawScore, answers.length, avgTime)

  const attentionProfile = generateAttentionProfile(answers)
  const logicProfile = generateLogicProfile(answers)

  const attentionAnswers = answers.filter(a => a.questionId.startsWith('att'))
  const logicAnswers = answers.filter(a => a.questionId.startsWith('log'))

  const attentionAccuracy = attentionAnswers.length > 0
    ? attentionAnswers.filter(a => a.correct).length / attentionAnswers.length
    : 0
  const logicAccuracy = logicAnswers.length > 0
    ? logicAnswers.filter(a => a.correct).length / logicAnswers.length
    : 0

  const attentionScore = attentionAnswers.length > 0 ? Math.round(attentionAccuracy * 100) : null
  const logicScore = logicAnswers.length > 0 ? Math.round(logicAccuracy * 100) : null

  const overallAccuracy = rawScore / answers.length
  const cognitiveStyle = determineCognitiveStyle(overallAccuracy, avgTime, attentionAccuracy, logicAccuracy)

  // Strengths and areas for improvement based on actual category scores
  const strengths: string[] = []
  const areasForImprovement: string[] = []

  if (attentionProfile) {
    if (attentionProfile.sustained >= 70) strengths.push('Atenção sustentada')
    else if (attentionProfile.sustained < 50) areasForImprovement.push('Atenção sustentada')
    if (attentionProfile.selective >= 70) strengths.push('Atenção seletiva')
    else if (attentionProfile.selective < 50) areasForImprovement.push('Atenção seletiva')
    if (attentionProfile.divided >= 70) strengths.push('Atenção dividida')
    else if (attentionProfile.divided < 50) areasForImprovement.push('Atenção dividida')
  }
  if (logicProfile) {
    if (logicProfile.deductive >= 70) strengths.push('Raciocínio dedutivo')
    else if (logicProfile.deductive < 50) areasForImprovement.push('Raciocínio dedutivo')
    if (logicProfile.inductive >= 70) strengths.push('Raciocínio indutivo')
    else if (logicProfile.inductive < 50) areasForImprovement.push('Raciocínio indutivo')
    if (logicProfile.patternRecognition >= 70) strengths.push('Reconhecimento de padrões')
    else if (logicProfile.patternRecognition < 50) areasForImprovement.push('Reconhecimento de padrões')
  }

  // General recommendations based on overall performance
  const generalRecs: string[] = []
  if (avgTime > 20000) {
    generalRecs.push('Treinar velocidade de processamento com exercícios cronometrados pode trazer ganhos significativos')
  }
  if (overallAccuracy < 0.5) {
    generalRecs.push('Priorize qualidade sobre quantidade — reserve mais tempo para analisar cada questão')
  }
  if (overallAccuracy >= 0.8) {
    generalRecs.push('Continue se desafiando com exercícios progressivamente mais complexos para manter o nível')
  }
  generalRecs.push('Exercícios físicos aeróbicos de 30 minutos, 3x por semana, melhoram a função cognitiva')
  if (attentionAccuracy < logicAccuracy - 0.2) {
    generalRecs.push('Investir em exercícios de atenção e mindfulness equilibraria seu perfil cognitivo')
  } else if (logicAccuracy < attentionAccuracy - 0.2) {
    generalRecs.push('Jogos de lógica e puzzles complementariam sua forte capacidade de atenção')
  }
  generalRecs.push('Uma boa noite de sono (7-8h) é fundamental para performance cognitiva')

  const detailedProfile: DetailedProfile = {
    attention: attentionProfile,
    logic: logicProfile,
    overall: {
      strengths: strengths.length > 0 ? strengths : ['Disposição para autoavaliação e crescimento pessoal'],
      areasForImprovement: areasForImprovement.length > 0 ? areasForImprovement : ['Continue praticando para identificar áreas específicas'],
      cognitiveStyle,
      recommendations: [...new Set(generalRecs)].slice(0, 4),
    },
  }

  const adhdIndicator = calculateADHDIndicator(answers)
  const cognitiveEstimate = calculateCognitiveEstimate(weightedScore, maxScore, rawScore, answers.length, avgTime, answers)

  const profileSummary = `Você acertou ${rawScore} de ${answers.length} questões, ficando acima de ${percentile}% das pessoas. ${cognitiveStyle.split(' — ')[0]}: ${cognitiveStyle.split(' — ')[1] || cognitiveStyle}`

  return {
    score: weightedScore,
    maxScore,
    percentile,
    attentionScore,
    logicScore,
    profileSummary,
    detailedProfile,
    adhdIndicator,
    cognitiveEstimate,
  }
}
