import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { chargeOf, departments, mxn, type Product } from '../data/catalog'
import { useStore } from '../lib/store'
import { Empty, Reveal, useToast } from '../components/ui'
import { QuoteForm } from '../components/Cotizador'
import { IconArrow, IconCart, IconMinus, IconPlus, IconTrash, IconWallet } from '../components/Icons'

export default function Carrito() {
  const {
    cartItems,
    cartTotal,
    quoteCount,
    setQty,
    removeFromCart,
    clearCart,
    checkout,
    balance,
    user,
    questionsOf,
    setAnswers,
  } = useStore()
  const { show, node } = useToast()
  const nav = useNavigate()
  const [done, setDone] = useState<string | null>(null)
  const [editando, setEditando] = useState<Product | null>(null)

  const savings = cartItems.reduce(
    (s, x) =>
      x.product.quote
        ? s
        : s + ((x.product.compareAt ?? x.product.price) - x.product.price) * x.qty,
    0,
  )
  const falta = Math.max(0, cartTotal - balance)

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="card p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok/10 text-3xl">
            🎉
          </span>
          <h1 className="mt-6 text-[2rem] text-ink">¡Pedido confirmado!</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Tu pedido <span className="font-mono font-semibold text-wine">{done}</span> quedó
            registrado y se pagó con el saldo de tu monedero.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/perfil" className="btn-primary">
              Ver mis pedidos
            </Link>
            <Link to="/tienda" className="btn-ghost">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-12 pb-24">
      {node}
      <Reveal>
        <span className="eyebrow bg-blush/20 text-wine ring-1 ring-blush/40">Carrito</span>
        <h1 className="mt-4 text-[clamp(2.2rem,5.5vw,3.4rem)] text-ink">Tu carrito</h1>
      </Reveal>

      {cartItems.length === 0 ? (
        <div className="mt-10">
          <Empty
            icon={<IconCart className="h-6 w-6" />}
            title="Tu carrito está vacío"
            sub="Explora los 12 departamentos y agrega los productos o servicios que necesites."
            action={
              <Link to="/tienda" className="btn-primary">
                Ir a la tienda
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-4 lg:grid-cols-[1.55fr_1fr] lg:items-start">
          <ul className="space-y-3">
            {cartItems.map(({ product, qty, answers }, i) => (
              <Reveal key={product.id} delay={i * 40}>
                <li className="card flex items-center gap-4 p-4 sm:p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream text-xl ring-1 ring-line">
                    {departments.find((d) => d.slug === product.dept)?.emoji}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{product.name}</p>
                    <p className="text-xs text-ink-faint">
                      {product.quote ? 'Por cotizar' : mxn(product.price)} · {product.unit}
                    </p>
                    {product.quote && (
                      <>
                        <p className="mt-1 line-clamp-2 text-[0.72rem] text-ink-soft">
                          {questionsOf(product)
                            .filter((qq) => (answers[qq.id] ?? '').trim())
                            .map((qq) => `${qq.label}: ${answers[qq.id]}`)
                            .join(' · ') || 'Sin datos de cotización'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditando(product)}
                          className="mt-1 text-[0.72rem] font-semibold text-magenta hover:underline"
                        >
                          Editar respuestas
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-cream p-1 ring-1 ring-line">
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-wine transition-colors hover:bg-white"
                      aria-label={`Quitar uno de ${product.name}`}
                    >
                      <IconMinus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-wine transition-colors hover:bg-white"
                      aria-label={`Agregar uno de ${product.name}`}
                    >
                      <IconPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="hidden w-24 text-right font-display font-semibold text-wine tabular-nums sm:block">
                    {product.quote ? '—' : mxn(chargeOf(product) * qty)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-bad/10 hover:text-bad"
                    aria-label={`Eliminar ${product.name}`}
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </li>
              </Reveal>
            ))}
            <li>
              <button type="button" onClick={clearCart} className="btn-ghost !py-2.5 !text-[0.8rem]">
                Vaciar carrito
              </button>
            </li>
          </ul>

          <Reveal delay={120}>
            <aside className="card sticky top-28 p-6">
              <h2 className="text-xl text-ink">Resumen</h2>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{mxn(cartTotal)}</dd>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-ok">
                    <dt>Ahorro por descuentos</dt>
                    <dd className="tabular-nums">-{mxn(savings)}</dd>
                  </div>
                )}
                {quoteCount > 0 && (
                  <div className="flex justify-between text-ink-soft">
                    <dt>Por cotizar</dt>
                    <dd>
                      {quoteCount} {quoteCount === 1 ? 'servicio' : 'servicios'}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
                  <dt>Total a pagar hoy</dt>
                  <dd className="font-display text-xl text-wine tabular-nums">{mxn(cartTotal)}</dd>
                </div>
              </dl>

              {quoteCount > 0 && (
                <p className="mt-4 rounded-2xl bg-gold/10 px-4 py-3 text-xs text-[#7d4a02]">
                  Los servicios de cotización no se cobran ahora: un asesor revisa tus respuestas y
                  te confirma el precio antes de cobrar.
                </p>
              )}

              <div className="mt-5 rounded-2xl bg-cream/70 p-4 ring-1 ring-line">
                <p className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink-soft">
                    <IconWallet className="h-4 w-4" /> Saldo del monedero
                  </span>
                  <span className="font-semibold text-ink tabular-nums">{mxn(balance)}</span>
                </p>
                {falta > 0 && (
                  <p className="mt-2 text-xs text-bad">
                    Te faltan {mxn(falta)} para completar este pedido.
                  </p>
                )}
              </div>

              {!user && (
                <p className="mt-4 rounded-2xl bg-warn/10 px-4 py-3 text-xs text-warn">
                  Inicia sesión para poder pagar con tu monedero.
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  const r = checkout()
                  if (r.ok) setDone(r.orderId!)
                  else {
                    show(r.error!, 'bad')
                    if (r.error?.includes('Inicia sesión')) nav('/acceder')
                    else if (r.error?.includes('Saldo')) nav('/monedero')
                  }
                }}
                className="group btn-primary mt-5 w-full !pr-2 !pl-6"
              >
                {cartTotal > 0 ? 'Pagar con monedero' : 'Enviar solicitud de cotización'}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                  <IconArrow className="h-3.5 w-3.5" />
                </span>
              </button>

              <Link to="/monedero" className="btn-soft mt-2.5 w-full">
                Recargar monedero
              </Link>
            </aside>
          </Reveal>
        </div>
      )}

      {editando && (
        <QuoteForm
          product={editando}
          questions={questionsOf(editando)}
          initial={cartItems.find((x) => x.product.id === editando.id)?.answers ?? {}}
          onCancel={() => setEditando(null)}
          onSubmit={(answers) => {
            setAnswers(editando.id, answers)
            show('Datos de cotización actualizados')
            setEditando(null)
          }}
        />
      )}
    </div>
  )
}
