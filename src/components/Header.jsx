export default function Header({ title, subtitle, coins, children }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div><h1 className="title text-3xl">{title}</h1>{subtitle && <p className="text-carvao/70 mt-1">{subtitle}</p>}</div>
      <div className="flex items-center gap-3">{children}
        {coins !== undefined && <span className="rounded-full bg-argila/40 text-carvao font-extrabold px-4 py-2" title="Moedas virtuais">● {coins} moedas</span>}</div>
    </header>
  )
}
