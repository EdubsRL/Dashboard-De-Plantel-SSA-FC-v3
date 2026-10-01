import { useMemo } from 'react'
import { usePlayers } from '../context/PlayersContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { POSITIONS, RATINGS, STATUSES, FEET } from '../constants/positions'
import PageLoader from '../components/feedback/PageLoader'

const COLORS = ['#ff5a00', '#ff7a33', '#ff965f', '#ffb38a', '#e64f00', '#b83f00', '#7f2c00', '#ffcfb8', '#ff6b1a']
const STATUS_HEX = { 'No clube': '#ff5a00', 'Em avaliação': '#f59e0b', Lesionado: '#ef4444' }

export default function Dashboard() {
  const { players, loading, error } = usePlayers()

  const stats = useMemo(() => {
    const byPos = POSITIONS.map((pos) => ({
      name: pos.replace('Lateral ', 'Lat. ').replace('Centroavante', 'CA'),
      value: players.filter((p) => p.primary_position === pos).length,
    }))
    const byFoot = FEET.map((f) => ({
      name: f,
      value: players.filter((p) => p.dominant_foot === f).length,
    }))
    const byRating = RATINGS.map((r) => ({
      name: r,
      value: players.filter((p) => p.technical_rating === r).length,
    }))
    const byStatus = STATUSES.map((s) => ({
      name: s,
      value: players.filter((p) => p.status === s).length,
    }))
    const registered = players.filter((p) => p.is_registered).length
    const latest = [...players]
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .slice(0, 8)
    return { byPos, byFoot, byRating, byStatus, latest, registered }
  }, [players])

  // Enquanto carrega pela primeira vez, mostra esqueleto em vez de zeros.
  if (loading && !players.length) return <PageLoader label="Carregando dashboard..." />

  // Sem dados por falha de conexão: não exibimos "0 atletas" para não
  // dar a impressão de que o plantel foi apagado (o aviso aparece no topo).
  if (error && !players.length) {
    return (
      <div className="card p-8 text-center text-gray-400">
        Os dados do plantel aparecerão aqui assim que a conexão for restabelecida.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-pitch-400 font-bold mb-1">SSA FC · Gestão esportiva</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 text-sm">Visão geral do plantel atual</p>
        </div>
        <div className="rounded-xl border border-graphite-800 bg-graphite-900 p-2.5 sm:p-3">
          <img src="/ssa-fc-logo.png" alt="SSA FC" className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg" />
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="card p-4"><p className="text-gray-400 text-xs sm:text-sm">Total de atletas</p><p className="text-2xl sm:text-3xl font-bold text-pitch-400 mt-1">{players.length}</p></div>
        {STATUSES.map((s) => (
          <div key={s} className="card p-4"><p className="text-gray-400 text-xs sm:text-sm">{s}</p><p className="text-2xl font-semibold mt-1">{players.filter((p) => p.status === s).length}</p></div>
        ))}
        <div className="card p-4"><p className="text-gray-400 text-xs sm:text-sm">Inscritos</p><p className="text-2xl font-semibold text-pitch-300 mt-1">{stats.registered}</p></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Distribuição por posição</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byPos}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none' }} />
                <Bar dataKey="value" fill="#ff5a00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-4">Avaliação técnica</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byRating}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                <YAxis tick={{ fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none' }} />
                <Bar dataKey="value" fill="#ff965f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-4">Pé dominante</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byFoot} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.byFoot.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-4">Status</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.byStatus.map((s, i) => (
                    <Cell key={i} fill={STATUS_HEX[s.name] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-3">Últimos atletas cadastrados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-graphite-800">
                <th className="py-2 pr-4">Nome</th>
                <th className="py-2 pr-4">Posição</th>
                <th className="py-2 pr-4">Aval.</th>
                <th className="py-2">Situação</th><th className="py-2">Inscrição</th>
              </tr>
            </thead>
            <tbody>
              {stats.latest.map((p) => (
                <tr key={p.id} className="border-b border-graphite-800/60">
                  <td className="py-2 pr-4">{p.name}</td>
                  <td className="py-2 pr-4 text-gray-300">{p.primary_position}</td>
                  <td className="py-2 pr-4">
                    <span className="px-2 py-0.5 rounded bg-pitch-900 text-pitch-300 text-xs">
                      {p.technical_rating}
                    </span>
                  </td>
                  <td className="py-2 text-gray-300">{p.status}</td><td className="py-2 text-gray-300">{p.is_registered ? "Inscrito" : "Não inscrito"}</td>
                </tr>
              ))}
              {!stats.latest.length && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    Nenhum atleta cadastrado ainda. Vá em Plantel e cadastre o primeiro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
