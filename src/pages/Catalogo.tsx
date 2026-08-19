import { Link } from 'react-router-dom'
import { byDept, departments, discountPct, mxn } from '../data/catalog'
import { Reveal } from '../components/ui'
import { IconArrow, IconTag } from '../components/Icons'

export default function Catalogo() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-12 pb-24">
      <Reveal>
        <div className="grain relative overflow-hidden rounded-card bg-gradient-to-br from-wine via-[#8a2a24] to-rose px-6 py-14 text-center text-cream sm:px-12 sm:py-20">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle,#fb0b77 0%,transparent 70%)' }}
          />
          <div className="relative">
            <span className="eyebrow bg-cream/15 text-cream">
              <IconTag className="h-3 w-3" /> Precios de referencia
            </span>
            {/* Eco tipográfico de la portada del catálogo del brief */}
            <h1 className="mt-6 text-[clamp(2.1rem,6.6vw,4.4rem)] leading-[0.95]">
              <span className="block opacity-25">CATÁLOGO DE</span>
              <span className="block opacity-55">CATÁLOGO DE</span>
              <span className="block">
                CATÁLOGO DE <span className="text-blush">DESCUENTOS</span>
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-cream/75">
              Todos los productos y servicios de Rubby Corp, organizados por área. Agrega al carrito
              desde la tienda y paga con tu monedero.
            </p>
            <Link to="/tienda" className="btn mt-8 bg-cream text-wine hover:bg-white">
              Ir a la tienda
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Índice rápido */}
      <Reveal delay={80}>
        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
          {departments.map((d) => (
            <a key={d.slug} href={`#${d.slug}`} className="chip chip-off">
              <span aria-hidden>{d.emoji}</span> {d.name}
            </a>
          ))}
        </div>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {departments.map((d, i) => {
          const items = byDept(d.slug)
          if (items.length === 0) return null
          return (
            <Reveal key={d.slug} delay={Math.min(i, 6) * 45}>
              <section id={d.slug} className="card flex h-full flex-col p-6 scroll-mt-28">
                <header className="flex items-center gap-3 border-b border-line pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream text-xl ring-1 ring-line">
                    {d.emoji}
                  </span>
                  <span>
                    <h2 className="text-[0.95rem] font-semibold tracking-[0.18em] text-ink uppercase">
                      {d.name}
                    </h2>
                    <p className="text-xs text-ink-faint">{d.tagline}</p>
                  </span>
                </header>

                <ul className="mt-4 flex-1 divide-y divide-line">
                  {items.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                        <span className="text-[0.7rem] text-ink-faint">{p.unit}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-display font-semibold text-wine tabular-nums">
                          {mxn(p.price)}
                        </span>
                        {p.compareAt && (
                          <span className="text-[0.7rem] text-magenta">-{discountPct(p)}%</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/tienda?dept=${d.slug}`}
                  className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-magenta"
                >
                  Comprar en {d.name}
                  <IconArrow className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1" />
                </Link>
              </section>
            </Reveal>
          )
        })}
      </div>

      <Reveal>
        <p className="mt-12 rounded-2xl bg-cream/60 px-5 py-4 text-xs leading-relaxed text-ink-soft ring-1 ring-line">
          Los precios mostrados son de referencia y se actualizan en{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[0.72rem] text-wine">
            src/data/catalog.ts
          </code>
          . Algunos servicios requieren cotización previa.
        </p>
      </Reveal>
    </div>
  )
}
