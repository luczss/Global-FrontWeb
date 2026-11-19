import Header from '../components/Header'
import PersonalityCard from '../components/PersonalityCard'
import { PERSONALITIES } from '../data/personalities'
export default function Personality({ profile, setProfile, notify }) {
  const select = id => { setProfile(p => ({ ...p, personality: id })); notify('Personalidade salva.') }
  return (<><Header title="Personalidade do Bimo" subtitle="Escolha como o Bimo conversa com você. Você pode mudar quando quiser." />
    <div className="grid gap-4 md:grid-cols-3">{PERSONALITIES.map(p => <PersonalityCard key={p.id} p={p} selected={profile.personality === p.id} onSelect={select} />)}</div></>)
}
