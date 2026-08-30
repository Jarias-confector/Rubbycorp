import type { Product } from './catalog'

/**
 * Costo que nos cobra el proveedor por una unidad del servicio.
 *
 * El catálogo (`catalog.ts`) sólo guarda el precio de venta al público. Sin el costo
 * del proveedor no se puede saber si un servicio deja utilidad, así que ese dato vive
 * aquí, aparte, y se puede llenar de tres formas:
 *
 *  1. `seedProviderCosts` — costos confirmados que se commitean al repositorio.
 *  2. Panel de ventas — el asesor captura o corrige un costo a mano.
 *  3. Importación JSON — el mismo formato que entrega el conector de proveedores
 *     (MCP `Rubby_Company`). Ver `docs/costos-proveedor.md`.
 */
export type CostSource = 'catalogo' | 'manual' | 'mcp'

export type ProviderCost = {
  /** id del producto en `catalog.ts`. */
  productId: string
  /** Nombre del proveedor que surte el servicio. */
  provider: string
  /** Costo unitario en MXN, sin IVA, tal como lo cobra el proveedor. */
  cost: number
  /** Fecha ISO de la última verificación del costo. */
  updatedAt: string
  source: CostSource
  note?: string
}

/** Margen mínimo aceptable sobre el precio de venta. */
export const DEFAULT_MARGIN_TARGET = 0.25

/**
 * Costos confirmados con el proveedor.
 *
 * Está vacío a propósito: el brief no incluyó tarifas de proveedor y un costo inventado
 * haría que la auditoría diera resultados falsos. Cada costo real se agrega aquí —o se
 * sincroniza desde el conector— y desde ese momento el panel lo audita.
 */
export const seedProviderCosts: ProviderCost[] = []

export type CostFlag = 'sin-costo' | 'invalido' | 'perdida' | 'sin-margen' | 'bajo' | 'ok'

export type CostAudit = {
  product: Product
  cost?: ProviderCost
  /** Precio de venta al público. */
  price: number
  /** price − cost. Sólo cuando hay costo válido. */
  margin?: number
  /** margin / price, entre 0 y 1. */
  marginPct?: number
  flag: CostFlag
  detail: string
}

const pct = (n: number) => `${Math.round(n * 100)}%`

/** Un flag distinto de `ok` y `sin-costo` es dinero perdido o en riesgo. */
export const isProblem = (flag: CostFlag) => flag !== 'ok' && flag !== 'sin-costo'

export const flagLabel: Record<CostFlag, string> = {
  'sin-costo': 'Sin costo',
  invalido: 'Costo inválido',
  perdida: 'Pérdida',
  'sin-margen': 'Sin margen',
  bajo: 'Margen bajo',
  ok: 'Correcto',
}

/** Compara el precio de venta contra lo que cobra el proveedor. */
export function auditCost(
  product: Product,
  cost: ProviderCost | undefined,
  target = DEFAULT_MARGIN_TARGET,
): CostAudit {
  const price = product.price
  const base = { product, cost, price }
  const ref = product.quote ? ' El precio es de referencia: la cotización final la fija el asesor.' : ''

  if (!cost) {
    return {
      ...base,
      flag: 'sin-costo',
      detail: 'No hay costo de proveedor registrado, así que no se puede comprobar la utilidad.',
    }
  }
  if (!Number.isFinite(cost.cost) || cost.cost < 0) {
    return { ...base, flag: 'invalido', detail: 'El costo capturado no es un monto válido.' }
  }

  const margin = price - cost.cost
  const marginPct = price > 0 ? margin / price : 0
  const full = { ...base, margin, marginPct }

  if (margin < 0)
    return {
      ...full,
      flag: 'perdida',
      detail: `El proveedor cobra más que el precio de venta: cada venta pierde dinero.${ref}`,
    }
  if (margin === 0)
    return { ...full, flag: 'sin-margen', detail: `Se vende justo al costo, sin utilidad.${ref}` }
  if (marginPct < target)
    return {
      ...full,
      flag: 'bajo',
      detail: `Margen de ${pct(marginPct)}, por debajo del mínimo de ${pct(target)}.${ref}`,
    }
  return { ...full, flag: 'ok', detail: `Margen de ${pct(marginPct)} sobre el precio de venta.${ref}` }
}

export type CostSummary = {
  total: number
  conCosto: number
  problemas: number
  /** Fracción de productos con costo registrado. */
  cobertura: number
  porFlag: Record<CostFlag, number>
}

export function summarizeAudits(audits: CostAudit[]): CostSummary {
  const porFlag: Record<CostFlag, number> = {
    'sin-costo': 0,
    invalido: 0,
    perdida: 0,
    'sin-margen': 0,
    bajo: 0,
    ok: 0,
  }
  for (const a of audits) porFlag[a.flag] += 1
  const conCosto = audits.length - porFlag['sin-costo']
  return {
    total: audits.length,
    conCosto,
    problemas: audits.filter((a) => isProblem(a.flag)).length,
    cobertura: audits.length > 0 ? conCosto / audits.length : 0,
    porFlag,
  }
}

/** Formato de intercambio con el conector de proveedores. */
export type CostImport = { productId: string; provider: string; cost: number; note?: string }

/**
 * Convierte el JSON del conector (o de un pegado manual) en costos válidos.
 * Devuelve también los renglones descartados para poder explicarlos en pantalla.
 */
export function parseCostImport(
  raw: string,
  known: Set<string>,
  source: CostSource = 'mcp',
): { costs: ProviderCost[]; errors: string[] } {
  const errors: string[] = []
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { costs: [], errors: ['El texto no es JSON válido.'] }
  }

  const rows = Array.isArray(data)
    ? data
    : Array.isArray((data as { costs?: unknown }).costs)
      ? (data as { costs: unknown[] }).costs
      : null
  if (!rows) return { costs: [], errors: ['Se esperaba un arreglo de costos o un objeto con "costs".'] }

  const at = new Date().toISOString()
  const costs: ProviderCost[] = []
  rows.forEach((row, i) => {
    const r = row as Partial<CostImport>
    const line = `Renglón ${i + 1}`
    if (!r || typeof r.productId !== 'string' || !r.productId.trim()) {
      errors.push(`${line}: falta "productId".`)
      return
    }
    if (!known.has(r.productId)) {
      errors.push(`${line}: el producto "${r.productId}" no existe en el catálogo.`)
      return
    }
    const cost = Number(r.cost)
    if (!Number.isFinite(cost) || cost < 0) {
      errors.push(`${line}: "cost" debe ser un número mayor o igual a cero.`)
      return
    }
    costs.push({
      productId: r.productId,
      provider: (r.provider ?? '').toString().trim() || 'Proveedor sin nombre',
      cost,
      updatedAt: at,
      source,
      note: r.note?.toString().trim() || undefined,
    })
  })

  return { costs, errors }
}
