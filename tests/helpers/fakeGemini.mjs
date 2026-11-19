// Servidor HTTP local que imita a API do Gemini (generateContent). Usado para testar o SDK real sem rede e sem custo.
import http from 'node:http'
export function startFakeGemini(handler, port = 0) {
  const seen = []
  const server = http.createServer((req, res) => {
    const chunks = []; req.on('data', c => chunks.push(c)); req.on('end', async () => {
      let json = null; try { json = JSON.parse(Buffer.concat(chunks).toString() || 'null') } catch { /* corpo inválido */ }
      const entry = { url: req.url, method: req.method, headers: req.headers, json }; seen.push(entry)
      const out = (await handler(entry)) || {}; if (out.delay) await new Promise(r => setTimeout(r, out.delay))
      res.statusCode = out.status || 200; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(out.json ?? { candidates: [{ content: { role: 'model', parts: [{ text: 'Resposta simulada do Gemini.' }] }, finishReason: 'STOP' }] }))
    })
  })
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${server.address().port}`, seen, close: () => new Promise(r => server.close(r)) })))
}
