export default function ChallengeCard({ challenge, done, busy, onComplete, onRemove }) {
  return (
    <article className="card pop flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-start"><span className="flex flex-wrap gap-1.5"><span className="text-xs font-bold rounded-full bg-salvia/30 text-floresta px-2 py-0.5">{challenge.category || 'Meus desafios'}</span>{challenge.level && <span className="text-xs font-bold rounded-full bg-areia text-carvao px-2 py-0.5">Nível {challenge.level} · {['bem leve', 'moderado', 'mais desafiador'][challenge.level - 1]}</span>}</span><span className={`text-xs font-bold ${done ? 'text-floresta' : 'text-carvao/75'}`}>{done ? 'Concluído hoje ✓' : 'Disponível'}</span></div>
      <div className="flex justify-between gap-2"><h3 className="title text-lg">{challenge.title}</h3><span className="text-sm font-extrabold text-floresta whitespace-nowrap">+{challenge.coins}</span></div>
      <p className="text-carvao/80">{challenge.desc}</p>
      <p className="text-sm text-floresta"><b>Objetivo:</b> {challenge.goal}</p>
      {challenge.steps?.length > 0 && <details className="text-sm"><summary className="cursor-pointer font-bold text-floresta">Como fazer</summary><ol className="list-decimal pl-5 mt-1 space-y-0.5 text-carvao/80">{challenge.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></details>}
      <p className="text-xs text-carvao/75">Opcional. Faça só se e quando quiser.</p>
      <div className="flex gap-2 mt-auto pt-2">
        <button className="btn-primary" disabled={done || busy} onClick={() => onComplete(challenge)}>{done ? 'Concluído hoje ✓' : 'Marcar como concluído'}</button>
        {challenge.custom && <button className="btn-danger" disabled={busy} onClick={() => onRemove(challenge)}>Excluir</button>}
      </div>
    </article>
  )
}
