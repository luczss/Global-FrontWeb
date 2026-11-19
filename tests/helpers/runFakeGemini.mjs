import fs from 'node:fs'
import { startFakeGemini } from './fakeGemini.mjs'
const log = process.env.FAKE_LOG || '/tmp/fake-gemini.log'; fs.writeFileSync(log, '')
await startFakeGemini(e => { fs.appendFileSync(log, JSON.stringify({ url: e.url, key: e.headers['x-goog-api-key'], body: e.json }) + '\n'); return { json: { candidates: [{ content: { role: 'model', parts: [{ text: 'Que dia puxado. O que pesou mais?' }] }, finishReason: 'STOP' }] } } }, 4599)
console.log('fake gemini on 4599')
