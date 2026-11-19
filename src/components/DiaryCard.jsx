import { formatDate } from '../utils/format'
export default function DiaryCard({ entry, onEdit, onDelete }) {
  return (
    <article className="card pop">
      <p className="text-xs font-bold text-floresta uppercase tracking-wide">{formatDate(entry.date)}{entry.updatedAt && ' · editado'}</p>
      <h3 className="title text-xl mt-1">{entry.title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-carvao/80">{entry.text}</p>
      <div className="flex gap-2 mt-4"><button className="btn-soft" onClick={() => onEdit(entry)}>Editar</button><button className="btn-danger" onClick={() => onDelete(entry)}>Excluir</button></div>
    </article>
  )
}
