import BimoCharacter from './BimoCharacter'
export default function ChatMessage({ from, text, mood, rating, onRate, tag, actions }) {
  const bimo = from === 'bimo'
  return (
    <div className={`flex items-end gap-2 pop ${bimo ? '' : 'justify-end'}`}>
      {bimo && <BimoCharacter mood={mood} size="w-12 shrink-0" />}
      <div className="max-w-[80%]">
        <p className={`whitespace-pre-wrap rounded-3xl px-4 py-3 ${bimo ? 'bg-white border border-areia rounded-bl-md' : 'bg-floresta text-bruma rounded-br-md'}`}>{text}</p>
        {tag && <p className="text-[11px] text-carvao/75 mt-1 ml-2">{tag}</p>}
        {actions?.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{actions.map(a => <button key={a.label} className="btn-soft text-sm" onClick={a.onClick}>{a.label}</button>)}</div>}
        {onRate && <div className="flex flex-wrap gap-1.5 mt-1.5 text-xs">
          {[['up', 'Útil'], ['down', 'Não ajudou'], ['flag', 'Inadequada']].map(([k, l]) => <button key={k} onClick={() => onRate(k)} aria-pressed={rating === k} className={`rounded-full px-3 py-2 min-h-[36px] ${rating === k ? 'bg-floresta text-bruma' : 'bg-salvia/30 text-floresta hover:bg-salvia/50'}`}>{l}</button>)}</div>}
      </div>
    </div>
  )
}
