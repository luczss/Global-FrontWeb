// RAG lexical: lê knowledge/*.md, divide em trechos e recupera os mais relevantes por sobreposição de termos.
// Para adicionar conhecimento basta criar um novo .md em /knowledge. (Não usa embeddings.)
import fs from 'node:fs'
import path from 'node:path'
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const STOP = new Set('de da do e o a os as um uma que para com em no na por se eh como mais ou ao'.split(' '))
const tokens = s => norm(s).split(/[^a-z0-9]+/).filter(t => t.length > 2 && !STOP.has(t))
let CHUNKS = null
function load() {
  if (CHUNKS) return CHUNKS
  const dir = path.join(process.cwd(), 'knowledge')
  CHUNKS = []
  try { for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) for (const [i, p] of fs.readFileSync(path.join(dir, f), 'utf8').split(/\n+/).filter(Boolean).entries()) CHUNKS.push({ id: `${f}#${i}`, text: p, tk: new Set(tokens(p)) }) } catch { /* sem base */ }
  return CHUNKS
}
export function retrieve(query, k = 3) {
  const q = tokens(query)
  return load().map(c => ({ ...c, score: q.filter(t => c.tk.has(t)).length })).filter(c => c.score > 0).sort((a, b) => b.score - a.score).slice(0, k)
}
export const baseline = () => load().filter(c => c.id.startsWith('04-')).slice(0, 2) // limites sempre presentes
