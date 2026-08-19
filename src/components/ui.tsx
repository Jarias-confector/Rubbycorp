import { useEffect, useRef, useState, type ReactNode } from 'react'
import { IconCheck, IconCopy } from './Icons'

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${seen ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  center = false,
}: {
  eyebrow?: string
  title: ReactNode
  sub?: ReactNode
  center?: boolean
}) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <span className="eyebrow bg-blush/20 text-wine ring-1 ring-blush/40">{eyebrow}</span>
      )}
      <h2 className="mt-4 text-[clamp(1.9rem,4.4vw,3.1rem)] text-ink">{title}</h2>
      {sub && <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft">{sub}</p>}
    </div>
  )
}

export function Copyable({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value.replace(/\s/g, ''))
        } catch {
          /* clipboard bloqueado: no rompemos la interacción */
        }
        setDone(true)
        setTimeout(() => setDone(false), 1800)
      }}
      className="group flex w-full items-center justify-between gap-4 rounded-2xl bg-cream/70 px-4 py-3 text-left ring-1 ring-line transition-all duration-500 hover:ring-blush"
      aria-label={`Copiar ${label}`}
    >
      <span className="min-w-0">
        <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </span>
        <span className="block truncate font-mono text-[0.92rem] text-ink">{value}</span>
      </span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-wine ring-1 ring-line transition-transform duration-500 group-hover:scale-105">
        {done ? <IconCheck className="h-4 w-4 text-ok" /> : <IconCopy className="h-4 w-4" />}
      </span>
    </button>
  )
}

export function Empty({
  icon,
  title,
  sub,
  action,
}: {
  icon: ReactNode
  title: string
  sub: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card bg-cream/50 px-6 py-16 text-center ring-1 ring-line">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-blush ring-1 ring-line">
        {icon}
      </span>
      <h3 className="text-lg text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-ink-soft">{sub}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Toast({ msg, tone = 'ok' }: { msg: string; tone?: 'ok' | 'bad' }) {
  return (
    <div
      role="status"
      className={`fixed bottom-24 left-1/2 z-60 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg sm:bottom-8 ${
        tone === 'ok' ? 'bg-ok' : 'bg-bad'
      }`}
    >
      {msg}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'bad' } | null>(null)
  const show = (msg: string, tone: 'ok' | 'bad' = 'ok') => {
    setToast({ msg, tone })
    setTimeout(() => setToast(null), 2600)
  }
  const node = toast ? <Toast msg={toast.msg} tone={toast.tone} /> : null
  return { show, node }
}

export function StatTile({
  label,
  value,
  sub,
  tone = 'ruby',
}: {
  label: string
  value: ReactNode
  sub?: string
  tone?: 'ruby' | 'gold' | 'plain'
}) {
  const bg =
    tone === 'ruby'
      ? 'bg-gradient-to-br from-wine to-rose text-cream ring-wine/20'
      : tone === 'gold'
        ? 'bg-gradient-to-br from-[#7d4a02] to-gold text-cream ring-gold/20'
        : 'bg-surface text-ink ring-line'
  const labelTone = tone === 'plain' ? 'text-ink-faint' : 'text-cream/70'
  return (
    <div className={`rounded-card p-5 ring-1 ${bg}`}>
      <p className={`text-[0.7rem] font-semibold uppercase tracking-[0.16em] ${labelTone}`}>{label}</p>
      <p className="mt-2 font-display text-[1.7rem] leading-none font-semibold">{value}</p>
      {sub && <p className={`mt-2 text-xs ${labelTone}`}>{sub}</p>}
    </div>
  )
}
