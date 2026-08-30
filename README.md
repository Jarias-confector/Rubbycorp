<div align="center">
  <img src="public/brand/rubby-mark.png" width="110" alt="Rubby Corp">
  <h1>Rubby Corp</h1>
  <p><em>Oportunidades que están al alcance de todos.</em></p>
</div>

Sitio web de Rubby Corp construido a partir del brief `PROYECTO_PAGINA_WEB`. Incluye tienda por
departamentos, carrito, monedero con recargas, centro de soporte y catálogo de descuentos.

Aplicación de una sola página (SPA) con React 19, TypeScript, Vite 7 y Tailwind CSS 4. No requiere
servidor: el estado vive en `localStorage`, así que se publica gratis como sitio estático.

---

## Arrancar en local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run preview  # sirve dist/ en http://localhost:4173
```

Requiere Node 20 o superior.

## Cuenta de demostración

| Campo | Valor |
| --- | --- |
| Correo | `rubby.corp.oficial@gmail.com` |
| Contraseña | `rubby2017` |
| Rol | `asesor` |

El rol `asesor` habilita los paneles de administración: abonar saldo manualmente al monedero,
cambiar el estado de los tickets de soporte y el panel de ventas con la auditoría de costos de
proveedor. Las cuentas nuevas se registran como
`cliente`.

---

## Módulos

### Inicio
Portada con el texto de bienvenida del brief, los tres pilares de la marca (variedad y ahorro;
fácil, rápido y seguro; todo en línea), los 12 departamentos y las seis ofertas con mayor descuento
calculado.

### Tienda
Los 12 departamentos del brief, cada uno con sus productos y servicios y su botón de agregar al
carrito. Sin filtro activo la vista se agrupa por área; con filtro o búsqueda pasa a rejilla plana.
Buscador por nombre de producto o de departamento.

### Carrito
Ajuste de cantidades, subtotal, ahorro acumulado por descuentos y pago contra el saldo del
monedero. Al confirmar se genera un pedido y su movimiento correspondiente.

### Mi perfil
Detalles de la cuenta —nombre, apellidos, nombre visible, correo, WhatsApp— siguiendo el formulario
del brief, más el historial de pedidos y un botón para borrar los datos locales.

### Monedero
- Datos bancarios para recargar, cada campo copiable con un toque.
- Botón directo a WhatsApp **998 103 0007** para pedir la recarga a un asesor.
- Panel de asesor para abonar saldo manualmente al monedero del usuario.
- **Movimientos** con fecha, concepto y monto, filtrables por tipo, rango de fechas y búsqueda.

### Soporte
Centro de soporte con contadores por estado (total, pendientes, en revisión, solucionados),
formulario de nuevo reporte —producto, asunto, descripción detallada y hasta 3 imágenes— y lista de
tickets con filtros, búsqueda, comentarios y seguimiento.

### Panel de ventas (rol `asesor`)
Ruta `/ventas`, sólo visible con rol `asesor`. Reúne el resultado comercial y la comprobación de
costos que el catálogo por sí solo no permite hacer:

- **Resultado**: pedidos, ingresos, utilidad y margen, calculados contra los costos de proveedor
  conocidos. Las partidas sin costo se excluyen del cálculo y se cuentan aparte.
- **Comprobación de costos**: cobertura, servicios con problema y margen mínimo configurable.
- **Tabla precio de venta contra costo del proveedor**: los 54 servicios con su costo, utilidad,
  margen y una bandera —correcto, margen bajo, sin margen, pérdida o sin costo—, con filtros por
  estado, departamento y búsqueda, y captura o corrección del costo en la misma fila.
- **Sincronización**: importa costos en el formato del conector de proveedores y copia los actuales.
- **Pedidos**: utilidad por pedido y cambio de estado (en proceso, completado, cancelado).

Los costos de proveedor y su formato de intercambio están documentados en
[`docs/costos-proveedor.md`](docs/costos-proveedor.md).

### Catálogo de descuentos
Todos los departamentos con sus productos, precios y porcentaje de descuento, con índice rápido.

---

## Marca

El logotipo se extrajo del PDF del brief y se limpió a fondo transparente
(`public/brand/rubby-logo.png` y `rubby-mark.png`).

| Token | Hex | Uso |
| --- | --- | --- |
| `wine` | `#671915` | Superficies oscuras, nav activa, footer |
| `rose` | `#b5435a` | Punto medio de los degradados rubí |
| `magenta` | `#fb0b77` | Acento, descuentos, foco |
| `gold` | `#a26604` | Acento secundario, "Corp", CTA alterno |
| `blush` | `#c18796` | Detalles suaves, bordes, eyebrows |
| `cream` | `#f9f3f3` | Superficie clara, campos, chips |

Tipografía: **Fraunces** para display y **Plus Jakarta Sans** para interfaz, ambas de Google Fonts.
Los tokens viven en `src/index.css` bajo `@theme`.

---

## Publicar gratis

El repositorio trae la configuración de las tres opciones sin costo. Elige una:

### GitHub Pages
`.github/workflows/deploy.yml` compila y publica en cada push. Actívalo una vez en
**Settings → Pages → Source: GitHub Actions**. El workflow inyecta `VITE_BASE=/<repo>/` para que las
rutas resuelvan bajo el subdirectorio y copia `index.html` a `404.html` para que las rutas directas
funcionen.

### Netlify
`netlify.toml` ya define build, carpeta de publicación y el redirect de SPA. Conecta el
repositorio y despliega.

### Vercel
`vercel.json` define el framework, el build y los rewrites. Importa el repositorio y despliega.

---

## Personalizar antes de publicar

| Qué | Dónde |
| --- | --- |
| Precios, productos y departamentos | `src/data/catalog.ts` |
| Costos de proveedor y margen mínimo | `src/data/providerCosts.ts` |
| Datos bancarios, WhatsApp y correo | `src/data/company.ts` |
| Colores y tipografías | `src/index.css` (bloque `@theme`) |
| Logotipo y favicon | `public/brand/` y `public/favicon.png` |

Los **datos bancarios de `src/data/company.ts` son de ejemplo** y deben sustituirse por los reales
antes de publicar. Los precios son de referencia: el brief no incluía lista de precios.

## Alcance actual

Todo el estado —cuentas, saldo, pedidos y tickets— se guarda en el `localStorage` del navegador. Es
suficiente para operar la demo y validar los flujos completos, pero los datos no se comparten entre
dispositivos ni entre el cliente y el asesor. Para producción real, el siguiente paso es mover el
estado a un backend; la capa de datos está aislada en `src/lib/store.tsx` para facilitar ese cambio.

## Estructura

```
src/
├─ components/   Layout, iconos hairline, primitivas de UI
├─ data/         catalog.ts (12 departamentos), providerCosts.ts, company.ts
├─ lib/          store.tsx (estado global + persistencia)
├─ pages/        Home, Tienda, Carrito, Catalogo, Monedero, Soporte, Ventas, Perfil, Acceder
└─ index.css     Tokens de marca y capa de componentes
```
