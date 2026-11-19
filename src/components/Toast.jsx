export default function Toast({ toast }) {
  if (!toast) return null
  return <div role="status" className={`fixed top-4 right-4 z-[60] pop rounded-2xl px-5 py-3 shadow-soft font-bold ${toast.type === 'error' ? 'bg-argila text-carvao' : 'bg-floresta text-bruma'}`}>{toast.msg}</div>
}
