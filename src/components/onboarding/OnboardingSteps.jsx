import PersonalityCard from '../PersonalityCard'
import { PERSONALITIES } from '../../data/personalities'
import { GOALS } from '../../data/profileOptions'
export const STEPS = ['welcome', 'name', 'personality', 'prefs', 'done']
export const MOOD = { welcome: 'hero', name: 'wink', personality: 'curious', prefs: 'happy', done: 'love' }
const H = ({ children }) => <h2 className="title text-2xl sm:text-3xl mb-2">{children}</h2>
export function StepWelcome() {
  return (<div><H>Oi! Eu sou o Bimo.</H><p className="text-carvao/85">Sou um robô de apoio à expressão emocional. Aqui você pode conversar, escrever no diário e dar pequenos passos em direção a outras pessoas, no seu ritmo.</p>
    <ul className="flex flex-wrap gap-2 my-4">{['Expressar', 'Refletir', 'Conectar'].map(t => <li key={t} className="rounded-full bg-salvia/30 text-floresta font-bold px-4 py-1.5 text-sm">{t}</li>)}</ul>
    <p className="text-sm text-carvao/75">Não sou psicólogo e não substituo apoio profissional. Leva menos de um minuto, e você pode pular o que não quiser.</p></div>)
}
export function StepName({ d, set, error, onEnter }) {
  return (<div><H>Como você gostaria de ser chamado(a)?</H><p className="text-carvao/75 mb-4">Pode ser um apelido. Se preferir não dizer, tudo bem.</p>
    <label className="block text-sm font-bold text-floresta">Nome ou apelido<input autoFocus className="input mt-1" maxLength={30} value={d.name} onChange={e => set({ name: e.target.value })} onKeyDown={e => e.key === 'Enter' && onEnter()} placeholder="Ex.: Lucas" aria-invalid={!!error} aria-describedby="nome-erro" /></label>
    <p id="nome-erro" role="alert" className="text-sm font-bold text-red-700 mt-2 min-h-[1.25rem]">{error}</p></div>)
}
export function StepPersonality({ d, set }) {
  return (<div><H>Como você quer que eu converse?</H><p className="text-carvao/75 mb-4">Você pode trocar quando quiser, na conversa ou nas configurações.</p>
    <div className="grid gap-3 sm:grid-cols-3">{PERSONALITIES.map(p => <PersonalityCard key={p.id} p={p} selected={d.personality === p.id} onSelect={id => set({ personality: id })} />)}</div></div>)
}
export function StepPrefs({ d, set }) {
  const toggle = g => set({ goals: d.goals.includes(g) ? d.goals.filter(x => x !== g) : [...d.goals, g] })
  return (<div><H>O que você espera encontrar aqui?</H><p className="text-carvao/75 mb-3">Tudo opcional.</p>
    <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Expectativas">{GOALS.map(g => <button key={g} type="button" aria-pressed={d.goals.includes(g)} onClick={() => toggle(g)} className={d.goals.includes(g) ? 'btn-primary' : 'btn-soft'}>{g}</button>)}</div>
    <fieldset className="mb-3"><legend className="text-sm font-bold text-floresta mb-1">Tamanho das respostas</legend><div className="flex gap-2">{[['normal', 'Normais'], ['curta', 'Mais curtas']].map(([v, l]) => <button key={v} type="button" aria-pressed={d.replyLength === v} onClick={() => set({ replyLength: v })} className={d.replyLength === v ? 'btn-primary' : 'btn-soft'}>{l}</button>)}</div></fieldset>
    <label className="flex items-start gap-3"><input type="checkbox" className="accent-floresta w-5 h-5 mt-0.5" checked={d.listenOnly} onChange={e => set({ listenOnly: e.target.checked })} /><span>Prefiro só desabafar, sem receber sugestões ou conselhos<span className="block text-xs text-carvao/75">Dá pra mudar a qualquer momento.</span></span></label></div>)
}
export function StepDone({ d, ai }) {
  const p = PERSONALITIES.find(x => x.id === d.personality)
  return (<div><H>{d.name ? `Tudo pronto, ${d.name}!` : 'Tudo pronto!'}</H><p className="text-carvao/85 mb-4">Esse é o resumo da sua configuração:</p>
    <dl className="rounded-2xl bg-bruma border border-areia p-4 space-y-1 text-sm"><div className="flex justify-between gap-3"><dt className="font-bold text-floresta">Nome</dt><dd>{d.name || 'não informado'}</dd></div><div className="flex justify-between gap-3"><dt className="font-bold text-floresta">Personalidade</dt><dd>{p.name}</dd></div><div className="flex justify-between gap-3"><dt className="font-bold text-floresta">Respostas</dt><dd>{d.replyLength === 'curta' ? 'mais curtas' : 'normais'}{d.listenOnly ? ', sem conselhos' : ''}</dd></div>{d.goals.length > 0 && <div className="flex justify-between gap-3"><dt className="font-bold text-floresta">Expectativas</dt><dd className="text-right">{d.goals.join(', ')}</dd></div>}</dl>
    <p className="text-xs text-carvao/75 mt-3">Tudo fica salvo só neste dispositivo. Você pode editar ou refazer isso em Configurações.</p>
    {ai === 'ready' && <p className="text-xs text-carvao/75 mt-2" data-testid="onboarding-ai">Respostas com IA: as respostas do Bimo são geradas pelo Google Gemini. Para isso, suas mensagens recentes são enviadas ao servidor do Bimo e ao Google (um aviso fica sempre visível na conversa). Situações de risco ficam sempre no seu aparelho.</p>}</div>)
}
