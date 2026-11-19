import { useState } from 'react'
import Header from '../components/Header'
import ChallengeCard from '../components/ChallengeCard'
import ProgressBar from '../components/ProgressBar'
import DashboardCard from '../components/DashboardCard'
import { formatDate } from '../utils/format'
export default function Challenges({ ch, notify }) {
  const [title, setTitle] = useState(''); const [cat, setCat] = useState('Todos')
  const cats = ['Todos', ...new Set(ch.all.map(c => c.category || 'Meus desafios'))]
  const complete = async c => { const r = await ch.complete(c); notify(r.msg, r.ok ? 'ok' : 'error') }
  const add = async e => { e.preventDefault(); if (title.trim().length < 5) return notify('Descreva o desafio com pelo menos 5 caracteres.', 'error'); await ch.addCustom(title); setTitle(''); notify('Desafio criado.') }
  const remove = async c => { await ch.removeCustom(c); notify('Desafio excluído.') }
  return (
    <>
      <Header title="Desafios" subtitle="Pequenos passos, opcionais e no seu ritmo. Sem pressão e sem culpa." coins={ch.coins} />
      <div className="card mb-5"><p className="text-sm text-carvao/80 mb-2"><b className="text-floresta">Sequência:</b> {ch.streak} dia(s) seguidos. É só um registro: se você pausar, nada se perde. Os desafios são graduais (nível 1 é o mais leve) e todos são opcionais.</p><ProgressBar value={ch.progress} label="Progresso de hoje (meta leve: 3 desafios)" />
        <p className={`text-xs mt-2 ${ch.api.error ? 'text-red-700' : 'text-carvao/75'}`}>{ch.api.loading ? 'Conectando à API de demonstração…' : ch.api.error ? `API indisponível: ${ch.api.error} O app segue funcionando localmente.` : `API de demonstração (JSONPlaceholder) conectada: ${ch.api.count} registros lidos. Escritas não são persistidas pelo servidor.`}</p></div>
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filtrar por categoria">{cats.map(c => <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)} className={cat === c ? 'btn-primary' : 'btn-soft'}>{c}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[...ch.all].sort((a, b) => (a.level || 9) - (b.level || 9)).filter(c => cat === 'Todos' || (c.category || 'Meus desafios') === cat).map(c => <ChallengeCard key={c.id} challenge={c} done={ch.isDone(c.id)} busy={ch.busy} onComplete={complete} onRemove={remove} />)}</div>
      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <DashboardCard title="Criar meu próprio desafio"><form onSubmit={add} className="flex gap-2"><input className="input" placeholder="Ex.: Ligar para minha avó" value={title} onChange={e => setTitle(e.target.value)} /><button className="btn-primary" disabled={ch.busy}>Criar</button></form><p className="text-xs text-carvao/75 mt-2">Atenção: o título do desafio é enviado à API pública de demonstração (JSONPlaceholder). Não escreva dados pessoais nele. Seu diário e suas conversas nunca vão para lá.</p></DashboardCard>
        <DashboardCard title="Histórico">{ch.done.length ? <ul className="divide-y divide-areia max-h-48 overflow-y-auto">{ch.done.map((d, i) => <li key={i} className="flex justify-between py-2 text-sm"><span>{d.title}</span><span className="text-carvao/75">{formatDate(d.date)}</span></li>)}</ul> : <p className="text-carvao/70">Quando concluir um desafio, ele aparece aqui.</p>}</DashboardCard>
      </div>
    </>
  )
}
