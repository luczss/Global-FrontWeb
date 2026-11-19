// Erros classificados. NUNCA repassamos a mensagem original do provedor ao cliente (poderia conter detalhes sensíveis).
export class AiError extends Error { constructor(code) { super(code); this.code = code } }
export const HTTP = { not_configured: 503, quota: 429, rate_limited: 429, timeout: 504, auth: 502, unavailable: 502, invalid: 502, blocked: 502, config: 502 }
export const PUBLIC_MESSAGE = { not_configured: 'A IA não está configurada neste servidor.', quota: 'O limite de uso da IA foi atingido por enquanto.', rate_limited: 'Muitas mensagens em pouco tempo. Aguarde um instante.', timeout: 'A IA demorou demais para responder.', auth: 'A IA está indisponível no momento.', unavailable: 'A IA está indisponível no momento.', invalid: 'A IA não devolveu uma resposta utilizável.', blocked: 'A IA não pôde responder a essa mensagem.', config: 'A IA está indisponível no momento.' }
export function classify(e) { // ApiError do SDK traz .status; erros de rede/abort viram unavailable/timeout
  if (e instanceof AiError) return e
  const s = e?.status
  if (e?.name === 'AbortError' || e?.name === 'TimeoutError' || s === 408 || s === 504) return new AiError('timeout')
  if (s === 429) return new AiError('quota')
  if (s === 401 || s === 403) return new AiError('auth')
  if (s === 400 || s === 404) return new AiError('config')
  return new AiError('unavailable')
}
