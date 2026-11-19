// Provedores de IA. Para adicionar outro: crie um objeto { name, configured(), complete({system,messages}) } e registre em PROVIDERS.
import { GoogleGenAI, ThinkingLevel } from '@google/genai'
import { AI_CONFIG } from './config.js'
import { AiError, classify } from './errors.js'
const gemini = {
  name: 'gemini',
  configured: () => !!process.env.GEMINI_API_KEY,
  async complete({ system, messages }) {
    const cfg = AI_CONFIG()
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { apiVersion: cfg.apiVersion, ...(cfg.baseUrl ? { baseUrl: cfg.baseUrl } : {}) } })
    // Gemini 3.x: não definimos temperature/top_p/top_k (não recomendado) nem thinkingBudget (use thinkingLevel).
    const config = { systemInstruction: system, maxOutputTokens: cfg.maxOutputTokens, abortSignal: AbortSignal.timeout(cfg.timeoutMs) }
    if (cfg.thinkingLevel !== 'none' && ThinkingLevel[cfg.thinkingLevel.toUpperCase()]) config.thinkingConfig = { thinkingLevel: ThinkingLevel[cfg.thinkingLevel.toUpperCase()] }
    let res
    try { res = await ai.models.generateContent({ model: cfg.model, contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })), config }) }
    catch (e) { throw classify(e) } // nunca propaga a mensagem original
    if (res?.promptFeedback?.blockReason) throw new AiError('blocked')
    const text = (res?.candidates?.[0]?.content?.parts || []).filter(p => typeof p.text === 'string' && !p.thought).map(p => p.text).join('').trim()
    if (!text) throw new AiError('invalid')
    return text
  },
}
const PROVIDERS = { gemini } // registro de provedores: para adicionar outro, crie um objeto como o `gemini` e registre aqui (AI_PROVIDER escolhe)
export const getProvider = () => PROVIDERS[AI_CONFIG().provider] || null
