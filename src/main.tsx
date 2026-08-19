import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import App from './App'
import './index.css'

// Hosts estáticos sin reescritura de rutas (o una vista previa de un solo
// archivo) pueden compilar con VITE_HASH_ROUTER=1 y usar rutas con #.
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router basename={import.meta.env.VITE_HASH_ROUTER ? undefined : import.meta.env.BASE_URL}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </Router>
  </StrictMode>,
)
