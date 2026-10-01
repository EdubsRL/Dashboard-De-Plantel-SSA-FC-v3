import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'

// Carregamento sob demanda: cada página (e bibliotecas pesadas como
// gráficos, Excel e PDF) só é baixada quando o usuário acessa.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Plantel = lazy(() => import('./pages/Plantel'))
const Escalacao = lazy(() => import('./pages/Escalacao'))
const Profundidade = lazy(() => import('./pages/Profundidade'))
const Relatorios = lazy(() => import('./pages/Relatorios'))

export default function App() {
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
