export default function PersonalityCard({ p, selected, onSelect }) {
  return (
    <button onClick={() => onSelect(p.id)} aria-pressed={selected} className={`card text-left transition hover:-translate-y-1 ${selected ? 'ring-2 ring-floresta bg-salvia/30' : ''}`}>
      <h3 className="title text-xl">{p.name}</h3><p className="mt-1 text-carvao/80">{p.desc}</p>
      <p className="mt-3 rounded-2xl bg-bruma p-3 text-sm italic">“{p.sample}”</p>
      {selected && <p className="mt-2 text-sm font-bold text-floresta">Personalidade atual</p>}
    </button>
  )
}
