// Cliente do backend de IA (/api/chat). A chave NUNCA passa por aqui: só o servidor a conhece.
class AiClientError extends Error { constructor(code, message) { super(message); this.code = code } }
async function parse(res) { const d = await res.json().catch(() => ({})); if (!res.ok) throw new AiClientError(d.error || 'unavailable', d.message || 'A IA está indisponível.'); return d }
export async function getAiStatus() { // não envia nenhum dado da pessoa
  try { const d = await parse(await fetch('/api/chat')); return { state: d.configured ? 'ready' : 'unconfigured', provider: d.provider, model: d.model } } catch { return { state: 'offline' } }
}
export async function sendChat(payload, timeoutMs = 18000) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), timeoutMs)
  try { return await parse(await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: c.signal })) }
  catch (e) { if (e instanceof AiClientError) throw e; throw new AiClientError(e?.name === 'AbortError' ? 'timeout' : 'unavailable', 'A IA não respondeu.') }
  finally { clearTimeout(t) }
}
