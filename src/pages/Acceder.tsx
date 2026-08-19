import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { company } from '../data/company'
import { useStore } from '../lib/store'
import { Reveal, useToast } from '../components/ui'

export default function Acceder() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState<'login' | 'registro'>(
    params.get('tab') === 'registro' ? 'registro' : 'login',
  )
  const { login, register } = useStore()
  const { show, node } = useToast()
  const nav = useNavigate()

  const [li, setLi] = useState({ email: '', password: '' })
  const [rg, setRg] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    password: '',
  })

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-12 pb-24 lg:grid-cols-[1fr_1fr] lg:items-center">
      {node}

      <Reveal>
        <div className="max-w-md">
          <img
            src={`${import.meta.env.BASE_URL}brand/rubby-logo.png`}
            alt="Rubby Corp"
            className="w-32 drop-shadow-[0_20px_34px_rgba(103,25,21,0.22)]"
          />
          <h1 className="mt-8 text-[clamp(2rem,4.6vw,3rem)] text-ink">
            Tu cuenta <span className="text-gradient-ruby">Rubby Corp</span>
          </h1>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft">
            Con tu cuenta administras tu monedero, tus pedidos y tus tickets de soporte. Todo en un
            solo lugar.
          </p>
          <div className="mt-8 rounded-2xl bg-cream/70 px-5 py-4 text-sm ring-1 ring-line">
            <p className="font-semibold text-ink">Cuenta de demostración</p>
            <p className="mt-1.5 text-ink-soft">
              Correo:{' '}
              <code className="font-mono text-[0.8rem] text-wine">{company.email}</code>
              <br />
              Contraseña: <code className="font-mono text-[0.8rem] text-wine">rubby2017</code>
            </p>
            <p className="mt-2 text-[0.72rem] text-ink-faint">
              Tiene rol de asesor: puede abonar saldo y cambiar el estado de los tickets.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={110}>
        <div className="shell">
          <div className="shell-core p-6 sm:p-8">
            <div className="flex gap-1 rounded-full bg-cream p-1 ring-1 ring-line">
              {(['login', 'registro'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    tab === t ? 'bg-wine text-cream' : 'text-ink-soft hover:text-wine'
                  }`}
                >
                  {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </button>
              ))}
            </div>

            {tab === 'login' ? (
              <form
                className="mt-7 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const r = login(li.email, li.password)
                  if (r.ok) {
                    show('¡Bienvenido de vuelta!')
                    nav('/perfil')
                  } else show(r.error!, 'bad')
                }}
              >
                <div>
                  <label className="label" htmlFor="li-email">
                    Correo electrónico
                  </label>
                  <input
                    id="li-email"
                    type="email"
                    autoComplete="email"
                    className="field"
                    value={li.email}
                    onChange={(e) => setLi({ ...li, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="li-pass">
                    Contraseña
                  </label>
                  <input
                    id="li-pass"
                    type="password"
                    autoComplete="current-password"
                    className="field"
                    value={li.password}
                    onChange={(e) => setLi({ ...li, password: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Entrar
                </button>
                <button
                  type="button"
                  className="btn-soft w-full"
                  onClick={() => setLi({ email: company.email, password: 'rubby2017' })}
                >
                  Rellenar cuenta demo
                </button>
              </form>
            ) : (
              <form
                className="mt-7 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!rg.firstName.trim() || !rg.email.trim() || rg.password.length < 6) {
                    show('Completa nombre, correo y una contraseña de 6+ caracteres.', 'bad')
                    return
                  }
                  const r = register({
                    ...rg,
                    displayName: rg.displayName.trim() || `${rg.firstName} ${rg.lastName}`.trim(),
                  })
                  if (r.ok) {
                    show('¡Cuenta creada!')
                    nav('/perfil')
                  } else show(r.error!, 'bad')
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="rg-first">
                      Nombre <span className="text-magenta">*</span>
                    </label>
                    <input
                      id="rg-first"
                      className="field"
                      value={rg.firstName}
                      onChange={(e) => setRg({ ...rg, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="rg-last">
                      Apellidos
                    </label>
                    <input
                      id="rg-last"
                      className="field"
                      value={rg.lastName}
                      onChange={(e) => setRg({ ...rg, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="rg-display">
                    Nombre visible
                  </label>
                  <input
                    id="rg-display"
                    className="field"
                    placeholder="Cómo quieres que te veamos"
                    value={rg.displayName}
                    onChange={(e) => setRg({ ...rg, displayName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="rg-email">
                    Correo electrónico <span className="text-magenta">*</span>
                  </label>
                  <input
                    id="rg-email"
                    type="email"
                    autoComplete="email"
                    className="field"
                    value={rg.email}
                    onChange={(e) => setRg({ ...rg, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="rg-phone">
                    WhatsApp
                  </label>
                  <input
                    id="rg-phone"
                    className="field"
                    placeholder="998 000 0000"
                    value={rg.phone}
                    onChange={(e) => setRg({ ...rg, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="rg-pass">
                    Contraseña <span className="text-magenta">*</span>
                  </label>
                  <input
                    id="rg-pass"
                    type="password"
                    autoComplete="new-password"
                    className="field"
                    value={rg.password}
                    onChange={(e) => setRg({ ...rg, password: e.target.value })}
                  />
                  <p className="mt-1.5 text-[0.72rem] text-ink-faint">Mínimo 6 caracteres.</p>
                </div>
                <button type="submit" className="btn-primary w-full">
                  Crear mi cuenta
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-[0.72rem] leading-relaxed text-ink-faint">
              Las cuentas se guardan solo en este navegador.{' '}
              <Link to="/" className="text-magenta hover:underline">
                Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
