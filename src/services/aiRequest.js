// Monta o que pode SAIR do navegador para a IA. Só recebe o estritamente necessário; o diário e o histórico inteiro nunca entram aqui.
export const LIMITS = { messageChars: 1000, history: 8, memoryItems: 10, memoryChars: 200, titleChars: 150, entryChars: 2000, challenges: 20, challengeChars: 120 }
const clip = (s, n) => String(s ?? '').trim().slice(0, n)
export function buildChatRequest({ messages, personality, memory = [], entry = null, challenges = [], brief = false, listenOnly = false }) {
  const history = messages.filter(m => !m.local && m.content?.trim()).slice(-LIMITS.history).map(m => ({ role: m.role, content: clip(m.content, LIMITS.messageChars) }))
  while (history.length && history[0].role !== 'user') history.shift()
  return { messages: history, personality, memory: memory.slice(0, LIMITS.memoryItems).map(x => clip(x, LIMITS.memoryChars)), // `memory` já vem vazia se a memória estiver desligada
    ...(entry ? { entry: { title: clip(entry.title, LIMITS.titleChars), text: clip(entry.text, LIMITS.entryChars) } } : {}), // só quando a pessoa escolheu compartilhar
    challenges: listenOnly ? [] : challenges.slice(0, LIMITS.challenges).map(c => clip(c, LIMITS.challengeChars)), brief: !!brief, listenOnly: !!listenOnly }
}
