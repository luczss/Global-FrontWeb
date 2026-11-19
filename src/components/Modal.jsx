import { useEffect } from 'react'
export default function Modal({ open, title, onClose, children }) {
  useEffect(() => { if (!open) return; const h = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-carvao/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="card pop w-full max-w-md max-h-[90vh] overflow-y-auto bg-bruma" onClick={e => e.stopPropagation()}>
        <h2 className="title text-xl mb-3">{title}</h2>{children}</div>
    </div>
  )
}
