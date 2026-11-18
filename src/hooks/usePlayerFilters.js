import { useDeferredValue, useMemo, useState } from 'react'
import { POSITION_ORDER } from '../constants/positions'

// Comparador reutilizável (bem mais rápido que localeCompare em cada comparação).
const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' })

export function usePlayerFilters(players) {
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('')
  const [status, setStatus] = useState('')
  const [rating, setRating] = useState('')
  const [registered, setRegistered] = useState('')
  const [indicatedBy, setIndicatedBy] = useState('')
  const [sortBy, setSortBy] = useState('position')
  const [sortDir, setSortDir] = useState('asc')

  // A digitação na busca fica fluida mesmo com muitos atletas:
  // o filtro roda com prioridade menor que o campo de texto.
  const deferredSearch = useDeferredValue(search)
  const deferredIndicated = useDeferredValue(indicatedBy)

  const filtered = useMemo(() => {
    let list = [...(players || [])]
    if (deferredSearch.trim()) {
      const q = deferredSearch.trim().toLowerCase()
      list = list.filter((p) => String(p.name || '').toLowerCase().includes(q))
    }
    if (position) list = list.filter((p) => p.primary_position === position)
    if (status) list = list.filter((p) => p.status === status)
    if (rating) list = list.filter((p) => p.technical_rating === rating)
    if (registered) list = list.filter((p) => String(p.is_registered) === registered)
    if (deferredIndicated.trim()) {
      const q = deferredIndicated.trim().toLowerCase()
      list = list.filter((p) => (p.indicated_by || '').toLowerCase().includes(q))
    }

    list.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'name') cmp = collator.compare(a.name || '', b.name || '')
      else if (sortBy === 'birth_date') cmp = (a.birth_date || '').localeCompare(b.birth_date || '')
      else if (sortBy === 'position') {
        cmp = (POSITION_ORDER[a.primary_position] ?? 99) - (POSITION_ORDER[b.primary_position] ?? 99)
        if (cmp === 0) cmp = collator.compare(a.name || '', b.name || '')
      } else if (sortBy === 'rating') cmp = (a.technical_rating || '').localeCompare(b.technical_rating || '')
      else if (sortBy === 'status') cmp = (a.status || '').localeCompare(b.status || '')
      else if (sortBy === 'registered') cmp = Number(Boolean(b.is_registered)) - Number(Boolean(a.is_registered))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [players, deferredSearch, position, status, rating, registered, deferredIndicated, sortBy, sortDir])

  return {
    filtered, search, setSearch, position, setPosition, status, setStatus,
    rating, setRating, registered, setRegistered, indicatedBy, setIndicatedBy,
    sortBy, setSortBy, sortDir, setSortDir,
  }
}
