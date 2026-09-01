import { POSITIONS } from '../constants/positions'

export function buildDepthChart(players) {
  const map = {}
  POSITIONS.forEach((pos) => {
    map[pos] = []
  })
  ;(players || []).forEach((p) => {
    if (map[p.primary_position]) {
      map[p.primary_position].push({ ...p, role: 'principal' })
    }
    ;(p.secondary_positions || []).forEach((sp) => {
      if (map[sp] && !map[sp].some((x) => x.id === p.id)) {
        map[sp].push({ ...p, role: 'secundária' })
      }
    })
  })
  const statusOrder = { 'No clube': 0, 'Em avaliação': 1, Lesionado: 2 }
  Object.keys(map).forEach((pos) => {
    map[pos].sort((a, b) => {
      const s = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
      if (s !== 0) return s
      return a.technical_rating.localeCompare(b.technical_rating)
    })
  })
  return map
}

export function positionsWithLowDepth(depth, min = 2) {
  return Object.entries(depth)
    .filter(([, list]) => list.length < min)
    .map(([pos, list]) => ({ position: pos, count: list.length }))
}
