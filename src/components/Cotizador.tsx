import { useEffect, useState, type ReactNode } from 'react'
import type { Product, Question, QuestionType } from '../data/catalog'
import type { Answers } from '../lib/store'
import { IconCheck, IconPlus, IconTrash } from './Icons'

const tipos: { value: QuestionType; label: string }[] = [
  { value: 'texto', label: 'Texto corto' },
  { value: 'parrafo', label: 'Texto largo' },
  { value: 'numero', label: 'Número' },
  { value: 'fecha', label: 'Fecha' },
  { value: 'opciones', label: 'Opciones' },
]

function Modal({
  title,
  sub,
  onClose,
  children,
  footer,
}: {
  title: string
  sub?: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-70 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-card bg-surface p-6 shadow-xl sm:rounded-card"
      >
        <h2 className="text-xl text-ink">{title}</h2>
        {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
        <div className="mt-5 space-y-4">{children}</div>
        <div className="mt-6 flex gap-2">{footer}</div>
      </div>
    </div>
  )
}

/** Formulario que responde el cliente para pedir la cotización de un producto. */
export function QuoteForm({
  product,
  questions,
  initial,
  onCancel,
  onSubmit,
}: {
  product: Product
  questions: Question[]
  initial?: Answers
  onCancel: () => void
  onSubmit: (answers: Answers) => void
}) {
  const [values, setValues] = useState<Answers>(initial ?? {})
  const [error, setError] = useState('')

  const set = (id: string, v: string) => setValues((s) => ({ ...s, [id]: v }))

  const submit = () => {
    const falta = questions.find((q) => q.required && !(values[q.id] ?? '').trim())
    if (falta) return setError(`Falta responder: ${falta.label}`)
    setError('')
    onSubmit(values)
  }

  return (
    <Modal
      title={`Cotizar ${product.name}`}
      sub="Responde estos datos y un asesor te confirma el precio final."
      onClose={onCancel}
      footer={
        <>
          <button type="button" onClick={submit} className="btn-primary flex-1">
            <IconCheck className="h-4 w-4" /> {initial ? 'Guardar cambios' : 'Agregar al carrito'}
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancelar
          </button>
        </>
      }
    >
      {questions.length === 0 && (
        <p className="text-sm text-ink-soft">Este producto no tiene preguntas configuradas.</p>
      )}
      {questions.map((q) => (
        <label key={q.id} className="block">
          <span className="mb-1.5 block text-[0.8rem] font-semibold text-ink">
            {q.label}
            {q.required && <span className="text-magenta"> *</span>}
          </span>
          {q.type === 'parrafo' ? (
            <textarea
              rows={3}
              value={values[q.id] ?? ''}
              placeholder={q.placeholder}
              onChange={(e) => set(q.id, e.target.value)}
              className="field"
            />
          ) : q.type === 'opciones' ? (
            <select
              value={values[q.id] ?? ''}
              onChange={(e) => set(q.id, e.target.value)}
              className="field"
            >
              <option value="">Selecciona…</option>
              {(q.options ?? []).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={q.type === 'numero' ? 'number' : q.type === 'fecha' ? 'date' : 'text'}
              value={values[q.id] ?? ''}
              placeholder={q.placeholder}
              onChange={(e) => set(q.id, e.target.value)}
              className="field"
            />
          )}
        </label>
      ))}
      {error && <p className="text-xs font-semibold text-bad">{error}</p>}
    </Modal>
  )
}

const nuevaPregunta = (): Question => ({
  id: `q-${Math.random().toString(36).slice(2, 8)}`,
  label: '',
  type: 'texto',
})

/** Editor de preguntas por producto (rol asesor). */
export function QuestionsEditor({
  product,
  questions,
  onCancel,
  onSave,
  onReset,
}: {
  product: Product
  questions: Question[]
  onCancel: () => void
  onSave: (questions: Question[]) => void
  onReset: () => void
}) {
  const [list, setList] = useState<Question[]>(questions.map((q) => ({ ...q })))
  const [error, setError] = useState('')

  const patch = (i: number, p: Partial<Question>) =>
    setList((s) => s.map((q, j) => (j === i ? { ...q, ...p } : q)))

  const move = (i: number, dir: -1 | 1) =>
    setList((s) => {
      const j = i + dir
      if (j < 0 || j >= s.length) return s
      const n = [...s]
      ;[n[i], n[j]] = [n[j], n[i]]
      return n
    })

  const save = () => {
    const limpio = list.map((q) => ({
      ...q,
      label: q.label.trim(),
      options:
        q.type === 'opciones' ? (q.options ?? []).map((o) => o.trim()).filter(Boolean) : undefined,
    }))
    if (limpio.some((q) => !q.label)) return setError('Todas las preguntas necesitan texto.')
    if (limpio.some((q) => q.type === 'opciones' && (q.options ?? []).length === 0))
      return setError('Las preguntas de opciones necesitan al menos una opción.')
    setError('')
    onSave(limpio)
  }

  return (
    <Modal
      title={`Preguntas de ${product.name}`}
      sub="Cada producto pregunta lo suyo. Se guardan solo para este producto."
      onClose={onCancel}
      footer={
        <>
          <button type="button" onClick={save} className="btn-primary flex-1">
            <IconCheck className="h-4 w-4" /> Guardar preguntas
          </button>
          <button type="button" onClick={onReset} className="btn-soft">
            Restaurar
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancelar
          </button>
        </>
      }
    >
      {list.map((q, i) => (
        <div key={q.id} className="rounded-2xl bg-cream/60 p-4 ring-1 ring-line">
          <div className="flex items-start gap-2">
            <input
              value={q.label}
              onChange={(e) => patch(i, { label: e.target.value })}
              placeholder="Texto de la pregunta"
              className="field !py-2.5"
              aria-label={`Pregunta ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => setList((s) => s.filter((_, j) => j !== i))}
              className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-bad/10 hover:text-bad"
              aria-label={`Eliminar pregunta ${i + 1}`}
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              value={q.type}
              onChange={(e) =>
                patch(i, { type: e.target.value as QuestionType, options: q.options ?? [''] })
              }
              className="field !w-auto !py-2 !text-[0.8rem]"
              aria-label={`Tipo de la pregunta ${i + 1}`}
            >
              {tipos.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-1.5 text-[0.78rem] text-ink-soft">
              <input
                type="checkbox"
                checked={Boolean(q.required)}
                onChange={(e) => patch(i, { required: e.target.checked })}
              />
              Obligatoria
            </label>

            <span className="ml-auto flex gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                className="rounded-full px-2 py-1 text-xs text-ink-soft hover:bg-white"
                aria-label={`Subir pregunta ${i + 1}`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                className="rounded-full px-2 py-1 text-xs text-ink-soft hover:bg-white"
                aria-label={`Bajar pregunta ${i + 1}`}
              >
                ↓
              </button>
            </span>
          </div>

          {q.type === 'opciones' && (
            <input
              value={(q.options ?? []).join(', ')}
              onChange={(e) => patch(i, { options: e.target.value.split(',') })}
              placeholder="Opciones separadas por coma"
              className="field mt-2 !py-2 !text-[0.8rem]"
              aria-label={`Opciones de la pregunta ${i + 1}`}
            />
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => setList((s) => [...s, nuevaPregunta()])}
        className="btn-soft w-full"
      >
        <IconPlus className="h-4 w-4" /> Agregar pregunta
      </button>
      {error && <p className="text-xs font-semibold text-bad">{error}</p>}
    </Modal>
  )
}
