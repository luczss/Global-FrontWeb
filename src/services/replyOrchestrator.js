// Decide QUEM responde: IA (Gemini) ou motor local. Regras: IA desligada/indisponível/erro/resposta inválida → motor local; situações de risco → sempre motor local;
// depois de uma falha a IA fica em pausa por um tempo (sem tentativas em loop).
import { reply as localReply, isPriority } from './localConversation.js'
export const createBreaker = () => ({ until: 0, reason: null })
const PAUSE = { quota: 5 * 60e3, rate_limited: 60e3, not_configured: 30 * 60e3, auth: 30 * 60e3, config: 30 * 60e3 } // padrão: 60 s
export async function respond({ text, entry = null, engine, ctx, ai, breaker, now = Date.now() }) {
  const local = fallback => { const r = localReply(engine, text, { ...ctx, entry }); return { text: r.text, mood: r.mood, intent: r.intent, safety: r.intent === 'risco', source: 'local', engine: r.state, fallback: fallback || null } }
  if (!ai.enabled) return local()
  if (ai.status !== 'ready') return local('unavailable')
  if (isPriority(engine, text, entry)) return local() // segurança é tratada localmente, de forma previsível
  if (breaker.until > now) return local(breaker.reason)
  try {
    const r = await ai.send(ai.request)
    if (!r || typeof r.reply !== 'string' || !r.reply.trim()) throw Object.assign(new Error('invalid'), { code: 'invalid' })
    return { text: r.reply.trim(), mood: r.safety ? 'reflexivo' : 'feliz', intent: null, safety: !!r.safety, source: 'gemini', engine: { ...engine, pending: null, scn: null }, fallback: null }
  } catch (e) {
    const code = e?.code || 'unavailable'; breaker.until = now + (PAUSE[code] ?? 60e3); breaker.reason = code
    return local(code)
  }
}
