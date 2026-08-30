import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { chargeOf, defaultQuestions, products, type Product, type Question } from '../data/catalog'
import {
  auditCost,
  DEFAULT_MARGIN_TARGET,
  seedProviderCosts,
  type CostAudit,
  type ProviderCost,
} from '../data/providerCosts'

export type User = {
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
  password: string
  role: 'cliente' | 'asesor'
}

/** Respuestas del cliente a las preguntas de cotización, por id de pregunta. */
export type Answers = Record<string, string>

export type CartLine = { productId: string; qty: number; answers?: Answers }

export type Movement = {
  id: string
  date: string
  concept: string
  amount: number // + recarga, - compra
  kind: 'recarga' | 'compra' | 'ajuste'
}

export type Order = {
  id: string
  date: string
  total: number
  status: 'En proceso' | 'Completado' | 'Cancelado'
  items: {
    /** Ausente en pedidos creados antes del panel de ventas: su costo no se puede rastrear. */
    productId?: string
    name: string
    qty: number
    price: number
    quote?: boolean
    answers?: Answers
  }[]
}

export type TicketStatus = 'Pendiente' | 'En revisión' | 'Solucionado'

export type Ticket = {
  id: string
  date: string
  product: string
  subject: string
  description: string
  images: string[]
  status: TicketStatus
  replies: { from: 'Soporte' | 'Tú'; text: string; date: string }[]
}

type State = {
  user: User | null
  users: User[]
  cart: CartLine[]
  balance: number
  movements: Movement[]
  orders: Order[]
  tickets: Ticket[]
  /** Preguntas personalizadas por producto (panel de asesor). */
  questionOverrides: Record<string, Question[]>
  /** Costo del proveedor por producto, indexado por id de producto. */
  providerCosts: Record<string, ProviderCost>
  /** Margen mínimo aceptable sobre el precio de venta (0 a 1). */
  marginTarget: number
}

const KEY = 'rubbycorp.v1'

const seedUser: User = {
  firstName: 'Rubby',
  lastName: 'Corp',
  displayName: 'Rubby Corp',
  email: 'rubby.corp.oficial@gmail.com',
  phone: '998 103 0007',
  password: 'rubby2017',
  role: 'asesor',
}

const initial: State = {
  user: null,
  users: [seedUser],
  cart: [],
  balance: 0,
  movements: [],
  orders: [],
  tickets: [],
  questionOverrides: {},
  providerCosts: Object.fromEntries(seedProviderCosts.map((c) => [c.productId, c])),
  marginTarget: DEFAULT_MARGIN_TARGET,
}

function load(): State {
  if (typeof localStorage === 'undefined') return initial
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initial
    return { ...initial, ...(JSON.parse(raw) as State) }
  } catch {
    return initial
  }
}

const now = () => new Date().toISOString()
const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/** Resultado de ventas medido contra los costos de proveedor conocidos. */
export type SalesSummary = {
  pedidos: number
  /** Sólo pedidos no cancelados. */
  ingresos: number
  /** Costo de proveedor de las partidas con costo registrado. */
  costo: number
  utilidad: number
  /** utilidad / ingresos con costo conocido, entre 0 y 1. */
  margen: number
  /** Partidas vendidas sin costo de proveedor: quedan fuera del cálculo. */
  partidasSinCosto: number
}

type Ctx = State & {
  cartItems: { product: Product; qty: number; answers: Answers }[]
  quoteCount: number
  cartCount: number
  cartTotal: number
  openTickets: number
  login: (email: string, password: string) => { ok: boolean; error?: string }
  register: (u: Omit<User, 'role'>) => { ok: boolean; error?: string }
  logout: () => void
  updateProfile: (patch: Partial<User>) => void
  addToCart: (productId: string, qty?: number, answers?: Answers) => void
  setAnswers: (productId: string, answers: Answers) => void
  questionsOf: (product: Product) => Question[]
  setProductQuestions: (productId: string, questions: Question[]) => void
  resetProductQuestions: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  checkout: () => { ok: boolean; error?: string; orderId?: string }
  addFunds: (amount: number, concept: string, kind?: Movement['kind']) => void
  createTicket: (t: { product: string; subject: string; description: string; images: string[] }) => string
  setTicketStatus: (id: string, status: TicketStatus) => void
  /** Auditoría precio de venta vs. costo del proveedor, para todo el catálogo. */
  audits: CostAudit[]
  costOf: (productId: string) => ProviderCost | undefined
  setProviderCost: (cost: Omit<ProviderCost, 'updatedAt'>) => void
  removeProviderCost: (productId: string) => void
  /** Reemplaza los costos recibidos y devuelve cuántos se guardaron. */
  importProviderCosts: (costs: ProviderCost[]) => number
  setMarginTarget: (target: number) => void
  setOrderStatus: (id: string, status: Order['status']) => void
  sales: SalesSummary
  replyTicket: (id: string, text: string) => void
  reset: () => void
}

