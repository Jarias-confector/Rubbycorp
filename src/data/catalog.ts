export type Department = {
  slug: string
  name: string
  emoji: string
  tagline: string
}

export type QuestionType = 'texto' | 'parrafo' | 'numero' | 'fecha' | 'opciones'

/** Pregunta que el cliente responde al pedir una cotización. */
export type Question = {
  id: string
  label: string
  type: QuestionType
  required?: boolean
  placeholder?: string
  /** Solo para type: 'opciones'. */
  options?: string[]
}

export type Product = {
  id: string
  name: string
  dept: string
  price: number
  compareAt?: number
  unit: string
  note?: string
  /** true = no se vende con precio fijo: se pide cotización antes de pagar. */
  quote?: boolean
  /** Preguntas propias del producto. Si falta, se usa el preset del departamento. */
  questions?: Question[]
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
  extra?: Pick<Product, 'quote' | 'questions'>,
): Product => ({
  id: `${dept}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
  name,
  dept,
  price,
  compareAt,
  unit,
  note,
  ...extra,
})

const q = (
  id: string,
  label: string,
  type: QuestionType = 'texto',
  extra?: Omit<Question, 'id' | 'label' | 'type'>,
): Question => ({ id, label, type, ...extra })

/**
 * Presets de preguntas por departamento.
 * Antes toda cotización usaba el formulario de envío; ahora cada área pregunta lo suyo
 * y cada producto puede sobrescribirlo (catálogo o panel de asesor).
 */
export const deptQuestions: Record<string, Question[]> = {
  importaciones: [
    q('link', 'Liga del producto (Amazon, eBay, tienda…)', 'texto', { required: true, placeholder: 'https://' }),
    q('detalle', 'Modelo, color, talla o variante', 'texto', { required: true }),
    q('piezas', 'Piezas', 'numero', { required: true, placeholder: '1' }),
    q('direccion', 'Dirección de entrega en México', 'parrafo', { required: true }),
    q('cp', 'Código postal', 'texto', { required: true }),
    q('seguro', '¿Agregar seguro de envío?', 'opciones', { options: ['Sí', 'No'], required: true }),
  ],
  viajes: [
    q('origen', 'Ciudad de origen', 'texto', { required: true }),
    q('destino', 'Destino', 'texto', { required: true }),
    q('salida', 'Fecha de salida', 'fecha', { required: true }),
    q('regreso', 'Fecha de regreso', 'fecha'),
    q('pasajeros', 'Número de pasajeros', 'numero', { required: true, placeholder: '2' }),
    q('presupuesto', 'Presupuesto aproximado por persona', 'texto'),
  ],
  tramites: [
    q('titular', 'Nombre completo del titular', 'texto', { required: true }),
    q('curp', 'CURP o NSS', 'texto'),
    q('estado', 'Estado y municipio del trámite', 'texto', { required: true }),
    q('urgencia', '¿Qué tan urgente es?', 'opciones', { options: ['Normal', 'Urgente (24-48 h)'], required: true }),
  ],
  justificantes: [
    q('paciente', 'Nombre del paciente', 'texto', { required: true }),
    q('fechas', 'Fechas que debe cubrir el documento', 'texto', { required: true }),
    q('motivo', 'Motivo o padecimiento', 'parrafo', { required: true }),
    q('institucion', 'Institución que lo solicita', 'texto' ),
  ],
  conductores: [
    q('vehiculo', 'Marca, modelo y año del vehículo', 'texto', { required: true }),
    q('uso', 'Uso del vehículo', 'opciones', { options: ['Particular', 'Plataforma (Uber/DiDi)', 'Carga'], required: true }),
    q('cobertura', 'Cobertura deseada', 'opciones', { options: ['Amplia', 'Limitada', 'Responsabilidad civil'] }),
    q('cp', 'Código postal donde circula', 'texto', { required: true }),
  ],
  marketing: [
    q('marca', 'Nombre de la marca o negocio', 'texto', { required: true }),
    q('objetivo', '¿Qué necesitas lograr?', 'parrafo', { required: true }),
    q('referencias', 'Referencias o estilo que te gusta', 'parrafo'),
    q('entrega', 'Fecha de entrega deseada', 'fecha'),
    q('presupuesto', 'Presupuesto aproximado', 'texto'),
  ],
  trabajo: [
    q('puesto', 'Puesto o vacante objetivo', 'texto', { required: true }),
    q('experiencia', 'Años de experiencia', 'numero'),
    q('detalle', 'Datos que debemos incluir', 'parrafo', { required: true }),
  ],
}

/** Preguntas genéricas para cualquier producto que no tenga preset ni propias. */
export const genericQuestions: Question[] = [
  q('detalle', '¿Qué necesitas exactamente?', 'parrafo', { required: true }),
  q('fecha', '¿Para cuándo lo necesitas?', 'fecha'),
  q('contacto', 'WhatsApp de contacto', 'texto', { required: true }),
]

/** Preguntas por defecto de un producto: propias → preset del departamento → genéricas. */
export const defaultQuestions = (x: Product): Question[] =>
  x.questions ?? deptQuestions[x.dept] ?? genericQuestions

/**
 * Catálogo tomado del "Catálogo de descuentos" (pág. 9 del PDF).
 * Los precios son de referencia y se editan en este archivo: el PDF no incluye lista de precios.
 */
export const products: Product[] = [
  // ── Viajes ✈️
  p('viajes', 'Vuelos', 1890, 'por trayecto', 2350, 'Nacionales e internacionales', {
    quote: true,
    questions: [
      q('origen', 'Ciudad o aeropuerto de origen', 'texto', { required: true }),
      q('destino', 'Ciudad o aeropuerto de destino', 'texto', { required: true }),
      q('viaje', 'Tipo de viaje', 'opciones', {
        options: ['Sencillo', 'Redondo', 'Multidestino'],
        required: true,
      }),
      q('salida', 'Fecha de salida', 'fecha', { required: true }),
      q('regreso', 'Fecha de regreso (si es redondo)', 'fecha'),
      q('adultos', 'Adultos', 'numero', { required: true, placeholder: '1' }),
      q('menores', 'Menores', 'numero', { placeholder: '0' }),
      q('clase', 'Clase', 'opciones', { options: ['Turista', 'Premium', 'Ejecutiva'] }),
      q('equipaje', 'Equipaje documentado', 'opciones', {
        options: ['Solo equipaje de mano', '1 maleta', '2 o más maletas'],
      }),
      q('flexible', '¿Tus fechas son flexibles?', 'opciones', { options: ['Sí, ±3 días', 'No'] }),
    ],
  }),
  p('viajes', 'Hoteles', 1150, 'por noche', 1490, undefined, {
    quote: true,
    questions: [
      q('destino', 'Ciudad y zona donde quieres hospedarte', 'texto', { required: true }),
      q('entrada', 'Fecha de entrada', 'fecha', { required: true }),
      q('salida', 'Fecha de salida', 'fecha', { required: true }),
      q('adultos', 'Adultos', 'numero', { required: true, placeholder: '2' }),
      q('menores', 'Menores y sus edades', 'texto'),
      q('habitaciones', 'Habitaciones', 'numero', { required: true, placeholder: '1' }),
      q('categoria', 'Categoría', 'opciones', { options: ['3 estrellas', '4 estrellas', '5 estrellas', 'Boutique'] }),
      q('plan', 'Plan', 'opciones', {
        options: ['Solo hospedaje', 'Con desayuno', 'Todo incluido'],
        required: true,
      }),
      q('hotel', '¿Algún hotel en particular?', 'texto'),
    ],
  }),
  p('viajes', 'Cruceros', 9800, 'por persona', 12500, undefined, {
    quote: true,
    questions: [
      q('puerto', 'Puerto de salida preferido', 'texto', { required: true }),
      q('itinerario', 'Destino o itinerario que te interesa', 'texto', { required: true }),
      q('naviera', 'Naviera preferida', 'texto'),
      q('salida', 'Fecha aproximada de salida', 'fecha', { required: true }),
      q('noches', 'Noches de crucero', 'numero', { placeholder: '7' }),
      q('pasajeros', 'Pasajeros (adultos y menores)', 'texto', { required: true }),
      q('camarote', 'Tipo de camarote', 'opciones', {
        options: ['Interior', 'Vista al mar', 'Balcón', 'Suite'],
        required: true,
      }),
      q('vuelo', '¿Necesitas vuelo al puerto?', 'opciones', { options: ['Sí', 'No'] }),
    ],
  }),
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
  p('importaciones', 'Celulares E.U.A', 4900, 'por equipo', undefined, 'Cotización previa por modelo', {
    quote: true,
    questions: [
      q('modelo', 'Marca y modelo exacto', 'texto', { required: true, placeholder: 'iPhone 16 Pro' }),
      q('almacenamiento', 'Almacenamiento', 'opciones', {
        options: ['128 GB', '256 GB', '512 GB', '1 TB'],
        required: true,
      }),
      q('color', 'Color', 'texto'),
      q('condicion', 'Condición', 'opciones', {
        options: ['Nuevo sellado', 'Reacondicionado'],
        required: true,
      }),
      q('liberado', '¿Liberado para cualquier compañía?', 'opciones', {
        options: ['Sí', 'No importa'],
        required: true,
      }),
      q('piezas', 'Piezas', 'numero', { required: true, placeholder: '1' }),
      q('liga', 'Liga de referencia (si tienes una)', 'texto', { placeholder: 'https://' }),
      q('entrega', 'Ciudad y código postal de entrega', 'texto', { required: true }),
    ],
  }),
  p('importaciones', 'Productos E.U.A', 350, 'por pedido', undefined, 'Se suma costo del artículo', {
    quote: true,
    questions: [
      q('liga', 'Liga del producto (Amazon, eBay, tienda…)', 'texto', {
        required: true,
        placeholder: 'https://',
      }),
      q('detalle', 'Modelo, color, talla o variante', 'texto', { required: true }),
      q('piezas', 'Piezas', 'numero', { required: true, placeholder: '1' }),
      q('precio', 'Precio publicado en USD', 'texto', { placeholder: '89.99' }),
      q('peso', 'Peso o tamaño aproximado', 'texto'),
      q('direccion', 'Dirección de entrega en México', 'parrafo', { required: true }),
      q('cp', 'Código postal', 'texto', { required: true }),
      q('seguro', '¿Agregar seguro de envío?', 'opciones', { options: ['Sí', 'No'], required: true }),
    ],
  }),

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
  p('conductores', 'Seguro de autos', 3900, 'anual', 5400, undefined, {
    quote: true,
    questions: [
      q('vehiculo', 'Marca, modelo, versión y año', 'texto', { required: true }),
      q('uso', 'Uso del vehículo', 'opciones', {
        options: ['Particular', 'Plataforma (Uber/DiDi)', 'Carga o reparto'],
        required: true,
      }),
      q('cobertura', 'Cobertura deseada', 'opciones', {
        options: ['Amplia', 'Limitada', 'Responsabilidad civil'],
        required: true,
      }),
      q('cp', 'Código postal donde circula', 'texto', { required: true }),
      q('edad', 'Edad del conductor principal', 'numero', { required: true }),
      q('siniestros', 'Siniestros en los últimos 12 meses', 'opciones', {
        options: ['Ninguno', '1', '2 o más'],
      }),
      q('aseguradora', 'Aseguradora actual y fecha de vencimiento', 'texto'),
      q('forma', 'Forma de pago preferida', 'opciones', {
        options: ['Anual', 'Semestral', 'Mensual'],
      }),
    ],
  }),
  p('conductores', 'Deducible autos', 2500, 'por siniestro', undefined, 'Sujeto a póliza'),

  // ── Trabajo 💼
  p('trabajo', 'CV (IA / ATS)', 249, 'por CV', 399, 'Optimizado para filtros ATS'),
  p('trabajo', 'Certificado de estudios', 690, 'por certificado', 890),

  // ── Marketing & Diseño 🎨
  // El PDF lista el departamento pero no sus productos: propuesta inicial, editable.
  p('marketing', 'Diseño de logotipo', 1290, 'por proyecto', 1900, undefined, {
    quote: true,
    questions: [
      q('marca', 'Nombre exacto de la marca', 'texto', { required: true }),
      q('giro', 'Giro del negocio', 'texto', { required: true }),
      q('estilo', 'Estilo que buscas', 'opciones', {
        options: ['Minimalista', 'Clásico', 'Divertido', 'Elegante', 'Aún no lo sé'],
        required: true,
      }),
      q('colores', 'Colores que quieres o que debemos evitar', 'texto'),
      q('referencias', 'Logotipos que te gustan (ligas o descripción)', 'parrafo'),
      q('entregables', 'Entregables', 'opciones', {
        options: ['Solo logotipo', 'Logotipo + versiones', 'Logotipo + manual de marca'],
        required: true,
      }),
      q('entrega', 'Fecha de entrega deseada', 'fecha'),
    ],
  }),
  p('marketing', 'Manejo de redes sociales', 2900, 'mensual', 3900, undefined, {
    quote: true,
    questions: [
      q('marca', 'Nombre de la marca o negocio', 'texto', { required: true }),
      q('redes', '¿Qué redes quieres manejar?', 'texto', {
        required: true,
        placeholder: 'Facebook, Instagram, TikTok…',
      }),
      q('publicaciones', 'Publicaciones por semana', 'numero', { required: true, placeholder: '3' }),
      q('contenido', '¿Quién produce el contenido?', 'opciones', {
        options: ['Nosotros lo producimos', 'Yo envío fotos y videos', 'Mixto'],
        required: true,
      }),
      q('objetivo', 'Objetivo principal', 'opciones', {
        options: ['Más seguidores', 'Ventas', 'Posicionamiento', 'Atención a clientes'],
        required: true,
      }),
      q('pauta', 'Presupuesto mensual para pauta publicitaria', 'texto'),
      q('inicio', 'Fecha de inicio', 'fecha'),
    ],
  }),
  p('marketing', 'Flyers y banners', 390, 'por pieza', 550),
  p('marketing', 'Landing page', 4900, 'por proyecto', 6900, undefined, {
    quote: true,
    questions: [
      q('negocio', 'Negocio o producto a promocionar', 'texto', { required: true }),
      q('objetivo', 'Objetivo de la página', 'opciones', {
        options: ['Captar prospectos', 'Vender en línea', 'Agendar citas', 'Solo informativa'],
        required: true,
      }),
      q('secciones', 'Secciones que debe llevar', 'parrafo', { required: true }),
      q('dominio', '¿Ya tienes dominio y hosting?', 'opciones', {
        options: ['Sí', 'No, lo necesito'],
        required: true,
      }),
      q('contenido', '¿Tienes textos e imágenes listos?', 'opciones', {
        options: ['Sí', 'Parcialmente', 'No, los necesito'],
        required: true,
      }),
      q('integraciones', 'Integraciones necesarias', 'texto', {
        placeholder: 'WhatsApp, pagos, formularios, analytics…',
      }),
      q('entrega', 'Fecha de entrega deseada', 'fecha'),
    ],
  }),

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


/** Precio que suma al carrito: los productos de cotización no cobran hasta que el asesor confirma. */
export const chargeOf = (x: Product) => (x.quote ? 0 : x.price)
