import { useMemo } from 'react'
import { usePlayers } from '../context/PlayersContext'
import { buildDepthChart, positionsWithLowDepth } from '../utils/depth'
import { POSITIONS } from '../constants/positions'
import { AlertTriangle } from 'lucide-react'

const statusColor = {
  'No clube': 'text-pitch-400',
  'Em avaliação': 'text-amber-400',
  Lesionado: 'text-red-400',
}

export default function Profundidade() {
  const { players, loading } = usePlayers()
  const depth = useMemo(() => buildDepthChart(players), [players])
  const low = useMemo(() => positionsWithLowDepth(depth, 2), [depth])

  if (loading) return <p className="text-gray-400">Carregando...</p>

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Profundidade do elenco</h2>
        <p className="text-gray-400 text-sm">Atletas por posição (principal e secundárias)</p>
      </header>

      {!!low.length && (
        <div className="card p-4 border-yellow-700/50 bg-yellow-950/20">
          <div className="flex items-center gap-2 text-yellow-400 font-medium mb-2">
            <AlertTriangle size={18} />
            Posições com profundidade insuficiente (&lt; 2)
          </div>
          <ul className="text-sm text-gray-300 list-disc list-inside">
            {low.map((l) => (
              <li key={l.position}>
                {l.position}: {l.count} atleta(s)
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {POSITIONS.map((pos) => (
          <div key={pos} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-pitch-400">{pos}</h3>
              <span className="text-xs text-gray-500">{depth[pos]?.length || 0}</span>
            </div>
            <ul className="space-y-2">
              {(depth[pos] || []).map((p) => (
                <li key={`${pos}-${p.id}`} className="flex justify-between text-sm gap-2">
                  <span>
                    {p.name}
                    {p.role === 'secundária' && (
                      <span className="ml-1 text-[10px] text-gray-500">(sec.)</span>
                    )}
                  </span>
                  <span className={`shrink-0 ${statusColor[p.status] || ''}`}>
                    {p.status} · {p.technical_rating}
                  </span>
                </li>
              ))}
              {!(depth[pos] || []).length && <li className="text-sm text-red-400/80">Nenhum atleta</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
