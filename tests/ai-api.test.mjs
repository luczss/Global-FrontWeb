import test from 'node:test'
import assert from 'node:assert/strict'
import { createHandler } from '../api/chat.js'
import { AiError } from '../api/_lib/errors.js'
import { buildSystem } from '../api/_lib/prompt.js'
// Endpoint /api/chat com provedores falsos (sem rede). O SDK real é testado em gemini-provider.test.mjs.
const call = (h, method, body, ip = '1.1.1.1') => new Promise(r => { const res = { status(c) { this.c = c; return this }, json(o) { r({ status: this.c, body: o }) } }; h({ method, body, headers: { 'x-forwarded-for': ip } }, res) })
const ok = (o = {}) => ({ messages: [{ role: 'user', content: 'Tive um dia difícil na faculdade' }], personality: 'acolhedor', ...o })
const prov = (impl, configured = true) => () => ({ name: 'gemini', configured: () => configured, complete: impl })
const withEnv = async (env, fn) => { const old = {}; for (const k of Object.keys(env)) { old[k] = process.env[k]; if (env[k] === undefined) delete process.env[k]; else process.env[k] = env[k] } try { return await fn() } finally { for (const k of Object.keys(old)) { if (old[k] === undefined) delete process.env[k]; else process.env[k] = old[k] } } }
test('1. Gemini responde: resposta devolvida com a personalidade no prompt', async () => {
  let seen; const h = createHandler({ getProvider: prov(async a => { seen = a; return 'Que dia cansativo. Foi alguma coisa específica?' }) })
  const r = await call(h, 'POST', ok({ personality: 'desafiador' })); assert.equal(r.status, 200); assert.equal(r.body.reply, 'Que dia cansativo. Foi alguma coisa específica?'); assert.equal(r.body.provider, 'gemini'); assert.match(seen.system, /DESAFIADOR/); assert.equal(seen.messages.at(-1).content, 'Tive um dia difícil na faculdade')
})
test('2. histórico enviado é limitado e começa por mensagem do usuário', async () => {
  let seen; const h = createHandler({ getProvider: prov(async a => { seen = a; return 'ok' }) })
  const msgs = Array.from({ length: 11 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `mensagem ${i}` })); await call(h, 'POST', ok({ messages: msgs }))
  assert.ok(seen.messages.length <= 8); assert.equal(seen.messages[0].role, 'user'); assert.equal(seen.messages.at(-1).content, 'mensagem 10')
})
test('3. chave ausente → 503 not_configured (cliente usa o motor local)', async () => withEnv({ GEMINI_API_KEY: undefined, AI_PROVIDER: undefined }, async () => {
  const h = createHandler(); const g = await call(h, 'GET'); assert.equal(g.body.configured, false); const r = await call(h, 'POST', ok()); assert.equal(r.status, 503); assert.equal(r.body.error, 'not_configured')
}))
test('4. erro da API é classificado e nunca vaza texto original nem a chave', async () => withEnv({ GEMINI_API_KEY: 'SECRET-TEST-KEY' }, async () => {
  const logs = []; const orig = console.error; console.error = (...a) => logs.push(a.join(' '))
  try {
    const map = { quota: 429, unavailable: 502, timeout: 504, auth: 502, invalid: 502, blocked: 502, config: 502 }
    for (const [code, st] of Object.entries(map)) { const r = await call(createHandler({ getProvider: prov(async () => { throw new AiError(code) }) }), 'POST', ok()); assert.equal(r.status, st, code); assert.equal(r.body.error, code) }
    const r = await call(createHandler({ getProvider: prov(async () => { throw new Error('invalid key SECRET-TEST-KEY at https://x') }) }), 'POST', ok()); assert.equal(r.status, 502); assert.doesNotMatch(JSON.stringify(r.body), /SECRET-TEST-KEY|https/)
    assert.ok(logs.length > 0); assert.ok(logs.every(l => !l.includes('SECRET-TEST-KEY')), 'a chave apareceu no log')
  } finally { console.error = orig }
}))
test('5. resposta inválida, diagnóstica ou com medicamento é rejeitada (cai no motor local)', async () => {
  for (const out of ['', '   ', 'Você tem depressão e precisa tratar.', 'Tome um antidepressivo hoje.', 'Seu diagnóstico é ansiedade generalizada.']) { const r = await call(createHandler({ getProvider: prov(async () => out) }), 'POST', ok()); assert.equal(r.status, 502, out); assert.equal(r.body.error, 'invalid') }
  const long = await call(createHandler({ getProvider: prov(async () => 'a '.repeat(2000)) }), 'POST', ok()); assert.ok(long.body.reply.length <= 1201)
})
test('6. mensagens inválidas são rejeitadas (400)', async () => {
  const h = createHandler({ getProvider: prov(async () => 'ok') })
  for (const [i, b] of [null, {}, ok({ messages: [] }), ok({ messages: 'oi' }), ok({ messages: [{ role: 'system', content: 'x' }] }), ok({ messages: [{ role: 'assistant', content: 'x' }] }), ok({ messages: [{ role: 'user', content: '   ' }] }), ok({ personality: 'agressivo' }), ok({ memory: Array(11).fill('a') }), ok({ memory: [1] }), ok({ entry: { title: '', text: 'x' } }), ok({ brief: 'sim' }), ok({ messages: Array(21).fill({ role: 'user', content: 'a' }) })].entries()) { const r = await call(h, 'POST', b, `5.5.5.${i}`); assert.equal(r.status, 400, JSON.stringify(b).slice(0, 60)) }
  assert.equal((await call(h, 'PUT', ok())).status, 405)
})
test('7. mensagem muito grande: 1000 caracteres passam, 1001 são rejeitados', async () => {
  const h = createHandler({ getProvider: prov(async () => 'ok') })
  assert.equal((await call(h, 'POST', ok({ messages: [{ role: 'user', content: 'a'.repeat(1000) }] }))).status, 200); assert.equal((await call(h, 'POST', ok({ messages: [{ role: 'user', content: 'a'.repeat(1001) }] }))).status, 400)
})
test('8. limite de frequência por IP', async () => withEnv({ AI_RATE_PER_MINUTE: '3' }, async () => {
  const h = createHandler({ getProvider: prov(async () => 'ok') }); const s = []; for (let i = 0; i < 4; i++) s.push((await call(h, 'POST', ok(), '9.9.9.9')).status)
  assert.deepEqual(s, [200, 200, 200, 429]); assert.equal((await call(h, 'POST', ok(), '8.8.8.8')).status, 200)
}))
test('9. limite diário de chamadas ao provedor (controle de custo)', async () => withEnv({ AI_DAILY_LIMIT: '2' }, async () => {
  let n = 0; const h = createHandler({ getProvider: prov(async () => { n++; return 'ok' }) }); const s = []; for (let i = 0; i < 4; i++) s.push(await call(h, 'POST', ok(), `7.7.7.${i}`))
  assert.deepEqual(s.map(x => x.status), [200, 200, 429, 429]); assert.equal(s[2].body.error, 'quota'); assert.equal(n, 2)
}))
test('10. risco de vida é tratado no servidor sem chamar o modelo', async () => {
  let n = 0; const r = await call(createHandler({ getProvider: prov(async () => { n++; return 'x' }) }), 'POST', ok({ messages: [{ role: 'user', content: 'às vezes eu quero morrer' }] })); assert.equal(r.body.safety, true); assert.match(r.body.reply, /188/); assert.equal(n, 0)
})
test('11. personalidades mudam as instruções; diário e memória só entram se enviados', () => {
  const base = { snippets: [], memory: [], challenges: [] }; const s = ['acolhedor', 'motivador', 'desafiador'].map(p => buildSystem({ personality: p, ...base }))
  assert.match(s[0], /ACOLHEDOR/); assert.match(s[1], /MOTIVADOR/); assert.match(s[2], /DESAFIADOR/); assert.equal(new Set(s).size, 3)
  assert.doesNotMatch(s[0], /registro_do_diario|memoria_autorizada/); const w = buildSystem({ personality: 'acolhedor', ...base, memory: ['quero me aproximar'], entry: { title: 'T', text: 'corpo' }, brief: true, listenOnly: true })
  assert.match(w, /memoria_autorizada/); assert.match(w, /registro_do_diario_compartilhado/); assert.match(w, /NÃO dê conselhos/); assert.match(w, /1 ou 2 frases/); assert.match(w, /SAMU 192/); assert.match(w, /não diagnostique/i)
})
test('12. GET informa só configuração (sem chave)', async () => withEnv({ GEMINI_API_KEY: 'SECRET-TEST-KEY', AI_PROVIDER: 'gemini' }, async () => { const r = await call(createHandler(), 'GET'); assert.equal(r.body.configured, true); assert.equal(r.body.provider, 'gemini'); assert.doesNotMatch(JSON.stringify(r.body), /SECRET/) }))
