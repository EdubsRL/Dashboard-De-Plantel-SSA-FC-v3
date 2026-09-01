import { useState } from 'react'

import {
  X,
  Trash2,
  Save,
  Plus,
} from 'lucide-react'

import { usePlantels } from '../../context/PlantelsContext'

export default function CreatePlantelModal({
  onClose,
  initialPlantel = null,
}) {
  const {
    createPlantel,
    updatePlantel,
    deletePlantel,
  } = usePlantels()

  const isEditing =
    Boolean(
      initialPlantel?.id
    )

  const [name, setName] =
    useState(
      initialPlantel?.name ||
        ''
    )

  const [category, setCategory] =
    useState(
      initialPlantel?.category ||
        'Sub-15'
    )

  const [season, setSeason] =
    useState(
      initialPlantel?.season ||
        '2026'
    )

  const [saving, setSaving] =
    useState(false)

  const [deleting, setDeleting] =
    useState(false)

  const [error, setError] =
    useState(null)

  // =========================================================
  // SALVAR
  // =========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    if (!name.trim()) {
      setError(
        'Digite o nome do plantel.'
      )

      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        name: name.trim(),
        category,
        season: season.trim(),
      }

      if (isEditing) {
        await updatePlantel(
          initialPlantel.id,
          payload
        )
      } else {
        await createPlantel(
          payload
        )
      }

      onClose()
    } catch (err) {
      console.error(
        'Erro ao salvar plantel:',
        err
      )

      setError(
        err?.message ||
          'Não foi possível salvar o plantel.'
      )
    } finally {
      setSaving(false)
    }
  }

  // =========================================================
  // EXCLUIR
  // =========================================================

  const handleDelete = async () => {
    if (!initialPlantel?.id) {
      return
    }

    const confirmed =
      window.confirm(
        `Excluir o plantel "${initialPlantel.name}"?\n\n` +
        `Essa operação remove o plantel e pode afetar os dados vinculados a ele.\n\n` +
        `Essa ação não poderá ser desfeita.`
      )

    if (!confirmed) {
      return
    }

    setDeleting(true)
    setError(null)

    try {
      await deletePlantel(
        initialPlantel.id
      )

      onClose()
    } catch (err) {
      console.error(
        'Erro ao excluir plantel:',
        err
      )

      setError(
        err?.message ||
          'Não foi possível excluir o plantel.'
      )
    } finally {
      setDeleting(false)
    }
  }

  // =========================================================
  // FECHAR
  // =========================================================

  const handleClose = () => {
    if (
      saving ||
      deleting
    ) {
      return
    }

    onClose()
  }

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/70
        backdrop-blur-sm
        p-4
      "
    >

      <div
        className="
          w-full max-w-md
          bg-graphite-900
          border border-graphite-800
          rounded-xl
          shadow-2xl
          overflow-hidden
        "
      >

        {/* ===================================================
            CABEÇALHO
        =================================================== */}

        <div
          className="
            flex items-center justify-between
            p-5
            border-b border-graphite-800
          "
        >

          <div>

            <div className="flex items-center gap-2">

              {isEditing ? (
                <Save
                  size={18}
                  className="text-pitch-400"
                />
              ) : (
                <Plus
                  size={18}
                  className="text-pitch-400"
                />
              )}

              <h2 className="text-lg font-semibold text-white">
                {isEditing
                  ? 'Editar plantel'
                  : 'Criar novo plantel'}
              </h2>

            </div>

            <p className="text-sm text-gray-500 mt-1">
              {isEditing
                ? 'Atualize os dados do plantel.'
                : 'Cadastre uma nova categoria do clube.'}
            </p>

          </div>

          <button
            type="button"
            onClick={
              handleClose
            }
            disabled={
              saving ||
              deleting
            }
            className="
              w-9 h-9
              flex items-center justify-center
              rounded-lg
              text-gray-400
              hover:text-white
              hover:bg-graphite-800
              transition
              disabled:opacity-50
            "
            aria-label="Fechar"
          >
            <X size={20} />
          </button>

        </div>

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          onSubmit={
            handleSubmit
          }
          className="p-5 space-y-4"
        >

          {/* NOME */}

          <div>

            <label
              htmlFor="plantel-name"
              className="block text-sm text-gray-400 mb-1.5"
            >
              Nome do plantel
            </label>

            <input
              id="plantel-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Ex.: Sub-15"
              disabled={
                saving ||
                deleting
              }
              autoFocus
              className="
                w-full
                bg-graphite-800
                border border-graphite-700
                rounded-lg
                px-3 py-2.5
                text-white
                outline-none
                placeholder:text-gray-600
                focus:border-pitch-500
                disabled:opacity-50
              "
            />

          </div>

          {/* CATEGORIA */}

          <div>

            <label
              htmlFor="plantel-category"
              className="block text-sm text-gray-400 mb-1.5"
            >
              Categoria
            </label>

            <select
              id="plantel-category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              disabled={
                saving ||
                deleting
              }
              className="
                w-full
                bg-graphite-800
                border border-graphite-700
                rounded-lg
                px-3 py-2.5
                text-white
                outline-none
                focus:border-pitch-500
                disabled:opacity-50
              "
            >
              {[
                'Sub-20',
                'Sub-19',
                'Sub-18',
                'Sub-17',
                'Sub-16',
                'Sub-15',
                'Sub-14',
                'Sub-13',
                'Sub-12',
                'Sub-11',
                'Sub-10',
              ].map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

          </div>

          {/* TEMPORADA */}

          <div>

            <label
              htmlFor="plantel-season"
              className="block text-sm text-gray-400 mb-1.5"
            >
              Temporada
            </label>

            <input
              id="plantel-season"
              type="text"
              value={season}
              onChange={(event) =>
                setSeason(
                  event.target.value
                )
              }
              placeholder="2026"
              disabled={
                saving ||
                deleting
              }
              className="
                w-full
                bg-graphite-800
                border border-graphite-700
                rounded-lg
                px-3 py-2.5
                text-white
                outline-none
                placeholder:text-gray-600
                focus:border-pitch-500
                disabled:opacity-50
              "
            />

          </div>

          {/* ERRO */}

          {error && (
            <div
              className="
                rounded-lg
                border border-red-900
                bg-red-950/40
                p-3
                text-sm
                text-red-300
              "
            >
              {error}
            </div>
          )}

          {/* =================================================
              AÇÕES
          ================================================= */}

          <div
            className="
              flex
              flex-col-reverse
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-2
              pt-2
            "
          >

            {/* EXCLUIR */}

            <div>

              {isEditing && (
                <button
                  type="button"
                  onClick={
                    handleDelete
                  }
                  disabled={
                    saving ||
                    deleting
                  }
                  className="
                    w-full sm:w-auto
                    px-4 py-2.5
                    rounded-lg
                    text-sm
                    font-medium
                    text-red-400
                    border border-red-900
                    bg-red-950/30
                    hover:bg-red-900/50
                    hover:text-red-300
                    transition
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  <Trash2
                    size={16}
                  />

                  {deleting
                    ? 'Excluindo...'
                    : 'Excluir plantel'}
                </button>
              )}

            </div>

            {/* DIREITA */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                gap-2
                sm:ml-auto
              "
            >

              <button
                type="button"
                onClick={
                  handleClose
                }
                disabled={
                  saving ||
                  deleting
                }
                className="
                  px-4 py-2.5
                  rounded-lg
                  text-sm
                  text-gray-300
                  hover:bg-graphite-800
                  transition
                  disabled:opacity-50
                "
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  deleting ||
                  !name.trim()
                }
                className="
                  px-4 py-2.5
                  rounded-lg
                  text-sm
                  font-medium
                  bg-pitch-600
                  text-white
                  hover:bg-pitch-500
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                "
              >

                {isEditing ? (
                  <Save
                    size={16}
                  />
                ) : (
                  <Plus
                    size={16}
                  />
                )}

                {saving
                  ? 'Salvando...'
                  : isEditing
                  ? 'Salvar alterações'
                  : 'Criar plantel'}

              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  )
}