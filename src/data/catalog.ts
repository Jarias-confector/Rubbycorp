export type Department = {
  slug: string
  name: string
  emoji: string
  tagline: string
}

export type Product = {
  id: string
  name: string
  dept: string
  price: number
  compareAt?: number
  unit: string
  note?: string
}

/** Los 12 departamentos del brief (pág. 5 del PDF). */
export const departments: Department[] = [
  { slug: 'viajes', name: 'Viajes', emoji: '✈️', tagline: 'Vuelos, hoteles, cruceros y parques' },
  { slug: 'diversion', name: 'Diversión', emoji: '🎬', tagline: 'Cine, gimnasios, películas y libros' },
  { slug: 'importaciones', name: 'Importaciones', emoji: '📦', tagline: 'Compras desde E.U.A. a tu puerta' },
  { slug: 'tramites', name: 'Trámites', emoji: '📄', tagline: 'Documentos oficiales sin filas' },
  { slug: 'justificantes', name: 'Justificantes', emoji: '🩺', tagline: 'Recetas, incapacidades y laboratorios' },
  { slug: 'suscripciones', name: 'Suscripciones', emoji: '📺', tagline: 'Streaming y música al mejor precio' },
  { slug: 'programas', name: 'Programas', emoji: '💻', tagline: 'Licencias y software original' },
  { slug: 'gamers', name: 'Gamers', emoji: '🎮', tagline: 'Pases, juegos y membresías' },
  { slug: 'conductores', name: 'Conductores', emoji: '🚗', tagline: 'Seguros, deducibles y recargas' },
  { slug: 'trabajo', name: 'Trabajo', emoji: '💼', tagline: 'CV con IA y certificados' },
  { slug: 'marketing', name: 'Marketing & Diseño', emoji: '🎨', tagline: 'Identidad, redes y contenido' },
  { slug: 'otros', name: 'Otros', emoji: '✨', tagline: 'Servicios y membresías varias' },
]

const p = (
  dept: string,
  name: string,
  price: number,
  unit: string,
  compareAt?: number,
  note?: string,
): Product => ({
  id: `${dept}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
  name,
  dept,
  price,
  compareAt,
  unit,
  note,
})

/**
 * Catálogo tomado del "Catálogo de descuentos" (pág. 9 del PDF).
 * Los precios son de referencia y se editan en este archivo: el PDF no incluye lista de precios.
 */
export const products: Product[] = [
  // ── Viajes ✈️
  p('viajes', 'Vuelos', 1890, 'por trayecto', 2350, 'Nacionales e internacionales'),
  p('viajes', 'Hoteles', 1150, 'por noche', 1490),
  p('viajes', 'Cruceros', 9800, 'por persona', 12500),
  p('viajes', 'Parques', 890, 'por boleto', 1150),
  p('viajes', 'Atracciones turísticas', 540, 'por boleto', 700),

  // ── Diversión 🎬
  p('diversion', 'Cinemex', 79, 'por boleto', 105),
  p('diversion', 'Cinépolis', 85, 'por boleto', 110),
  p('diversion', 'Smart Fit', 320, 'mensual', 419),
  p('diversion', 'Total Pass', 480, 'mensual', 620),
  p('diversion', 'Películas HD', 45, 'por título', 79),
  p('diversion', 'Libros digitales', 39, 'por título', 69),

  // ── Importaciones 📦
  p('importaciones', 'Celulares E.U.A', 4900, 'por equipo', undefined, 'Cotización previa por modelo'),
  p('importaciones', 'Productos E.U.A', 350, 'por pedido', undefined, 'Se suma costo del artículo'),

  // ── Trámites 📄
  p('tramites', 'Afiliación al IMSS', 450, 'por trámite', 600),
  p('tramites', 'Actas actualizadas', 180, 'por acta', 250),
  p('tramites', 'Constancia de RFC', 150, 'por constancia', 220),
  p('tramites', 'Antecedentes penales', 390, 'por trámite', 490),
  p('tramites', 'Recuperación cuenta Infonavit', 420, 'por trámite', 550),
  p('tramites', 'Constancia de semanas cotizadas', 160, 'por constancia', 230),
  p('tramites', 'Constancia vigencia de derechos', 160, 'por constancia', 230),

  // ── Justificantes 🩺
  p('justificantes', 'Recetas', 190, 'por receta', 260),
  p('justificantes', 'Incapacidades', 350, 'por documento', 450),
  p('justificantes', 'Laboratorios', 290, 'por estudio', 390),

  // ── Suscripciones 📺
  p('suscripciones', 'Netflix Premium', 129, 'mensual', 299),
  p('suscripciones', 'Disney+', 109, 'mensual', 199),
  p('suscripciones', 'HBO Max', 99, 'mensual', 179),
  p('suscripciones', 'Prime Video', 79, 'mensual', 119),
  p('suscripciones', 'Paramount+', 69, 'mensual', 119),
  p('suscripciones', 'Apple TV', 89, 'mensual', 149),
  p('suscripciones', 'Vix+', 69, 'mensual', 119),
  p('suscripciones', 'Fox One', 89, 'mensual', 149),
  p('suscripciones', 'Rubby TV', 99, 'mensual', 189, 'Nuestro servicio propio'),
  p('suscripciones', 'Crunchyroll', 79, 'mensual', 129),
  p('suscripciones', 'Viki Rakuten', 69, 'mensual', 109),
  p('suscripciones', 'Spotify Premium', 89, 'mensual', 129),

  // ── Programas 💻
  p('programas', 'Antivirus', 199, 'anual', 399),
  p('programas', 'Canva Pro', 149, 'anual', 1499),
  p('programas', 'Licencia Office 365', 299, 'anual', 1699),
  p('programas', 'Licencia Windows 11', 349, 'permanente', 3499),
  p('programas', 'Géminis Pro + Google Drive 5TB', 259, 'mensual', 499),

  // ── Gamers 🎮
  p('gamers', 'X Game Pass Ultimate', 199, 'mensual', 299),
  p('gamers', 'Juegos Nintendo', 420, 'por título', 1299),
  p('gamers', 'Nintendo Online', 149, 'anual', 449),

  // ── Conductores 🚗
  p('conductores', 'Recargas Bait', 50, 'por recarga', undefined, 'Paquetes desde $50'),
  p('conductores', 'Seguro de autos', 3900, 'anual', 5400),
  p('conductores', 'Deducible autos', 2500, 'por siniestro', undefined, 'Sujeto a póliza'),

  // ── Trabajo 💼
  p('trabajo', 'CV (IA / ATS)', 249, 'por CV', 399, 'Optimizado para filtros ATS'),
  p('trabajo', 'Certificado de estudios', 690, 'por certificado', 890),

  // ── Marketing & Diseño 🎨
  // El PDF lista el departamento pero no sus productos: propuesta inicial, editable.
  p('marketing', 'Diseño de logotipo', 1290, 'por proyecto', 1900),
  p('marketing', 'Manejo de redes sociales', 2900, 'mensual', 3900),
  p('marketing', 'Flyers y banners', 390, 'por pieza', 550),
  p('marketing', 'Landing page', 4900, 'por proyecto', 6900),

  // ── Otros ✨
  p('otros', 'Telmex', 389, 'mensual', 499),
  p('otros', 'Membresía Sam’s', 650, 'anual', 850),
]

export const byDept = (slug: string) => products.filter((x) => x.dept === slug)

export const deptOf = (slug: string) => departments.find((d) => d.slug === slug)

export const mxn = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(n)

export const discountPct = (x: Product) =>
  x.compareAt ? Math.round((1 - x.price / x.compareAt) * 100) : 0
