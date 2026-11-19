import Header from '../components/Header'
import DashboardCard from '../components/DashboardCard'
import BimoCharacter from '../components/BimoCharacter'
import { greeting, formatDate, todayKey } from '../utils/format'
const SHORTCUTS = [['chat', 'Conversar', 'Falar com o Bimo'], ['diary', 'Diário', 'Escrever um registro'], ['challenges', 'Desafios', 'Ver os opcionais'], ['customize', 'Personalizar', 'Acessórios do Bimo']]
export default function Dashboard({ profile, diary, ch, go, notify }) {
  const doDaily = async () => { const r = await ch.complete(ch.daily); notify(r.msg, r.ok ? 'ok' : 'error') }
  const today = todayKey(), doneToday = ch.done.filter(d => d.date === today).length, available = ch.all.filter(c => !ch.isDone(c.id)).length
  const activity = [...diary.entries.map(e => ({ k: 'Diário', t: e.title, d: e.date })), ...ch.done.map(d => ({ k: 'Desafio', t: d.title, d: d.date }))].sort((a, b) => b.d.localeCompare(a.d)).slice(0, 5)
  const stats = [['Registros no diário', diary.entries.length], ['Desafios concluídos', ch.done.length], ['Dias seguidos', ch.streak]]
  return (
    <>
      <Header title={`${greeting()}, ${profile.name || 'amigo'}!`} subtitle="Como você está hoje? Sem pressa, escolha por onde começar." coins={ch.coins} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card lg:col-span-2 bg-gradient-to-r from-bruma via-bruma to-salvia/30 flex flex-col sm:flex-row items-center gap-6 lg:gap-10 p-6 lg:p-8">
          <BimoCharacter mood="hero" size="w-44 lg:w-56 shrink-0" float accessories={profile.equipped} />
          <div className="text-center sm:text-left"><p className="title text-2xl lg:text-3xl">Estou por perto.</p><p className="mt-2 max-w-md text-carvao/85">Podemos conversar, você pode escrever no diário ou dar um pequeno passo em direção a alguém, tudo no seu ritmo.</p>
            <button className="btn-primary mt-5" onClick={() => go('chat')}>Conversar com o Bimo</button></div>
        </div>
        {profile.prefs.reminders && <DashboardCard title="Desafio do dia (opcional)" action="Ver todos" onAction={() => go('challenges')} className="flex flex-col">
          <p className="font-bold">{ch.daily.title}</p><p className="text-sm text-carvao/80 mb-4">{ch.daily.desc}</p>
          <div className="mt-auto"><button className="btn-primary" disabled={ch.isDone(ch.daily.id) || ch.busy} onClick={doDaily}>{ch.isDone(ch.daily.id) ? 'Concluído hoje ✓' : `Concluir (+${ch.daily.coins})`}</button>
            <p className="text-sm text-carvao/75 mt-3">{available} disponível(is) · {doneToday} concluído(s) hoje</p></div></DashboardCard>}
      </div>
      <div className="grid gap-5 mt-5 lg:grid-cols-3">
        <DashboardCard title="Atalhos"><div className="grid grid-cols-2 gap-3">{SHORTCUTS.map(([id, t, s]) => <button key={id} onClick={() => go(id)} className="rounded-2xl bg-salvia/20 hover:bg-salvia/40 p-3 text-left transition"><p className="font-bold text-floresta">{t}</p><p className="text-xs text-carvao/75">{s}</p></button>)}</div></DashboardCard>
        <DashboardCard title="Últimos registros do diário" action="Abrir diário" onAction={() => go('diary')}>
          {diary.filtered.length ? <ul className="divide-y divide-areia">{diary.filtered.slice(0, 3).map(e => <li key={e.id} className="py-2"><p className="text-xs font-bold text-floresta">{formatDate(e.date)}</p><p className="font-bold truncate">{e.title}</p><p className="text-sm text-carvao/80 line-clamp-1">{e.text}</p></li>)}</ul> : <p className="text-carvao/80">Seu diário ainda está vazio. Que tal registrar o primeiro momento?</p>}</DashboardCard>
        <DashboardCard title="Atividades recentes">
          {activity.length ? <ul className="divide-y divide-areia">{activity.map((a, i) => <li key={i} className="flex justify-between gap-3 py-2"><span className="truncate"><b className="text-floresta">{a.k}</b> · {a.t}</span><span className="text-xs text-carvao/75 whitespace-nowrap">{formatDate(a.d)}</span></li>)}</ul> : <p className="text-carvao/80">Nenhuma atividade ainda. Seu primeiro passo pode ser pequeno.</p>}</DashboardCard>
      </div>
      <dl className="grid grid-cols-3 gap-3 sm:gap-5 mt-5">{stats.map(([l, v]) => <div key={l} className="card text-center py-4"><dd className="title text-3xl">{v}</dd><dt className="text-xs sm:text-sm text-carvao/75 mt-1">{l}</dt></div>)}</dl>
    </>
  )
}
