import { useState } from 'react'
import useFeedback from '../hooks/useFeedback'
import Header from '../components/Header'
import DashboardCard from '../components/DashboardCard'
export default function Memory({ memory, notify }) {
  const [text, setText] = useState(''); const [edit, setEdit] = useState(null)
  const fb = useFeedback()
  const add = e => { e.preventDefault(); if (text.trim().length < 3) return notify('Escreva pelo menos 3 caracteres.', 'error'); memory.add(text); setText(''); notify('Salvo na memória.') }
  return (<><Header title="Memória e avaliações" subtitle="Você decide o que o Bimo pode lembrar." />
    <div className="grid gap-5 md:grid-cols-2">
      <DashboardCard title="Memória do Bimo" className="md:col-span-2">
        <label className="flex gap-3 items-start"><input type="checkbox" className="accent-floresta w-5 h-5 mt-1" checked={memory.enabled} onChange={e => { memory.setEnabled(e.target.checked); notify(e.target.checked ? 'Memória ativada.' : 'Memória desativada.') }} />
          <span>Permitir que o Bimo use as informações abaixo nas conversas. <span className="block text-sm text-carvao/75">Desligada por padrão. Só é guardado o que você escrever aqui, no seu navegador; fica no seu navegador e só é usada pelo motor local nas conversas. Se você ativar a IA externa opcional nas configurações, ela também seria enviada ao servidor.</span></span></label>
        <form onSubmit={add} className="flex gap-2 mt-4"><input className="input" maxLength={200} placeholder="Ex.: Quero me aproximar mais dos meus colegas" value={text} onChange={e => setText(e.target.value)} /><button className="btn-primary">Adicionar</button></form>
        {!memory.items.length ? <p className="text-carvao/70 mt-4">Nada salvo ainda.</p> : <ul className="mt-4 divide-y divide-areia">{memory.items.map(i => <li key={i.id} className="flex gap-2 items-center py-2">
          {edit?.id === i.id ? <><input className="input" value={edit.text} onChange={e => setEdit({ ...edit, text: e.target.value })} /><button className="btn-primary" onClick={() => { if (edit.text.trim().length < 3) return notify('Texto muito curto.', 'error'); memory.edit(i.id, edit.text); setEdit(null); notify('Atualizado.') }}>Salvar</button></>
            : <><span className="flex-1">{i.text}</span><button className="btn-soft" onClick={() => setEdit(i)}>Editar</button><button className="btn-danger" onClick={() => { memory.remove(i.id); notify('Removido da memória.') }}>Excluir</button></>}</li>)}</ul>}
        {memory.items.length > 0 && <button className="btn-danger mt-3" onClick={() => { memory.clear(); notify('Memória apagada.') }}>Apagar toda a memória</button>}
      </DashboardCard>
      <DashboardCard title="Avaliações das respostas"><p className="text-sm text-carvao/80">{fb.items.length} avaliação(ões): {fb.items.filter(f => f.rating === 'up').length} úteis, {fb.items.filter(f => f.rating === 'down').length} negativas, {fb.items.filter(f => f.flagged).length} marcadas como inadequadas. Guardam só o texto da resposta do Bimo, sem suas mensagens, diário ou memória.</p>
        <div className="flex flex-wrap gap-2 mt-3"><button className="btn-soft" disabled={!fb.items.length} onClick={() => { fb.exportJson(); notify('Avaliações exportadas.') }}>Exportar avaliações (JSON)</button><button className="btn-danger" disabled={!fb.items.length} onClick={() => { fb.clear(); notify('Avaliações apagadas.') }}>Apagar avaliações</button></div></DashboardCard>
      <DashboardCard title="Sobre aprimoramento"><p className="text-sm text-carvao/80">O Bimo conversa por regras locais. <b>Não há treinamento nem aprendizado automático</b>: quem mantém o projeto pode exportar as avaliações (JSON) e ajustar as regras manualmente.</p></DashboardCard>
    </div></>)
}
