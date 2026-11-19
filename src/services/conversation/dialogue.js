// Gerenciador de diálogo por cenários: segurança primeiro, respostas curtas ("deixa pra lá", "foi isso"…), continuidade por estágios
// (1 reconhecer + perguntar → 2 acompanhar → 3 outra perspectiva ou pequena atitude, conforme a personalidade → 4 conectar com pessoas).
import { SCN, Q } from './scenarios.js'
const GEN = { yes: ['Certo, então é assim mesmo.', 'Faz sentido.'], no: ['Ok, então não é isso.', 'Entendi, então não foi assim.'], content: ['Isso ajuda a entender.', 'Certo, ficou mais claro.', 'Ok, estou acompanhando o quadro.'] }
const SAFE = {
  acidente: ['Isso parece sério. Você está em segurança agora? Se estiver machucado ou com dor, procure atendimento de emergência (SAMU 192) e avise alguém de confiança.', 'Isso merece atenção imediata. Antes de qualquer coisa: você está bem e em um lugar seguro? Se houver dor ou ferimento, ligue para o SAMU (192) ou peça ajuda a quem estiver por perto.', 'Que situação séria. Você se machucou? Se sim, o mais importante agora é atendimento médico: SAMU 192, ou alguém te levando ao pronto-socorro.'],
  susto: ['Que susto! Você se machucou, ou ficou só o susto?', 'Escapar por pouco assusta bastante. Está tudo bem com você?'],
  ok: ['Que bom saber que você está bem. Mesmo assim, fique atento a qualquer dor que apareça depois.', 'Ainda bem que está tudo certo. Se surgir dor ou mal-estar mais tarde, vale ser avaliado.'],
  hurt: ['Então o mais importante agora é ser atendido: ligue para o SAMU (192) ou peça para alguém te levar ao pronto-socorro. Tem alguém com você?', 'Dor depois de um acidente precisa ser avaliada por um profissional. Ligue para o SAMU (192) ou vá ao pronto-socorro. Tem alguém por perto pra ajudar?', 'Não deixe pra depois: procure atendimento agora (SAMU 192). Tem alguém com você?'],
  alone: ['Se estiver sozinho, ligue para o SAMU (192) agora ou chame alguém por perto, como um vizinho ou outra pessoa na rua. Depois, avise alguém da sua família.', 'Pode ligar para o 192 agora mesmo e pedir ajuda a quem estiver por perto. Quando estiver em segurança, avise alguém de confiança.'],
  with: ['Que bom que tem alguém aí. Peça para essa pessoa acompanhar você até o atendimento. Quando estiver mais calmo, pode voltar aqui e me contar.', 'Então deixe essa pessoa te ajudar a chegar ao atendimento. Eu fico por aqui, e a prioridade agora é você ser avaliado.'],
  unsure: ['Se existe qualquer dúvida sobre ter se machucado, o melhor é ser avaliado por um profissional. Você está com dor ou algum ferimento?', 'Só pra ter certeza: você está com dor, tontura ou algum ferimento agora?'],
}
const CONNECT = { acolhedor: ['Talvez valha levar isso também para alguém de confiança: conversar com outra pessoa costuma aliviar. Se quiser, dá pra registrar no Diário antes.'], motivador: ['Um bom próximo passo é falar disso com alguém próximo. Se quiser, registre no Diário pra organizar o que dizer.'], desafiador: ['E se você levasse isso pra alguém de confiança? O que diria primeiro? Dá pra anotar no Diário antes.'] }
const CONNECT_LISTEN = ['Fico por aqui se quiser seguir. O Diário está disponível se quiser guardar isso, e conversar com alguém próximo também pode ajudar.']
const META = { deixa: ['Tudo bem, a gente não precisa seguir nesse assunto. Se voltar a fazer sentido, é só dizer.', 'Sem problema, deixamos isso de lado. Se quiser falar de outra coisa, estou por aqui.'], outra: ['Claro, então me conta qual é a outra coisa.', 'Ah, é outra coisa. Pode contar do seu jeito.'], foi_isso: ['Beleza. Se lembrar de mais alguma coisa, pode contar. Se quiser, dá pra guardar isso no Diário.', 'Combinado, por ora é isso. Fico por aqui se quiser voltar nesse assunto.'], nao_sei_explicar: ['Sem problema, nem tudo tem palavras prontas. Dá pra ir por partes: o que aconteceu primeiro?', 'Tudo bem não saber explicar. Começa por qualquer pedaço, pode ser bagunçado.'], de_novo: ['Então aconteceu de novo. Foi parecido com a outra vez?', 'De novo, então. O que se repetiu dessa vez?'] }
const low = x => x[0].toLowerCase() + x.slice(1)
const plan = (pool, pending, o = {}) => ({ kind: 'pool', pool, pending, mood: 'reflexivo', canSkip: false, ...o })
const REC = /(outras vezes|acontecendo|recorrente|pontual|comum|frequente|padr)/i // a pergunta anterior era sobre recorrência?
const ansType = (a, prev) => { // "sim/não" só significa algo conforme a pergunta que foi feita
  const yn = prev && (prev.y || prev.n), short = a.n <= 6
  if (a.meta === 'mais_ou_menos') return 'partial'
  if (prev && REC.test(prev.t) && (a.meta === 'de_novo' || /^(sim|sempre|varias)\b|\b(ja aconteceu|toda vez|outras vezes|varias vezes|frequente)\b/.test(a.t))) return 'yes'
  if (prev && REC.test(prev.t) && /\b(so dessa|pontual|primeira vez|nunca)\b/.test(a.t)) return 'no'
  if (yn && short && (a.yes || /^(ja|sim)\b|\bja (falei|tentei|conversei)\b/.test(a.t))) return 'yes'
  if (yn && short && (a.no || /\b(nao|nunca|ainda nao)\b/.test(a.t))) return 'no'
  return a.yes ? 'yes' : a.no ? 'no' : 'content'
}
export const startScenario = (s, d, p, o = {}) => { // estágio 0: reconhece a situação e faz UMA pergunta
  s.scn = { id: d.id, stage: 0 }; s.hist = [{ id: d.id, stage: 0 }, ...(s.hist || []).filter(h => h.id !== d.id)].slice(0, 5); const q = Q(d, 0)
  const asks = p === 'acolhedor' ? [q.t, `Se quiser me contar, ${low(q.t)}`] : [q.t]
  return plan(d.r.flatMap(r => asks.map(x => `${r} ${x}`)), 'scn', { mood: d.sev < 0 ? 'feliz' : 'reflexivo', ...o })
}
export function safetyStart(s, d) { s.scn = { id: d.id === 'susto' ? 'susto' : 'acidente', stage: 0 }; s.safety = 1; return plan(SAFE[d.id], 'safety_check', { urgent: true }) }
export function safetyFollow(s, a) {
  const t = a.t, neg = /(nao (me )?machuc|sem (dor|ferimento)|nao (tenho|to|estou) (com )?(dor|nada)|nada grave|so (o )?susto|estou bem|ileso|tudo bem)/.test(t), hurt = !neg && /(machuc|\bdor\b|doi|sangr|quebr|ferid|hospital|nao consigo|tontura|desmai)/.test(t)
  if (hurt) { s.safety = 2; return plan(SAFE.hurt, 'safety_check', { urgent: true }) }
  if (neg && s.safety !== 2) { s.safety = 0; const d = SCN.pos_acidente; s.scn = { id: d.id, stage: 0 }; return plan(SAFE.ok.map(x => `${x} ${Q(d, 0).t}`), 'scn') }
  if (s.safety === 2) { if (a.no || /(sozinh|ninguem)/.test(t)) return plan(SAFE.alone, 'safety_check', { urgent: true }); if (a.yes || /(tem alguem|estou com|minha mae|meu pai|amig)/.test(t)) return plan(SAFE.with, null, { urgent: true }) }
  return plan(SAFE.unsure, 'safety_check', { urgent: true })
}
export function continueScenario(s, a, p, listenOnly) {
  const sc = s.scn, d = SCN[sc.id], prev = Q(d, sc.stage), type = ansType(a, prev); sc.stage++
  const ack = type === 'yes' ? (prev?.y ? [prev.y] : GEN.yes) : type === 'no' ? (prev?.n ? [prev.n] : GEN.no) : GEN.content, mood = d.sev < 0 ? 'feliz' : 'reflexivo'
  if (type === 'partial') { sc.stage--; return plan(['Mais ou menos, então. O que ficou no "menos"?'], 'scn', { mood }) }
  if (sc.stage === 1) { const q = Q(d, 1); return plan(ack.map(x => `${x} ${q ? q.t : d.p[0]}`), 'scn', { mood }) }
  if (sc.stage === 2) { // aqui a personalidade muda a estratégia
    const q2 = Q(d, 2), r2 = d.r[d.r.length - 1]
    if (p === 'motivador' && !listenOnly && d.sev <= 1 && d.a.length) return plan(ack.map(x => `${x} ${d.a[0]}`), 'scn', { mood, canSkip: true })
    if (p === 'desafiador') return plan(ack.map(x => `${x} ${d.p[0]}`), 'scn', { mood })
    return plan(ack.flatMap(x => [`${x} ${r2} Sem pressa pra resolver nada agora.`, ...(q2 ? [`${x} ${q2.t}`] : [])]), 'scn', { mood, canSkip: true })
  }
  const extra = !listenOnly && p !== 'motivador' && d.a.length ? [`${d.a[0]} Se quiser, registre no Diário antes.`] : [] // conectar com outras pessoas
  return plan([...(listenOnly ? CONNECT_LISTEN : CONNECT[p]), ...extra], 'closing', { mood, canSkip: true })
}
export function adviceAsked(s, p, listenOnly) { // pediu opinião/conselho: só responde com sugestão se já entendeu a situação
  const d = SCN[s.scn.id]; if (s.scn.stage < 1) return plan([`Antes de sugerir qualquer coisa, preciso entender melhor. ${Q(d, s.scn.stage).t}`], 'scn')
  return plan(listenOnly || !d.a.length ? [d.p[0]] : [d.p[0], `Uma possibilidade: ${low(d.a[0])} Mas a decisão é sua.`], 'scn', { mood: 'curioso' })
}
export function metaMove(s, a) {
  const m = a.meta; if (!m || m === 'mais_ou_menos') return null
  if (m === 'retomar') { const w = a.t.split(' ').filter(x => x.length > 3), h = (s.hist || []).find(x => w.some(y => SCN[x.id].lab.includes(y))) || (s.scn ? s.hist?.[1] : s.hist?.[0]) || s.hist?.[0]; if (!h) return plan(['Claro, sobre qual assunto você quer voltar?'], 'what_happened', { mood: 'curioso' }); const d = SCN[h.id], q = Q(d, Math.min(h.stage + 1, d.q.length - 1)) || Q(d, 0); s.scn = { id: d.id, stage: Math.min(h.stage + 1, d.q.length - 1) }; return plan([`Voltando para ${d.lab}: ${low(q.t)}`], 'scn', { mood: 'curioso' }) }
  if (m === 'de_novo' && s.scn) return null // vira resposta "sim" dentro do cenário
  if (!s.scn && !s.pending && m !== 'deixa' && m !== 'outra') return null
  if (m === 'outra') s.scn = null
  return plan(META[m] || META.deixa, m === 'foi_isso' ? 'closing' : m === 'deixa' ? null : m === 'nao_sei_explicar' && s.scn ? 'scn' : 'what_happened', { mood: 'curioso', canSkip: true })
}
