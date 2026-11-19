import { useState } from 'react'
import BimoCharacter from './BimoCharacter'
const NAV = [['dashboard', 'Início', 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'], ['chat', 'Conversa', 'M4 4h16v12H8l-4 4z'], ['diary', 'Diário', 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6zM9 3v18'], ['challenges', 'Desafios', 'M12 2l3 7 7 .6-5.3 4.700 1.700 7.200L12 17.800 5.600 21.500l1.700-7.200L2 9.600 9 9z'], ['memory', 'Memória', 'M12 3a6 6 0 0 0-3 11v3h6v-3a6 6 0 0 0-3-11zM9 21h6'], ['personality', 'Personalidade', 'M12 21s-8-5.400-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.600-8 11-8 11z'], ['customize', 'Personalizar', 'M3 21C3 9 12 3 21 3c0 9-6 18-18 18z'], ['settings', 'Configurações', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM3 12h3m12 0h3M12 3v3m0 12v3']]
const Icon = ({ d }) => <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d={d} /></svg>
export default function Sidebar({ page, onNavigate }) {
  const [more, setMore] = useState(false)
  const go = id => { setMore(false); onNavigate(id) }
  const MAIN = NAV.slice(0, 4), REST = NAV.slice(4), inRest = REST.some(([id]) => id === page)
  return (
    <>
      <aside aria-label="Menu lateral" className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col gap-2 bg-white/60 border-r border-areia p-5">
        <div className="flex items-center gap-3 mb-4"><BimoCharacter mood="happy" size="w-14" /><div><p className="title text-3xl leading-none">bimo</p><p className="text-xs text-floresta/80">sempre por perto</p></div></div>
        {NAV.map(([id, label, d]) => (
          <button key={id} onClick={() => onNavigate(id)} aria-current={page === id} className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition ${page === id ? 'bg-floresta text-bruma shadow-soft' : 'text-floresta hover:bg-salvia/30'}`}><Icon d={d} />{label}</button>
        ))}
      </aside>
      <nav aria-label="Menu principal" className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-bruma/95 border-t border-areia">
        {more && <div className="absolute bottom-full inset-x-0 bg-bruma border-t border-areia p-3 grid grid-cols-3 gap-2 shadow-soft">{REST.map(([id, label, d]) => <button key={id} onClick={() => go(id)} aria-current={page === id} className={`flex flex-col items-center gap-1 rounded-2xl p-2 text-xs font-bold ${page === id ? 'bg-floresta text-bruma' : 'bg-salvia/20 text-floresta'}`}><Icon d={d} />{label}</button>)}</div>}
        <div className="flex justify-around px-1 py-1">{MAIN.map(([id, label, d]) => <button key={id} onClick={() => go(id)} aria-current={page === id} className={`flex flex-col items-center min-w-[64px] rounded-xl px-2 py-1 text-[11px] font-bold ${page === id ? 'bg-floresta text-bruma' : 'text-floresta'}`}><Icon d={d} />{label}</button>)}
          <button onClick={() => setMore(m => !m)} aria-expanded={more} className={`flex flex-col items-center min-w-[64px] rounded-xl px-2 py-1 text-[11px] font-bold ${inRest || more ? 'bg-floresta text-bruma' : 'text-floresta'}`}><Icon d="M5 12h.01M12 12h.01M19 12h.01" />Mais</button></div>
      </nav>
    </>
  )
}
