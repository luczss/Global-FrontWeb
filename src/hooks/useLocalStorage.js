import { useState, useEffect } from 'react'
// Estado sincronizado com localStorage (persistência local; nada sai do navegador).
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial } catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* armazenamento indisponível */ } }, [key, value])
  return [value, setValue]
}
