import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Tienda from './pages/Tienda'
import Carrito from './pages/Carrito'
import Catalogo from './pages/Catalogo'
import Monedero from './pages/Monedero'
import Soporte from './pages/Soporte'
import Ventas from './pages/Ventas'
import Perfil from './pages/Perfil'
import Acceder from './pages/Acceder'
import NoEncontrado from './pages/NoEncontrado'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tienda" element={<Tienda />} />
          <Route path="carrito" element={<Carrito />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="monedero" element={<Monedero />} />
          <Route path="soporte" element={<Soporte />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="acceder" element={<Acceder />} />
          <Route path="*" element={<NoEncontrado />} />
        </Route>
      </Routes>
    </>
  )
}
