import { useCallback, useEffect, useRef, useState } from 'react'
import useLocalStorage from './useLocalStorage'
import useFeedback from './useFeedback'
import { getAiStatus, sendChat } from '../services/ai'
import { buildChatRequest } from '../services/aiRequest'
import { respond, createBreaker } from '../services/replyOrchestrator'
import { newState } from '../services/localConversation'
const GREETINGS = [['Olá! Como você está se sentindo hoje?', 'how_are_you'], ['Oi! Como foi seu dia e como você está agora?', 'how_are_you'], ['Que bom te ver. Como você está chegando aqui hoje?', 'how_are_you']]
const pick = name => { const g = name ? [...GREETINGS, [`Oi, ${name}! Como você está se sentindo hoje?`, 'how_are_you']] : GREETINGS; return g[Math.floor(Math.random() * g.length)] }
const wait = ms => new Promise(r => setTimeout(r, ms))
const FALLBACK = { quota: 'O limite de uso da IA foi atingido por enquanto; o motor local assumiu a conversa.', rate_limited: 'Muitas mensagens em pouco tempo; o motor local respondeu desta vez.', timeout: 'A IA demorou demais; o motor local respondeu.' }
const FALLBACK_DEFAULT = 'A IA não respondeu agora; o motor local assumiu a conversa.'
// Sessão de conversa. PADRÃO: motor local. Com "Respostas com IA" ligadas e disponíveis, o Gemini responde; qualquer falha cai no motor local.
export default function useBimoChat({ personality, memory, challenges, useExternal = false, saveHistory = false, brief = false, listenOnly = false, name = '' }) {
  const [ai, setAi] = useState({ state: 'off' }), [messages, setMessages] = useState([]), [state, setState] = useState('feliz'), [notice, setNotice] = useState('')
  const [sending, setSending] = useState(false), [error, setError] = useState(null), [noMemory, setNoMemory] = useState(false)
  const fb = useFeedback(), [chats, setChats] = useLocalStorage('bimo:chats', [])
  const engine = useRef(newState()), sid = useRef(crypto.randomUUID()), breaker = useRef(createBreaker())
  const reset = useCallback(() => { sid.current = crypto.randomUUID(); const [content, pending] = pick(name); engine.current = { ...newState(), pending }; setMessages([{ id: crypto.randomUUID(), role: 'assistant', content, local: true }]); setError(null); setNotice(''); setState('feliz') }, [name])
  useEffect(() => { reset() }, [reset])
  useEffect(() => { // só consulta o servidor de IA se a pessoa ativou; a consulta não envia dados pessoais
    if (!useExternal) { setAi({ state: 'off' }); return }
    let alive = true; setAi({ state: 'checking' }); breaker.current = createBreaker(); getAiStatus().then(s => alive && setAi(s)); return () => { alive = false }
  }, [useExternal])
  useEffect(() => { if (sending || state === 'dormindo') return; const t = setTimeout(() => setState('dormindo'), 90000); return () => clearTimeout(t) }, [sending, state, messages])
  useEffect(() => { // histórico: só se o usuário ativou; fica apenas neste dispositivo
    if (!saveHistory || messages.length < 2) return
    setChats(c => [{ id: sid.current, date: c.find(x => x.id === sid.current)?.date || new Date().toISOString(), messages: messages.map(({ id, role, content, mood }) => ({ id, role, content, mood })) }, ...c.filter(x => x.id !== sid.current)].slice(0, 20))
  }, [messages, saveHistory, setChats])
  const mem = memory.enabled && !noMemory ? memory.items.map(i => i.text) : []
  const send = async (text, entry = null) => {
    const user = { id: crypto.randomUUID(), role: 'user', content: text.trim() }, history = [...messages, user]
    setMessages(history); setSending(true); setError(null); setNotice(''); setState('pensativo')
    try {
      const t0 = Date.now()
      const r = await respond({ text, entry, engine: engine.current, ctx: { personality, memory: mem, challenges, brief, listenOnly }, breaker: breaker.current,
        ai: { enabled: useExternal, status: ai.state, send: sendChat, request: buildChatRequest({ messages: history, personality, memory: mem, entry, challenges, brief, listenOnly }) } })
      if (r.source === 'local') await wait(Math.max(0, 500 + Math.random() * 400 - (Date.now() - t0)))
      engine.current = r.engine
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', personality, content: r.text, safety: r.safety, mood: r.mood, intent: r.intent, source: r.source }]); setState(r.mood)
      if (r.fallback) setNotice(FALLBACK[r.fallback] || FALLBACK_DEFAULT)
    } catch { setError('Algo deu errado ao responder. Tente de novo.'); setState('reflexivo') } finally { setSending(false) }
  }
  return { chats, clearChats: () => setChats([]), aiInfo: ai, aiActive: useExternal && ai.state === 'ready', messages, state, notice, sending, error, send, reset, rate: fb.rate, ratingOf: fb.ratingOf, noMemory, setNoMemory }
}
