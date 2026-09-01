import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const PlantelsContext = createContext(null)

export function PlantelsProvider({ children }) {
  const [plantels, setPlantels] = useState([])
  const [selectedPlantel, setSelectedPlantel] = useState(null)
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
        setError(err.message)
        setPlantels([])
      } else {
        setPlantels(data || [])

        setSelectedPlantel((current) => {
          if (current && data?.some((p) => p.id === current.id)) {
            return data.find((p) => p.id === current.id)
          }

          return data?.[0] || null
        })
      }
    } catch (e) {
      setError(e.message || 'Erro de conexão')
      setPlantels([])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPlantels()
  }, [fetchPlantels])

  const createPlantel = async (payload) => {
    const { data, error: err } = await supabase
      .from('plantels')
      .insert([payload])
      .select()
      .single()

    if (err) throw err

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

    if (err) throw err

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

    if (err) throw err

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