const StoreCtx = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* almacenamiento lleno o bloqueado: la app sigue funcionando en memoria */
    }
  }, [state])

  const login: Ctx['login'] = useCallback((email, password) => {
    let result: { ok: boolean; error?: string } = { ok: false }
    setState((s) => {
      const found = s.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (!found) {
        result = { ok: false, error: 'No encontramos una cuenta con ese correo.' }
        return s
      }
      if (found.password !== password) {
        result = { ok: false, error: 'La contraseña no es correcta.' }
        return s
      }
      result = { ok: true }
      return { ...s, user: found }
    })
    return result
  }, [])

  const register: Ctx['register'] = useCallback((u) => {
    let result: { ok: boolean; error?: string } = { ok: false }
    setState((s) => {
      if (s.users.some((x) => x.email.toLowerCase() === u.email.trim().toLowerCase())) {
        result = { ok: false, error: 'Ese correo ya está registrado.' }
        return s
      }
      const nu: User = { ...u, email: u.email.trim(), role: 'cliente' }
      result = { ok: true }
      return { ...s, users: [...s.users, nu], user: nu }
    })
    return result
  }, [])

  const logout = useCallback(() => setState((s) => ({ ...s, user: null })), [])

  const updateProfile: Ctx['updateProfile'] = useCallback((patch) => {
    setState((s) => {
      if (!s.user) return s
      const next = { ...s.user, ...patch }
      return {
        ...s,
        user: next,
        users: s.users.map((u) => (u.email === s.user!.email ? next : u)),
      }
    })
  }, [])

  const addToCart: Ctx['addToCart'] = useCallback((productId, qty = 1, answers) => {
    setState((s) => {
      const line = s.cart.find((l) => l.productId === productId)
      return {
        ...s,
        cart: line
          ? s.cart.map((l) =>
              l.productId === productId
                ? { ...l, qty: l.qty + qty, answers: answers ?? l.answers }
                : l,
            )
          : [...s.cart, { productId, qty, answers }],
      }
    })
  }, [])

  const setAnswers: Ctx['setAnswers'] = useCallback((productId, answers) => {
    setState((s) => ({
      ...s,
      cart: s.cart.map((l) => (l.productId === productId ? { ...l, answers } : l)),
    }))
  }, [])

  const setProductQuestions: Ctx['setProductQuestions'] = useCallback((productId, questions) => {
    setState((s) => ({
      ...s,
      questionOverrides: { ...s.questionOverrides, [productId]: questions },
    }))
  }, [])

  const resetProductQuestions: Ctx['resetProductQuestions'] = useCallback((productId) => {
    setState((s) => {
      const next = { ...s.questionOverrides }
      delete next[productId]
      return { ...s, questionOverrides: next }
    })
  }, [])

  const setQty: Ctx['setQty'] = useCallback((productId, qty) => {
    setState((s) => ({
      ...s,
      cart:
        qty <= 0
          ? s.cart.filter((l) => l.productId !== productId)
          : s.cart.map((l) => (l.productId === productId ? { ...l, qty } : l)),
    }))
  }, [])

  const removeFromCart: Ctx['removeFromCart'] = useCallback((productId) => {
    setState((s) => ({ ...s, cart: s.cart.filter((l) => l.productId !== productId) }))
  }, [])

  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: [] })), [])

  const addFunds: Ctx['addFunds'] = useCallback((amount, concept, kind = 'recarga') => {
    setState((s) => ({
      ...s,
      balance: s.balance + amount,
      movements: [{ id: uid('mov'), date: now(), concept, amount, kind }, ...s.movements],
    }))
  }, [])

  const cartItems = useMemo(
    () =>
      state.cart
        .map((l) => ({
          product: products.find((p) => p.id === l.productId)!,
          qty: l.qty,
          answers: l.answers ?? {},
        }))
        .filter((x) => Boolean(x.product)),
    [state.cart],
  )

  /** Los productos de cotización no suman: el asesor confirma el precio después. */
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, x) => sum + chargeOf(x.product) * x.qty, 0),
    [cartItems],
  )

  const quoteCount = useMemo(
    () => cartItems.filter((x) => x.product.quote).length,
    [cartItems],
  )

  const questionsOf: Ctx['questionsOf'] = useCallback(
    (product) => state.questionOverrides[product.id] ?? defaultQuestions(product),
    [state.questionOverrides],
  )

  const cartCount = useMemo(() => cartItems.reduce((n, x) => n + x.qty, 0), [cartItems])

  const openTickets = useMemo(
    () => state.tickets.filter((t) => t.status !== 'Solucionado').length,
    [state.tickets],
  )

  const checkout: Ctx['checkout'] = useCallback(() => {
    if (!state.user) return { ok: false, error: 'Inicia sesión para completar tu compra.' }
    if (cartItems.length === 0) return { ok: false, error: 'Tu carrito está vacío.' }
    if (state.balance < cartTotal)
      return { ok: false, error: 'Saldo insuficiente en tu monedero. Recarga para continuar.' }

    const faltan = cartItems.filter(
      (x) =>
        x.product.quote &&
        questionsOf(x.product).some((qq) => qq.required && !(x.answers[qq.id] ?? '').trim()),
    )
    if (faltan.length > 0)
      return {
        ok: false,
        error: `Completa los datos de cotización de ${faltan[0].product.name}.`,
      }

    const orderId = uid('ped').toUpperCase()
    setState((s) => ({
      ...s,
      balance: s.balance - cartTotal,
      cart: [],
      orders: [
        {
          id: orderId,
          date: now(),
          total: cartTotal,
          status: 'En proceso',
          items: cartItems.map((x) => ({
            productId: x.product.id,
            name: x.product.name,
            qty: x.qty,
            price: chargeOf(x.product),
            quote: x.product.quote,
            answers: x.product.quote ? x.answers : undefined,
          })),
        },
        ...s.orders,
      ],
      movements:
        cartTotal > 0
          ? [
              {
                id: uid('mov'),
                date: now(),
                concept: `Pago de pedido ${orderId}`,
                amount: -cartTotal,
                kind: 'compra',
              },
              ...s.movements,
            ]
          : s.movements,
    }))
    return { ok: true, orderId }
  }, [state.user, state.balance, cartItems, cartTotal, questionsOf])

  const createTicket: Ctx['createTicket'] = useCallback((t) => {
    const id = uid('tk').toUpperCase()
    setState((s) => ({
      ...s,
      tickets: [
        { id, date: now(), status: 'Pendiente', replies: [], ...t },
        ...s.tickets,
      ],
    }))
    return id
  }, [])

  const setTicketStatus: Ctx['setTicketStatus'] = useCallback((id, status) => {
    setState((s) => ({
      ...s,
      tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)),
    }))
  }, [])

  const replyTicket: Ctx['replyTicket'] = useCallback((id, text) => {
    setState((s) => ({
      ...s,
      tickets: s.tickets.map((t) =>
        t.id === id
          ? { ...t, status: 'En revisión', replies: [...t.replies, { from: 'Tú', text, date: now() }] }
          : t,
      ),
    }))
  }, [])

  const setProviderCost: Ctx['setProviderCost'] = useCallback((cost) => {
    setState((s) => ({
      ...s,
      providerCosts: {
        ...s.providerCosts,
        [cost.productId]: { ...cost, updatedAt: now() },
      },
    }))
  }, [])

  const removeProviderCost: Ctx['removeProviderCost'] = useCallback((productId) => {
    setState((s) => {
      const next = { ...s.providerCosts }
      delete next[productId]
      return { ...s, providerCosts: next }
    })
  }, [])

  const importProviderCosts: Ctx['importProviderCosts'] = useCallback((costs) => {
    if (costs.length === 0) return 0
    setState((s) => ({
      ...s,
      providerCosts: {
        ...s.providerCosts,
        ...Object.fromEntries(costs.map((c) => [c.productId, c])),
      },
    }))
    return costs.length
  }, [])

  const setMarginTarget: Ctx['setMarginTarget'] = useCallback((target) => {
    const clamped = Math.min(0.95, Math.max(0, Number.isFinite(target) ? target : 0))
    setState((s) => ({ ...s, marginTarget: clamped }))
  }, [])

  const setOrderStatus: Ctx['setOrderStatus'] = useCallback((id, status) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }))
  }, [])

  const costOf: Ctx['costOf'] = useCallback(
    (productId) => state.providerCosts[productId],
    [state.providerCosts],
  )

  const audits = useMemo(
    () => products.map((x) => auditCost(x, state.providerCosts[x.id], state.marginTarget)),
    [state.providerCosts, state.marginTarget],
  )

  const sales = useMemo<SalesSummary>(() => {
    const vivos = state.orders.filter((o) => o.status !== 'Cancelado')
    let costo = 0
    let ingresosConCosto = 0
    let partidasSinCosto = 0

    for (const order of vivos) {
      for (const item of order.items) {
        const c = item.productId ? state.providerCosts[item.productId] : undefined
        if (!c || !Number.isFinite(c.cost) || c.cost < 0) {
          partidasSinCosto += 1
          continue
        }
        costo += c.cost * item.qty
        ingresosConCosto += item.price * item.qty
      }
    }

    const ingresos = vivos.reduce((sum, o) => sum + o.total, 0)
    const utilidad = ingresosConCosto - costo
    return {
      pedidos: vivos.length,
      ingresos,
      costo,
      utilidad,
      margen: ingresosConCosto > 0 ? utilidad / ingresosConCosto : 0,
      partidasSinCosto,
    }
  }, [state.orders, state.providerCosts])

  const reset = useCallback(() => {
    localStorage.removeItem(KEY)
    setState(initial)
  }, [])

  const value: Ctx = {
    ...state,
    cartItems,
    cartCount,
    cartTotal,
    quoteCount,
    openTickets,
    login,
    register,
    logout,
    updateProfile,
    addToCart,
    setAnswers,
    questionsOf,
    setProductQuestions,
    resetProductQuestions,
    setQty,
    removeFromCart,
    clearCart,
    checkout,
    addFunds,
    createTicket,
    setTicketStatus,
    replyTicket,
    audits,
    costOf,
    setProviderCost,
    removeProviderCost,
    importProviderCosts,
    setMarginTarget,
    setOrderStatus,
    sales,
    reset,
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
