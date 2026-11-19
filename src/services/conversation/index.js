// Motor conversacional LOCAL por regras (sem rede). NÃO é IA generativa nem modelo treinado: não aprende sozinho.
// normalize → intents (analisar) → context (planejar o turno) → responses/personalities (compor) → validação de qualidade.
import { analyze, RISK } from './intents.js'
import { newState, planTurn, EMO } from './context.js'
import { compose, okOpener } from './responses.js'
import { matchScenario } from './scenarios.js'
export { newState, analyze }
export { clean } from './normalize.js'
const CRISIS = 'Sinto muito que você esteja passando por isso, e fico feliz que tenha me contado. Eu sou um robô de apoio à expressão e não consigo oferecer o cuidado que você merece agora. Por favor, fale com alguém de confiança hoje, perto de você. Você também pode ligar para o CVV, gratuitamente e a qualquer hora, pelo 188, ou para o SAMU (192) se estiver em perigo. Se puder, não fique sozinho(a) neste momento.'
const BANNED = /(lado positivo|tudo acontece por uma raz|pensar positivo|te deixar mais forte|te deixara mais forte|outro ângulo|hum, interessante|contexto suficiente)/i
const questions = x => (x.match(/[^.?!]+\?/g) || []).map(q => q.trim().toLowerCase())
const clone = s => ({ ...s, asked: [...s.asked], used: [...s.used], recent: [...s.recent], openers: [...s.openers], qs: [...(s.qs || [])], scn: s.scn ? { ...s.scn } : null, hist: (s.hist || []).map(h => ({ ...h })) })
function violations(text, prev, a, pl) { // controle de qualidade antes de entregar
  const v = []
  if (BANNED.test(text)) v.push('frase_proibida')
  if (prev.recent.includes(text)) v.push('repetida')
  if (a.conf >= .7 && pl.kind === 'clarify') v.push('generica_com_intencao_clara')
  if (prev.turn <= 2 && pl.kind === 'suggest' && a.intent !== 'sugestao') v.push('conselho_prematuro')
  if (!okOpener(text, { openers: prev.openers })) v.push('abertura_repetida')
  if (questions(text).some(q => prev.qs.slice(-10).includes(q))) v.push('pergunta_repetida') // não pergunta de novo o que já perguntou
  return v
}
// Situações de segurança (risco, acidente, susto) ficam sempre com o motor local, mesmo com IA ligada.
export function isPriority(state, text, entry) {
  const a = analyze(entry ? `${entry.title}. ${entry.text}` : text, state)
  if (RISK.test(a.t) || state?.pending === 'safety_check') return true
  const sc = matchScenario(a.t); return !!(sc && (sc.sev === 2 || sc.id === 'susto'))
}
// reply(estado, texto, { personality, memory: string[], entry: {title,text}, challenges: string[] }) -> { text, state, intent, mood, kind, checks }
export function reply(state, text, ctx = {}) {
  const base = clone({ ...newState(), ...state }); base.turn++; base.brief = !!ctx.brief; base.listenOnly = base.listenOnly || !!ctx.listenOnly
  const p = ctx.personality || 'acolhedor', a = analyze(ctx.entry ? `${ctx.entry.title}. ${ctx.entry.text}` : text, base)
  base.userLong = a.n >= 12
  if (RISK.test(a.t)) { base.pending = null; base.recent = [...base.recent, CRISIS].slice(-6); return { text: CRISIS, state: base, intent: 'risco', mood: 'reflexivo', kind: 'crisis', checks: [] } }
  const age = a.t.match(/tenho (\d{1,2}) anos/), minor = age && +age[1] < 18 ? ' Como você ainda é jovem, vale conversar também com um adulto de confiança sobre isso.' : ''
  let t, pl, txt, checks = []
  for (let i = 0; i < 8; i++) {
    t = clone(base); pl = planTurn(t, a, { ...ctx, personality: p }); txt = compose(pl, t, p); checks = violations(txt, base, a, pl)
    if (!checks.length) break
    if (i === 7 && checks.every(c => ['pergunta_repetida', 'abertura_repetida', 'repetida'].includes(c))) break // defeitos leves: melhor repetir uma abertura do que perder o fio da conversa
    if (i === 7) { t = clone(base); pl = { kind: 'clarify', pending: 'what_happened', mood: 'curioso', canSkip: false, short: false }; txt = compose(pl, t, p) } // último recurso: pedir esclarecimento
  }
  t.pending = pl.pending ?? null; if (EMO.includes(a.intent)) t.lastIntent = a.intent
  const out = txt + (pl.kind === 'about_bimo' || pl.kind === 'dependency' ? '' : minor)
  t.recent = [...t.recent, txt].slice(-6); t.qs = [...t.qs, ...questions(txt)].slice(-12)
  return { text: out, state: t, intent: a.intent, mood: pl.mood || 'feliz', kind: pl.kind, checks }
}
