import test from 'node:test'
import assert from 'node:assert/strict'
import { startFakeGemini } from './helpers/fakeGemini.mjs'
import { getProvider } from '../api/_lib/providers.js'
import { createHandler } from '../api/chat.js'
// O SDK OFICIAL (@google/genai) conversa com um servidor Gemini simulado: valida URL, cabeçalho da chave, corpo e tratamento de erros. Não usa a rede nem gasta crédito.
const KEY = 'test-key-123'
const run = async (handlerFn, env, fn) => { const fake = await startFakeGemini(handlerFn), old = {}; const E = { GEMINI_API_KEY: KEY, GEMINI_API_BASE_URL: fake.url, AI_PROVIDER: 'gemini', ...env }; for (const k of Object.keys(E)) { old[k] = process.env[k]; if (E[k] === undefined) delete process.env[k]; else process.env[k] = E[k] }
  try { return await fn(fake) } finally { for (const k of Object.keys(old)) { if (old[k] === undefined) delete process.env[k]; else process.env[k] = old[k] } await fake.close() } }
const msgs = [{ role: 'user', content: 'oi' }, { role: 'assistant', content: 'olá' }, { role: 'user', content: 'tive um dia ruim' }]
test('SDK real: requisição correta (modelo, chave no cabeçalho, instruções, tokens, thinking) e resposta lida', () => run(() => ({}), {}, async fake => {
  const text = await getProvider().complete({ system: 'SISTEMA-TESTE', messages: msgs }); assert.equal(text, 'Resposta simulada do Gemini.')
  const r = fake.seen[0]; assert.match(r.url, /^\/v1beta\/models\/gemini-3\.1-flash-lite:generateContent/); assert.equal(r.headers['x-goog-api-key'], KEY); assert.equal(r.json.systemInstruction.parts[0].text, 'SISTEMA-TESTE')
  assert.deepEqual(r.json.contents.map(c => c.role), ['user', 'model', 'user']); assert.equal(r.json.generationConfig.maxOutputTokens, 500); assert.match(JSON.stringify(r.json.generationConfig.thinkingConfig), /low/i)
  assert.ok(!('temperature' in (r.json.generationConfig || {})), 'Gemini 3.x: não definir temperature'); assert.ok(!JSON.stringify(r.json).includes(KEY), 'a chave não pode ir no corpo')
}))
test('configuração central: modelo, tokens e thinking por variável de ambiente', () => run(() => ({}), { GEMINI_MODEL: 'modelo-x', AI_MAX_OUTPUT_TOKENS: '200', GEMINI_THINKING_LEVEL: 'none' }, async fake => {
  await getProvider().complete({ system: 's', messages: msgs }); const r = fake.seen[0]; assert.match(r.url, /models\/modelo-x:generateContent/); assert.equal(r.json.generationConfig.maxOutputTokens, 200); assert.ok(!r.json.generationConfig.thinkingConfig)
}))
for (const [status, code] of [[429, 'quota'], [403, 'auth'], [401, 'auth'], [400, 'config'], [500, 'unavailable'], [503, 'unavailable']]) test(`erro HTTP ${status} → ${code}, sem vazar a chave`, () => run(() => ({ status, json: { error: { code: status, status: 'X', message: `problema com a chave ${KEY}` } } }), {}, async () => {
  await assert.rejects(getProvider().complete({ system: 's', messages: msgs }), e => { assert.equal(e.code, code); assert.ok(!e.message.includes(KEY)); return true })
}))
test('resposta vazia → invalid; bloqueio de segurança → blocked', async () => {
  await run(() => ({ json: { candidates: [] } }), {}, async () => assert.rejects(getProvider().complete({ system: 's', messages: msgs }), e => e.code === 'invalid'))
  await run(() => ({ json: { promptFeedback: { blockReason: 'SAFETY' } } }), {}, async () => assert.rejects(getProvider().complete({ system: 's', messages: msgs }), e => e.code === 'blocked'))
})
test('tempo esgotado → timeout (sem tentar de novo)', () => run(() => ({ delay: 4500 }), { AI_TIMEOUT_MS: '3000' }, async fake => {
  await assert.rejects(getProvider().complete({ system: 's', messages: msgs }), e => e.code === 'timeout'); assert.equal(fake.seen.length, 1, 'não deve repetir a chamada')
}))
test('pipeline completo: /api/chat + SDK real + servidor simulado', () => run(() => ({ json: { candidates: [{ content: { role: 'model', parts: [{ text: 'Que dia pesado. O que mais incomodou?' }] }, finishReason: 'STOP' }] } }), {}, async fake => {
  const res = await new Promise(r => { createHandler()({ method: 'POST', headers: {}, body: { messages: msgs.slice(0, 1), personality: 'motivador' } }, { status(c) { this.c = c; return this }, json(o) { r({ status: this.c, body: o }) } }) })
  assert.equal(res.status, 200); assert.equal(res.body.reply, 'Que dia pesado. O que mais incomodou?'); assert.match(fake.seen[0].json.systemInstruction.parts[0].text, /MOTIVADOR/)
}))
