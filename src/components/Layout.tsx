import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../lib/store'
import { company, waLink } from '../data/company'
import {
  IconCart,
  IconClose,
  IconGem,
  IconLife,
  IconMenu,
  IconStore,
  IconTag,
  IconUser,
  IconWallet,
  IconWhatsApp,
} from './Icons'

const nav = [
  { to: '/tienda', label: 'Tienda', icon: IconStore },
  { to: '/catalogo', label: 'Catálogo', icon: IconTag },
  { to: '/monedero', label: 'Monedero', icon: IconWallet },
  { to: '/soporte', label: 'Soporte', icon: IconLife },
  { to: '/perfil', label: 'Mi perfil', icon: IconUser },
]

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Rubby Corp, inicio">
      <img
        src={`${import.meta.env.BASE_URL}brand/rubby-mark.png`}
        alt=""
        className="h-9 w-9 object-contain transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:rotate-3"
      />
      {!compact && (
        <span className="font-display text-[1.15rem] leading-none font-semibold tracking-tight text-ink">
          Rubby<span className="text-gradient-gold"> Corp</span>
        </span>
      )}
    </Link>
  )
}

export default function Layout() {
  const { cartCount, user, openTickets } = useStore()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Isla flotante, despegada del borde superior */}
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
        <nav className="mx-auto flex w-full max-w-6xl items-center gap-2 rounded-full border border-white/60 bg-white/80 py-2 pr-2 pl-4 shadow-[0_18px_44px_-30px_rgba(103,25,21,0.5)] backdrop-blur-xl sm:pl-5">
          <Brand />

          <div className="mx-auto hidden items-center gap-0.5 lg:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `relative rounded-full px-4 py-2 text-[0.86rem] font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isActive ? 'bg-wine text-cream' : 'text-ink-soft hover:bg-cream hover:text-wine'
                  }`
                }
              >
                {n.label}
                {n.to === '/soporte' && openTickets > 0 && (
                  <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-magenta" />
                )}
              </NavLink>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link
              to="/carrito"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-cream text-wine ring-1 ring-line transition-all duration-500 hover:ring-blush"
              aria-label={`Carrito, ${cartCount} artículos`}
            >
              <IconCart className="h-[1.15rem] w-[1.15rem]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-magenta px-1 text-[0.65rem] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                to="/perfil"
                className="hidden h-10 items-center gap-2 rounded-full bg-wine pr-4 pl-1.5 text-cream sm:flex"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream/15 text-[0.7rem] font-bold">
                  {user.displayName.slice(0, 2).toUpperCase()}
                </span>
                <span className="max-w-[9rem] truncate text-[0.82rem] font-semibold">
                  {user.firstName}
                </span>
              </Link>
            ) : (
              <Link to="/acceder" className="btn-primary hidden !py-2.5 !text-[0.82rem] sm:inline-flex">
                Acceder
              </Link>
            )}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-wine ring-1 ring-line lg:hidden"
              aria-expanded={open}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            >
              {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Overlay de navegación móvil con revelado escalonado */}
      {open && (
        <div className="fixed inset-0 z-40 bg-canvas/90 px-6 pt-28 pb-10 backdrop-blur-2xl lg:hidden">
          <ul className="flex flex-col gap-1.5">
            {nav.map((n, i) => (
              <li
                key={n.to}
                className="reveal-in"
                style={{ transitionDelay: `${60 + i * 55}ms` }}
              >
                <NavLink
                  to={n.to}
                  className={({ isActive }) =>
                    `flex items-center gap-4 rounded-2xl px-4 py-4 text-lg transition-colors ${
                      isActive ? 'bg-wine text-cream' : 'bg-white text-ink ring-1 ring-line'
                    }`
                  }
                >
                  <n.icon className="h-5 w-5" />
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-2.5">
            {user ? (
              <Link to="/perfil" className="btn-primary w-full">
                Mi cuenta · {user.firstName}
              </Link>
            ) : (
              <>
                <Link to="/acceder" className="btn-primary w-full">
                  Iniciar sesión
                </Link>
                <Link to="/acceder?tab=registro" className="btn-ghost w-full">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      <a
        href={waLink('¡Hola Rubby Corp! Me gustaría recibir información.')}
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1fac52] text-white shadow-[0_16px_36px_-14px_rgba(31,172,82,0.8)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
        aria-label={`Escríbenos por WhatsApp al ${company.whatsappDisplay}`}
      >
        <IconWhatsApp className="h-7 w-7" />
        <span className="pointer-events-none absolute right-full mr-3 hidden rounded-full bg-ink px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:block">
          WhatsApp {company.whatsappDisplay}
        </span>
      </a>
    </div>
  )
}

function Footer() {
  return (
    <footer className="grain relative mt-24 overflow-hidden bg-wine text-cream">
      <div
        className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #fb0b77 0%, transparent 70%)' }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}brand/rubby-mark.png`}
              alt=""
              className="h-11 w-11 object-contain"
            />
            <span className="font-display text-2xl font-semibold">Rubby Corp</span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">
            Desde {company.since}, una empresa digital que trabaja para ofrecerte productos y
            servicios a precios justos, con descuentos y promociones todos los días del año.
          </p>
          <p className="mt-5 flex items-center gap-2 text-sm text-cream/70">
            <IconGem className="h-4 w-4 text-blush" />
            {company.tagline}
          </p>
        </div>

        <div>
          <h3 className="text-[0.7rem] font-semibold tracking-[0.2em] text-blush uppercase">
            Secciones
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="text-cream/70 transition-colors hover:text-cream">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[0.7rem] font-semibold tracking-[0.2em] text-blush uppercase">
            Contacto
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm text-cream/70">
            <li>
              <a
                href={waLink('¡Hola! Necesito ayuda.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-cream"
              >
                <IconWhatsApp className="h-4 w-4" /> {company.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className="transition-colors hover:text-cream">
                {company.email}
              </a>
            </li>
            <li className="pt-2 text-cream/50">Atención en línea, todos los días.</li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-cream/10 px-6 py-6">
        <p className="mx-auto max-w-6xl text-xs text-cream/50">
          © {new Date().getFullYear()} Rubby Corp. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
