import useLocalStorage from './useLocalStorage'
// Avaliações das respostas do Bimo (útil / não ajudou / inadequada). Guarda só a resposta do Bimo (nunca a mensagem da pessoa), no localStorage.
export default function useFeedback() {
  const [items, setItems] = useLocalStorage('bimo:feedback', [])
  const rate = (msg, rating, flagged = false) => setItems(f => [{ id: msg.id, rating, flagged, reply: msg.content, personality: msg.personality, intent: msg.intent || null, source: msg.source, date: new Date().toISOString() }, ...f.filter(x => x.id !== msg.id)])
  const ratingOf = id => items.find(f => f.id === id)
  const clear = () => setItems([])
  const exportJson = () => { const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })), download: 'bimo-avaliacoes.json' }); a.click(); URL.revokeObjectURL(a.href) }
  return { items, rate, ratingOf, clear, exportJson }
}
