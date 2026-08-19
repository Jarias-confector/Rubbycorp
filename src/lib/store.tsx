import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { products, type Product } from '../data/catalog'

export type User = {
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
  password: string
  role: 'cliente' | 'asesor'
}

export type CartLine = { productId: string; qty: number }

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
  items: { name: string; qty: number; price: number }[]
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

type Ctx = State & {
  cartItems: { product: Product; qty: number }[]
  cartCount: number
  cartTotal: number
  openTickets: number
  login: (email: string, password: string) => { ok: boolean; error?: string }
  register: (u: Omit<User, 'role'>) => { ok: boolean; error?: string }
  logout: () => void
  updateProfile: (patch: Partial<User>) => void
  addToCart: (productId: string, qty?: number) => void
  setQty: (productId: string, qty: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  checkout: () => { ok: boolean; error?: string; orderId?: string }
  addFunds: (amount: number, concept: string, kind?: Movement['kind']) => void
  createTicket: (t: { product: string; subject: string; description: string; images: string[] }) => string
  setTicketStatus: (id: string, status: TicketStatus) => void
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

  const addToCart: Ctx['addToCart'] = useCallback((productId, qty = 1) => {
    setState((s) => {
      const line = s.cart.find((l) => l.productId === productId)
      return {
        ...s,
        cart: line
          ? s.cart.map((l) => (l.productId === productId ? { ...l, qty: l.qty + qty } : l))
          : [...s.cart, { productId, qty }],
      }
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
        .map((l) => ({ product: products.find((p) => p.id === l.productId)!, qty: l.qty }))
        .filter((x) => Boolean(x.product)),
    [state.cart],
  )

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, x) => sum + x.product.price * x.qty, 0),
    [cartItems],
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
          items: cartItems.map((x) => ({ name: x.product.name, qty: x.qty, price: x.product.price })),
        },
        ...s.orders,
      ],
      movements: [
        {
          id: uid('mov'),
          date: now(),
          concept: `Pago de pedido ${orderId}`,
          amount: -cartTotal,
          kind: 'compra',
        },
        ...s.movements,
      ],
    }))
    return { ok: true, orderId }
  }, [state.user, state.balance, cartItems, cartTotal])

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

  const reset = useCallback(() => {
    localStorage.removeItem(KEY)
    setState(initial)
  }, [])

  const value: Ctx = {
    ...state,
    cartItems,
    cartCount,
    cartTotal,
    openTickets,
    login,
    register,
    logout,
    updateProfile,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    checkout,
    addFunds,
    createTicket,
    setTicketStatus,
    replyTicket,
    reset,
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
