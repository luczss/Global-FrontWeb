import { useState } from 'react'
import Header from '../components/Header'
import DiaryCard from '../components/DiaryCard'
import useSpeechInput from '../hooks/useSpeechInput'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
export default function Diary({ diary, notify, profile }) {
  const [form, setForm] = useState(null); const [err, setErr] = useState(''); const [del, setDel] = useState(null)
  const speech = useSpeechInput(t => setForm(f => f && ({ ...f, text: (f.text ? f.text + ' ' : '') + t })))
  const open = e => { setErr(''); setForm(e ? { ...e } : { title: '', text: '' }) }
  const save = ev => {
    ev.preventDefault()
    if (form.title.trim().length < 2) return setErr('Dê um título com pelo menos 2 caracteres.')
    if (form.text.trim().length < 5) return setErr('Escreva um pouco mais (mínimo 5 caracteres).')
    if (form.id) { diary.update(form.id, form); notify('Registro atualizado.') } else { diary.create(form); notify('Registro salvo no diário.') }
    setForm(null)
  }
  return (
    <>
      <Header title="Meu diário" subtitle="Privado: seus registros ficam só neste dispositivo, nunca vão para nenhuma API.">
        <button className="btn-primary" onClick={() => open(null)}>Novo registro</button></Header>
      <input className="input mb-5" placeholder="Pesquisar registros…" aria-label="Pesquisar" value={diary.query} onChange={e => diary.setQuery(e.target.value)} />
      {!diary.filtered.length ? <EmptyState text={diary.entries.length ? 'Nenhum registro encontrado para essa busca.' : 'Seu diário está vazio. Escrever um pouco já ajuda a organizar o que sentimos.'}>{!diary.entries.length && <button className="btn-primary" onClick={() => open(null)}>Escrever agora</button>}</EmptyState>
        : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{diary.filtered.map(e => <DiaryCard key={e.id} entry={e} onEdit={open} onDelete={e => profile.prefs.confirmDelete ? setDel(e) : (diary.remove(e.id), notify("Registro excluído."))} />)}</div>}
      <Modal open={!!form} title={form?.id ? 'Editar registro' : 'Novo registro'} onClose={() => setForm(null)}>
        {form && <form onSubmit={save} className="space-y-3">
          <input className="input" placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="input min-h-[140px]" placeholder="O que aconteceu hoje?" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} />
          <div className="rounded-2xl bg-bruma border border-areia p-3 text-sm">{speech.supported ? <><button type="button" className="btn-soft" aria-pressed={speech.listening} onClick={speech.listening ? speech.stop : speech.start}>{speech.listening ? 'Parar de ditar' : 'Ditar por voz'}</button>
            <p className="text-xs text-carvao/75 mt-2">Como funciona: o ditado usa o reconhecimento de voz do seu navegador. No Chrome e no Edge, o áudio é enviado ao serviço de voz do fabricante (fora do Bimo). O texto fica só no seu dispositivo. Use apenas se estiver de acordo.</p>{speech.error && <p role="alert" className="text-xs font-bold text-red-700 mt-1">{speech.error}</p>}</> : <p className="text-xs text-carvao/75">Este navegador não oferece ditado por voz. No celular, você pode usar o ditado do próprio teclado.</p>}</div>
          {err && <p role="alert" className="text-sm font-bold text-red-700">{err}</p>}
          <div className="flex gap-2 justify-end"><button type="button" className="btn-soft" onClick={() => setForm(null)}>Cancelar</button><button className="btn-primary">Salvar</button></div></form>}
      </Modal>
      <Modal open={!!del} title="Excluir registro?" onClose={() => setDel(null)}>
        <p className="mb-4">“{del?.title}” será removido permanentemente.</p>
        <div className="flex gap-2 justify-end"><button className="btn-soft" onClick={() => setDel(null)}>Cancelar</button><button className="btn-danger" onClick={() => { diary.remove(del.id); setDel(null); notify('Registro excluído.') }}>Excluir</button></div>
      </Modal>
    </>
  )
}
