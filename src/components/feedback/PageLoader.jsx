/** Esqueleto de carregamento usado nas páginas enquanto os dados chegam. */
export default function PageLoader({ label = 'Carregando...' }) {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label={label}>
      <div className="space-y-2">
        <div className="h-3 w-40 rounded bg-graphite-800" />
        <div className="h-7 w-56 rounded bg-graphite-800" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-20" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card h-64" />
        <div className="card h-64" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  )
}
