// Configuração CENTRAL da IA (modelo, limites e custos). Tudo pode ser ajustado por variável de ambiente, sempre só no servidor.
const int = (v, d, min, max) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d }
export const AI_CONFIG = () => ({
  provider: (process.env.AI_PROVIDER || 'gemini').toLowerCase(),
  model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite', // Flash-Lite: modelo de baixo custo/alto volume indicado pela documentação do Google
  thinkingLevel: (process.env.GEMINI_THINKING_LEVEL ?? 'low').toLowerCase(), // 'minimal' | 'low' | 'medium' | 'high' | 'none' (não enviar)
  maxOutputTokens: int(process.env.AI_MAX_OUTPUT_TOKENS, 500, 100, 1000), // no Gemini, inclui os tokens de "raciocínio"
  maxMessageChars: 1000, maxHistory: 8, maxReplyChars: 1200,
  ratePerMinute: int(process.env.AI_RATE_PER_MINUTE, 12, 1, 60), // por IP (em memória: melhor esforço em serverless)
  dailyLimit: int(process.env.AI_DAILY_LIMIT, 300, 1, 100000), // chamadas ao provedor por dia e por instância
  timeoutMs: int(process.env.AI_TIMEOUT_MS, 15000, 3000, 60000),
  apiVersion: process.env.GEMINI_API_VERSION || 'v1beta', // recursos do Gemini 3.x (ex.: thinkingLevel) estão documentados no endpoint v1beta
  baseUrl: process.env.GEMINI_API_BASE_URL || undefined, // só para testes ou proxy; não definir em produção
})
