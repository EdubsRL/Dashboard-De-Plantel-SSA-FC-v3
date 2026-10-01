import { useRef, useState } from 'react'
import { notify, confirmDialog } from '../lib/notify'

import { usePlayers } from '../context/PlayersContext'
import { usePlayerFilters } from '../hooks/usePlayerFilters'

import PlayerForm from '../components/players/PlayerForm'
import Avatar from '../components/common/Avatar'

import {
  POSITIONS,
  RATINGS,
  STATUSES,
  STATUS_COLORS,
} from '../constants/positions'

import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Paperclip,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react'

import { format, parseISO } from 'date-fns'

import { parsePlayersExcel } from '../utils/import'

import {
  downloadPlayerTemplate,
  exportPlayersExcel,
} from '../utils/export'

export default function Plantel() {
  const {
    players,
    loading,
    createPlayer,
    updatePlayer,
    deletePlayer,
    fetchPlayers,
  } = usePlayers()

  const f = usePlayerFilters(players)

  const [modal, setModal] = useState(null)
  const [importing, setImporting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fileRef = useRef(null)

  // =========================================================
  // ABRIR NOVO ATLETA
  // =========================================================

  const handleCreate = () => {
    setModal('create')
  }

  // =========================================================
  // ABRIR EDIÇÃO
  // =========================================================

  const handleEdit = (player) => {
    if (!player?.id) {
      notify.warning('Não foi possível identificar este atleta.')
      return
    }

    setModal(player)
  }

  // =========================================================
  // SALVAR / EDITAR
  // =========================================================

  const handleSave = async (payload) => {
    try {
      if (modal === 'create') {
        await createPlayer(payload)
        notify.success('Atleta cadastrado com sucesso.')
      } else if (modal?.id) {
        await updatePlayer(modal.id, payload)
        notify.success('Alterações salvas.')
      } else {
        throw new Error(
          'Não foi possível identificar o atleta.'
        )
      }

      setModal(null)
    } catch (err) {
      console.error(
        'Erro ao salvar atleta:',
        err
      )

      notify.error(
        err?.message ||
          'Não foi possível salvar o atleta.'
      )
    }
  }

  // =========================================================
  // EXCLUIR
  // =========================================================

  const handleDelete = async (id) => {
    if (!id) {
      notify.warning(
        'Não foi possível identificar o atleta.'
      )
      return
    }

    const player = players.find(
      (item) => item.id === id
    )

    const nome =
      player?.name || 'este atleta'

    const confirmed = await confirmDialog(
      `Tem certeza que deseja excluir "${nome}"?\n\nEssa ação não poderá ser desfeita.`,
      { title: 'Excluir atleta', confirmLabel: 'Excluir' }
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(id)

      await deletePlayer(id)

      notify.success(`${nome} foi excluído.`)
    } catch (err) {
      console.error(
        'Erro ao excluir atleta:',
        err
      )

      notify.error(
        err?.message ||
          'Não foi possível excluir o atleta.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  // =========================================================
  // ATUALIZAR LISTA
  // =========================================================

  const handleRefresh = async () => {
    if (!fetchPlayers) {
      return
    }

    try {
      setRefreshing(true)
      await fetchPlayers()
    } catch (err) {
      console.error(
        'Erro ao atualizar plantel:',
        err
      )
    } finally {
      setRefreshing(false)
    }
  }

  // =========================================================
  // IMPORTAR EXCEL
  // =========================================================

  const handleImport = async (event) => {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      setImporting(true)

      const rows =
        await parsePlayersExcel(file)

      if (!rows?.length) {
        throw new Error(
          'Nenhum atleta válido foi encontrado no arquivo.'
        )
      }

      let created = 0

      for (const player of rows) {
        await createPlayer(player)
        created += 1
      }

      notify.success(
        `${created} atleta(s) importado(s) com sucesso.`
      )

      await fetchPlayers?.()
    } catch (err) {
      console.error(
        'Erro ao importar Excel:',
        err
      )

      notify.error(
        err?.message ||
          'Erro ao importar atletas pelo Excel.'
      )
    } finally {
      setImporting(false)

      event.target.value = ''
    }
  }

  // =========================================================
  // COR DO STATUS
  // =========================================================

  const getStatusClass = (status) => {
    return (
      STATUS_COLORS?.[status]?.badge ||
      STATUS_COLORS?.['No clube']?.badge ||
      'bg-graphite-800 text-gray-300'
    )
  }

  // =========================================================
  // DATA
  // =========================================================

  const formatBirthDate = (birthDate) => {
    if (!birthDate) {
      return '-'
    }

    try {
      return format(
        parseISO(birthDate),
        'dd/MM/yyyy'
      )
    } catch {
      return '-'
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

        <div>
          <h2 className="text-2xl font-bold text-white">
            Plantel
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            {players.length}{' '}
            {players.length === 1
              ? 'atleta cadastrado'
              : 'atletas cadastrados'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          {/* ATUALIZAR */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2
              min-h-10 px-3 rounded-lg
              border border-graphite-700
              bg-graphite-900
              text-gray-300
              hover:bg-graphite-700
              hover:text-white
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed"
            title="Atualizar plantel"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            />

            <span className="hidden sm:inline">
              Atualizar
            </span>
          </button>

          {/* MODELO */}

          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2 text-sm"
            onClick={
              downloadPlayerTemplate
            }
          >
            <Download size={16} />
            Modelo Excel
          </button>

          {/* INPUT EXCEL */}

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleImport}
          />

          {/* IMPORTAR */}

          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2 text-sm"
            onClick={() =>
              fileRef.current?.click()
            }
            disabled={importing}
          >
            <Upload size={16} />

            {importing
              ? 'Importando...'
              : 'Importar Excel'}
          </button>

          {/* NOVO ATLETA */}

          <button
            type="button"
            className="btn-primary inline-flex items-center gap-2 min-h-10"
            onClick={handleCreate}
          >
            <Plus size={18} />
            Novo atleta
          </button>

        </div>
      </header>

      {/* =====================================================
          FORMULÁRIO
      ===================================================== */}

      {modal && (
        <PlayerForm
          initial={
            modal === 'create'
              ? null
              : modal
          }
          onSubmit={handleSave}
          onCancel={() =>
            setModal(null)
          }
        />
      )}

      {/* =====================================================
          RESUMO
      ===================================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        {[
          [
            'No clube',
            players.filter(
              (p) =>
                p.status === 'No clube'
            ).length,
          ],

          [
            'Em avaliação',
            players.filter(
              (p) =>
                p.status ===
                'Em avaliação'
            ).length,
          ],

          [
            'Lesionados',
            players.filter(
              (p) =>
                p.status ===
                'Lesionado'
            ).length,
          ],

          [
            'Inscritos',
            players.filter(
              (p) =>
                Boolean(
                  p.is_registered
                )
            ).length,
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="card p-3 sm:p-4"
          >
            <p className="text-[11px] sm:text-xs text-gray-500">
              {label}
            </p>

            <p className="text-xl font-bold mt-1 text-white">
              {value}
            </p>
          </div>
        ))}

      </div>

      {/* =====================================================
          FILTROS
      ===================================================== */}

      <div className="card p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">

        {/* BUSCA */}

        <div className="relative sm:col-span-2 lg:col-span-2">

          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="search"
            className="input-field pl-9 min-h-11"
            placeholder="Buscar por nome..."
            value={f.search}
            onChange={(e) =>
              f.setSearch(
                e.target.value
              )
            }
          />

        </div>

        {/* POSIÇÃO */}

        <select
          className="input-field min-h-11"
          value={f.position}
          onChange={(e) =>
            f.setPosition(
              e.target.value
            )
          }
        >
          <option value="">
            Todas posições
          </option>

          {POSITIONS.map(
            (position) => (
              <option
                key={position}
                value={position}
              >
                {position}
              </option>
            )
          )}
        </select>

        {/* SITUAÇÃO */}

        <select
          className="input-field min-h-11"
          value={f.status}
          onChange={(e) =>
            f.setStatus(
              e.target.value
            )
          }
        >
          <option value="">
            Todas situações
          </option>

          {STATUSES.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            )
          )}
        </select>

        {/* INSCRIÇÃO */}

        <select
          className="input-field min-h-11"
          value={f.registered}
          onChange={(e) =>
            f.setRegistered(
              e.target.value
            )
          }
        >
          <option value="">
            Inscrição: todas
          </option>

          <option value="true">
            Inscritos
          </option>

          <option value="false">
            Não inscritos
          </option>
        </select>

        {/* AVALIAÇÃO */}

        <select
          className="input-field min-h-11"
          value={f.rating}
          onChange={(e) =>
            f.setRating(
              e.target.value
            )
          }
        >
          <option value="">
            Todas avaliações
          </option>

          {RATINGS.map(
            (rating) => (
              <option
                key={rating}
                value={rating}
              >
                {rating}
              </option>
            )
          )}
        </select>

        {/* ORDENAÇÃO */}

        <select
          className="input-field min-h-11"
          value={f.sortBy}
          onChange={(e) =>
            f.setSortBy(
              e.target.value
            )
          }
        >
          <option value="position">
            Ordenar: posição
          </option>

          <option value="name">
            Ordenar: nome
          </option>

          <option value="birth_date">
            Ordenar: nascimento
          </option>

          <option value="rating">
            Ordenar: avaliação
          </option>

          <option value="status">
            Ordenar: situação
          </option>

          <option value="registered">
            Ordenar: inscrição
          </option>
        </select>

        {/* DIREÇÃO */}

        <select
          className="input-field min-h-11"
          value={f.sortDir}
          onChange={(e) =>
            f.setSortDir(
              e.target.value
            )
          }
        >
          <option value="asc">
            Crescente
          </option>

          <option value="desc">
            Decrescente
          </option>
        </select>

        {/* INDICADO */}

        <input
          type="text"
          className="input-field min-h-11 lg:col-span-2 xl:col-span-2"
          placeholder="Indicado por..."
          value={f.indicatedBy}
          onChange={(e) =>
            f.setIndicatedBy(
              e.target.value
            )
          }
        />

      </div>

      {/* =====================================================
          DESKTOP
      ===================================================== */}

      <div className="card overflow-x-auto hidden md:block">

        <table className="w-full text-sm min-w-[1100px]">

          <thead>
            <tr className="text-left text-gray-400 border-b border-graphite-800">

              <th className="p-3">
                Atleta
              </th>

              <th className="p-3">
                Nasc.
              </th>

              <th className="p-3">
                Posição
              </th>

              <th className="p-3">
                Pé
              </th>

              <th className="p-3">
                Aval.
              </th>

              <th className="p-3">
                Situação
              </th>

              <th className="p-3">
                Inscrição
              </th>

              <th className="p-3">
                Indicado
              </th>

              <th className="p-3 text-center">
                Ações
              </th>

            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td
                  colSpan={9}
                  className="p-8 text-center text-gray-500"
                >
                  Carregando atletas...
                </td>
              </tr>
            )}

            {!loading &&
              f.filtered.map(
                (player) => {

                  const isDeleting =
                    deletingId ===
                    player.id

                  const docCount =
                    Array.isArray(
                      player.documents
                    )
                      ? player.documents.length
                      : 0

                  return (
                    <tr
                      key={player.id}
                      className="border-b border-graphite-800/50 hover:bg-graphite-850/50 transition-colors"
                    >

                      {/* ATLETA */}

                      <td className="p-3">

                        <div className="flex items-center gap-3">

                          <Avatar
                            name={
                              player.name
                            }
                            photoUrl={
                              player.photo_url
                            }
                            size="sm"
                          />

                          <div className="min-w-0">

                            <p className="font-medium text-white truncate">
                              {player.name}
                            </p>

                            {docCount >
                              0 && (
                              <span className="mt-0.5 text-[10px] text-gray-500 inline-flex items-center gap-1">
                                <Paperclip
                                  size={
                                    11
                                  }
                                />
                                {docCount}{' '}
                                documento
                                {docCount >
                                1
                                  ? 's'
                                  : ''}
                              </span>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* NASCIMENTO */}

                      <td className="p-3 text-gray-300">
                        {formatBirthDate(
                          player.birth_date
                        )}
                      </td>

                      {/* POSIÇÃO */}

                      <td className="p-3 text-gray-300">
                        {player.primary_position ||
                          '-'}
                      </td>

                      {/* PÉ */}

                      <td className="p-3 text-gray-300">
                        {player.dominant_foot ||
                          '-'}
                      </td>

                      {/* AVALIAÇÃO */}

                      <td className="p-3">

                        {player.technical_rating ? (
                          <span className="px-2 py-1 rounded bg-pitch-900 text-pitch-300 text-xs font-semibold">
                            {
                              player.technical_rating
                            }
                          </span>
                        ) : (
                          <span className="text-gray-600">
                            -
                          </span>
                        )}

                      </td>

                      {/* SITUAÇÃO */}

                      <td className="p-3">

                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(
                            player.status
                          )}`}
                        >
                          {player.status ||
                            'No clube'}
                        </span>

                      </td>

                      {/* INSCRIÇÃO */}

                      <td className="p-3">

                        {player.is_registered ? (
                          <span className="text-pitch-400 inline-flex gap-1.5 items-center text-xs font-medium">
                            <CheckCircle2
                              size={15}
                            />
                            Inscrito
                          </span>
                        ) : (
                          <span className="text-gray-500 inline-flex gap-1.5 items-center text-xs">
                            <XCircle
                              size={15}
                            />
                            Não inscrito
                          </span>
                        )}

                      </td>

                      {/* INDICADO */}

                      <td className="p-3 text-gray-400">
                        {player.indicated_by ||
                          '-'}
                      </td>

                      {/* AÇÕES */}

                      <td className="p-3">

                        <div className="flex items-center justify-center gap-2">

                          <button
                            type="button"
                            disabled={
                              isDeleting
                            }
                            onClick={() =>
                              handleEdit(
                                player
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 min-h-9 px-3 rounded-lg border border-orange-600/50 bg-orange-950/30 hover:bg-orange-600 text-orange-300 hover:text-white transition disabled:opacity-50"
                            title={`Editar ${player.name}`}
                          >
                            <Pencil
                              size={15}
                            />

                            Editar
                          </button>

                          <button
                            type="button"
                            disabled={
                              isDeleting
                            }
                            onClick={() =>
                              handleDelete(
                                player.id
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 min-h-9 px-3 rounded-lg border border-red-800 bg-red-950/40 hover:bg-red-700 text-red-300 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title={`Excluir ${player.name}`}
                          >
                            <Trash2
                              size={15}
                            />

                            {isDeleting
                              ? 'Excluindo...'
                              : 'Excluir'}
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                }
              )}

            {!loading &&
              f.filtered.length ===
                0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-10 text-center"
                  >
                    <p className="text-gray-400">
                      Nenhum atleta encontrado.
                    </p>

                    <p className="text-gray-600 text-xs mt-1">
                      Tente remover os filtros
                      ou cadastrar um novo atleta.
                    </p>
                  </td>
                </tr>
              )}

          </tbody>

        </table>

      </div>

      {/* =====================================================
          MOBILE
      ===================================================== */}

      <div className="md:hidden space-y-3">

        {loading && (
          <div className="card p-6 text-center text-gray-500">
            Carregando atletas...
          </div>
        )}

        {!loading &&
          f.filtered.map(
            (player) => {

              const isDeleting =
                deletingId ===
                player.id

              return (
                <article
                  key={player.id}
                  className="card p-4"
                >

                  {/* HEADER */}

                  <div className="flex items-center gap-3">

                    <Avatar
                      name={
                        player.name
                      }
                      photoUrl={
                        player.photo_url
                      }
                      size="md"
                    />

                    <div className="min-w-0 flex-1">

                      <h3 className="font-semibold text-white truncate">
                        {player.name}
                      </h3>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {player.primary_position ||
                          'Posição não informada'}

                        {' · '}

                        {player.dominant_foot ||
                          'Pé não informado'}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 px-2 py-1 rounded-full text-[10px] ${getStatusClass(
                        player.status
                      )}`}
                    >
                      {player.status ||
                        'No clube'}
                    </span>

                  </div>

                  {/* INFORMAÇÕES */}

                  <div className="grid grid-cols-2 gap-2 mt-4">

                    <div className="bg-graphite-950 rounded-lg p-3">

                      <span className="text-gray-500 text-xs">
                        Nascimento
                      </span>

                      <div className="font-medium text-gray-200 text-sm mt-1">
                        {formatBirthDate(
                          player.birth_date
                        )}
                      </div>

                    </div>

                    <div className="bg-graphite-950 rounded-lg p-3">

                      <span className="text-gray-500 text-xs">
                        Avaliação
                      </span>

                      <div className="font-semibold text-pitch-300 text-sm mt-1">
                        {player.technical_rating ||
                          '-'}
                      </div>

                    </div>

                    <div className="bg-graphite-950 rounded-lg p-3">

                      <span className="text-gray-500 text-xs">
                        Inscrição
                      </span>

                      <div
                        className={
                          player.is_registered
                            ? 'text-pitch-400 font-semibold text-sm mt-1'
                            : 'text-gray-500 text-sm mt-1'
                        }
                      >
                        {player.is_registered
                          ? 'Inscrito'
                          : 'Não inscrito'}
                      </div>

                    </div>

                    <div className="bg-graphite-950 rounded-lg p-3">

                      <span className="text-gray-500 text-xs">
                        Indicado por
                      </span>

                      <div className="font-medium text-gray-300 text-sm mt-1 truncate">
                        {player.indicated_by ||
                          '-'}
                      </div>

                    </div>

                  </div>

                  {/* AÇÕES MOBILE */}

                  <div className="grid grid-cols-2 gap-2 mt-4">

                    <button
                      type="button"
                      disabled={
                        isDeleting
                      }
                      onClick={() =>
                        handleEdit(
                          player
                        )
                      }
                      className="min-h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-orange-600/60 bg-orange-950/30 hover:bg-orange-600 text-orange-300 hover:text-white font-medium transition disabled:opacity-50"
                    >
                      <Pencil
                        size={16}
                      />

                      Editar
                    </button>

                    <button
                      type="button"
                      disabled={
                        isDeleting
                      }
                      onClick={() =>
                        handleDelete(
                          player.id
                        )
                      }
                      className="min-h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-red-800 bg-red-950/40 hover:bg-red-700 text-red-300 hover:text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2
                        size={16}
                      />

                      {isDeleting
                        ? 'Excluindo...'
                        : 'Excluir'}
                    </button>

                  </div>

                </article>
              )
            }
          )}

        {!loading &&
          f.filtered.length ===
            0 && (
            <div className="card p-8 text-center">
              <p className="text-gray-400">
                Nenhum atleta encontrado.
              </p>

              <p className="text-gray-600 text-xs mt-1">
                Tente remover os filtros
                ou cadastrar um novo atleta.
              </p>
            </div>
          )}

      </div>

      {/* =====================================================
          EXCEL / FORMS
      ===================================================== */}

      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <p className="font-medium text-sm text-white">
            Integração com Excel / Forms
          </p>

          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            O Excel pode importar e exportar
            os dados do plantel. O Forms pode
            utilizar as mesmas colunas para
            alimentar avaliações e cadastros.
          </p>

        </div>

        <button
          type="button"
          className="btn-secondary inline-flex items-center justify-center gap-2 text-sm min-h-10"
          onClick={() =>
            exportPlayersExcel(
              f.filtered,
              'plantel_atual.xlsx'
            )
          }
        >
          <Download size={15} />
          Exportar Excel
        </button>

      </div>

    </div>
  )
}