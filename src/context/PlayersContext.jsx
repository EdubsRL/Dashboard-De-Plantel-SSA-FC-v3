import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

import { supabase } from '../lib/supabase'
import { usePlantels } from './PlantelsContext'

const PlayersContext = createContext(null)

export function PlayersProvider({ children }) {
  const { selectedPlantel } = usePlantels()

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

    console.log(
      '🔎 Buscando atletas do plantel:',
      selectedPlantel.id
    )

    try {
      const response = await supabase
        .from('players')
        .select('*')
        .eq('plantel_id', selectedPlantel.id)
        .order('name', { ascending: true })

      console.log('📦 Resposta do Supabase:', response)

      const { data, error: supabaseError } = response

      if (supabaseError) {
        console.error(
          '❌ ERRO SUPABASE:',
          supabaseError
        )

        const mensagem = [
          supabaseError.message,
          supabaseError.details,
          supabaseError.hint,
          supabaseError.code
            ? `Código: ${supabaseError.code}`
            : null,
        ]
          .filter(Boolean)
          .join(' | ')

        setError(
          mensagem ||
            'Erro desconhecido ao consultar o banco.'
        )

        setPlayers([])
        return
      }

      console.log(
        '✅ Atletas encontrados:',
        data
      )

      setPlayers(data || [])
    } catch (err) {
      console.error(
        '❌ ERRO DE CONEXÃO:',
        err
      )

      setError(
        err?.message ||
          'Não foi possível conectar ao banco de dados.'
      )

      setPlayers([])
    } finally {
      setLoading(false)
    }
  }, [selectedPlantel?.id])

  // ==========================================
  // CARREGAR ATLETAS
  // ==========================================
  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  // ==========================================
  // CRIAR ATLETA
  // ==========================================
  const createPlayer = async (payload) => {
    if (!selectedPlantel?.id) {
      throw new Error(
        'Nenhum plantel selecionado.'
      )
    }

    setError(null)

    const playerPayload = {
      ...payload,
      plantel_id: selectedPlantel.id,
    }

    console.log(
      '➕ Criando atleta:',
      playerPayload
    )

    const { data, error: supabaseError } =
      await supabase
        .from('players')
        .insert([playerPayload])
        .select()
        .single()

    if (supabaseError) {
      console.error(
        '❌ Erro ao criar atleta:',
        supabaseError
      )

      throw new Error(
        [
          supabaseError.message,
          supabaseError.details,
          supabaseError.hint,
          supabaseError.code
            ? `Código: ${supabaseError.code}`
            : null,
        ]
          .filter(Boolean)
          .join(' | ')
      )
    }

    setPlayers((prev) =>
      [...prev, data].sort((a, b) =>
        String(a.name || '').localeCompare(
          String(b.name || ''),
          'pt-BR'
        )
      )
    )

    return data
  }

  // ==========================================
  // EDITAR ATLETA
  // ==========================================
  const updatePlayer = async (id, payload) => {
    if (!selectedPlantel?.id) {
      throw new Error(
        'Nenhum plantel selecionado.'
      )
    }

    if (!id) {
      throw new Error(
        'ID do atleta não informado.'
      )
    }

    setError(null)

    console.log(
      '✏️ Editando atleta:',
      id,
      payload
    )

    const { data, error: supabaseError } =
      await supabase
        .from('players')
        .update(payload)
        .eq('id', id)
        .eq('plantel_id', selectedPlantel.id)
        .select()
        .single()

    if (supabaseError) {
      console.error(
        '❌ Erro ao editar atleta:',
        supabaseError
      )

      throw new Error(
        [
          supabaseError.message,
          supabaseError.details,
          supabaseError.hint,
          supabaseError.code
            ? `Código: ${supabaseError.code}`
            : null,
        ]
          .filter(Boolean)
          .join(' | ')
      )
    }

    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id
          ? data
          : player
      )
    )

    return data
  }

  // ==========================================
  // EXCLUIR ATLETA
  // ==========================================
  const deletePlayer = async (id) => {
    if (!selectedPlantel?.id) {
      throw new Error(
        'Nenhum plantel selecionado.'
      )
    }

    if (!id) {
      throw new Error(
        'ID do atleta não informado.'
      )
    }

    setError(null)

    console.log(
      '🗑️ Excluindo atleta:',
      id
    )

    const { error: supabaseError } =
      await supabase
        .from('players')
        .delete()
        .eq('id', id)
        .eq('plantel_id', selectedPlantel.id)

    if (supabaseError) {
      console.error(
        '❌ Erro ao excluir atleta:',
        supabaseError
      )

      throw new Error(
        [
          supabaseError.message,
          supabaseError.details,
          supabaseError.hint,
          supabaseError.code
            ? `Código: ${supabaseError.code}`
            : null,
        ]
          .filter(Boolean)
          .join(' | ')
      )
    }

    setPlayers((prev) =>
      prev.filter(
        (player) => player.id !== id
      )
    )

    console.log(
      '✅ Atleta excluído com sucesso'
    )
  }

  return (
    <PlayersContext.Provider
      value={{
        players,
        loading,
        error,
        fetchPlayers,
        createPlayer,
        updatePlayer,
        deletePlayer,
      }}
    >
      {children}
    </PlayersContext.Provider>
  )
}

export function usePlayers() {
  const context = useContext(
    PlayersContext
  )

  if (!context) {
    throw new Error(
      'usePlayers deve ser usado dentro de PlayersProvider'
    )
  }

  return context
}