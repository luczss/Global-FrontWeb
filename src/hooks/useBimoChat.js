
import { useCallback, useEffect, useRef, useState } from 'react'
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

const pick = (name) => {
  const greetings = name
    ? [...GREETINGS, [`Oi, ${name}! Como você está se sentindo hoje?`, 'how_are_you']]
    : GREETINGS

  return greetings[Math.floor(Math.random() * greetings.length)]
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const FALLBACK = {
  quota: 'O limite de uso da IA foi atingido por enquanto; o motor local assumiu a conversa.',
  rate_limited: 'Muitas mensagens em pouco tempo; o motor local respondeu desta vez.',
  timeout: 'A IA demorou demais; o motor local respondeu.'
}

const FALLBACK_DEFAULT = 'A IA não respondeu agora; o motor local assumiu a conversa.'

// Sessão de conversa. Se o servidor tem a IA (Gemini) configurada,
// ela responde automaticamente; sem IA, ou em qualquer falha,
// o motor local responde.

export default function useBimoChat({
  personality,
  memory,
  challenges,
  saveHistory = false,
  brief = false,
  listenOnly = false,
  name = ''
}) {
  // Inicializa a conversa sem precisar chamar setState dentro de um efeito.
  const [initialConversation] = useState(() => {
    const [content, pending] = pick(name)

    return {
      messages: [
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content,
          local: true
        }
      ],
      engine: {
        ...newState(),
        pending
      }
    }
  })

  const [ai, setAi] = useState({ state: 'checking' })
  const [messages, setMessages] = useState(initialConversation.messages)
  const [state, setState] = useState('feliz')
  const [notice, setNotice] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [noMemory, setNoMemory] = useState(false)

  const fb = useFeedback()
  const [chats, setChats] = useLocalStorage('bimo:chats', [])

  const engine = useRef(initialConversation.engine)
  const sid = useRef(crypto.randomUUID())
  const breaker = useRef(createBreaker())

  // Reinicia a conversa quando reset for chamado por uma ação do usuário.
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

  // Verifica se a IA está configurada no servidor.
  useEffect(() => {
    let alive = true

    getAiStatus()
      .then((status) => {
        if (alive) setAi(status)
      })
      .catch(() => {
        if (alive) setAi({ state: 'unavailable' })
      })

    return () => {
      alive = false
    }
  }, [])

  // Controla o estado de inatividade do mascote.
  useEffect(() => {
    if (sending || state === 'dormindo') return

    const timer = setTimeout(() => {
      setState('dormindo')
    }, 90000)

    return () => clearTimeout(timer)
  }, [sending, state, messages])

  // Salva o histórico somente quando o usuário ativa essa opção.
  // Os dados permanecem neste dispositivo.
  useEffect(() => {
    if (!saveHistory || messages.length < 2) return

    setChats((currentChats) => [
      {
        id: sid.current,
        date:
          currentChats.find((chat) => chat.id === sid.current)?.date ||
          new Date().toISOString(),
        messages: messages.map(({ id, role, content, mood }) => ({
          id,
          role,
          content,
          mood
        }))
      },
      ...currentChats.filter((chat) => chat.id !== sid.current)
    ].slice(0, 20))
  }, [messages, saveHistory, setChats])

  const mem = memory.enabled && !noMemory
    ? memory.items.map((item) => item.text)
    : []

  // Envia uma mensagem e utiliza a IA ou o motor local como alternativa.
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

      const response = await respond({
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

      if (response.source === 'local') {
        await wait(
          Math.max(
            0,
            500 + Math.random() * 400 - (Date.now() - startTime)
          )
        )
      }

      engine.current = response.engine

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          personality,
          content: response.text,
          safety: response.safety,
          mood: response.mood,
          intent: response.intent,
          source: response.source
        }
      ])

      setState(response.mood)

      if (response.fallback) {
        setNotice(FALLBACK[response.fallback] || FALLBACK_DEFAULT)
      }
    } catch {
      setError('Algo deu errado ao responder. Tente de novo.')
      setState('reflexivo')
    } finally {
      setSending(false)
    }
  }

  return {
    chats,
    clearChats: () => setChats([]),
    aiInfo: ai,
    aiActive: ai.state === 'ready',
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
