import { useMemo, useState } from 'react'
import { products } from '../data/catalog'
import { company, waLink } from '../data/company'
import { useStore, type TicketStatus } from '../lib/store'
import { Empty, Reveal, useToast } from '../components/ui'
import { IconDoc, IconLife, IconSearch, IconWhatsApp } from '../components/Icons'

type Filter = 'Todos' | TicketStatus

const filtros: Filter[] = ['Todos', 'Pendiente', 'En revisión', 'Solucionado']

const statusStyle: Record<TicketStatus, string> = {
  Pendiente: 'bg-bad/10 text-bad',
  'En revisión': 'bg-warn/10 text-warn',
  Solucionado: 'bg-ok/10 text-ok',
}

const MAX_IMGS = 3

export default function Soporte() {
  const { tickets, createTicket, setTicketStatus, replyTicket, orders, user } = useStore()
  const { show, node } = useToast()
  const [filter, setFilter] = useState<Filter>('Todos')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [reply, setReply] = useState('')

  const [form, setForm] = useState({ product: '', subject: '', description: '' })
  const [images, setImages] = useState<string[]>([])

  const stats = {
    total: tickets.length,
    pendientes: tickets.filter((t) => t.status === 'Pendiente').length,
    revision: tickets.filter((t) => t.status === 'En revisión').length,
    solucionados: tickets.filter((t) => t.status === 'Solucionado').length,
  }

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return tickets.filter(
      (t) =>
        (filter === 'Todos' || t.status === filter) &&
        (term === '' ||
          t.subject.toLowerCase().includes(term) ||
          t.product.toLowerCase().includes(term) ||
          t.id.toLowerCase().includes(term)),
    )
  }, [tickets, filter, q])

  const onFiles = (files: FileList | null) => {
    if (!files) return
    const picked = Array.from(files).slice(0, MAX_IMGS - images.length)
    if (picked.length < files.length) show(`Máximo ${MAX_IMGS} imágenes por ticket.`, 'bad')
    picked.forEach((f) => {
      // Se guardan como data URL para que el ticket sobreviva a recargas de la página.
      const r = new FileReader()
      r.onload = () => setImages((prev) => [...prev, String(r.result)].slice(0, MAX_IMGS))
      r.readAsDataURL(f)
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-12 pb-24">
      {node}
      <Reveal>
        <span className="eyebrow bg-blush/20 text-wine ring-1 ring-blush/40">Soporte</span>
        <h1 className="mt-4 text-[clamp(2.2rem,5.5vw,3.6rem)] text-ink">
          Centro de <span className="text-gradient-ruby">soporte</span>
        </h1>
        <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-ink-soft">
          Reporta problemas, consulta respuestas y realiza seguimiento de tus solicitudes.
        </p>
      </Reveal>

      {/* Panel de estado */}
      <Reveal delay={80}>
        <div className="grain relative mt-10 overflow-hidden rounded-card bg-gradient-to-br from-wine via-[#8a2a24] to-rose p-6 text-cream sm:p-8">
          <div
            className="pointer-events-none absolute -top-20 -right-10 h-72 w-72 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle,#fb0b77 0%,transparent 70%)' }}
          />
          <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Total tickets', stats.total, 'Tickets creados', '🎫'],
              ['Pendientes', stats.pendientes, 'Esperando atención', '🔴'],
              ['En revisión', stats.revision, 'En proceso', '🟠'],
              ['Solucionados', stats.solucionados, 'Cerrados', '🟢'],
            ].map(([label, value, sub, emoji]) => (
              <div
                key={String(label)}
                className="rounded-2xl bg-cream/10 p-4 ring-1 ring-cream/15 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between">
                  <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-cream/70 uppercase">
                    {label}
                  </p>
                  <span aria-hidden>{emoji}</span>
                </div>
                <p className="mt-3 font-display text-3xl leading-none font-semibold">{value}</p>
                <p className="mt-1.5 text-[0.72rem] text-cream/60">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.35fr] lg:items-start">
        {/* Nuevo reporte */}
        <Reveal delay={130}>
          <section className="card p-6">
            <h2 className="text-xl text-ink">Nuevo reporte</h2>
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!form.product || !form.subject.trim() || !form.description.trim()) {
                  show('Completa producto, asunto y descripción.', 'bad')
                  return
                }
                const id = createTicket({ ...form, images })
                setForm({ product: '', subject: '', description: '' })
                setImages([])
                show(`Ticket ${id} creado`)
                setOpen(id)
              }}
            >
              <div>
                <label className="label" htmlFor="tk-product">
                  Producto o pedido
                </label>
                <select
                  id="tk-product"
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  className="field"
                >
                  <option value="">Selecciona una opción…</option>
                  {orders.length > 0 && (
                    <optgroup label="Mis pedidos">
                      {orders.map((o) => (
                        <option key={o.id} value={`Pedido ${o.id}`}>
                          Pedido {o.id}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Productos y servicios">
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                  <option value="Otro asunto">Otro asunto</option>
                </select>
              </div>

              <div>
                <label className="label" htmlFor="tk-subject">
                  Asunto
                </label>
                <input
                  id="tk-subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Resume tu solicitud"
                  className="field"
                />
              </div>

              <div>
                <label className="label" htmlFor="tk-desc">
                  Descripción detallada
                </label>
                <textarea
                  id="tk-desc"
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Cuéntanos qué pasó, con el mayor detalle posible."
                  className="field resize-y"
                />
              </div>

              <div>
                <span className="label">Adjuntar imágenes (máximo {MAX_IMGS})</span>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-blush/60 bg-cream/50 px-4 py-3.5 text-sm text-ink-soft transition-colors hover:bg-cream">
                  <span>{images.length > 0 ? `${images.length} archivo(s)` : 'Elegir archivos'}</span>
                  <span className="btn-soft !px-4 !py-1.5 !text-[0.75rem]">Examinar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      onFiles(e.target.files)
                      e.target.value = ''
                    }}
                  />
                </label>
                {images.length > 0 && (
                  <ul className="mt-3 flex gap-2">
                    {images.map((src, i) => (
                      <li key={i} className="relative">
                        <img
                          src={src}
                          alt={`Adjunto ${i + 1}`}
                          className="h-16 w-16 rounded-xl object-cover ring-1 ring-line"
                        />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-bad text-[0.7rem] text-white"
                          aria-label={`Quitar adjunto ${i + 1}`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button type="submit" className="btn-primary w-full">
                🚀 Crear ticket
              </button>
            </form>

            <a
              href={waLink('Hola, necesito ayuda con mi pedido de Rubby Corp.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost mt-3 w-full"
            >
              <IconWhatsApp className="h-4 w-4" /> Atención directa · {company.whatsappDisplay}
            </a>
          </section>
        </Reveal>

        {/* Mis tickets */}
        <Reveal delay={190}>
          <section className="card overflow-hidden">
            <div className="flex flex-wrap gap-3 border-b border-line p-4">
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                {filtros.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`chip !px-3.5 !py-2 !text-[0.75rem] ${filter === f ? 'chip-on' : 'chip-off'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <label className="relative min-w-[10rem] flex-1">
                <IconSearch className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar ticket, producto, pedido o asunto…"
                  className="field !py-2.5 !pl-10 !text-[0.85rem]"
                  aria-label="Buscar ticket"
                />
              </label>
            </div>

            {list.length === 0 ? (
              <div className="p-6">
                <Empty
                  icon={<IconLife className="h-6 w-6" />}
                  title={tickets.length === 0 ? 'Aún no tienes tickets' : 'Sin coincidencias'}
                  sub={
                    tickets.length === 0
                      ? 'Cuando reportes un problema aparecerá aquí con su estado y seguimiento.'
                      : 'Prueba con otro filtro o término de búsqueda.'
                  }
                />
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {list.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setOpen(open === t.id ? null : t.id)}
                      className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-cream/40"
                      aria-expanded={open === t.id}
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream text-wine ring-1 ring-line">
                        <IconDoc className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-ink">{t.subject}</span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold ${statusStyle[t.status]}`}
                          >
                            {t.status}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-xs text-ink-faint">
                          {t.product} · {t.id} ·{' '}
                          {new Date(t.date).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </span>
                      <span className="text-ink-faint">{open === t.id ? '▴' : '▾'}</span>
                    </button>

                    {open === t.id && (
                      <div className="border-t border-line bg-cream/30 px-5 py-5">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
                          {t.description}
                        </p>

                        {t.images.length > 0 && (
                          <ul className="mt-4 flex flex-wrap gap-2">
                            {t.images.map((src, i) => (
                              <li key={i}>
                                <img
                                  src={src}
                                  alt={`Evidencia ${i + 1} del ticket ${t.id}`}
                                  className="h-24 w-24 rounded-xl object-cover ring-1 ring-line"
                                />
                              </li>
                            ))}
                          </ul>
                        )}

                        {t.replies.length > 0 && (
                          <ul className="mt-5 space-y-2.5">
                            {t.replies.map((r, i) => (
                              <li
                                key={i}
                                className="rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-line"
                              >
                                <span className="block text-[0.7rem] font-semibold text-ink-faint">
                                  {r.from} ·{' '}
                                  {new Date(r.date).toLocaleString('es-MX', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span className="mt-1 block text-ink-soft">{r.text}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <form
                          className="mt-4 flex gap-2"
                          onSubmit={(e) => {
                            e.preventDefault()
                            if (!reply.trim()) return
                            replyTicket(t.id, reply.trim())
                            setReply('')
                            show('Respuesta enviada')
                          }}
                        >
                          <input
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Agregar un comentario…"
                            className="field !py-2.5 !text-[0.85rem]"
                            aria-label="Agregar comentario al ticket"
                          />
                          <button type="submit" className="btn-soft shrink-0 !px-5 !py-2.5 !text-[0.8rem]">
                            Enviar
                          </button>
                        </form>

                        {user?.role === 'asesor' && (
                          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                            <span className="text-[0.7rem] font-semibold tracking-wide text-ink-faint uppercase">
                              Asesor · cambiar estado
                            </span>
                            {(['Pendiente', 'En revisión', 'Solucionado'] as TicketStatus[]).map(
                              (s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setTicketStatus(t.id, s)}
                                  className={`chip !px-3 !py-1.5 !text-[0.72rem] ${t.status === s ? 'chip-on' : 'chip-off'}`}
                                >
                                  {s}
                                </button>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}
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
