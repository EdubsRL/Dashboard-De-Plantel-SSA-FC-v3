import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

import { supabase } from '../lib/supabase'
import { usePlantels } from './PlantelsContext'

const LineupsContext =
  createContext(null)

export function LineupsProvider({
  children,
}) {
  const {
    selectedPlantel,
  } = usePlantels()

  const [lineups, setLineups] =
    useState([])

  const [currentLineup, setCurrentLineup] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  /*
   * =========================================================
   * CARREGAR UMA ESCALAÇÃO COMPLETA
   * =========================================================
   */

  const loadLineupData = useCallback(
    async (
      lineupId,
      plantelId
    ) => {
      if (
        !lineupId ||
        !plantelId
      ) {
        throw new Error(
          'Escalação ou plantel inválido.'
        )
      }

      const {
        data: lineup,
        error: lineupError,
      } = await supabase
        .from('lineups')
        .select('*')
        .eq(
          'id',
          lineupId
        )
        .eq(
          'plantel_id',
          plantelId
        )
        .single()

      if (lineupError) {
        throw lineupError
      }

      const {
        data: slots,
        error: slotsError,
      } = await supabase
        .from('lineup_players')
        .select(
          '*, player:players(*)'
        )
        .eq(
          'lineup_id',
          lineupId
        )

      if (slotsError) {
        throw slotsError
      }

      const complete = {
        ...lineup,
        slots: slots || [],
      }

      setCurrentLineup(
        complete
      )

      return complete
    },
    []
  )

  /*
   * =========================================================
   * BUSCAR ESCALAÇÕES DO PLANTEL
   * =========================================================
   */

  const fetchLineups =
    useCallback(
      async () => {
        if (
          !selectedPlantel?.id
        ) {
          setLineups([])
          setCurrentLineup(null)
          setLoading(false)

          return
        }

        setLoading(true)

        try {
          const {
            data,
            error,
          } = await supabase
            .from('lineups')
            .select('*')
            .eq(
              'plantel_id',
              selectedPlantel.id
            )
            .order(
              'created_at',
              {
                ascending: false,
              }
            )

          if (error) {
            throw error
          }

          const list =
            data || []

          setLineups(
            list
          )

          /*
           * Não sobrescrevemos uma escalação
           * que o usuário já esteja editando.
           *
           * Se não existe uma atual,
           * carregamos a principal ou
           * a primeira.
           */
          setCurrentLineup(
            (current) => {
              if (
                current?.id &&
                list.some(
                  (item) =>
                    item.id ===
                    current.id
                )
              ) {
                return current
              }

              const primary =
                list.find(
                  (item) =>
                    item.is_primary
                )

              return primary ||
                list[0] ||
                null
            }
          )
        } catch (error) {
          console.error(
            'Erro ao carregar escalações:',
            error
          )

          setLineups([])
          setCurrentLineup(null)
        } finally {
          setLoading(false)
        }
      },
      [
        selectedPlantel?.id,
      ]
    )

  /*
   * =========================================================
   * CARREGAMENTO INICIAL
   * =========================================================
   */

  useEffect(() => {
    fetchLineups()
  }, [fetchLineups])

  /*
   * =========================================================
   * CARREGAR UMA ESCALAÇÃO
   * =========================================================
   */

  const loadLineup = async (
    lineupId
  ) => {
    if (
      !selectedPlantel?.id
    ) {
      throw new Error(
        'Nenhum plantel selecionado.'
      )
    }

    return loadLineupData(
      lineupId,
      selectedPlantel.id
    )
  }

  /*
   * =========================================================
   * CRIAR NOVA ESCALAÇÃO
   * =========================================================
   */

  const createLineup = async ({
    name,
    formation,
    is_primary = false,
  }) => {
    if (
      !selectedPlantel?.id
    ) {
      throw new Error(
        'Nenhum plantel selecionado.'
      )
    }

    if (!name?.trim()) {
      throw new Error(
        'Informe um nome para a escalação.'
      )
    }

    if (!formation) {
      throw new Error(
        'Informe uma formação.'
      )
    }

    /*
     * Se essa escalação for principal,
     * primeiro retiramos o status
     * das demais.
     */
    if (is_primary) {
      const {
        error: resetError,
      } = await supabase
        .from('lineups')
        .update({
          is_primary: false,
        })
        .eq(
          'plantel_id',
          selectedPlantel.id
        )

      if (resetError) {
        throw resetError
      }
    }

    const {
      data,
      error,
    } = await supabase
      .from('lineups')
      .insert([
        {
          name:
            name.trim(),
          formation,
          is_primary,
          plantel_id:
            selectedPlantel.id,
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    /*
     * Atualiza a lista sem
     * trocar silenciosamente
     * a escalação atual.
     */
    setLineups(
      (current) => [
        data,
        ...current.filter(
          (item) =>
            item.id !==
            data.id
        ),
      ]
    )

    /*
     * Uma nova escalação criada
     * pelo usuário vira a escalação
     * atual.
     */
    setCurrentLineup({
      ...data,
      slots: [],
    })

    return data
  }

  /*
   * =========================================================
   * ATUALIZAR METADADOS
   * =========================================================
   */

  const updateLineupMeta =
    async (
      id,
      payload
    ) => {
      if (
        !selectedPlantel?.id
      ) {
        throw new Error(
          'Nenhum plantel selecionado.'
        )
      }

      if (!id) {
        throw new Error(
          'Escalação inválida.'
        )
      }

      /*
       * Se está tornando uma
       * escalação principal,
       * remove a principal anterior.
       */
      if (
        payload.is_primary ===
        true
      ) {
        const {
          error: resetError,
        } = await supabase
          .from('lineups')
          .update({
            is_primary: false,
          })
          .eq(
            'plantel_id',
            selectedPlantel.id
          )
          .neq(
            'id',
            id
          )

        if (resetError) {
          throw resetError
        }
      }

      const {
        data,
        error,
      } = await supabase
        .from('lineups')
        .update(payload)
        .eq(
          'id',
          id
        )
        .eq(
          'plantel_id',
          selectedPlantel.id
        )
        .select()
        .single()

      if (error) {
        throw error
      }

      setLineups(
        (current) =>
          current.map(
            (lineup) => {
              if (
                lineup.id ===
                id
              ) {
                return data
              }

              /*
               * Se a linha atual
               * virou principal,
               * as demais deixam
               * de ser principais.
               */
              if (
                payload.is_primary ===
                  true &&
                data.is_primary &&
                lineup.is_primary
              ) {
                return {
                  ...lineup,
                  is_primary:
                    false,
                }
              }

              return lineup
            }
          )
      )

      setCurrentLineup(
        (current) =>
          current?.id ===
          id
            ? {
                ...current,
                ...data,
              }
            : current
      )

      return data
    }

  /*
   * =========================================================
   * SALVAR JOGADORES
   * =========================================================
   */

  const saveSlots = async (
    lineupId,
    slots
  ) => {
    if (
      !selectedPlantel?.id
    ) {
      throw new Error(
        'Nenhum plantel selecionado.'
      )
    }

    if (!lineupId) {
      throw new Error(
        'Escalação inválida.'
      )
    }

    /*
     * Confirma que a escalação
     * pertence ao plantel atual.
     */
    const {
      data: lineup,
      error:
        lineupError,
    } = await supabase
      .from('lineups')
      .select('id')
      .eq(
        'id',
        lineupId
      )
      .eq(
        'plantel_id',
        selectedPlantel.id
      )
      .single()

    if (lineupError) {
      throw lineupError
    }

    if (!lineup) {
      throw new Error(
        'Escalação não encontrada.'
      )
    }

    /*
     * Remove os slots antigos.
     */
    const {
      error:
        deleteError,
    } = await supabase
      .from('lineup_players')
      .delete()
      .eq(
        'lineup_id',
        lineupId
      )

    if (deleteError) {
      throw deleteError
    }

    /*
     * Insere os novos.
     */
    if (slots?.length) {
      /*
       * Remove duplicados.
       */
      const uniqueSlots =
        slots.filter(
          (
            slot,
            index,
            array
          ) =>
            index ===
            array.findIndex(
              (item) =>
                item.slot_key ===
                  slot.slot_key
            )
        )

      const rows =
        uniqueSlots.map(
          (slot) => ({
            lineup_id:
              lineupId,
            player_id:
              slot.player_id,
            slot_key:
              slot.slot_key,
            is_bench:
              Boolean(
                slot.is_bench
              ),
          })
        )

      const {
        error: insertError,
      } = await supabase
        .from('lineup_players')
        .insert(rows)

      if (insertError) {
        throw insertError
      }
    }

    /*
     * Recarrega a escalação
     * que acabou de ser salva.
     */
    await loadLineupData(
      lineupId,
      selectedPlantel.id
    )
  }

  /*
   * =========================================================
   * EXCLUIR ESCALAÇÃO
   * =========================================================
   */

  const deleteLineup = async (
    id
  ) => {
    if (
      !selectedPlantel?.id
    ) {
      throw new Error(
        'Nenhum plantel selecionado.'
      )
    }

    if (!id) {
      throw new Error(
        'Escalação inválida.'
      )
    }

    const {
      error,
    } = await supabase
      .from('lineups')
      .delete()
      .eq(
        'id',
        id
      )
      .eq(
        'plantel_id',
        selectedPlantel.id
      )

    if (error) {
      throw error
    }

    setLineups(
      (current) =>
        current.filter(
          (lineup) =>
            lineup.id !==
            id
        )
    )

    setCurrentLineup(
      (current) =>
        current?.id ===
        id
          ? null
          : current
    )
  }

  return (
    <LineupsContext.Provider
      value={{
        lineups,
        currentLineup,
        setCurrentLineup,
        loading,
        fetchLineups,
        loadLineup,
        createLineup,
        updateLineupMeta,
        saveSlots,
        deleteLineup,
      }}
    >
      {children}
    </LineupsContext.Provider>
  )
}

export function useLineups() {
  const context =
    useContext(
      LineupsContext
    )

  if (!context) {
    throw new Error(
      'useLineups deve ser usado dentro de LineupsProvider'
    )
  }

  return context
}