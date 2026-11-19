import { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import ChatMessage from '../components/ChatMessage'
import BimoCharacter from '../components/BimoCharacter'
import Modal from '../components/Modal'
import useBimoChat from '../hooks/useBimoChat'
import { PERSONALITIES } from '../data/personalities'
import { formatDate } from '../utils/format'
const FACE = { feliz: 'happy', curioso: 'curious', pensativo: 'sad', reflexivo: 'sad', dormindo: 'sleepy' }
const QUICK = [[/Di[áa]rio/, 'Abrir o Diário', 'diary'], [/desafio/i, 'Ver desafios', 'challenges']] // atalhos quando o Bimo menciona o Diário ou desafios (Expressar/Conectar)
const SUGGEST = ['Quero falar sobre meu dia', 'Estou preocupado com algo', 'Pode sugerir um desafio?', 'Você é psicólogo?', 'Consegui uma coisa boa hoje']
export default function Conversation(props) {
  const { profile, setProfile, memory, diary, ch, notify } = props
  const chat = useBimoChat({ personality: profile.personality, memory, challenges: ch.all.map(c => c.title), saveHistory: !!profile.prefs.saveHistory, brief: profile.prefs.replyLength === 'curta', listenOnly: !!profile.prefs.listenOnly, name: profile.name })
  const [text, setText] = useState(''); const [share, setShare] = useState(false); const [pick, setPick] = useState(null); const [ok, setOk] = useState(false); const [hist, setHist] = useState(false); const [viewing, setViewing] = useState(null)
  const end = useRef(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat.messages, chat.sending])
  const submit = e => { e.preventDefault(); if (!text.trim() || chat.sending) return; chat.send(text); setText('') }
  const confirmShare = () => { chat.send(`Quero refletir sobre este registro do meu diário: "${pick.title}".`, pick); setShare(false); setPick(null); setOk(false) }
  const unavailable = false
  const psel = <select aria-label="Personalidade do Bimo" className="input mt-1 text-sm" value={profile.personality} onChange={e => { setProfile(p => ({ ...p, personality: e.target.value })); notify('Personalidade atualizada.') }}>{PERSONALITIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
  return (
    <div className="flex flex-col lg:h-[calc(100dvh-3.5rem)]">
      <Header title="Conversar com o Bimo" subtitle="Uma conversa para refletir. O Bimo não é psicólogo nem faz diagnósticos.">
        <button className="btn-soft" onClick={() => setHist(true)}>Histórico</button><button className="btn-soft" onClick={chat.reset}>Nova conversa</button></Header>
      <p className="text-xs text-carvao/75 mb-3" data-testid="ai-info">{chat.aiActive ? 'Respostas com IA (Google Gemini): suas mensagens recentes são enviadas ao servidor do Bimo e ao Google para gerar a resposta. Situações de risco são tratadas pelo motor local e, se a IA falhar, o motor local assume. Não prometemos confidencialidade absoluta.' : 'Motor local por regras, no seu navegador: funciona sem internet e sem chaves, e nenhuma mensagem sai do seu aparelho. Não é uma IA generativa nem um modelo treinado, então tem limites.'}</p>
      <div className="lg:hidden card flex items-center gap-3 mb-3 py-3"><BimoCharacter mood={FACE[chat.state]} size="w-14 shrink-0" accessories={profile.equipped} /><div className="flex-1 min-w-0"><p className="text-sm font-bold text-floresta capitalize">{chat.state}</p>{psel}</div></div>
      <div className="grid lg:grid-cols-[1fr_300px] gap-5 lg:flex-1 lg:min-h-0">
        <div className="card flex flex-col min-h-[60vh] lg:min-h-0 lg:h-full">
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[52vh] lg:max-h-none pr-1" role="log" aria-label="Conversa com o Bimo" aria-live="polite">
            {chat.messages.map((m, i) => <ChatMessage key={m.id} from={m.role === 'user' ? 'user' : 'bimo'} text={m.content} tag={m.source === 'gemini' ? 'IA · Google Gemini' : undefined} actions={i === chat.messages.length - 1 && m.role === 'assistant' ? QUICK.filter(([re]) => re.test(m.content)).map(([, label, to]) => ({ label, onClick: () => props.go(to) })) : undefined} mood={FACE[m.mood || 'feliz']} rating={chat.ratingOf(m.id)?.flagged ? 'flag' : chat.ratingOf(m.id)?.rating} onRate={m.role === 'assistant' && !m.local ? k => { chat.rate(m, k === 'up' ? 'up' : 'down', k === 'flag'); notify('Obrigado pelo feedback.') } : undefined} />)}
            {chat.sending && <p className="text-sm text-carvao/75 pl-14">Bimo está pensando…</p>}
            {chat.error && <p role="alert" className="text-sm font-bold text-red-700 pl-14">{chat.error}</p>}
            {chat.notice && <p role="status" className="text-xs font-bold text-floresta pl-14" data-testid="ai-notice">{chat.notice}</p>}<div ref={end} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">{chat.messages.length < 2 && SUGGEST.map(s => <button key={s} className="btn-soft text-sm" disabled={unavailable || chat.sending} onClick={() => chat.send(s)}>{s}</button>)}</div>
          <form onSubmit={submit} className="flex gap-2 pt-3 border-t border-areia mt-3">
            <input className="input" aria-label="Mensagem" maxLength={1000} placeholder="Escreva para o Bimo…" value={text} onChange={e => setText(e.target.value)} disabled={unavailable} />
            <button className="btn-primary" disabled={unavailable || chat.sending || !text.trim()}>Enviar</button></form>
          <button className="text-sm font-bold text-floresta underline underline-offset-4 mt-2 self-start disabled:opacity-40" disabled={unavailable || !diary.entries.length} onClick={() => setShare(true)}>Compartilhar um registro do diário…</button>
        </div>
        <aside className="card hidden lg:flex flex-col items-center text-center h-fit gap-3 py-6">
          <BimoCharacter mood={FACE[chat.state]} size="w-44" accessories={profile.equipped} />
          <p className="font-bold text-floresta capitalize">{chat.state}</p>
          <label className="text-xs font-bold w-full text-left">Personalidade{psel}</label>
          <p className="text-xs text-carvao/70">Memória: {memory.enabled && !chat.noMemory ? `ligada (${memory.items.length})` : 'desligada'}</p>
          {memory.enabled && <label className="text-xs flex gap-2 items-center"><input type="checkbox" className="accent-floresta" checked={chat.noMemory} onChange={e => chat.setNoMemory(e.target.checked)} />Conversar sem usar memória</label>}
        </aside>
      </div>
      <Modal open={hist} title="Histórico de conversas" onClose={() => { setHist(false); setViewing(null) }}>
        {!profile.prefs.saveHistory && <p className="text-sm mb-3">O histórico está desativado e nada é salvo. Para ativar, vá em Configurações. Ele fica só neste dispositivo.</p>}
        {viewing ? <><button className="btn-soft mb-3" onClick={() => setViewing(null)}>← Voltar</button><div className="space-y-3 max-h-[50vh] overflow-y-auto">{viewing.messages.map(m => <ChatMessage key={m.id} from={m.role === 'user' ? 'user' : 'bimo'} text={m.content} mood={FACE[m.mood || 'feliz']} />)}</div></>
          : chat.chats.length ? <><ul className="space-y-2 max-h-[50vh] overflow-y-auto">{chat.chats.map(c => <li key={c.id}><button className="w-full text-left rounded-2xl border border-areia p-3 hover:bg-salvia/20" onClick={() => setViewing(c)}><b>{formatDate(c.date)}</b><br /><span className="text-sm text-carvao/80">{(c.messages.find(m => m.role === 'user')?.content || '').slice(0, 60)}</span></button></li>)}</ul><button className="btn-danger mt-3" onClick={() => { chat.clearChats(); notify('Histórico apagado.') }}>Apagar histórico</button></>
          : <p className="text-carvao/80">Nenhuma conversa salva.</p>}
      </Modal>
      <Modal open={share} title="Compartilhar com o Bimo" onClose={() => setShare(false)}>
        <p className="text-sm mb-3">Escolha um registro. Ele será usado <b>só agora, nesta conversa</b>. {chat.aiActive ? <b>Como as respostas com IA estão ativas, o registro escolhido será enviado ao servidor do Bimo e ao Google (Gemini) para gerar a resposta.</b> : 'Com o motor local, ele fica no seu navegador e não é enviado a nenhum servidor.'}</p>
        <ul className="max-h-48 overflow-y-auto space-y-2 mb-3">{diary.filtered.map(e => <li key={e.id}><button onClick={() => setPick(e)} aria-pressed={pick?.id === e.id} className={`w-full text-left rounded-2xl border p-3 ${pick?.id === e.id ? 'border-floresta bg-salvia/30' : 'border-areia'}`}><b>{e.title}</b><br /><span className="text-xs text-carvao/75">{formatDate(e.date)}</span></button></li>)}</ul>
        <label className="flex gap-2 text-sm mb-4"><input type="checkbox" className="accent-floresta mt-1" checked={ok} onChange={e => setOk(e.target.checked)} />Autorizo usar este registro com o Bimo nesta conversa.</label>
        <div className="flex gap-2 justify-end"><button className="btn-soft" onClick={() => setShare(false)}>Cancelar</button><button className="btn-primary" disabled={!pick || !ok} onClick={confirmShare}>Compartilhar</button></div>
      </Modal>
    </div>
  )
}
