// Endpoint serverless (Vercel e dev local): valida, limita frequência/custo, recupera conhecimento e chama o provedor de IA.
// A chave (GEMINI_API_KEY) só existe aqui, no servidor. O cliente recebe apenas { reply } ou um código de erro genérico.
import { getProvider as defaultProvider } from './_lib/providers.js'
import { AI_CONFIG } from './_lib/config.js'
import { AiError, classify, HTTP, PUBLIC_MESSAGE } from './_lib/errors.js'
import { sanitizeReply } from './_lib/sanitize.js'
import { retrieve, baseline } from './_lib/knowledge.js'
import { isRisk, CRISIS_REPLY } from './_lib/safety.js'
import { buildSystem } from './_lib/prompt.js'
const str = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max
function validate(b, cfg = AI_CONFIG()) {
  if (!b || !Array.isArray(b.messages) || !b.messages.length || b.messages.length > 20) return 'messages inválido'
  if (!b.messages.every(m => m && ['user', 'assistant'].includes(m.role) && str(m.content, cfg.maxMessageChars))) return 'mensagem inválida ou grande demais'
  if (b.messages[0].role !== 'user' || b.messages.at(-1).role !== 'user') return 'ordem de mensagens inválida'
  if (!['acolhedor', 'motivador', 'desafiador'].includes(b.personality)) return 'personalidade inválida'
  if (b.memory !== undefined && (!Array.isArray(b.memory) || b.memory.length > 10 || !b.memory.every(m => str(m, 200)))) return 'memória inválida'
  if (b.entry !== undefined && !(b.entry && str(b.entry.title, 150) && str(b.entry.text, 2000))) return 'registro inválido'
  if (b.challenges !== undefined && (!Array.isArray(b.challenges) || b.challenges.length > 20 || !b.challenges.every(c => str(c, 120)))) return 'desafios inválidos'
  if (['brief', 'listenOnly'].some(k => b[k] !== undefined && typeof b[k] !== 'boolean')) return 'preferências inválidas'
  return null
}
export function createHandler({ getProvider = defaultProvider, config = AI_CONFIG } = {}) {
  const hits = new Map(); const day = { d: '', n: 0 }
  return async function handler(req, res) {
    const cfg = config(), provider = getProvider()
    if (req.method === 'GET') return res.status(200).json({ configured: !!provider?.configured(), provider: provider?.name || null, model: provider?.name === 'gemini' ? cfg.model : undefined })
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })
    const ip = (req.headers?.['x-forwarded-for'] || '').split(',')[0] || 'local', now = Date.now(), recent = (hits.get(ip) || []).filter(t => now - t < 60000); recent.push(now); hits.set(ip, recent)
    if (recent.length > cfg.ratePerMinute) return res.status(429).json({ error: 'rate_limited', message: PUBLIC_MESSAGE.rate_limited })
    const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body) } catch { return null } })() : req.body
    const bad = validate(body, cfg); if (bad) return res.status(400).json({ error: 'invalid_input', message: bad })
    if (isRisk(body.messages.at(-1).content)) return res.status(200).json({ reply: CRISIS_REPLY, safety: true, sources: [] }) // resposta fixa, sem depender do modelo
    if (!provider?.configured()) return res.status(503).json({ error: 'not_configured', message: PUBLIC_MESSAGE.not_configured })
    const today = new Date(now).toISOString().slice(0, 10); if (day.d !== today) { day.d = today; day.n = 0 }
    if (day.n >= cfg.dailyLimit) return res.status(429).json({ error: 'quota', message: PUBLIC_MESSAGE.quota })
    day.n++ // conta só chamadas realmente feitas ao provedor
    try {
      let msgs = body.messages.slice(-cfg.maxHistory); while (msgs.length && msgs[0].role !== 'user') msgs.shift() // histórico limitado
      const last = msgs.at(-1).content, snippets = [...retrieve(last + ' ' + (body.entry?.title || '')), ...baseline()].filter((s, i, a) => a.findIndex(x => x.id === s.id) === i)
      const system = buildSystem({ personality: body.personality, snippets, memory: body.memory || [], entry: body.entry, challenges: body.listenOnly ? [] : body.challenges || [], brief: body.brief, listenOnly: body.listenOnly })
      const reply = sanitizeReply(await provider.complete({ system, messages: msgs }), cfg.maxReplyChars)
      if (!reply) throw new AiError('invalid')
      return res.status(200).json({ reply, safety: false, provider: provider.name })
    } catch (e) {
      const err = classify(e); console.error('[bimo-ai] falha do provedor:', err.code) // registra só o código; nunca a chave nem o texto do erro
      return res.status(HTTP[err.code] || 502).json({ error: err.code, message: PUBLIC_MESSAGE[err.code] || PUBLIC_MESSAGE.unavailable })
    }
  }
}
export default createHandler()
