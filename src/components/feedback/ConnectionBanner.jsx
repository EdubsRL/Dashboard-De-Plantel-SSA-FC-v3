import { useEffect, useState } from 'react'
import { WifiOff, RefreshCw, DatabaseZap } from 'lucide-react'
import { usePlantels } from '../../context/PlantelsContext'
import { usePlayers } from '../../context/PlayersContext'
import { supabaseConfigError } from '../../lib/supabase'

/**
 * Faixa exibida no topo quando o app não consegue falar com o banco,
 * com botão para tentar novamente. Evita que o usuário veja "0 atletas"
 * e pense que perdeu os dados.
 */
export default function ConnectionBanner() {
  const { error: plantelsError, fetchPlantels } = usePlantels()
  const { error: playersError, fetchPlayers } = usePlayers()
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    const on = () => {
      setOnline(true)
      fetchPlantels()
    }
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [fetchPlantels])

  const error = supabaseConfigError || plantelsError || playersError
  if (online && !error) return null

  const retry = async () => {
    setRetrying(true)
    try {
      await fetchPlantels()
      await fetchPlayers()
    } finally {
      setRetrying(false)
    }
  }

  const Icon = online ? DatabaseZap : WifiOff

  return (
    <div className="mb-5 rounded-xl border border-amber-700/50 bg-amber-950/30 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <Icon className="text-amber-400 shrink-0" size={22} />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-amber-300">
          {online ? 'Não foi possível carregar os dados' : 'Você está offline'}
        </p>
        <p className="text-amber-100/80">
          {online
            ? error
            : 'Assim que a conexão voltar, os dados serão recarregados automaticamente.'}
        </p>
      </div>
      {online && !supabaseConfigError && (
        <button
          type="button"
          onClick={retry}
          disabled={retrying}
          className="btn-secondary inline-flex items-center justify-center gap-2 text-sm"
        >
          <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Tentando...' : 'Tentar novamente'}
        </button>
      )}
    </div>
  )
}
