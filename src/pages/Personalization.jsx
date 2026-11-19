import Header from '../components/Header'
import BimoCharacter from '../components/BimoCharacter'
import DashboardCard from '../components/DashboardCard'
import { SHOP } from '../data/shop'
import { formatDate } from '../utils/format'
export default function Personalization({ ch, profile, setProfile, notify }) {
  const owned = id => profile.owned.includes(id)
  const buy = item => { if (!ch.spend(item)) return notify('Moedas insuficientes. Conclua desafios para ganhar mais.', 'error'); setProfile(p => ({ ...p, owned: [...p.owned, item.id], equipped: [...p.equipped, item.id] })); notify(`${item.name} desbloqueado!`) }
  const toggle = id => setProfile(p => ({ ...p, equipped: p.equipped.includes(id) ? p.equipped.filter(x => x !== id) : [...p.equipped, id] }))
  return (<><Header title="Personalizar o Bimo" subtitle="Use as moedas dos desafios para desbloquear acessórios." coins={ch.coins} />
    <div className="grid md:grid-cols-[260px_1fr] gap-5">
      <div className="card flex justify-center"><BimoCharacter mood="hero" size="w-52" float accessories={profile.equipped} /></div>
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-3">{SHOP.map(i => (
          <div key={i.id} className="card flex items-center justify-between gap-2"><div><p className="font-bold">{i.name}</p><p className="text-sm text-carvao/75">{owned(i.id) ? 'Desbloqueado' : `${i.cost} moedas`}</p></div>
            {owned(i.id) ? <button className="btn-soft" onClick={() => toggle(i.id)}>{profile.equipped.includes(i.id) ? 'Remover' : 'Usar'}</button> : <button className="btn-primary" onClick={() => buy(i)}>Desbloquear</button>}</div>))}</div>
        <DashboardCard title="Histórico de personalizações">{ch.spent.length ? <ul className="text-sm divide-y divide-areia">{ch.spent.map((s, i) => <li key={i} className="flex justify-between py-2"><span>{s.name}</span><span className="text-carvao/75">{formatDate(s.date)} · −{s.cost}</span></li>)}</ul> : <p className="text-carvao/70">Nenhum item desbloqueado ainda.</p>}</DashboardCard>
      </div></div></>)
}
