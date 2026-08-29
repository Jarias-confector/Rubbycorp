import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { departments, discountPct, mxn, products, type Product } from '../data/catalog'
import { useStore } from '../lib/store'
import { Empty, Reveal, useToast } from '../components/ui'
import { QuestionsEditor, QuoteForm } from '../components/Cotizador'
import { IconCart, IconCheck, IconSearch, IconStore } from '../components/Icons'

export default function Tienda() {
  const [params, setParams] = useSearchParams()
  const dept = params.get('dept') ?? 'todos'
  const [q, setQ] = useState('')
  const { addToCart, cart, user, questionsOf, setProductQuestions, resetProductQuestions } =
    useStore()
  const { show, node } = useToast()
  const [cotizando, setCotizando] = useState<Product | null>(null)
  const [editando, setEditando] = useState<Product | null>(null)
  const esAsesor = user?.role === 'asesor'

  const onAdd = (p: Product) => {
    if (p.quote) return setCotizando(p)
    addToCart(p.id)
    show(`${p.name} agregado al carrito`)
  }

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return products.filter(
      (p) =>
        (dept === 'todos' || p.dept === dept) &&
        (term === '' ||
          p.name.toLowerCase().includes(term) ||
          departments.find((d) => d.slug === p.dept)?.name.toLowerCase().includes(term)),
    )
  }, [dept, q])

  // Cuando no hay filtro, mostramos la tienda agrupada por departamento (como pide el brief).
  const grouped = dept === 'todos' && q.trim() === ''

  const setDept = (slug: string) => {
    if (slug === 'todos') params.delete('dept')
    else params.set('dept', slug)
    setParams(params, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-12 pb-24">
      {node}
      <Reveal>
        <span className="eyebrow bg-blush/20 text-wine ring-1 ring-blush/40">Tienda</span>
        <h1 className="mt-4 text-[clamp(2.2rem,5.5vw,3.6rem)] text-ink">
          Cada área, con sus <span className="text-gradient-ruby">productos y servicios</span>
        </h1>
        <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-ink-soft">
          Elige un departamento, agrega al carrito y paga con el saldo de tu monedero.
        </p>
      </Reveal>

      {/* Buscador + filtros por departamento */}
      <div className="sticky top-24 z-30 mt-10 -mx-2 rounded-3xl bg-canvas/85 px-2 py-3 backdrop-blur-lg">
        <label className="relative block">
          <IconSearch className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto, servicio o departamento…"
            className="field !py-3.5 !pl-11"
            aria-label="Buscar en la tienda"
          />
        </label>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setDept('todos')}
            className={`chip ${dept === 'todos' ? 'chip-on' : 'chip-off'}`}
          >
            Todos
          </button>
          {departments.map((d) => (
            <button
              key={d.slug}
              type="button"
              onClick={() => setDept(d.slug)}
              className={`chip ${dept === d.slug ? 'chip-on' : 'chip-off'}`}
            >
              <span aria-hidden>{d.emoji}</span> {d.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {list.length === 0 ? (
          <Empty
            icon={<IconStore className="h-6 w-6" />}
            title="Sin resultados"
            sub="No encontramos productos con ese término. Prueba con otra palabra o cambia de departamento."
            action={
              <button type="button" className="btn-soft" onClick={() => setQ('')}>
                Limpiar búsqueda
              </button>
            }
          />
        ) : grouped ? (
          departments.map((d) => {
            const items = products.filter((p) => p.dept === d.slug)
            if (items.length === 0) return null
            return (
              <section key={d.slug} className="mb-14">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <h2 className="flex items-center gap-2.5 text-[1.5rem] text-ink">
                    <span aria-hidden className="text-2xl">
                      {d.emoji}
                    </span>
                    {d.name}
                  </h2>
                  <span className="text-xs text-ink-faint">{items.length} opciones</span>
                </div>
                <Grid
                  items={items}
                  onAdd={onAdd}
                  onEditQuestions={esAsesor ? setEditando : undefined}
                  cart={cart}
                />
              </section>
            )
          })
        ) : (
          <Grid
            items={list}
            onAdd={onAdd}
            onEditQuestions={esAsesor ? setEditando : undefined}
            cart={cart}
          />
        )}
      </div>

      {cotizando && (
        <QuoteForm
          product={cotizando}
          questions={questionsOf(cotizando)}
          onCancel={() => setCotizando(null)}
          onSubmit={(answers) => {
            addToCart(cotizando.id, 1, answers)
            show(`Cotización de ${cotizando.name} agregada al carrito`)
            setCotizando(null)
          }}
        />
      )}

      {editando && (
        <QuestionsEditor
          product={editando}
          questions={questionsOf(editando)}
          onCancel={() => setEditando(null)}
          onSave={(qs) => {
            setProductQuestions(editando.id, qs)
            show(`Preguntas de ${editando.name} actualizadas`)
            setEditando(null)
          }}
          onReset={() => {
            resetProductQuestions(editando.id)
            show(`Preguntas de ${editando.name} restauradas`)
            setEditando(null)
          }}
        />
      )}
    </div>
  )
}

function Grid({
  items,
  onAdd,
  onEditQuestions,
  cart,
}: {
  items: Product[]
  onAdd: (p: Product) => void
  onEditQuestions?: (p: Product) => void
  cart: { productId: string; qty: number }[]
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => (
        <Reveal key={p.id} delay={Math.min(i, 8) * 40}>
          <Card
            product={p}
            onAdd={onAdd}
            onEditQuestions={onEditQuestions}
            inCart={cart.find((l) => l.productId === p.id)?.qty ?? 0}
          />
        </Reveal>
      ))}
    </div>
  )
}

function Card({
  product,
  onAdd,
  onEditQuestions,
  inCart,
}: {
  product: Product
  onAdd: (p: Product) => void
  onEditQuestions?: (p: Product) => void
  inCart: number
}) {
  const off = discountPct(product)
  const d = departments.find((x) => x.slug === product.dept)
  return (
    <article className="card card-hover flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream text-xl ring-1 ring-line">
          {d?.emoji}
        </span>
        {product.quote ? (
          <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[0.7rem] font-bold text-[#7d4a02]">
            Cotización
          </span>
        ) : off > 0 && (
          <span className="rounded-full bg-magenta/10 px-2.5 py-1 text-[0.7rem] font-bold text-magenta">
            -{off}%
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-[1.1rem] leading-tight font-semibold text-ink">
        {product.name}
      </h3>
      <p className="mt-1 text-xs text-ink-faint">
        {d?.name} · {product.unit}
      </p>
      {product.note && <p className="mt-2 text-xs leading-relaxed text-ink-soft">{product.note}</p>}

      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
        <span>
          {product.quote ? (
            <>
              <span className="block font-display text-[1.35rem] leading-none font-semibold text-wine">
                A cotizar
              </span>
              <span className="mt-1 block text-xs text-ink-faint">
                desde {mxn(product.price)} · {product.unit}
              </span>
            </>
          ) : (
            <>
              <span className="block font-display text-[1.35rem] leading-none font-semibold text-wine">
                {mxn(product.price)}
              </span>
              {product.compareAt && (
                <span className="mt-1 block text-xs text-ink-faint line-through">
                  {mxn(product.compareAt)}
                </span>
              )}
            </>
          )}
        </span>
        <button
          type="button"
          onClick={() => onAdd(product)}
          className="group btn-primary !px-4 !py-2.5 !text-[0.8rem]"
          aria-label={
            product.quote ? `Cotizar ${product.name}` : `Agregar ${product.name} al carrito`
          }
        >
          {inCart > 0 ? (
            <>
              <IconCheck className="h-4 w-4" /> {inCart}
            </>
          ) : product.quote ? (
            'Cotizar'
          ) : (
            <>
              <IconCart className="h-4 w-4" /> Agregar
            </>
          )}
        </button>
      </div>

      {onEditQuestions && product.quote && (
        <button
          type="button"
          onClick={() => onEditQuestions(product)}
          className="mt-3 text-[0.75rem] font-semibold text-ink-soft hover:text-wine hover:underline"
        >
          Editar preguntas de cotización
        </button>
      )}

      {inCart > 0 && (
        <Link
          to="/carrito"
          className="mt-3 text-center text-[0.75rem] font-semibold text-magenta hover:underline"
        >
          Ver carrito →
        </Link>
      )}
    </article>
  )
}
