import BimoCharacter from './BimoCharacter'
export default function EmptyState({ mood = 'sleepy', text, children }) {
  return <div className="card text-center flex flex-col items-center gap-3 py-8"><BimoCharacter mood={mood} size="w-28" /><p className="text-carvao/70 max-w-sm">{text}</p>{children}</div>
}
