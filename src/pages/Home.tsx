import { Link } from 'react-router-dom'
import { departments, discountPct, mxn, products } from '../data/catalog'
import { company, waLink } from '../data/company'
import { Reveal, SectionHead } from '../components/ui'
import {
  IconArrow,
  IconClock,
  IconGem,
  IconShield,
  IconSpark,
  IconWallet,
  IconWhatsApp,
} from '../components/Icons'

const pillars = [
  {
    icon: IconSpark,
    title: 'Variedad y ahorro',
    text: 'Un amplio catálogo con descuentos y promociones todos los días del año.',
  },
  {
    icon: IconShield,
    title: 'Fácil, rápido y seguro',
    text: 'Compra con tu monedero, recibe confirmación y da seguimiento desde tu cuenta.',
  },
  {
    icon: IconClock,
    title: 'Todo en línea',
    text: 'Todo desde donde estés, con asesoría por WhatsApp cuando la necesites.',
  },
]

// Las mejores ofertas del catálogo, calculadas por porcentaje de descuento.
const topDeals = [...products]
  .filter((p) => p.compareAt)
  .sort((a, b) => discountPct(b) - discountPct(a))
  .slice(0, 6)

export default function Home() {
  return (
    <div>
      <Hero />

      {/* Bienvenida — texto del brief */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <SectionHead
              eyebrow={`Desde ${company.since}`}
              title={
                <>
                  Bienvenido a <span className="text-gradient-ruby">Rubby Corp</span>
                </>
              }
              sub="Somos una empresa digital que trabaja para ofrecerte productos y servicios a precios justos, con descuentos y promociones todos los días del año."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/tienda" className="btn-primary group">
                Ver la tienda
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                  <IconArrow className="h-3.5 w-3.5" />
                </span>
              </Link>
              <a
                href={waLink('¡Hola Rubby Corp! Quiero saber más sobre sus servicios.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                <IconWhatsApp className="h-4 w-4" /> Hablar con un asesor
              </a>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {pillars.map((p) => (
                <li key={p.title} className="card card-hover flex items-start gap-4 p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream text-wine ring-1 ring-line">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-semibold text-ink">
                      {p.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{p.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <p className="mt-16 border-l-2 border-blush pl-6 font-display text-[clamp(1.15rem,2.4vw,1.6rem)] leading-snug text-ink-soft italic">
            Gracias a nuestros aliados y proveedores, seguimos creciendo para brindarte más y mejores
            opciones.
          </p>
        </Reveal>
      </section>

      {/* Departamentos */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <SectionHead
            eyebrow="12 departamentos"
            title="Todo lo que necesitas, en un solo lugar"
            sub="Cada área con sus productos y servicios listos para agregar al carrito."
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {departments.map((d, i) => (
            <Reveal key={d.slug} delay={i * 35}>
              <Link
                to={`/tienda?dept=${d.slug}`}
                className="group card card-hover flex h-full flex-col justify-between gap-6 p-5"
              >
                <span className="text-3xl">{d.emoji}</span>
                <span>
                  <span className="block font-display text-[1.05rem] leading-tight font-semibold text-ink">
                    {d.name}
                  </span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-ink-faint">
                    {d.tagline}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Ofertas destacadas */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead
              eyebrow="Catálogo de descuentos"
              title="Los descuentos más fuertes de la semana"
            />
            <Link to="/catalogo" className="btn-soft">
              Ver catálogo completo
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topDeals.map((d, i) => (
            <Reveal key={d.id} delay={i * 45}>
              <Link
                to={`/tienda?dept=${d.dept}`}
                className="card card-hover flex h-full items-center justify-between gap-4 p-5"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">{d.name}</span>
                  <span className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-lg font-semibold text-wine">
                      {mxn(d.price)}
                    </span>
                    <span className="text-xs text-ink-faint line-through">{mxn(d.compareAt!)}</span>
                  </span>
                </span>
                <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-magenta text-[0.7rem] leading-none font-bold text-white">
                  <span className="text-[0.85rem]">{discountPct(d)}%</span>
                  <span className="text-[0.55rem] opacity-80">OFF</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Monedero + Soporte */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="grain relative flex h-full flex-col justify-between overflow-hidden rounded-card bg-gradient-to-br from-wine via-[#8a2a24] to-rose p-8 text-cream sm:p-10">
              <div
                className="pointer-events-none absolute -right-10 -bottom-16 h-64 w-64 rounded-full opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(circle,#fb0b77 0%,transparent 70%)' }}
              />
              <div className="relative">
                <span className="eyebrow bg-cream/15 text-cream">Monedero Rubby</span>
                <h3 className="mt-5 text-[clamp(1.6rem,3vw,2.2rem)]">
                  Recarga tu saldo y paga en un toque
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/75">
                  Te mostramos los datos bancarios para recargar y, si prefieres, un asesor te
                  agrega el saldo manualmente por WhatsApp. Todo queda registrado en tus
                  movimientos.
                </p>
              </div>
              <div className="relative mt-8 flex flex-wrap gap-3">
                <Link
                  to="/monedero"
                  className="btn bg-cream text-wine hover:bg-white"
                >
                  <IconWallet className="h-4 w-4" /> Abrir monedero
                </Link>
                <a
                  href={waLink('Hola, quiero solicitar una recarga a mi monedero de Rubby Corp.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-cream/10 text-cream ring-1 ring-cream/30 hover:bg-cream/20"
                >
                  <IconWhatsApp className="h-4 w-4" /> Recarga con asesor
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={110}>
            <div className="card flex h-full flex-col justify-between p-8 sm:p-10">
              <div>
                <span className="eyebrow bg-blush/20 text-wine ring-1 ring-blush/40">
                  Centro de soporte
                </span>
                <h3 className="mt-5 text-[clamp(1.6rem,3vw,2.2rem)] text-ink">
                  Reporta, consulta y da seguimiento
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
                  Crea un ticket con tu producto, asunto, descripción e imágenes. Sigue su estado
                  hasta que quede solucionado.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
                  {['Tickets con estado y seguimiento', 'Adjunta hasta 3 imágenes', 'Filtra por estado o busca por pedido'].map(
                    (t) => (
                      <li key={t} className="flex items-center gap-2.5">
                        <IconGem className="h-4 w-4 shrink-0 text-blush" />
                        {t}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <Link to="/soporte" className="btn-gold mt-8 w-fit">
                Ir a soporte
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function Hero() {
  return (
    <section className="grain relative overflow-hidden px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
      <div
        className="pointer-events-none absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle,#c18796 0%,transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -top-24 right-0 h-[26rem] w-[26rem] rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle,#fb0b77 0%,transparent 70%)' }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Reveal>
            <span className="eyebrow bg-white text-wine ring-1 ring-line">
              🚀 Empresa digital desde {company.since}
            </span>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="mt-6 text-[clamp(2.6rem,7.4vw,5.2rem)] text-ink">
              Oportunidades
              <br />
              al alcance
              <span className="text-gradient-ruby"> de todos</span>
            </h1>
          </Reveal>
          <Reveal delay={170}>
            <p className="mt-7 max-w-lg text-[1.05rem] leading-relaxed text-ink-soft">
              🛍️ Variedad, ahorro y soluciones en un amplio catálogo, de forma fácil, rápida y
              segura. 💻 Todo en línea. Todo desde donde estés.
            </p>
          </Reveal>
          <Reveal delay={250}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/tienda" className="group btn-primary !py-3.5 !pr-2 !pl-7">
                Explorar la tienda
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                  <IconArrow className="h-4 w-4" />
                </span>
              </Link>
              <Link to="/catalogo" className="btn-ghost !py-3.5">
                Catálogo de descuentos
              </Link>
            </div>
          </Reveal>
          <Reveal delay={330}>
            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-6">
              {[
                ['12', 'departamentos'],
                [`${products.length}`, 'productos y servicios'],
                ['365', 'días con promociones'],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-[1.9rem] leading-none font-semibold text-wine">
                    {n}
                  </dt>
                  <dd className="mt-1.5 text-[0.78rem] tracking-wide text-ink-faint uppercase">
                    {l}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="shell mx-auto max-w-sm lg:mr-0 lg:ml-auto">
            <div className="shell-core flex flex-col items-center px-8 py-12 text-center">
              <img
                src={`${import.meta.env.BASE_URL}brand/rubby-logo.png`}
                alt="Logotipo de Rubby Corp"
                className="w-44 drop-shadow-[0_24px_40px_rgba(103,25,21,0.25)]"
              />
              <p className="mt-8 font-display text-lg text-ink italic">
                “Gracias por visitarnos 💙”
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                {departments.slice(0, 8).map((d) => (
                  <span
                    key={d.slug}
                    className="rounded-full bg-cream px-3 py-1.5 text-[0.7rem] font-medium text-ink-soft ring-1 ring-line"
                  >
                    {d.emoji} {d.name}
                  </span>
                ))}
                <span className="rounded-full bg-wine px-3 py-1.5 text-[0.7rem] font-medium text-cream">
                  +4 más
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
