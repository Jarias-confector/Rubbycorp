# Costos de proveedor y comprobación de márgenes

El catálogo (`src/data/catalog.ts`) sólo guarda el **precio de venta al público**. Para saber si un
servicio deja utilidad hace falta el otro lado de la operación: **lo que cobra el proveedor**. Ese
dato vive en `src/data/providerCosts.ts` y se audita desde el **panel de ventas** (`/ventas`, visible
sólo con rol `asesor`).

## Qué comprueba el panel

Por cada servicio compara `price` contra `cost` y lo marca:

| Bandera | Cuándo aparece |
| --- | --- |
| `Correcto` | El margen alcanza o supera el mínimo configurado (25 % por omisión). |
| `Margen bajo` | Hay utilidad, pero por debajo del mínimo. |
| `Sin margen` | El precio de venta es exactamente el costo. |
| `Pérdida` | El proveedor cobra **más** que el precio de venta. |
| `Costo inválido` | El costo capturado no es un monto válido. |
| `Sin costo` | No hay costo registrado: no se puede comprobar nada. |

El mínimo de margen se ajusta desde el mismo panel y se guarda con el resto del estado.

Los servicios marcados como cotización (`quote: true`) se auditan contra su precio de referencia; el
precio real lo fija el asesor al cotizar, así que su bandera es orientativa.

## Las tres formas de cargar costos

### 1. Commitear costos confirmados

Agrega los renglones a `seedProviderCosts` en `src/data/providerCosts.ts`:

```ts
export const seedProviderCosts: ProviderCost[] = [
  {
    productId: 'suscripciones-netflix-premium',
    provider: 'Distribuidor mayorista',
    cost: 74,
    updatedAt: '2026-08-30T00:00:00.000Z',
    source: 'catalogo',
  },
]
```

El `productId` es el que genera el catálogo: departamento + nombre en minúsculas con guiones
(`suscripciones-netflix-premium`, `tramites-actas-actualizadas`, …).

### 2. Capturar a mano en el panel

En **Ventas → Precio de venta contra costo del proveedor**, cada renglón tiene *Registrar costo* /
*Corregir costo*. Queda guardado en el navegador junto con el resto del estado de la app.

### 3. Importar desde el conector de proveedores (MCP)

El panel acepta, pegado en **Ventas → Sincronización**, el JSON del conector `Rubby_Company` — o
cualquier lista con el mismo formato:

```json
{
  "costs": [
    { "productId": "suscripciones-netflix-premium", "provider": "Distribuidor X", "cost": 74 },
    { "productId": "tramites-actas-actualizadas", "provider": "Gestoría Y", "cost": 95, "note": "Incluye envío" }
  ]
}
```

También se acepta el arreglo pelón, sin el objeto que lo envuelve. Cada renglón necesita
`productId`, `provider` y `cost`; `note` es opcional. Los renglones con un `productId` que no existe
en el catálogo, o con un `cost` que no es número, se descartan y el panel explica cuál y por qué.

El botón *Copiar costos actuales* devuelve el mismo formato, para regresar los costos al conector o
pegarlos en `seedProviderCosts`.

## Estado del conector `Rubby_Company`

El servidor MCP `Rubby_Company` está declarado en el entorno pero **sin autorizar**, así que sus
herramientas no se pueden llamar todavía y la sincronización automática no está disponible. Para
habilitarla:

1. Autoriza el conector desde una sesión interactiva (`/mcp`, o los ajustes de conectores de
   claude.ai si es un conector de claude.ai). El flujo OAuth no se puede completar desde una sesión
   automatizada.
2. Con el conector autorizado, pide la lista de costos y pégala en el panel — el formato de arriba es
   el contrato.
3. Si el conector entrega otro formato, el único punto a tocar es `parseCostImport()` en
   `src/data/providerCosts.ts`: ahí se traduce el JSON entrante a `ProviderCost[]`.

Mientras tanto, las opciones 1 y 2 dejan el panel plenamente operativo.
