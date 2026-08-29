import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mxn } from '../data/catalog'
import { useStore } from '../lib/store'
import { Empty, Reveal, StatTile, useToast } from '../components/ui'
import { IconCart, IconUser } from '../components/Icons'

export default function Perfil() {
  const { user, updateProfile, logout, orders, balance, tickets, reset } = useStore()
  const { show, node } = useToast()
  const nav = useNavigate()
  const [form, setForm] = useState(user)

  if (!user || !form) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <Empty
          icon={<IconUser className="h-6 w-6" />}
          title="Inicia sesión para ver tu perfil"
          sub="Desde tu cuenta puedes editar tus datos, revisar pedidos y consultar tu monedero."
          action={
            <Link to="/acceder" className="btn-primary">
              Acceder
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-12 pb-24">
      {node}
      <Reveal>
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-ink-faint">
          <Link to="/" className="link-quiet">
            🏠 Dashboard
          </Link>
          <span>—</span>
          <span className="text-ink-soft">Mi perfil</span>
        </nav>
        <h1 className="mt-4 text-[clamp(2.2rem,5.5vw,3.6rem)] text-ink">
          Mi <span className="text-gradient-ruby">perfil</span>
        </h1>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <StatTile label="Saldo del monedero" value={mxn(balance)} sub="Disponible para tus compras" />
          <StatTile label="Pedidos" value={orders.length} tone="gold" sub="Historial de compras" />
          <StatTile
            label="Tickets abiertos"
            value={tickets.filter((t) => t.status !== 'Solucionado').length}
            tone="plain"
            sub={`${tickets.length} en total`}
          />
        </div>
      </Reveal>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <Reveal delay={130}>
          <section className="card p-6 sm:p-8">
            <h2 className="flex items-center gap-2.5 text-xl text-ink">
              <IconUser className="h-5 w-5 text-wine" /> Detalles de la cuenta
            </h2>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!form.firstName.trim() || !form.displayName.trim()) {
                  show('Nombre y nombre visible son obligatorios.', 'bad')
                  return
                }
                updateProfile(form)
                show('Datos actualizados')
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="pf-first">
                    Nombre <span className="text-magenta">*</span>
                  </label>
                  <input
                    id="pf-first"
                    className="field"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="pf-last">
                    Apellidos <span className="text-magenta">*</span>
                  </label>
                  <input
                    id="pf-last"
                    className="field"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="pf-display">
                  Nombre visible <span className="text-magenta">*</span>
                </label>
                <input
                  id="pf-display"
                  className="field"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                />
                <p className="mt-1.5 text-[0.72rem] text-ink-faint">
                  Así será como se mostrará tu nombre en la sección de tu cuenta y en las
                  valoraciones.
                </p>
              </div>

              <div>
                <label className="label" htmlFor="pf-email">
                  Dirección de correo electrónico <span className="text-magenta">*</span>
                </label>
                <input
                  id="pf-email"
                  type="email"
                  className="field"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="label" htmlFor="pf-phone">
                  Teléfono / WhatsApp
                </label>
                <input
                  id="pf-phone"
                  className="field"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <button type="submit" className="btn-primary">
                  Guardar cambios
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    logout()
                    nav('/')
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </form>

            <div className="mt-8 border-t border-line pt-5">
              <p className="text-[0.72rem] leading-relaxed text-ink-faint">
                Tu cuenta actual tiene el rol{' '}
                <strong className="text-ink-soft capitalize">{user.role}</strong>. Los datos se
                guardan en este navegador.
              </p>
              <button
                type="button"
                className="mt-3 text-[0.75rem] font-semibold text-bad hover:underline"
                onClick={() => {
                  reset()
                  nav('/')
                }}
              >
                Borrar todos mis datos de este dispositivo
              </button>
            </div>
          </section>
        </Reveal>

        <Reveal delay={180}>
          <section className="card p-6 sm:p-8">
            <h2 className="text-xl text-ink">Mis pedidos</h2>
            {orders.length === 0 ? (
              <div className="mt-5">
                <Empty
                  icon={<IconCart className="h-6 w-6" />}
                  title="Sin pedidos todavía"
                  sub="Cuando compres algo, aquí verás el detalle y el estado de cada pedido."
                  action={
                    <Link to="/tienda" className="btn-soft">
                      Ir a la tienda
                    </Link>
                  }
                />
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {orders.map((o) => (
                  <li key={o.id} className="rounded-2xl bg-cream/60 p-4 ring-1 ring-line">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[0.8rem] font-semibold text-wine">{o.id}</span>
                      <span className="rounded-full bg-warn/10 px-2.5 py-0.5 text-[0.68rem] font-semibold text-warn">
                        {o.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-faint">
                      {new Date(o.date).toLocaleString('es-MX', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-ink-soft">
                      {o.items.map((it, i) => (
                        <li key={i}>
                          <div className="flex justify-between gap-3">
                            <span className="truncate">
                              {it.qty} × {it.name}
                            </span>
                            <span className="shrink-0 tabular-nums">
                              {it.quote ? 'Por cotizar' : mxn(it.price * it.qty)}
                            </span>
                          </div>
                          {it.quote && it.answers && (
                            <p className="mt-0.5 text-[0.72rem] text-ink-faint">
                              {Object.values(it.answers)
                                .filter((v) => v.trim())
                                .join(' · ')}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 flex justify-between border-t border-line pt-3 font-semibold text-ink">
                      <span>Total</span>
                      <span className="font-display text-wine tabular-nums">{mxn(o.total)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Reveal>
      </div>
    </div>
  )
}
