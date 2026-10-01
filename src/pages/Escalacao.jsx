import { useState, useMemo, useEffect } from 'react'
import { notify, confirmDialog } from '../lib/notify'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core'

import { usePlayers } from '../context/PlayersContext'
import { useLineups } from '../context/LineupsContext'

import Pitch from '../components/lineup/Pitch'
import PlayerChip from '../components/lineup/PlayerChip'

import {
  FORMATIONS,
  POSITIONS,
} from '../constants/positions'

import {
  Search,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
} from 'lucide-react'

function BenchDrop({ children }) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: 'bench',
    data: {
      type: 'bench',
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[90px]
        rounded-lg
        border
        border-dashed
        p-2
        flex
        flex-wrap
        gap-2
        transition
        ${
          isOver
            ? 'border-pitch-400 bg-pitch-900/30'
            : 'border-graphite-600'
        }
      `}
    >
      {children}
    </div>
  )
}

export default function Escalacao() {
  const { players } = usePlayers()

  const {
    lineups,
    currentLineup,
    loadLineup,
    createLineup,
    updateLineupMeta,
    saveSlots,
    deleteLineup,
  } = useLineups()

  const [formation, setFormation] =
    useState('4-3-3')

  const [assignments, setAssignments] =
    useState({})

  const [reserves, setReserves] =
    useState({})

  const [bench, setBench] =
    useState([])

  const [name, setName] =
    useState('Nova escalação')

  const [activeId, setActiveId] =
    useState(null)

  const [selectedPlayerId, setSelectedPlayerId] =
    useState(null)

  const [reserveMode, setReserveMode] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [creating, setCreating] =
    useState(false)

  const [search, setSearch] =
    useState('')

  const [
    showOnlyRegistered,
    setShowOnlyRegistered,
  ] = useState(false)

  /*
   * Atletas por ID
   */
  const playersById = useMemo(
    () =>
      Object.fromEntries(
        players.map((player) => [
          player.id,
          player,
        ])
      ),
    [players]
  )

  /*
   * Jogadores já utilizados
   */
  const usedIds = useMemo(
    () =>
      new Set([
        ...Object.values(assignments),
        ...Object.values(reserves),
        ...bench,
      ]),
    [
      assignments,
      reserves,
      bench,
    ]
  )

  /*
   * Drag and drop
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  )

  /*
   * Carregar escalação atual
   */
  useEffect(() => {
    if (!currentLineup) {
      return
    }

    setFormation(
      currentLineup.formation ||
        '4-3-3'
    )

    setName(
      currentLineup.name ||
        'Escalação'
    )

    const field = {}
    const reserveMap = {}
    const benchPlayers = []

    ;(
      currentLineup.slots || []
    ).forEach((slot) => {
      if (
        slot.slot_key?.startsWith(
          'RESERVE_'
        )
      ) {
        const key =
          slot.slot_key.replace(
            'RESERVE_',
            ''
          )

        reserveMap[key] =
          slot.player_id

        return
      }

      if (slot.is_bench) {
        benchPlayers.push(
          slot.player_id
        )

        return
      }

      field[slot.slot_key] =
        slot.player_id
    })

    setAssignments(field)
    setReserves(reserveMap)
    setBench(benchPlayers)

    setSelectedPlayerId(null)
    setReserveMode(false)
  }, [currentLineup])

  /*
   * Remover atleta de qualquer lugar
   */
  const removeFromAll = (
    playerId
  ) => {
    setAssignments((current) =>
      Object.fromEntries(
        Object.entries(current).filter(
          ([, id]) =>
            id !== playerId
        )
      )
    )

    setReserves((current) =>
      Object.fromEntries(
        Object.entries(current).filter(
          ([, id]) =>
            id !== playerId
        )
      )
    )

    setBench((current) =>
      current.filter(
        (id) => id !== playerId
      )
    )
  }

  /*
   * Verifica se o atleta pode
   * participar da escalação oficial.
   */
  const canPlayOfficially = (
    player
  ) => {
    if (!player) {
      return false
    }

    return (
      player.status ===
        'No clube' &&
      Boolean(player.is_registered)
    )
  }

  /*
   * Colocar atleta em uma posição
   */
  const placePlayer = (
    playerId,
    slotKey,
    asReserve = false
  ) => {
    const player =
      playersById[playerId]

    if (!player) {
      return
    }

    /*
     * Atleta precisa estar:
     * - No clube
     * - Inscrito
     */
    if (!canPlayOfficially(player)) {
      notify.warning(
        `${player.name} não pode participar da escalação oficial.\n\n`
        +
        `Situação: ${
          player.status ||
          'não informada'
        }\n`
        +
        `Inscrição: ${
          player.is_registered
            ? 'Inscrito'
            : 'Não inscrito'
        }`
      )

      return
    }

    removeFromAll(playerId)

    if (asReserve) {
      setReserves((current) => ({
        ...current,
        [slotKey]: playerId,
      }))
    } else {
      setAssignments((current) => ({
        ...current,
        [slotKey]: playerId,
      }))
    }

    setSelectedPlayerId(null)
    setReserveMode(false)
  }

  /*
   * Arrastar atleta
   */
  const onDragEnd = (event) => {
    const {
      active,
      over,
    } = event

    setActiveId(null)

    if (!over) {
      return
    }

    const playerId =
      active.data.current?.playerId

    if (!playerId) {
      return
    }

    const player =
      playersById[playerId]

    if (!canPlayOfficially(player)) {
      notify.warning(
        `${player?.name || 'Este atleta'} não está elegível para a escalação oficial.`
      )

      return
    }

    const overData =
      over.data.current

    if (
      overData?.type ===
      'slot'
    ) {
      placePlayer(
        playerId,
        overData.slotKey,
        false
      )

      return
    }

    if (
      over.id === 'bench' ||
      overData?.type === 'bench'
    ) {
      removeFromAll(playerId)

      setBench((current) =>
        current.includes(
          playerId
        )
          ? current
          : [
              ...current,
              playerId,
            ]
      )
    }
  }

  /*
   * Selecionar atleta para celular
   */
  const handlePlayerSelect = (
    player
  ) => {
    if (!player?.id) {
      return
    }

    if (!canPlayOfficially(player)) {
      notify.warning(
        `${player.name} não está disponível para a escalação oficial.\n\n`
        +
        `Somente atletas "No clube" e "Inscritos" podem ser escalados.`
      )

      return
    }

    if (
      selectedPlayerId ===
      player.id
    ) {
      setSelectedPlayerId(null)
      setReserveMode(false)

      return
    }

    setSelectedPlayerId(player.id)

    /*
     * Se havia modo reserva ativo,
     * mantém o modo.
     */
  }

  /*
   * Toque no espaço do titular
   */
  const handleSlotClick = (
    slotKey
  ) => {
    if (!selectedPlayerId) {
      return
    }

    placePlayer(
      selectedPlayerId,
      slotKey,
      false
    )
  }

  /*
   * Reserva da posição
   */
  const handleReserveClick = (
    slotKey
  ) => {
    if (!selectedPlayerId) {
      notify.warning(
        'Primeiro selecione um atleta e depois toque em "+ reserva".'
      )

      setReserveMode(true)

      return
    }

    placePlayer(
      selectedPlayerId,
      slotKey,
      true
    )
  }

  /*
   * Remover titular
   */
  const handleRemoveSlot = (
    slotKey
  ) => {
    setAssignments((current) => {
      const next = {
        ...current,
      }

      delete next[slotKey]

      return next
    })
  }

  /*
   * Remover reserva
   */
  const handleRemoveReserve = (
    slotKey
  ) => {
    setReserves((current) => {
      const next = {
        ...current,
      }

      delete next[slotKey]

      return next
    })
  }

  /*
   * Remover do banco
   */
  const handleRemoveBench = (
    playerId
  ) => {
    setBench((current) =>
      current.filter(
        (id) =>
          id !== playerId
      )
    )
  }

  /*
   * Criar nova escalação
   *
   * Importante:
   * não colocamos automaticamente
   * jogadores nela.
   */
  const handleNew = async () => {
    const requestedName =
      window.prompt(
        'Nome da nova escalação:',
        `Escalação ${lineups.length + 1}`
      )

    if (!requestedName?.trim()) {
      return
    }

    try {
      setCreating(true)

      const created =
        await createLineup({
          name:
            requestedName.trim(),
          formation: '4-3-3',
          is_primary: false,
        })

      /*
       * A nova escalação vira a atual
       * explicitamente.
       */
      await loadLineup(
        created.id
      )

      setFormation('4-3-3')
      setName(
        requestedName.trim()
      )
      setAssignments({})
      setReserves({})
      setBench([])
      setSelectedPlayerId(null)
      setReserveMode(false)
    } catch (error) {
      console.error(
        'Erro ao criar escalação:',
        error
      )

      notify.error(
        error?.message ||
          'Erro ao criar escalação.'
      )
    } finally {
      setCreating(false)
    }
  }

  /*
   * Salvar
   */
  const handleSave = async () => {
    if (!name.trim()) {
      notify.warning(
        'Informe um nome para a escalação.'
      )

      return
    }

    try {
      setSaving(true)

      let lineupId =
        currentLineup?.id

      /*
       * Se ainda não existe uma
       * escalação, cria uma.
       */
      if (!lineupId) {
        const created =
          await createLineup({
            name:
              name.trim(),
            formation,
            is_primary: false,
          })

        lineupId =
          created.id

        await loadLineup(
          lineupId
        )
      } else {
        await updateLineupMeta(
          lineupId,
          {
            name:
              name.trim(),
            formation,
          }
        )
      }

      /*
       * Somente jogadores realmente
       * elegíveis podem ser salvos.
       */
      const invalidPlayers = [
        ...Object.values(assignments),
        ...Object.values(reserves),
        ...bench,
      ].filter(
        (playerId) =>
          !canPlayOfficially(
            playersById[playerId]
          )
      )

      if (
        invalidPlayers.length >
        0
      ) {
        notify.warning(
          'Existem atletas não inscritos, lesionados ou fora do clube na escalação. Remova-os antes de salvar.'
        )

        return
      }

      const slots = [
        ...Object.entries(
          assignments
        ).map(
          ([
            slot_key,
            player_id,
          ]) => ({
            player_id,
            slot_key,
            is_bench: false,
          })
        ),

        ...Object.entries(
          reserves
        ).map(
          ([
            slot_key,
            player_id,
          ]) => ({
            player_id,
            slot_key:
              `RESERVE_${slot_key}`,
            is_bench: true,
          })
        ),

        ...bench.map(
          (player_id, index) => ({
            player_id,
            slot_key:
              `BENCH_${index + 1}`,
            is_bench: true,
          })
        ),
      ]

      await saveSlots(
        lineupId,
        slots
      )

      notify.success(
        'Escalação salva com sucesso.'
      )
    } catch (error) {
      console.error(
        'Erro ao salvar escalação:',
        error
      )

      notify.error(
        error?.message ||
          'Erro ao salvar escalação.'
      )
    } finally {
      setSaving(false)
    }
  }

  /*
   * Definir principal
   */
  const setPrimary = async () => {
    if (!currentLineup) {
      return
    }

    try {
      await updateLineupMeta(
        currentLineup.id,
        {
          is_primary: true,
        }
      )

      notify.success(
        'Escalação definida como principal.'
      )
    } catch (error) {
      notify.error(
        error?.message ||
          'Erro ao definir escalação principal.'
      )
    }
  }

  /*
   * Todos os atletas disponíveis
   *
   * Agora mostramos TODOS os atletas
   * do clube.
   *
   * Os não inscritos aparecem na lista,
   * mas não podem ser colocados no campo.
   */
  const availablePlayers =
    players.filter(
      (player) =>
        !usedIds.has(
          player.id
        ) &&
        player.status ===
          'No clube'
    )

  /*
   * Busca
   */
  const filteredAvailable =
    useMemo(() => {
      let list =
        availablePlayers

      if (
        showOnlyRegistered
      ) {
        list =
          list.filter(
            (player) =>
              Boolean(
                player.is_registered
              )
          )
      }

      if (
        search.trim()
      ) {
        const query =
          search
            .trim()
            .toLowerCase()

        list =
          list.filter(
            (player) =>
              String(
                player.name || ''
              )
                .toLowerCase()
                .includes(
                  query
                )
          )
      }

      return list
    }, [
      availablePlayers,
      search,
      showOnlyRegistered,
    ])

  /*
   * Agrupar por posição
   */
  const groupedAvailable =
    useMemo(
      () =>
        POSITIONS.map(
          (position) => ({
            position,
            players:
              filteredAvailable.filter(
                (player) =>
                  player.primary_position ===
                  position
              ),
          })
        ).filter(
          (group) =>
            group.players.length >
            0
        ),
      [filteredAvailable]
    )

  /*
   * Não elegíveis
   */
  const unavailablePlayers =
    players.filter(
      (player) =>
        !usedIds.has(
          player.id
        ) &&
        (
          player.status !==
            'No clube' ||
          !player.is_registered
        )
    )

  const selectedPlayer =
    selectedPlayerId
      ? playersById[
          selectedPlayerId
        ]
      : null

  return (
    <div className="space-y-6">

      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div>

          <h2 className="text-2xl font-bold">
            Escalação em campo
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Monte titulares, reservas
            por posição e banco de
            reservas.
          </p>

        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2"
            onClick={handleNew}
            disabled={
              creating ||
              saving
            }
          >
            <Plus size={17} />

            {creating
              ? 'Criando...'
              : 'Nova escalação'}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={setPrimary}
            disabled={
              !currentLineup ||
              saving
            }
          >
            Definir principal
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={
              saving ||
              creating
            }
          >
            {saving
              ? 'Salvando...'
              : 'Salvar escalação'}
          </button>

        </div>

      </header>

      {/* =====================================================
          CONFIGURAÇÃO
      ===================================================== */}

      <div className="card p-3 sm:p-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

          {/* ESCALAÇÃO */}

          <div>
            <label className="label">
              Escalação salva
            </label>

            <select
              className="input-field min-h-11"
              value={
                currentLineup?.id ||
                ''
              }
              onChange={async (
                event
              ) => {
                const id =
                  event.target.value

                if (!id) {
                  return
                }

                try {
                  await loadLineup(
                    id
                  )
                } catch (
                  error
                ) {
                  notify.error(
                    error?.message ||
                      'Erro ao carregar escalação.'
                  )
                }
              }}
            >
              <option value="">
                — Selecionar —
              </option>

              {lineups.map(
                (lineup) => (
                  <option
                    key={
                      lineup.id
                    }
                    value={
                      lineup.id
                    }
                  >
                    {lineup.name}
                    {' '}
                    (
                    {
                      lineup.formation
                    }
                    )

                    {lineup.is_primary
                      ? ' ★'
                      : ''}
                  </option>
                )
              )}
            </select>

          </div>

          {/* NOME */}

          <div>
            <label className="label">
              Nome da escalação
            </label>

            <input
              className="input-field min-h-11"
              value={name}
              onChange={(event) =>
                setName(
                  event.target
                    .value
                )
              }
              placeholder="Ex.: Jogo contra Bahia"
            />
          </div>

          {/* FORMAÇÃO */}

          <div>
            <label className="label">
              Formação
            </label>

            <select
              className="input-field min-h-11"
              value={formation}
              onChange={(event) => {
                const nextFormation =
                  event.target
                    .value

                setFormation(
                  nextFormation
                )

                /*
                 * Evita manter posições
                 * antigas incompatíveis.
                 */
                setAssignments({})
                setReserves({})
              }}
            >
              {Object.keys(
                FORMATIONS
              ).map(
                (formationName) => (
                  <option
                    key={
                      formationName
                    }
                    value={
                      formationName
                    }
                  >
                    {formationName}
                  </option>
                )
              )}
            </select>
          </div>

          {/* EXCLUIR */}

          <div className="flex items-end">

            {currentLineup && (
              <button
                type="button"
                className="btn-danger min-h-11 w-full"
                onClick={async () => {
                  const confirmed =
                    await confirmDialog(
                      `Excluir a escalação "${currentLineup.name}"?\n\nEssa ação não poderá ser desfeita.`,
                      { title: 'Excluir escalação', confirmLabel: 'Excluir' }
                    )

                  if (!confirmed) {
                    return
                  }

                  try {
                    await deleteLineup(
                      currentLineup.id
                    )
                  } catch (
                    error
                  ) {
                    notify.error(
                      error?.message ||
                        'Erro ao excluir escalação.'
                    )
                  }
                }}
              >
                Excluir escalação
              </button>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          INSTRUÇÕES MOBILE
      ===================================================== */}

      <div className="card p-3 sm:p-4 border-pitch-900/70 bg-pitch-950/20">

        <div className="flex items-start gap-3">

          <Smartphone
            size={20}
            className="text-pitch-400 mt-0.5 shrink-0"
          />

          <div>

            <p className="font-semibold text-sm">
              Montagem pelo celular
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Selecione um atleta e
              depois toque na posição
              desejada. Para uma reserva,
              selecione o atleta e toque
              em "+ reserva".
            </p>

          </div>

        </div>

        {selectedPlayer && (
          <div className="mt-3 flex flex-wrap items-center gap-2">

            <span className="px-2.5 py-1 rounded-full bg-pitch-700 text-white text-xs">
              Selecionado:{' '}
              {selectedPlayer.name}
            </span>

            {reserveMode && (
              <span className="px-2.5 py-1 rounded-full bg-amber-900 text-amber-200 text-xs">
                Modo reserva
              </span>
            )}

            <button
              type="button"
              className="btn-secondary text-xs py-1.5"
              onClick={() => {
                setSelectedPlayerId(
                  null
                )

                setReserveMode(
                  false
                )
              }}
            >
              Cancelar seleção
            </button>

          </div>
        )}

      </div>

      {/* =====================================================
          CAMPO + ATLETAS
      ===================================================== */}

      <DndContext
        sensors={sensors}
        collisionDetection={
          closestCenter
        }
        onDragStart={(event) =>
          setActiveId(
            event.active.id
          )
        }
        onDragEnd={
          onDragEnd
        }
        onDragCancel={() =>
          setActiveId(null)
        }
      >

        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6">

          {/* =================================================
              CAMPO
          ================================================= */}

          <div className="space-y-5 min-w-0">

            <Pitch
              formation={
                formation
              }
              assignments={
                assignments
              }
              reserves={
                reserves
              }
              playersById={
                playersById
              }
              onRemove={
                handleRemoveSlot
              }
              onRemoveReserve={
                handleRemoveReserve
              }
              onSlotClick={
                handleSlotClick
              }
              onReserveClick={
                handleReserveClick
              }
              selectedPlayerId={
                selectedPlayerId
              }
            />

            {/* =================================================
                BANCO
            ================================================= */}

            <div>

              <div className="flex items-center justify-between mb-2">

                <h3 className="text-sm font-semibold text-gray-400">
                  Banco de reservas
                </h3>

                <span className="text-[11px] text-gray-500">
                  {bench.length}{' '}
                  atleta(s)
                </span>

              </div>

              <BenchDrop>

                {bench.map(
                  (id) => {
                    const player =
                      playersById[
                        id
                      ]

                    if (!player) {
                      return null
                    }

                    return (
                      <div
                        key={id}
                        className="relative w-full sm:w-auto"
                      >

                        <PlayerChip
                          player={
                            player
                          }
                          onSelect={() =>
                            handlePlayerSelect(
                              player
                            )
                          }
                          selected={
                            selectedPlayerId ===
                            id
                          }
                        />

                        <button
                          type="button"
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs"
                          onClick={() =>
                            handleRemoveBench(
                              id
                            )
                          }
                          aria-label={`Remover ${player.name} do banco`}
                        >
                          ×
                        </button>

                      </div>
                    )
                  }
                )}

                {bench.length ===
                  0 && (
                  <span className="text-xs text-gray-500 p-2">
                    Arraste atletas
                    para cá ou monte o
                    banco pelo celular.
                  </span>
                )}

              </BenchDrop>

            </div>

          </div>

          {/* =================================================
              LISTA DE ATLETAS
          ================================================= */}

          <div className="card p-3 max-h-[78vh] overflow-y-auto">

            <div className="sticky top-0 bg-graphite-900 pb-3 space-y-3 z-10">

              <div>

                <h3 className="font-semibold">
                  Atletas do plantel
                </h3>

                <p className="text-[11px] text-gray-500 mt-1">
                  Apenas atletas
                  <strong className="text-gray-300">
                    {' '}No clube + Inscritos
                  </strong>
                  podem ser colocados
                  oficialmente no campo.
                </p>

              </div>

              {/* BUSCA */}

              <div className="relative">

                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  className="input-field pl-8 py-2 min-h-10 text-sm"
                  placeholder="Buscar atleta..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                />

              </div>

              {/* FILTRO INSCRIÇÃO */}

              <button
                type="button"
                onClick={() =>
                  setShowOnlyRegistered(
                    (current) =>
                      !current
                  )
                }
                className={`w-full min-h-10 rounded-lg border text-xs font-medium transition ${
                  showOnlyRegistered
                    ? 'border-pitch-500 bg-pitch-950 text-pitch-300'
                    : 'border-graphite-700 bg-graphite-950 text-gray-400'
                }`}
              >
                {showOnlyRegistered
                  ? '✓ Mostrando somente inscritos'
                  : 'Mostrar somente inscritos'}
              </button>

            </div>

            {/* ATLETAS */}

            <div className="flex flex-col gap-4">

              {groupedAvailable.map(
                (group) => (
                  <div
                    key={
                      group.position
                    }
                  >

                    <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">
                      {group.position}
                      {' · '}
                      {group.players.length}
                    </p>

                    <div className="flex flex-col gap-2">

                      {group.players.map(
                        (player) => {

                          const registered =
                            Boolean(
                              player.is_registered
                            )

                          return (
                            <div
                              key={
                                player.id
                              }
                              className="relative"
                            >

                              <PlayerChip
                                player={
                                  player
                                }
                                onSelect={() =>
                                  handlePlayerSelect(
                                    player
                                  )
                                }
                                selected={
                                  selectedPlayerId ===
                                  player.id
                                }
                                disabled={
                                  !registered
                                }
                              />

                              {/* STATUS DE INSCRIÇÃO */}

                              {!registered && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">

                                  <span className="inline-flex items-center gap-1 text-[9px] text-gray-500 bg-black/70 px-1.5 py-0.5 rounded">
                                    <XCircle
                                      size={
                                        10
                                      }
                                    />
                                    Não inscrito
                                  </span>

                                </div>
                              )}

                            </div>
                          )
                        }
                      )}

                    </div>

                  </div>
                )
              )}

              {!groupedAvailable.length && (
                <div className="py-6 text-center">

                  <p className="text-sm text-gray-500">
                    Nenhum atleta encontrado.
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    Verifique a busca ou
                    o filtro selecionado.
                  </p>

                </div>
              )}

            </div>

            {/* =================================================
                ATLETAS FORA DA ESCALAÇÃO
            ================================================= */}

            {unavailablePlayers.length >
              0 && (
              <div className="mt-6 pt-4 border-t border-graphite-800">

                <div className="flex items-center gap-2 mb-2">

                  <AlertTriangle
                    size={14}
                    className="text-amber-400"
                  />

                  <p className="text-xs font-semibold text-gray-400">
                    Fora da escalação oficial
                  </p>

                </div>

                <div className="space-y-1">

                  {unavailablePlayers
                    .slice(0, 12)
                    .map(
                      (player) => (
                        <div
                          key={
                            player.id
                          }
                          className="flex items-center justify-between gap-2 text-[11px]"
                        >

                          <span className="text-gray-500 truncate">
                            {
                              player.name
                            }
                          </span>

                          <span className="shrink-0 text-gray-600">
                            {player.status !==
                            'No clube'
                              ? player.status
                              : 'Não inscrito'}
                          </span>

                        </div>
                      )
                    )}

                </div>

                {unavailablePlayers.length >
                  12 && (
                  <p className="text-[10px] text-gray-600 mt-2">
                    +
                    {' '}
                    {unavailablePlayers.length -
                      12}
                    {' '}
                    atleta(s)
                  </p>
                )}

              </div>
            )}

          </div>

        </div>

        {/* =====================================================
            DRAG OVERLAY
        ===================================================== */}

        <DragOverlay>
          {activeId &&
          String(
            activeId
          ).startsWith(
            'player-'
          ) ? (
            <div className="px-4 py-2 rounded-lg text-xs bg-pitch-700 border border-pitch-400 text-white shadow-xl">
              Arrastando atleta...
            </div>
          ) : null}
        </DragOverlay>

      </DndContext>

    </div>
  )
}