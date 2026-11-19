export default function ProgressBar({ value, label }) {
  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-3 rounded-full bg-areia overflow-hidden"><div className="h-full rounded-full bg-floresta transition-all duration-700" style={{ width: `${value}%` }} /></div>
      {label && <p className="text-xs text-carvao/70 mt-1">{label}</p>}
    </div>
  )
}
