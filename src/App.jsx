import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Plantel from './pages/Plantel'
import Escalacao from './pages/Escalacao'
import Profundidade from './pages/Profundidade'
import Relatorios from './pages/Relatorios'

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
