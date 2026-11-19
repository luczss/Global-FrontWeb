import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// Serve /api/chat também no `npm run dev` e no `npm run preview` (na Vercel ele roda como função serverless).
// Só variáveis GEMINI_*/AI_* de .env.local são lidas para process.env DO SERVIDOR; nada vira constante do frontend (sem prefixo VITE_).
const apiPlugin = () => {
  const mw = async (req, res, next) => {
    if (!req.url?.startsWith('/api/chat')) return next()
    const chunks = []; for await (const c of req) chunks.push(c)
    let body; try { const raw = Buffer.concat(chunks).toString(); body = raw ? JSON.parse(raw) : undefined } catch { body = null }
    const { default: handler } = await import('./api/chat.js')
    await handler({ method: req.method, headers: req.headers, body }, { status(c) { res.statusCode = c; return this }, json(o) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)) } })
  }
  return { name: 'bimo-api', configureServer(s) { s.middlewares.use(mw) }, configurePreviewServer(s) { s.middlewares.use(mw) } } // sem retorno: retornar função viraria hook de pós-processamento
}
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const k of Object.keys(env)) if (/^(GEMINI_|AI_)/.test(k) && process.env[k] === undefined) process.env[k] = env[k]
  return { plugins: [react(), apiPlugin()] }
})
