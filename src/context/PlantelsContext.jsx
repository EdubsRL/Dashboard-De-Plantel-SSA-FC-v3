import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, friendlyError } from '../lib/supabase'

const STORAGE_KEY = 'ssafc:selectedPlantelId'

function readSavedId() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

const PlantelsContext = createContext(null)

export function PlantelsProvider({ children }) {
  const [plantels, setPlantels] = useState([])
  const [selectedPlantel, setSelectedPlantelState] = useState(null)

  // Lembra o último plantel escolhido entre visitas.
  const setSelectedPlantel = useCallback((value) => {
    setSelectedPlantelState((current) => {
      const next = typeof value === 'function' ? value(current) : value
      try {
        if (next?.id) localStorage.setItem(STORAGE_KEY, next.id)
        else localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* armazenamento indisponível: ignora */
      }
      return next
    })
  }, [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlantels = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('plantels')
        .select('*')
        .order('category')

      if (err) {
        setError(friendlyError(err))
      } else {
        setPlantels(data || [])

        setSelectedPlantel((current) => {
          if (current && data?.some((p) => p.id === current.id)) {
            return data.find((p) => p.id === current.id)
          }

          const savedId = readSavedId()
          return data?.find((p) => p.id === savedId) || data?.[0] || null
        })
      }
    } catch (e) {
      // Mantém os dados já carregados na tela; apenas sinaliza o erro.
      setError(friendlyError(e, 'Erro de conexão'))
    }

    setLoading(false)
  }, [setSelectedPlantel])

  useEffect(() => {
    fetchPlantels()
  }, [fetchPlantels])

  const createPlantel = async (payload) => {
    const { data, error: err } = await supabase
      .from('plantels')
      .insert([payload])
      .select()
      .single()

    if (err) throw new Error(friendlyError(err))

    setPlantels((prev) =>
      [...prev, data].sort((a, b) =>
        a.category.localeCompare(b.category)
      )
    )

    setSelectedPlantel(data)

    return data
  }

  const updatePlantel = async (id, payload) => {
    const { data, error: err } = await supabase
      .from('plantels')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (err) throw new Error(friendlyError(err))

    setPlantels((prev) =>
      prev.map((p) => (p.id === id ? data : p))
    )

    setSelectedPlantel((current) =>
      current?.id === id ? data : current
    )

    return data
  }

  const deletePlantel = async (id) => {
    const { error: err } = await supabase
      .from('plantels')
      .delete()
      .eq('id', id)

    if (err) throw new Error(friendlyError(err))

    setPlantels((prev) =>
      prev.filter((p) => p.id !== id)
    )

    setSelectedPlantel((current) =>
      current?.id === id ? null : current
    )
  }

  return (
    <PlantelsContext.Provider
      value={{
        plantels,
        selectedPlantel,
        setSelectedPlantel,
        loading,
        error,
        fetchPlantels,
        createPlantel,
        updatePlantel,
        deletePlantel,
      }}
    >
      {children}
    </PlantelsContext.Provider>
  )
}

export function usePlantels() {
  const ctx = useContext(PlantelsContext)

  if (!ctx) {
    throw new Error('usePlantels deve ser usado dentro de PlantelsProvider')
  }

  return ctx
}