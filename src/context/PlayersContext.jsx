import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'

import { supabase, friendlyError } from '../lib/supabase'
import { usePlantels } from './PlantelsContext'

const PlayersContext = createContext(null)

const sortByName = (list) =>
  [...list].sort((a, b) =>
    String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR')
  )

export function PlayersProvider({ children }) {
  const { selectedPlantel, loading: plantelsLoading, error: plantelsError } = usePlantels()

  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ==========================================
  // BUSCAR ATLETAS
  // ==========================================
  const fetchPlayers = useCallback(async () => {
    if (!selectedPlantel?.id) {
      setPlayers([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from('players')
        .select('*')
        .eq('plantel_id', selectedPlantel.id)
        .order('name', { ascending: true })

      if (supabaseError) throw supabaseError

      setPlayers(data || [])
    } catch (err) {
      console.error('Erro ao carregar atletas:', err)
      setError(friendlyError(err, 'Não foi possível carregar os atletas.'))
      // Não limpamos a lista: se havia dados na tela, eles continuam visíveis.
    } finally {
      setLoading(false)
    }
  }, [selectedPlantel?.id])

  // Ao trocar de plantel, limpa a lista anterior para não misturar dados.
  useEffect(() => {
    setPlayers([])
    fetchPlayers()
  }, [fetchPlayers])

  const requirePlantel = () => {
    if (!selectedPlantel?.id) {
      throw new Error('Nenhum plantel selecionado.')
    }
  }

  // ==========================================
  // CRIAR ATLETA
  // ==========================================
  const createPlayer = async (payload) => {
    requirePlantel()

    const { data, error: supabaseError } = await supabase
      .from('players')
      .insert([{ ...payload, plantel_id: selectedPlantel.id }])
      .select()
      .single()

    if (supabaseError) {
      throw new Error(friendlyError(supabaseError, 'Não foi possível criar o atleta.'))
    }

    setPlayers((prev) => sortByName([...prev, data]))
    return data
  }

  // ==========================================
  // EDITAR ATLETA
  // ==========================================
  const updatePlayer = async (id, payload) => {
    requirePlantel()
    if (!id) throw new Error('ID do atleta não informado.')

    const { data, error: supabaseError } = await supabase
      .from('players')
      .update(payload)
      .eq('id', id)
      .eq('plantel_id', selectedPlantel.id)
      .select()
      .single()

    if (supabaseError) {
      throw new Error(friendlyError(supabaseError, 'Não foi possível salvar o atleta.'))
    }

    setPlayers((prev) => sortByName(prev.map((p) => (p.id === id ? data : p))))
    return data
  }

  // ==========================================
  // EXCLUIR ATLETA
  // ==========================================
  const deletePlayer = async (id) => {
    requirePlantel()
    if (!id) throw new Error('ID do atleta não informado.')

    const { error: supabaseError } = await supabase
      .from('players')
      .delete()
      .eq('id', id)
      .eq('plantel_id', selectedPlantel.id)

    if (supabaseError) {
      throw new Error(friendlyError(supabaseError, 'Não foi possível excluir o atleta.'))
    }

    setPlayers((prev) => prev.filter((p) => p.id !== id))
  }

  // Valor memorizado: evita re-renderizar todas as telas que usam
  // este contexto quando nada relevante mudou.
  const value = useMemo(
    () => ({
        players,
        // Enquanto os plantéis carregam, também estamos "carregando"
        // (evita mostrar 0 atletas por alguns segundos).
        loading: loading || plantelsLoading,
        // Falha ao carregar plantéis também impede carregar os atletas.
        error: error || plantelsError,
        fetchPlayers,
        createPlayer,
        updatePlayer,
        deletePlayer,
      }),
    // As funções acima só dependem destes valores.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [players, loading, plantelsLoading, error, plantelsError, fetchPlayers, selectedPlantel?.id]
  )

  return (
    <PlayersContext.Provider value={value}>
      {children}
    </PlayersContext.Provider>
  )
}

export function usePlayers() {
  const context = useContext(PlayersContext)
  if (!context) {
    throw new Error('usePlayers deve ser usado dentro de PlayersProvider')
  }
  return context
}
