import useLocalStorage from './useLocalStorage'
// Memória opcional e controlada: desligada por padrão, só guarda o que a pessoa escreve, editável e apagável.
export default function useMemory() {
  const [mem, setMem] = useLocalStorage('bimo:memory', { enabled: false, items: [] })
  const setEnabled = enabled => setMem(m => ({ ...m, enabled }))
  const add = text => setMem(m => ({ ...m, items: [...m.items, { id: crypto.randomUUID(), text: text.trim() }].slice(-10) }))
  const edit = (id, text) => setMem(m => ({ ...m, items: m.items.map(i => i.id === id ? { ...i, text: text.trim() } : i) }))
  const remove = id => setMem(m => ({ ...m, items: m.items.filter(i => i.id !== id) }))
  const clear = () => setMem(m => ({ ...m, items: [] }))
  return { ...mem, setEnabled, add, edit, remove, clear }
}
