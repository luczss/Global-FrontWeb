export default function DashboardCard({ title, action, onAction, className = '', children }) {
  return (
    <section className={`card pop ${className}`}>
      <div className="flex items-center justify-between mb-3"><h2 className="title text-lg">{title}</h2>
        {action && <button onClick={onAction} className="text-sm font-bold text-floresta underline underline-offset-4 hover:text-carvao">{action}</button>}</div>
      {children}
    </section>
  )
}
