import test from 'node:test'
import assert from 'node:assert/strict'
import { buildChatRequest, LIMITS } from '../src/services/aiRequest.js'
import { respond, createBreaker } from '../src/services/replyOrchestrator.js'
import { newState } from '../src/services/localConversation.js'
// Lado do navegador: o que pode sair, e quando a IA ou o motor local responde.
const user = c => ({ id: Math.random(), role: 'user', content: c }), bot = c => ({ id: Math.random(), role: 'assistant', content: c })
const ctx = (p = 'acolhedor') => ({ personality: p, memory: [], challenges: [], brief: false, listenOnly: false })
const mk = (send, status = 'ready', request = { messages: [{ role: 'user', content: 'oi' }] }) => ({ status, send, request })
test('request: só o necessário — sem saudação local, histórico limitado, textos cortados', () => {
  const m = [{ ...bot('Olá! Como você está?'), local: true }, ...Array.from({ length: 12 }, (_, i) => (i % 2 ? bot : user)(`m${i}`)), user('x'.repeat(5000))]
  const r = buildChatRequest({ messages: m, personality: 'motivador' }); assert.ok(r.messages.length <= LIMITS.history); assert.equal(r.messages[0].role, 'user'); assert.ok(r.messages.every(x => x.content.length <= LIMITS.messageChars)); assert.ok(!JSON.stringify(r).includes('Olá! Como você está?')); assert.equal(r.personality, 'motivador')
})
test('request: diário e memória NÃO vão sozinhos', () => {
  const r = buildChatRequest({ messages: [user('oi')], personality: 'acolhedor' }); assert.deepEqual(r.memory, []); assert.ok(!('entry' in r)); assert.ok(!/diario|diary/i.test(JSON.stringify(Object.keys(r))))
  const c = buildChatRequest({ messages: [user('oi')], personality: 'acolhedor', memory: ['quero me aproximar'], entry: { title: 'T', text: 'corpo '.repeat(1000) } }); assert.deepEqual(c.memory, ['quero me aproximar']); assert.ok(c.entry.text.length <= LIMITS.entryChars)
  assert.deepEqual(buildChatRequest({ messages: [user('oi')], personality: 'acolhedor', challenges: ['a'], listenOnly: true }).challenges, [])
})
test('servidor sem IA (sem chave, fora do ar ou ainda verificando) → motor local, sem chamar a IA e sem aviso de falha', async () => { for (const st of ['unconfigured', 'offline', 'checking']) { let n = 0; const r = await respond({ text: 'oi', engine: newState(), ctx: ctx(), ai: mk(async () => { n++ }, st), breaker: createBreaker() }); assert.equal(r.source, 'local'); assert.equal(r.fallback, null); assert.equal(n, 0) } })
test('IA responde → fonte gemini e estado local é reiniciado', async () => { const r = await respond({ text: 'oi', engine: { ...newState(), pending: 'scn', scn: { id: 'x', stage: 1 } }, ctx: ctx(), ai: mk(async () => ({ reply: ' Que bom te ver! ' })), breaker: createBreaker() }); assert.equal(r.source, 'gemini'); assert.equal(r.text, 'Que bom te ver!'); assert.equal(r.engine.pending, null); assert.equal(r.engine.scn, null) })
test('erro da API → motor local, e pausa: sem novas chamadas em loop', async () => {
  let n = 0; const b = createBreaker(), ai = mk(async () => { n++; throw Object.assign(new Error('x'), { code: 'quota' }) }); let e = newState()
  const a = await respond({ text: 'Meu dia foi ruim', engine: e, ctx: ctx(), ai, breaker: b, now: 1000 }); assert.equal(a.source, 'local'); assert.equal(a.fallback, 'quota'); assert.equal(n, 1)
  const c = await respond({ text: 'Tive problemas na faculdade', engine: a.engine, ctx: ctx(), ai, breaker: b, now: 2000 }); assert.equal(c.source, 'local'); assert.equal(n, 1, 'não deve tentar de novo durante a pausa'); assert.ok(c.text.length > 5)
  await respond({ text: 'oi', engine: c.engine, ctx: ctx(), ai, breaker: b, now: 1000 + 6 * 60e3 }); assert.equal(n, 2, 'depois da pausa pode tentar de novo')
})
test('resposta inválida da IA → motor local', async () => { for (const bad of [{ reply: '' }, {}, null, { reply: 42 }]) { const r = await respond({ text: 'oi', engine: newState(), ctx: ctx(), ai: mk(async () => bad), breaker: createBreaker() }); assert.equal(r.source, 'local'); assert.equal(r.fallback, 'invalid') } })
test('segurança fica com o motor local mesmo com IA ligada', async () => {
  for (const t of ['Eu fui atropelado hoje', 'às vezes eu quero morrer']) { let n = 0; const r = await respond({ text: t, engine: newState(), ctx: ctx(), ai: mk(async () => { n++; return { reply: 'x' } }), breaker: createBreaker() }); assert.equal(r.source, 'local'); assert.equal(n, 0); assert.match(r.text, /192|188/) }
  let n = 0; const s = await respond({ text: 'Estou com dor', engine: { ...newState(), pending: 'safety_check', safety: 1 }, ctx: ctx(), ai: mk(async () => { n++; return { reply: 'x' } }), breaker: createBreaker() }); assert.equal(s.source, 'local'); assert.equal(n, 0)
})
test('personalidade segue para a IA e para o motor local; histórico continua após fallback', async () => {
  const req = buildChatRequest({ messages: [user('oi')], personality: 'desafiador' }); let seen; await respond({ text: 'oi', engine: newState(), ctx: ctx('desafiador'), ai: mk(async r => { seen = r; return { reply: 'ok' } }, 'ready', req), breaker: createBreaker() }); assert.equal(seen.personality, 'desafiador')
  const M = ['Estou tendo problemas na faculdade', 'Foi com meu grupo', 'Ninguém fez a parte que combinou']
  const run = async p => { let e = newState(), out = []; const b = createBreaker(); for (const [i, t] of M.entries()) { const r = await respond({ text: t, engine: e, ctx: ctx(p), ai: mk(async () => { if (i === 1) return { reply: 'Resposta da IA.' }; throw Object.assign(new Error('x'), { code: 'unavailable' }) }), breaker: b, now: i * 70000 }); e = r.engine; out.push(r) } return out }
  const a = await run('acolhedor'); assert.deepEqual(a.map(r => r.source), ['local', 'gemini', 'local']); assert.ok(a.every(r => r.text.length > 5))
})
