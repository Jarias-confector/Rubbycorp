import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { mxn } from '../data/catalog'
import { company, waLink } from '../data/company'
import { useStore } from '../lib/store'
import { Copyable, Empty, Reveal, StatTile, useToast } from '../components/ui'
import { IconBank, IconSearch, IconWallet, IconWhatsApp } from '../components/Icons'

type Filter = 'todos' | 'recarga' | 'compra' | 'ajuste'

const rangos = [
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
  { label: 'Todo', days: 0 },
]

export default function Monedero() {
  const { balance, movements, user, addFunds } = useStore()
  const { show, node } = useToast()
  const [filter, setFilter] = useState<Filter>('todos')
  const [q, setQ] = useState('')
  const [range, setRange] = useState(30)
  const [manual, setManual] = useState('')

  const totalRecargas = movements.filter((m) => m.amount > 0).reduce((s, m) => s + m.amount, 0)
  const totalCompras = movements.filter((m) => m.amount < 0).reduce((s, m) => s - m.amount, 0)

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    const cutoff = range > 0 ? Date.now() - range * 86_400_000 : 0
    return movements.filter(
      (m) =>
        (filter === 'todos' || m.kind === filter) &&
        (term === '' || m.concept.toLowerCase().includes(term)) &&
        (cutoff === 0 || new Date(m.date).getTime() >= cutoff),
    )
  }, [movements, filter, q, range])

  return (
    <div className="mx-auto max-w-6xl px-6 pt-12 pb-24">
      {node}
      <Reveal>
        <span className="eyebrow bg-blush/20 text-wine ring-1 ring-blush/40">Monedero</span>
        <h1 className="mt-4 text-[clamp(2.2rem,5.5vw,3.6rem)] text-ink">
          Tu <span className="text-gradient-ruby">saldo disponible</span>
        </h1>
        <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-ink-soft">
          {user ? `Hola ${user.displayName}, este es tu saldo disponible.` : 'Inicia sesión para ver el saldo asociado a tu cuenta.'}
        </p>
      </Reveal>

      {/* Saldo */}
      <Reveal delay={80}>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <StatTile label="Saldo disponible" value={mxn(balance)} sub="Se usa al pagar tus pedidos" />
          <StatTile label="Total recargado" value={mxn(totalRecargas)} tone="gold" sub={`${movements.filter((m) => m.amount > 0).length} recargas`} />
          <StatTile label="Total gastado" value={mxn(totalCompras)} tone="plain" sub={`${movements.filter((m) => m.amount < 0).length} compras`} />
        </div>
      </Reveal>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.35fr] lg:items-start">
        {/* Recargas */}
        <Reveal delay={120}>
          <div className="space-y-4">
            <section className="card p-6">
              <h2 className="flex items-center gap-2.5 text-xl text-ink">
                <IconBank className="h-5 w-5 text-wine" /> Datos para recargar
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Transfiere a la siguiente cuenta y envía tu comprobante por WhatsApp. Toca cualquier
                dato para copiarlo.
              </p>
              <div className="mt-5 space-y-2">
                <Copyable label="Banco" value={company.bank.bank} />
                <Copyable label="Titular" value={company.bank.holder} />
                <Copyable label="CLABE interbancaria" value={company.bank.clabe} />
                <Copyable label="Número de cuenta" value={company.bank.account} />
                <Copyable label="Tarjeta" value={company.bank.card} />
              </div>
              <p className="mt-4 rounded-2xl bg-cream/70 px-4 py-3 text-xs leading-relaxed text-ink-soft ring-1 ring-line">
                <strong className="text-ink">Concepto:</strong> {company.bank.concept}. Así podemos
                identificar tu depósito y abonarlo más rápido.
              </p>
            </section>

            <section className="grain relative overflow-hidden rounded-card bg-gradient-to-br from-[#128c43] to-[#1fac52] p-6 text-white">
              <h2 className="relative flex items-center gap-2.5 text-xl">
                <IconWhatsApp className="h-5 w-5" /> Recarga con un asesor
              </h2>
              <p className="relative mt-2 text-sm leading-relaxed text-white/85">
                Escríbenos al <strong>{company.whatsappDisplay}</strong> y un asesor agrega el saldo
                a tu monedero manualmente.
              </p>
              <a
                href={waLink(
                  `Hola, soy ${user?.displayName ?? 'cliente'} (${user?.email ?? 'sin cuenta'}). Quiero solicitar una recarga a mi monedero de Rubby Corp.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="relative btn mt-5 w-full bg-white text-[#128c43] hover:bg-white/90"
              >
                Solicitar recarga por WhatsApp
              </a>
            </section>

            {/* Panel del asesor: abono manual al monedero del usuario */}
            {user?.role === 'asesor' && (
              <section className="card border-2 border-dashed border-gold/40 p-6">
                <span className="eyebrow bg-gold/10 text-gold ring-1 ring-gold/30">
                  Panel de asesor
                </span>
                <h2 className="mt-4 text-xl text-ink">Abonar saldo manualmente</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Registra el depósito confirmado del cliente. Queda asentado en Movimientos.
                </p>
                <form
                  className="mt-5 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const amount = Number(manual)
                    if (!Number.isFinite(amount) || amount <= 0) {
                      show('Ingresa un monto válido.', 'bad')
                      return
                    }
                    addFunds(amount, 'Ajuste manual administrador', 'ajuste')
                    setManual('')
                    show(`Se abonaron ${mxn(amount)} al monedero`)
                  }}
                >
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    inputMode="decimal"
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    placeholder="Monto en MXN"
                    className="field"
                    aria-label="Monto a abonar"
                  />
                  <button type="submit" className="btn-gold shrink-0">
                    Abonar
                  </button>
                </form>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[100, 200, 500, 1000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setManual(String(v))}
                      className="chip chip-off"
                    >
                      {mxn(v)}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </Reveal>

        {/* Movimientos */}
        <Reveal delay={180}>
          <section className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-6">
              <h2 className="text-xl text-ink">Movimientos</h2>
              <div className="flex gap-1.5">
                {rangos.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setRange(r.days)}
                    className={`chip !px-3 !py-1.5 !text-[0.72rem] ${range === r.days ? 'chip-on' : 'chip-off'}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-b border-line p-4">
              <label className="relative min-w-[10rem] flex-1">
                <IconSearch className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar…"
                  className="field !py-2.5 !pl-10 !text-[0.85rem]"
                  aria-label="Buscar movimiento"
                />
              </label>
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                {(['todos', 'recarga', 'compra', 'ajuste'] as Filter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`chip !px-3.5 !py-2 !text-[0.75rem] capitalize ${filter === f ? 'chip-on' : 'chip-off'}`}
                  >
                    {f === 'todos' ? 'Todos' : `${f}s`}
                  </button>
                ))}
              </div>
            </div>

            {list.length === 0 ? (
              <div className="p-6">
                <Empty
                  icon={<IconWallet className="h-6 w-6" />}
                  title="Sin movimientos"
                  sub="Aquí aparecerán tus recargas y compras con fecha, concepto y monto."
                  action={
                    <Link to="/tienda" className="btn-soft">
                      Ir a la tienda
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[30rem] text-sm">
                  <thead>
                    <tr className="bg-ink text-cream">
                      <th className="px-5 py-3 text-left text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                        Fecha
                      </th>
                      <th className="px-5 py-3 text-left text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                        Concepto
                      </th>
                      <th className="px-5 py-3 text-right text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((m) => (
                      <tr key={m.id} className="border-b border-line last:border-0">
                        <td className="px-5 py-4 whitespace-nowrap text-ink-faint tabular-nums">
                          {new Date(m.date).toLocaleString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-5 py-4 text-ink">
                          {m.concept}
                          <span className="ml-2 rounded-full bg-cream px-2 py-0.5 text-[0.65rem] font-semibold text-ink-faint capitalize">
                            {m.kind}
                          </span>
                        </td>
                        <td
                          className={`px-5 py-4 text-right font-semibold whitespace-nowrap tabular-nums ${
                            m.amount >= 0 ? 'text-ok' : 'text-bad'
                          }`}
                        >
                          {m.amount >= 0 ? '+' : '−'} {mxn(Math.abs(m.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </Reveal>
      </div>
    </div>
  )
}
