import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
// A chave da API só pode existir no servidor (variável de ambiente). Procura vazamentos no código do frontend e, se existir, no build.
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); f.isDirectory() ? walk(p, out) : out.push(p) } return out }
const KEYLIKE = /AIza[0-9A-Za-z_-]{20,}/
test('frontend (src/) não referencia a chave nem usa VITE_ para segredos', () => {
  for (const f of walk('src').filter(f => /\.(jsx?|css|html)$/.test(f))) { const s = fs.readFileSync(f, 'utf8'); assert.doesNotMatch(s, /GEMINI_API_KEY|VITE_GEMINI|VITE_.*KEY/, f); assert.doesNotMatch(s, KEYLIKE, f) }
  assert.doesNotMatch(fs.readFileSync('src/services/ai.js', 'utf8'), /apiKey|x-goog-api-key/)
})
test('configuração do Vite não injeta variáveis no frontend', () => { const s = fs.readFileSync('vite.config.js', 'utf8'); assert.doesNotMatch(s, /define\s*:/); assert.match(s, /process\.env\[k\]/) })
test('build (se existir) não contém a chave nem referências a ela', () => {
  const files = walk('dist'); if (!files.length) return
  for (const f of files.filter(f => /\.(js|html|css)$/.test(f))) { const s = fs.readFileSync(f, 'utf8'); assert.doesNotMatch(s, /GEMINI_API_KEY|x-goog-api-key/, f); assert.doesNotMatch(s, KEYLIKE, f); assert.ok(!s.includes('@google/genai'), f) }
})
test('.env.example vazio, .env.local ignorado pelo Git e logs do servidor sem segredos', () => {
  const ex = fs.readFileSync('.env.example', 'utf8'); assert.match(ex, /^GEMINI_API_KEY=\s*$/m); assert.doesNotMatch(ex, KEYLIKE); assert.match(fs.readFileSync('.gitignore', 'utf8'), /\.env\.local/)
  for (const f of walk('api').filter(f => f.endsWith('.js'))) { const s = fs.readFileSync(f, 'utf8'); assert.doesNotMatch(s, /console\.log/); for (const l of s.split('\n').filter(l => /console\.error/.test(l))) assert.match(l, /err\.code/, `${f}: log só com o código`) }
})
