import { useMemo, useState } from 'react'
import useLocalStorage from './useLocalStorage'
// Lógica do diário. Dados privados: ficam SOMENTE no localStorage.
export default function useDiary() {
  const [entries, setEntries] = useLocalStorage('bimo:diary', [])
  const [query, setQuery] = useState('')
  const create = ({ title, text }) => { const e = { id: crypto.randomUUID(), title: title.trim(), text: text.trim(), date: new Date().toISOString(), updatedAt: null }; setEntries(p => [e, ...p]); return e }
  const update = (id, { title, text }) => setEntries(p => p.map(e => e.id === id ? { ...e, title: title.trim(), text: text.trim(), updatedAt: new Date().toISOString() } : e))
  const remove = id => setEntries(p => p.filter(e => e.id !== id))
  const clear = () => setEntries([])
  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return [...entries].filter(e => !q || e.title.toLowerCase().includes(q) || e.text.toLowerCase().includes(q)).sort((a, b) => b.date.localeCompare(a.date))
  }, [entries, query])
  return { entries, filtered, query, setQuery, create, update, remove, clear }
}
