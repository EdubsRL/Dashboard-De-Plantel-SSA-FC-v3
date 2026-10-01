import { useMemo, useState } from 'react'
import { notify } from '../lib/notify'
import { usePlayers } from '../context/PlayersContext'
import { useLineups } from '../context/LineupsContext'
import { usePlantels } from '../context/PlantelsContext'
import {
  exportPlayersPDF,
  exportPlayersExcel,
  exportLineupPDF,
} from '../utils/export'
import { FileText, FileSpreadsheet } from 'lucide-react'

export default function Relatorios() {
  const { players } = usePlayers()
  const { lineups, loadLineup } = useLineups()
  const { selectedPlantel } = usePlantels()

  const [groupBy, setGroupBy] = useState('position')

  const grouped = useMemo(() => {
    const keyFn = {
      position: (p) => p.primary_position,
      rating: (p) => p.technical_rating,
      status: (p) => p.status,
      indicator: (p) => p.indicated_by || '(não informado)',
    }[groupBy]

    const map = {}

    players.forEach((p) => {
      const k = keyFn(p)

      if (!map[k]) {
        map[k] = []
      }

      map[k].push(p)
    })

    return Object.entries(map).sort((a, b) =>
      a[0].localeCompare(b[0])
    )
  }, [players, groupBy])

  const playersMap = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players]
  )

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Relatórios</h2>

        <p className="text-gray-400 text-sm">
          Exportações e análises do{' '}
          {selectedPlantel?.name || 'plantel'}
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          type="button"
          className="card p-4 text-left hover:border-pitch-600 transition border border-transparent"
          onClick={() => exportPlayersPDF(players)}
        >
          <FileText className="text-pitch-400 mb-2" />

          <p className="font-semibold">
            PDF do plantel
          </p>

          <p className="text-xs text-gray-500">
            Lista completa em PDF
          </p>
        </button>

        <button
          type="button"
          className="card p-4 text-left hover:border-pitch-600 transition border border-transparent"
          onClick={() => exportPlayersExcel(players)}
        >
          <FileSpreadsheet className="text-pitch-400 mb-2" />

          <p className="font-semibold">
            Excel do elenco
          </p>

          <p className="text-xs text-gray-500">
            Planilha .xlsx
          </p>
        </button>

        <div className="card p-4 space-y-2">
          <p className="font-semibold">
            PDF da escalação
          </p>

          <select
            className="input-field"
            onChange={async (e) => {
              if (!e.target.value) return

              try {
                const lu = await loadLineup(e.target.value)

                exportLineupPDF(
                  lu,
                  lu.slots,
                  playersMap
                )
              } catch (error) {
                notify.error(
                  error.message ||
                    'Erro ao carregar a escalação.'
                )
              }
            }}
            defaultValue=""
          >
            <option value="">
              Selecionar escalação...
            </option>

            {lineups.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
                {l.is_primary ? ' ★' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <h3 className="font-semibold">
            Relatório agrupado
          </h3>

          <select
            className="input-field w-auto"
            value={groupBy}
            onChange={(e) =>
              setGroupBy(e.target.value)
            }
          >
            <option value="position">
              Por posição
            </option>

            <option value="rating">
              Por avaliação técnica
            </option>

            <option value="status">
              Por status
            </option>

            <option value="indicator">
              Por indicador
            </option>
          </select>

          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() =>
              exportPlayersPDF(
                players,
                `Relatório por ${groupBy}`
              )
            }
          >
            Exportar PDF desta visão
          </button>
        </div>

        <div className="space-y-4">
          {grouped.map(([key, list]) => (
            <div key={key}>
              <h4 className="text-pitch-400 font-medium mb-1">
                {key}{' '}
                <span className="text-gray-500 text-sm">
                  ({list.length})
                </span>
              </h4>

              <ul className="text-sm text-gray-300 grid sm:grid-cols-2 lg:grid-cols-3 gap-1">
                {list.map((p) => (
                  <li key={p.id}>
                    {p.name} — {p.primary_position} ·{' '}
                    {p.status} · {p.technical_rating}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {!grouped.length && (
            <p className="text-gray-500">
              Sem dados. Cadastre atletas em Plantel.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}