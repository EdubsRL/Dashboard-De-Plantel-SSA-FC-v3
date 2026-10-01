import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { PlayersProvider } from './context/PlayersContext'
import { PlantelsProvider } from './context/PlantelsContext'
import { LineupsProvider } from './context/LineupsContext'
import Toaster from './components/feedback/Toaster'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PlantelsProvider>
        <PlayersProvider>
          <LineupsProvider>
            <App />
            <Toaster />
          </LineupsProvider>
        </PlayersProvider>
      </PlantelsProvider>
    </BrowserRouter>
  </React.StrictMode>
)
