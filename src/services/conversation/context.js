// Gerenciamento de contexto: decide o QUE fazer neste turno (plano), considerando pergunta pendente, assunto, histórico e mudança de assunto.
import { matchScenario } from './scenarios.js'
import { startScenario, safetyStart, safetyFollow, continueScenario, adviceAsked, metaMove } from './dialogue.js'
const NEG = ['dia_ruim', 'tristeza', 'ansiedade', 'preocupacao', 'frustracao', 'solidao', 'problema', 'desabafo'], POS = ['dia_bom', 'felicidade', 'conquista', 'noticia_boa']
export const EMO = [...NEG, ...POS, 'socializacao', 'decisao', 'nao_sei']
const NARR = ['recurrence', 'talked', 'what_happened', 'event_or_persistent', 'topic_detail', 'what_good', 'entry_open', 'organize']
const WHERE = { faculdade: 'na faculdade', trabalho: 'no trabalho', familia: 'em casa', amizades: 'com os amigos', relacionamento: 'no relacionamento' }
const NP = { grupo: 'a situação com o grupo', prova: 'a questão da prova', professor: 'a situação com o professor', chefe: 'a situação com a chefia', projeto: 'a questão desse trabalho', colega: 'a situação com os colegas', parceiro: 'a situação entre vocês', familiar: 'a situação com a sua família' }
const FEEL = { dia_ruim: 'esse dia ruim', tristeza: 'esse desânimo', ansiedade: 'essa ansiedade', preocupacao: 'essa preocupação', frustracao: 'essa frustração', solidao: 'essa solidão', socializacao: 'essa dificuldade' }
const NEGQ = ['O que foi mais difícil nisso tudo?', 'Isso já tinha acontecido antes?', 'Como você está agora, depois disso?', 'O que você gostaria que fosse diferente?'], POSQ = ['Como você se sentiu?', 'O que você mais gostou nesse momento?', 'Com quem você gostaria de compartilhar isso?']
const POSS = { meu: 'seu', minha: 'sua', meus: 'seus', minhas: 'suas' }
function mirror(raw) { // devolve o que a pessoa disse, em 2ª pessoa (só trocas seguras: meu/minha → seu/sua)
  const w = raw.trim().replace(/[.!?…]+$/, '').split(/\s+/)
  if (w.length < 3 || w.length > 10 || !w.some(x => POSS[x.toLowerCase()]) || w.some(x => /^(eu|estou|fico|fiquei|tenho|tive|sou|fui|me|to|tô|comigo|mim|nos|nossa|nosso)$/i.test(x))) return null
  const o = w.map(x => POSS[x.toLowerCase()] || x).join(' '); return o[0].toLowerCase() + o.slice(1)
}
const pickChallenge = ctx => ctx.challenges?.length ? ctx.challenges[Math.floor(Math.random() * ctx.challenges.length)] : 'Cumprimentar alguém com quem você fala pouco'
const PERSIST = /(faz (um )?tempo|ha (um )?tempo|ultimamente|sempre|varios dias|semanas|meses|vem )/
export const newState = () => ({ turn: 0, pending: null, topic: null, detail: null, depth: 0, lastIntent: null, asked: [], used: [], recent: [], openers: [], qs: [], scn: null, hist: [], safety: 0, brief: false, listenOnly: false, userLong: false, lastQ: false, qRun: 0, memUsed: false })
const nextQ = (list, s) => { const q = list.find(x => !s.asked.includes(x)); if (q) s.asked = [...s.asked, q]; return q || null }
function extractOpts(t) { // "sair do emprego ou ficar" -> opções citadas pela pessoa
  const m = t.match(/(.{3,40}?) ou (.{3,40})/); if (!m) return null
  const clip = x => x.replace(/^((estou|ficar|eu|entre|se|de|devo|que)\s+)+/, '').replace(/ \?$/, '').split(' ').slice(0, 6).join(' ').trim()
  const [a, b] = [clip(m[1]), clip(m[2])]; return a && b ? `${a} ou ${b}` : null
}
function narrate(s, a) { // continuação do relato: usa o que já foi contado e só pergunta o que falta
  s.depth++; const prev = s.topic
  if (a.topic && !(a.detail === 'grupo' && prev === 'faculdade')) s.topic = a.topic; if (a.detail) s.detail = a.detail
  const P = (kind, o = {}) => ({ kind, intent: a.intent, pending: 'topic_detail', mood: NEG.includes(s.lastIntent) ? 'reflexivo' : 'feliz', canSkip: true, ...o })
  if (s.pending === 'organize') { if (s.depth >= 4) { s.depth = 0; return P('close', { pending: 'closing' }) } const opts = extractOpts(a.t); return P(opts ? 'organize_opts' : 'organize_more', { opts, pending: 'organize', canSkip: false }) }
  if (s.pending === 'what_good') { if (s.depth >= 3) { s.depth = 0; return P('close_pos', { pending: 'closing' }) } return P('pos_follow', { pending: 'what_good', q: nextQ(POSQ, s) }) }
  if (s.pending === 'recurrence') { // "isso já aconteceu outras vezes?"
    if (/\b(nunca|pontual|primeira vez|so agora|so dessa)\b|^nao\b/.test(a.t)) return P('one_off', { pending: 'topic_detail', canSkip: false })
    if (/(sempre|toda vez|outras vezes|de novo|varias|costuma|ja aconteceu|\bsim\b|frequente)/.test(a.t)) return P('recurrent', { pending: 'talked', canSkip: false })
  }
  if (s.pending === 'talked') { // "você já falou com eles?"
    if (a.no || /(nao falei|nunca falei|ainda nao|nao conversei)/.test(a.t)) return P('talked_no', { pending: 'organize_offer', canSkip: false })
    if (a.yes || /\b(ja falei|conversei|falei)\b/.test(a.t)) return P('talked_yes', { pending: 'topic_detail', canSkip: false })
  }
  if (a.long && a.frames.length >= 2) return P('long_story', { labels: a.frames, pending: 'topic_detail', canSkip: false })
  if (a.frames.length) return P('frame', { frame: a.frames[0], detail: s.detail, pending: ['sobrecarga', 'sem_retorno'].includes(a.frames[0]) ? 'recurrence' : 'topic_detail', canSkip: false })
  if (s.depth >= 4) { s.depth = 0; return P('close', { pending: 'closing' }) }
  if (a.long) return P('long_generic', { canSkip: false })
  if (s.pending === 'event_or_persistent' && PERSIST.test(a.t)) return P('persist', { pending: 'what_happened', canSkip: false })
  if (s.pending === 'event_or_persistent' && !a.topic && !a.detail && a.n <= 5 && /(nao sei|nada|sem motivo|do nada)/.test(a.t)) return P('unknown_reason', { pending: 'what_happened', canSkip: false })
  const where = s.topic ? WHERE[s.topic] : null
  if (a.topic && a.topic !== prev && ['socializacao', 'solidao'].includes(s.lastIntent)) return P('where_social', { where, canSkip: false })
  if (a.detail && NP[a.detail]) return P('narrate_topic', { thing: NP[a.detail] + (where ? ', ' + where : ''), canSkip: false })
  if (a.topic && a.topic !== prev) return P('topic_q', { topic: a.topic, where: WHERE[a.topic], canSkip: false })
  return P('narrate_generic', { q: nextQ(NEGQ, s), mirror: mirror(a.raw) })
}
export function planTurn(s, a, ctx) {
  const I = a.intent, mem = ctx.memory || [], P = (kind, o = {}) => ({ kind, intent: I, pending: null, mood: 'feliz', canSkip: true, ...o })
  if (ctx.entry) { if (a.topic) s.topic = a.topic; s.depth = 1; return P('entry', { title: ctx.entry.title, pending: 'entry_open', mood: NEG.includes(I) ? 'reflexivo' : 'curioso' }) }
  if (I === 'despedida') return P('bye')
  if (I === 'so_ouvir') { s.listenOnly = true; return P('listen_only_ack', { pending: s.pending }) }
  const sc = matchScenario(a.t), longStory = a.long && a.frames.length >= 2
  if ((sc?.sev === 2 || sc?.id === 'susto') && I !== 'despedida') return { ...safetyStart(s, sc), intent: I } // situações de risco têm prioridade
  if (s.pending === 'safety_check') return { ...safetyFollow(s, a), intent: I }
  if (I === 'agradecimento') return P('thanks') // resposta breve, sem puxar outro assunto
  if (I === 'dependencia') return P('dependency', { mood: 'curioso' })
  if (I === 'riso') return P('laugh', { pending: s.pending })
  if (I === 'elogio') return P('compliment')
  if (I === 'sobre_bot') return P('about_bot', { pending: s.pending })
  if (I === 'sobre_bimo') return P('about_bimo', { t: a.t })
  if (I === 'devolve') return P('devolve', { pending: 'open', mood: 'curioso' })
  if (s.pending === 'how_are_you' && a.feel && a.n <= 6 && (!a.q || (I !== 'checkin' && /^(bem|mal|otim|mais ou menos|ok)/.test(a.t))) && ['desconhecido', 'relato', 'felicidade', 'checkin', 'devolve'].includes(I)) {
    const back = /\be voce\b/.test(a.t)
    if (a.feel === 'pos') return P('feel_pos', { back, pending: 'what_good' })
    if (a.feel === 'meh') return P('feel_meh', { back, pending: 'what_happened', mood: 'curioso' })
    return P('listen_neg', { feel: 'isso', pending: 'what_happened', mood: 'reflexivo' })
  }
  if (I === 'checkin' || I === 'saudacao') return P(I === 'checkin' ? 'checkin' : 'greet', { pending: 'how_are_you' })
  if (s.pending === 'suggest_ok' && (a.yes || a.no)) return a.yes ? P('suggest', { c: pickChallenge(ctx), mood: 'curioso' }) : P('closing_no')
  if (s.pending === 'organize_offer' && (a.yes || a.no)) return a.yes ? P('organize', { pending: 'organize', mood: 'curioso', canSkip: false }) : P('closing_no')
  const mv = metaMove(s, a); if (mv) return { ...mv, intent: I }
  if (s.scn && ['conselho', 'opiniao', 'sugestao', 'nao_sei'].includes(I) && !(I === 'sugestao' && s.listenOnly)) return { ...adviceAsked(s, ctx.personality, s.listenOnly), intent: I }
  if (['closing', 'open'].includes(s.pending) && (a.yes || a.no)) return P(`${s.pending}_${a.yes ? 'yes' : 'no'}`, { pending: a.yes && s.pending === 'open' ? 'what_happened' : null })
  if (sc && !longStory && sc.sev <= 1 && (!s.scn || sc.id !== s.scn.id)) { if (a.topic) s.topic = a.topic; return { ...startScenario(s, sc, ctx.personality), intent: I } }
  if (s.pending === 'scn' && s.scn && !['sugestao', 'sobre_bimo'].includes(I)) return { ...continueScenario(s, a, ctx.personality, s.listenOnly), intent: I }
  const narr = NARR.includes(s.pending)
  const contSet = s.pending === 'what_good' ? ['desconhecido', 'relato'] : ['desconhecido', 'relato', 'problema', 'dia_ruim', 'tristeza', 'preocupacao', 'frustracao', 'ansiedade', 'solidao', 'socializacao', 'desabafo', 'decisao', 'nao_sei']
  if (narr && contSet.includes(I) && !(I === 'nao_sei' && /(fazer|dizer)/.test(a.t)) && !(I === 'desconhecido' && a.n <= 1 && !a.detail && !a.topic)) return narrate(s, a)
  s.depth = 0; if (a.topic) s.topic = a.topic; if (a.detail) s.detail = a.detail
  if (['nao_sei', 'conselho', 'opiniao', 'decisao'].includes(I)) return P('organize', { opts: extractOpts(a.t), pending: 'organize', mood: 'curioso', canSkip: false })
  if (I === 'sugestao') return s.listenOnly ? P('suggest_confirm', { pending: 'suggest_ok', mood: 'curioso', canSkip: false }) : s.turn <= 2 && !s.topic ? P('suggest_ctx', { pending: 'what_happened', mood: 'curioso', canSkip: false }) : P('suggest', { c: pickChallenge(ctx), mood: 'curioso' })
  if (I === 'plano_acao') return P('action_plan', { mood: 'feliz' })
  if (I === 'casual') return P('casual')
  if (I === 'dia_normal') return P('dia_normal', { pending: 'open' })
  const emo = NEG.includes(I) || I === 'socializacao'
  if (mem.length && !s.memUsed && s.turn >= 2 && emo) { s.memUsed = true; const tk = a.t.split(' ').filter(w => w.length > 3); return P('mem', { mem: mem.find(x => tk.some(w => x.toLowerCase().includes(w))) || mem[0], pending: 'what_happened', mood: 'reflexivo', canSkip: false }) }
  if (a.long && a.frames.length >= 2) return P('long_story', { labels: a.frames, pending: 'topic_detail', mood: 'reflexivo', canSkip: false })
  if (a.frames.length && ['relato', 'desabafo', 'problema', 'frustracao', 'dia_ruim'].includes(I)) return P('frame', { frame: a.frames[0], detail: s.detail, pending: ['sobrecarga', 'sem_retorno'].includes(a.frames[0]) ? 'recurrence' : 'topic_detail', mood: 'reflexivo', canSkip: false })
  if (a.long && NEG.includes(I)) return P('long_generic', { mood: 'reflexivo', canSkip: false })
  if (a.topic && ['problema', 'frustracao', 'relato', 'desabafo', 'dia_ruim'].includes(I)) return P('topic_q', { topic: a.topic, where: WHERE[a.topic], pending: 'topic_detail', mood: 'reflexivo', canSkip: false })
  if (NEG.includes(I)) return P('listen_neg', { feel: /insegur/.test(a.t) ? 'essa insegurança' : FEEL[I] || 'isso', vague: ['tristeza', 'ansiedade'].includes(I), pending: ['tristeza', 'ansiedade'].includes(I) ? 'event_or_persistent' : 'what_happened', mood: 'reflexivo' })
  if (I === 'socializacao') return P('listen_neg', { feel: FEEL.socializacao, pending: 'what_happened', mood: 'reflexivo' })
  if (POS.includes(I)) return P('listen_pos', { proj: I === 'conquista' && /(projeto|tcc|trabalho|curso)/.test(a.t), pending: 'what_good' })
  if (I === 'relato') return P('relato', { pending: 'what_happened', mood: 'curioso' })
  return P('clarify', { short: a.n <= 2, pending: 'what_happened', mood: 'curioso', canSkip: false })
}
