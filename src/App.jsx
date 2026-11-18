import { lazy, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'

// Carregamento sob demanda: cada página (e bibliotecas pesadas como
// gráficos, Excel e PDF) só é baixada quando o usuário acessa.
const pages = {
  dashboard: () => import('./pages/Dashboard'),
  plantel: () => import('./pages/Plantel'),
  escalacao: () => import('./pages/Escalacao'),
  profundidade: () => import('./pages/Profundidade'),
  relatorios: () => import('./pages/Relatorios'),
}

const Dashboard = lazy(pages.dashboard)
const Plantel = lazy(pages.plantel)
const Escalacao = lazy(pages.escalacao)
const Profundidade = lazy(pages.profundidade)
const Relatorios = lazy(pages.relatorios)

// Depois que a primeira tela aparece, baixa as outras em segundo plano
// (quando o navegador está ocioso). Assim a troca de página é instantânea.
function usePrefetchPages() {
  useEffect(() => {
    const conn = navigator.connection
    if (conn?.saveData || /2g/.test(conn?.effectiveType || '')) return
    const run = () => Object.values(pages).forEach((load) => load().catch(() => {}))
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 2000))
    const id = idle(run, { timeout: 5000 })
    return () => (window.cancelIdleCallback || clearTimeout)(id)
  }, [])
}

export default function App() {
  usePrefetchPages()

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="plantel" element={<Plantel />} />
        <Route path="escalacao" element={<Escalacao />} />
        <Route path="profundidade" element={<Profundidade />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
