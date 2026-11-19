
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import useLocalStorage from './useLocalStorage'
import useFeedback from './useFeedback'
import { getAiStatus, sendChat } from '../services/ai'
import { buildChatRequest } from '../services/aiRequest'
import { respond, createBreaker } from '../services/replyOrchestrator'
import { newState } from '../services/localConversation'

const GREETINGS = [
  ['Olá! Como você está se sentindo hoje?', 'how_are_you'],
  ['Oi! Como foi seu dia e como você está agora?', 'how_are_you'],
  ['Que bom te ver. Como você está chegando aqui hoje?', 'how_are_you']
]

const pick = name => {
  const greetings = name
    ? [...GREETINGS, [`Oi, ${name}! Como você está se sentindo hoje?`, 'how_are_you']]
    : GREETINGS

  return greetings[Math.floor(Math.random() * greetings.length)]
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const FALLBACK = {
  quota: 'O limite de uso da IA foi atingido por enquanto; o motor local assumiu a conversa.',
  rate_limited: 'Muitas mensagens em pouco tempo; o motor local respondeu desta vez.',
  timeout: 'A IA demorou demais; o motor local respondeu.'
}

const FALLBACK_DEFAULT = 'A IA não respondeu agora; o motor local assumiu a conversa.'

// Sessão de conversa. Padrão: motor local.
// Com "Respostas com IA" ligadas e disponíveis, o Gemini responde.
// Qualquer falha faz o motor local assumir a conversa.
export default function useBimoChat({
  personality,
  memory,
  challenges,
  useExternal = false,
  saveHistory = false,
  brief = false,
  listenOnly = false,
  name = ''
}) {
  const initialMessage = name
    ? `Oi, ${name}! Como você está se sentindo hoje?`
    : 'Olá! Como você está se sentindo hoje?'

  const [ai, setAi] = useState({ state: 'off' })
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: initialMessage,
      local: true
    }
  ])

  const [state, setState] = useState('feliz')
  const [notice, setNotice] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [noMemory, setNoMemory] = useState(false)

  const fb = useFeedback()
  const [chats, setChats] = useLocalStorage('bimo:chats', [])

  // Inicializações previsíveis dos refs.
  const engine = useRef(null)
  if (engine.current === null) {
    engine.current = {
      ...newState(),
      pending: 'how_are_you'
    }
  }

  const sessionId = useId()
  const sid = useRef(sessionId)

  const breaker = useRef(null)
  if (breaker.current === null) {
    breaker.current = createBreaker()
  }

  const reset = useCallback(() => {
    sid.current = crypto.randomUUID()

    const [content, pending] = pick(name)

    engine.current = {
      ...newState(),
      pending
    }

    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content,
        local: true
      }
    ])

    setError(null)
    setNotice('')
    setState('feliz')
  }, [name])

  // Consulta a IA somente quando o usuário ativa essa opção.
  useEffect(() => {
    if (!useExternal) return

    let alive = true

    breaker.current = createBreaker()

    getAiStatus()
      .then(status => {
        if (alive) setAi(status)
      })
      .catch(() => {
        if (alive) setAi({ state: 'off' })
      })

    return () => {
      alive = false
    }
  }, [useExternal])

  // Estado de descanso do Bimo após um período sem atividade.
  useEffect(() => {
    if (sending || state === 'dormindo') return

    const timer = setTimeout(() => {
      setState('dormindo')
    }, 90000)

    return () => clearTimeout(timer)
  }, [sending, state, messages])

  // Histórico salvo apenas se o usuário ativou essa opção.
  useEffect(() => {
    if (!saveHistory || messages.length < 2) return

    setChats(currentChats => [
      {
        id: sid.current,
        date:
          currentChats.find(chat => chat.id === sid.current)?.date ||
          new Date().toISOString(),
        messages: messages.map(({ id, role, content, mood }) => ({
          id,
          role,
          content,
          mood
        }))
      },
      ...currentChats.filter(chat => chat.id !== sid.current)
    ].slice(0, 20))
  }, [messages, saveHistory, setChats])

  const mem =
    memory.enabled && !noMemory
      ? memory.items.map(item => item.text)
      : []

  const send = async (text, entry = null) => {
    const user = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim()
    }

    const history = [...messages, user]

    setMessages(history)
    setSending(true)
    setError(null)
    setNotice('')
    setState('pensativo')

    try {
      const startTime = Date.now()

      const result = await respond({
        text,
        entry,
        engine: engine.current,
        ctx: {
          personality,
          memory: mem,
          challenges,
          brief,
          listenOnly
        },
        breaker: breaker.current,
        ai: {
          enabled: useExternal,
          status: ai.state,
          send: sendChat,
          request: buildChatRequest({
            messages: history,
            personality,
            memory: mem,
            entry,
            challenges,
            brief,
            listenOnly
          })
        }
      })

      if (result.source === 'local') {
        await wait(
          Math.max(
            0,
            500 + Math.random() * 400 - (Date.now() - startTime)
          )
        )
      }

      engine.current = result.engine

      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          personality,
          content: result.text,
          safety: result.safety,
          mood: result.mood,
          intent: result.intent,
          source: result.source
        }
      ])

      setState(result.mood)

      if (result.fallback) {
        setNotice(FALLBACK[result.fallback] || FALLBACK_DEFAULT)
      }
    } catch {
      setError('Algo deu errado ao responder. Tente de novo.')
      setState('reflexivo')
    } finally {
      setSending(false)
    }
  }

  const aiInfo = useExternal ? ai : { state: 'off' }

  return {
    chats,
    clearChats: () => setChats([]),
    aiInfo,
    aiActive: useExternal && ai.state === 'ready',
    messages,
    state,
    notice,
    sending,
    error,
    send,
    reset,
    rate: fb.rate,
    ratingOf: fb.ratingOf,
    noMemory,
    setNoMemory
  }
}
