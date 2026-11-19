import { useEffect, useRef, useState } from 'react'
// Ditado por voz via Web Speech API do navegador. ATENÇÃO: em Chrome/Edge o áudio é processado por um serviço do fabricante (fora do Bimo).
export default function useSpeechInput(onText) {
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
  const [listening, setListening] = useState(false), [error, setError] = useState(''), rec = useRef(null)
  useEffect(() => () => rec.current?.stop(), [])
  const start = () => {
    if (!SR) return
    const r = new SR(); r.lang = 'pt-BR'; r.continuous = true; r.interimResults = false
    r.onresult = e => onText(Array.from(e.results).slice(e.resultIndex).map(x => x[0].transcript).join(' ').trim())
    r.onerror = e => { setError(e.error === 'not-allowed' ? 'Permissão do microfone negada.' : 'Não consegui ouvir agora. Tente de novo.'); setListening(false) }
    r.onend = () => setListening(false)
    rec.current = r; setError(''); r.start(); setListening(true)
  }
  const stop = () => { rec.current?.stop(); setListening(false) }
  return { supported: !!SR, listening, error, start, stop }
}
