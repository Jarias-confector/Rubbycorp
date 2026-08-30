import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { departments, deptOf, mxn, products } from "../data/catalog";
import {
  flagLabel,
  isProblem,
  parseCostImport,
  summarizeAudits,
  type CostAudit,
  type CostFlag,
} from "../data/providerCosts";
import {
  Empty,
  Reveal,
  SectionHead,
  StatTile,
  useToast,
} from "../components/ui";
import {
  IconCheck,
  IconDoc,
  IconSearch,
  IconShield,
  IconTrash,
} from "../components/Icons";

const pct = (n: number) => `${Math.round(n * 100)}%`;

const flagTone: Record<CostFlag, string> = {
  ok: "bg-ok/10 text-ok ring-ok/30",
  bajo: "bg-gold/10 text-gold ring-gold/30",
  "sin-margen": "bg-gold/10 text-gold ring-gold/30",
  perdida: "bg-bad/10 text-bad ring-bad/30",
  invalido: "bg-bad/10 text-bad ring-bad/30",
  "sin-costo": "bg-cream text-ink-faint ring-line",
};

function Flag({ flag }: { flag: CostFlag }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ring-1 ${flagTone[flag]}`}
    >
      {flagLabel[flag]}
    </span>
  );
}

type Filter = "todos" | "problemas" | "sin-costo" | "ok";

const filters: { id: Filter; label: string }[] = [
  { id: "problemas", label: "Con problema" },
  { id: "sin-costo", label: "Sin costo" },
  { id: "ok", label: "Correctos" },
  { id: "todos", label: "Todos" },
];

/** Renglón de la tabla de auditoría, con captura del costo del proveedor. */
function CostRow({
  audit,
  onSave,
  onClear,
}: {
  audit: CostAudit;
  onSave: (provider: string, cost: number) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState(audit.cost?.provider ?? "");
  const [cost, setCost] = useState(audit.cost ? String(audit.cost.cost) : "");

  const dept = deptOf(audit.product.dept);
  const problema = isProblem(audit.flag);

  const guardar = () => {
    onSave(provider.trim(), Number(cost));
    setOpen(false);
  };

  return (
    <tr className="border-t border-line align-middle transition-colors hover:bg-cream/40">
      <td className="px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-[0.85rem] font-semibold text-ink">
          {audit.product.name}
          {audit.product.quote && (
            <span
              className="rounded-full bg-blush/20 px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wide text-wine uppercase"
              title="Precio de referencia: la cotización final la fija el asesor"
            >
              Cot.
            </span>
          )}
        </p>
        <p className="mt-0.5 text-[0.7rem] text-ink-faint">
          {dept?.emoji} {dept?.name} · {audit.product.unit}
        </p>
        {problema && (
          <p className="mt-1 text-[0.7rem] leading-snug text-bad">
            {audit.detail}
          </p>
        )}
      </td>

      <td className="px-3 py-2.5 text-[0.8rem] text-ink-soft">
        {open ? (
          <input
            className="field !px-3 !py-2 !text-[0.8rem]"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && guardar()}
            placeholder="Proveedor"
            aria-label={`Proveedor de ${audit.product.name}`}
          />
        ) : (
          (audit.cost?.provider ?? "—")
        )}
      </td>

      <td className="px-3 py-2.5 text-right text-[0.8rem] whitespace-nowrap text-ink">
        {mxn(audit.price)}
      </td>

      <td className="px-3 py-2.5 text-right text-[0.8rem] whitespace-nowrap text-ink">
        {open ? (
          <input
            className="field !w-28 !px-3 !py-2 !text-right !text-[0.8rem]"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && guardar()}
            placeholder="Costo"
            aria-label={`Costo de proveedor de ${audit.product.name}`}
          />
        ) : audit.cost ? (
          mxn(audit.cost.cost)
        ) : (
          "—"
        )}
      </td>

      <td
        className={`px-3 py-2.5 text-right text-[0.8rem] whitespace-nowrap ${
          audit.margin !== undefined && audit.margin < 0
            ? "text-bad"
            : "text-ink"
        }`}
      >
        {audit.margin === undefined ? "—" : mxn(audit.margin)}
      </td>

      <td className="px-3 py-2.5 text-right text-[0.8rem] font-semibold whitespace-nowrap text-ink">
        {audit.marginPct === undefined ? "—" : pct(audit.marginPct)}
      </td>

      <td className="px-3 py-2.5">
        <Flag flag={audit.flag} />
      </td>

      <td className="px-3 py-2.5">
        <div className="flex justify-end gap-1.5 whitespace-nowrap">
          {open ? (
            <>
              <button
                type="button"
                className="btn-primary !px-3.5 !py-1.5 !text-[0.75rem]"
                onClick={guardar}
              >
                Guardar
              </button>
              <button
                type="button"
                className="btn-soft !px-3 !py-1.5 !text-[0.75rem]"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-soft !px-3.5 !py-1.5 !text-[0.75rem]"
                onClick={() => setOpen(true)}
              >
                {audit.cost ? "Corregir" : "Registrar"}
              </button>
              {audit.cost && (
                <button
                  type="button"
                  className="btn-ghost !px-2.5 !py-1.5 !text-[0.75rem]"
                  onClick={onClear}
                  aria-label={`Borrar el costo de ${audit.product.name}`}
                  title="Borrar costo"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function Ventas() {
  const {
    user,
    audits,
    marginTarget,
    setMarginTarget,
    setProviderCost,
    removeProviderCost,
    importProviderCosts,
    providerCosts,
    orders,
    setOrderStatus,
    sales,
  } = useStore();
  const { show, node } = useToast();

  const [filter, setFilter] = useState<Filter>("problemas");
  const [dept, setDept] = useState("");
  const [query, setQuery] = useState("");
  const [paste, setPaste] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const resumen = useMemo(() => summarizeAudits(audits), [audits]);

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return audits.filter((a) => {
      if (dept && a.product.dept !== dept) return false;
      if (filter === "problemas" && !isProblem(a.flag)) return false;
      if (filter === "sin-costo" && a.flag !== "sin-costo") return false;
      if (filter === "ok" && a.flag !== "ok") return false;
      if (q && !a.product.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [audits, filter, dept, query]);

  if (user?.role !== "asesor") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
        <Empty
          icon={<IconShield className="h-6 w-6" />}
          title="Panel sólo para asesores"
          sub="El panel de ventas muestra costos de proveedor y utilidades. Entra con una cuenta con rol de asesor para consultarlo."
          action={
            <Link to="/acceder" className="btn-primary">
              Acceder como asesor
            </Link>
          }
        />
      </div>
    );
  }

  const exportar = () => {
    const payload = JSON.stringify(
      {
        generado: new Date().toISOString(),
        costs: Object.values(providerCosts),
      },
      null,
      2,
    );
    navigator.clipboard?.writeText(payload).then(
      () => show("Costos copiados al portapapeles"),
      () =>
        show("No se pudo copiar; revisa los permisos del navegador.", "bad"),
    );
  };

  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-12 sm:px-6 sm:py-16">
      {node}

      <Reveal>
        <SectionHead
          eyebrow="Panel de asesor"
          title="Panel de ventas"
          sub="Qué se vendió, cuánto cobró el proveedor y si cada servicio deja la utilidad esperada."
        />
      </Reveal>

      {/* ── Resultado de ventas ────────────────────────────────────────── */}
      <Reveal delay={60}>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Pedidos"
            value={sales.pedidos}
            sub="Sin contar cancelados"
          />
          <StatTile label="Ingresos" value={mxn(sales.ingresos)} tone="gold" />
          <StatTile
            label="Utilidad"
            value={mxn(sales.utilidad)}
            sub="Sólo partidas con costo registrado"
            tone="plain"
          />
          <StatTile
            label="Margen"
            value={sales.costo > 0 ? pct(sales.margen) : "—"}
            sub={
              sales.partidasSinCosto > 0
                ? `${sales.partidasSinCosto} partidas sin costo quedan fuera`
                : "Todas las partidas tienen costo"
            }
            tone="plain"
          />
        </div>
      </Reveal>

      {/* ── Estado de la comprobación ─────────────────────────────────── */}
      <Reveal delay={90}>
        <section className="card mt-6 p-6">
          <h2 className="text-xl text-ink">Comprobación de costos</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-cream/50 p-4 ring-1 ring-line">
              <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                Cobertura
              </p>
              <p className="mt-1 font-display text-2xl text-ink">
                {pct(resumen.cobertura)}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                {resumen.conCosto} de {resumen.total} servicios con costo
              </p>
            </div>
            <div className="rounded-2xl bg-cream/50 p-4 ring-1 ring-line">
              <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                Con problema
              </p>
              <p className="mt-1 font-display text-2xl text-bad">
                {resumen.problemas}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                {resumen.porFlag.perdida} en pérdida · {resumen.porFlag.bajo}{" "}
                margen bajo
              </p>
            </div>
            <div className="rounded-2xl bg-cream/50 p-4 ring-1 ring-line">
              <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                Correctos
              </p>
              <p className="mt-1 font-display text-2xl text-ok">
                {resumen.porFlag.ok}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                Al menos {pct(marginTarget)} de margen
              </p>
            </div>
            <div className="rounded-2xl bg-cream/50 p-4 ring-1 ring-line">
              <label
                className="text-[0.7rem] font-semibold tracking-[0.14em] text-ink-faint uppercase"
                htmlFor="umbral"
              >
                Margen mínimo
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="umbral"
                  type="number"
                  min="0"
                  max="95"
                  step="1"
                  className="field !py-2"
                  value={Math.round(marginTarget * 100)}
                  onChange={(e) =>
                    setMarginTarget(Number(e.target.value) / 100)
                  }
                />
                <span className="text-sm text-ink-soft">%</span>
              </div>
            </div>
          </div>

          {resumen.conCosto === 0 && (
            <p className="mt-5 rounded-2xl bg-gold/10 p-4 text-sm leading-relaxed text-ink ring-1 ring-gold/30">
              <strong>Todavía no se puede comprobar nada.</strong> El catálogo
              sólo guarda precios de venta; ningún servicio tiene registrado lo
              que cobra el proveedor. Captura los costos abajo, pégalos en
              bloque desde el conector de proveedores, o commitéalos en{" "}
              <code className="font-mono text-[0.85em]">
                src/data/providerCosts.ts
              </code>
              . En cuanto haya costos, esta pantalla marca cada servicio como
              correcto, de margen bajo o en pérdida.
            </p>
          )}
        </section>
      </Reveal>

      {/* ── Sincronización con el proveedor ───────────────────────────── */}
      <Reveal delay={120}>
        <section className="card mt-6 p-6">
          <span className="eyebrow bg-blush/20 text-wine ring-1 ring-blush/40">
            Sincronización
          </span>
          <h2 className="mt-4 flex items-center gap-2 text-xl text-ink">
            <IconDoc className="h-5 w-5 text-wine" /> Costos desde el conector
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Pega aquí la respuesta del conector de proveedores (MCP{" "}
            <strong>Rubby_Company</strong>) o cualquier lista con el mismo
            formato. Se aceptan un arreglo o un objeto con la llave{" "}
            <code className="font-mono text-[0.85em]">costs</code>, y cada
            renglón necesita{" "}
            <code className="font-mono text-[0.85em]">productId</code>,{" "}
            <code className="font-mono text-[0.85em]">provider</code> y{" "}
            <code className="font-mono text-[0.85em]">cost</code>.
          </p>
          <textarea
            className="field mt-4 min-h-32 font-mono text-xs"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder={
              '[{ "productId": "suscripciones-netflix-premium", "provider": "Distribuidor X", "cost": 74 }]'
            }
            aria-label="JSON de costos de proveedor"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary !px-5 !py-2.5 !text-[0.82rem]"
              onClick={() => {
                const known = new Set(products.map((x) => x.id));
                const { costs, errors: errs } = parseCostImport(paste, known);
                setErrors(errs);
                if (costs.length === 0) {
                  show("No se importó ningún costo.", "bad");
                  return;
                }
                importProviderCosts(costs);
                setPaste("");
                show(`Se importaron ${costs.length} costos`);
              }}
            >
              Importar costos
            </button>
            <button
              type="button"
              className="btn-soft !px-5 !py-2.5 !text-[0.82rem]"
              onClick={exportar}
            >
              Copiar costos actuales
            </button>
          </div>
          {errors.length > 0 && (
            <ul className="mt-4 space-y-1 rounded-2xl bg-bad/5 p-4 text-xs text-bad ring-1 ring-bad/20">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </section>
      </Reveal>

      {/* ── Auditoría por servicio ────────────────────────────────────── */}
      <Reveal delay={150}>
        <section className="card mt-6 p-6">
          <h2 className="text-xl text-ink">
            Precio de venta contra costo del proveedor
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`chip ${filter === f.id ? "chip-on" : "chip-off"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_14rem]">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                className="field !pl-11"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar servicio"
                aria-label="Buscar servicio"
              />
            </div>
            <select
              className="field"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              aria-label="Filtrar por departamento"
            >
              <option value="">Todos los departamentos</option>
              {departments.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.emoji} {d.name}
                </option>
              ))}
            </select>
          </div>

          {visibles.length === 0 ? (
            <div className="mt-6">
              <Empty
                icon={<IconCheck className="h-6 w-6" />}
                title="Nada que revisar aquí"
                sub="Ningún servicio cae en este filtro. Prueba con otro o quita la búsqueda."
              />
            </div>
          ) : (
            <div className="mt-5 -mx-6 overflow-x-auto px-6">
              <table className="w-full min-w-[58rem] border-collapse text-left">
                <thead>
                  <tr className="text-[0.68rem] font-semibold tracking-[0.12em] text-ink-faint uppercase">
                    <th scope="col" className="px-3 pb-2">
                      Servicio
                    </th>
                    <th scope="col" className="px-3 pb-2">
                      Proveedor
                    </th>
                    <th scope="col" className="px-3 pb-2 text-right">
                      Venta
                    </th>
                    <th scope="col" className="px-3 pb-2 text-right">
                      Costo
                    </th>
                    <th scope="col" className="px-3 pb-2 text-right">
                      Utilidad
                    </th>
                    <th scope="col" className="px-3 pb-2 text-right">
                      Margen
                    </th>
                    <th scope="col" className="px-3 pb-2">
                      Estado
                    </th>
                    <th scope="col" className="px-3 pb-2 text-right">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((a) => (
                    <CostRow
                      key={a.product.id}
                      audit={a}
                      onSave={(provider, cost) => {
                        if (!Number.isFinite(cost) || cost < 0) {
                          show("El costo debe ser un monto válido.", "bad");
                          return;
                        }
                        setProviderCost({
                          productId: a.product.id,
                          provider: provider || "Proveedor sin nombre",
                          cost,
                          source: "manual",
                        });
                        show(`Costo de ${a.product.name} actualizado`);
                      }}
                      onClear={() => {
                        removeProviderCost(a.product.id);
                        show(`Se borró el costo de ${a.product.name}`);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </Reveal>

      {/* ── Pedidos ───────────────────────────────────────────────────── */}
      <Reveal delay={180}>
        <section className="card mt-6 p-6">
          <h2 className="text-xl text-ink">Pedidos</h2>
          {orders.length === 0 ? (
            <div className="mt-5">
              <Empty
                icon={<IconDoc className="h-6 w-6" />}
                title="Sin pedidos todavía"
                sub="Cuando un cliente pague desde su monedero, el pedido aparece aquí con su utilidad."
              />
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {orders.map((o) => {
                let costo = 0;
                let sinCosto = 0;
                for (const item of o.items) {
                  const c = item.productId
                    ? providerCosts[item.productId]
                    : undefined;
                  if (c) costo += c.cost * item.qty;
                  else sinCosto += 1;
                }
                return (
                  <li
                    key={o.id}
                    className="rounded-2xl bg-cream/40 p-4 ring-1 ring-line"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[0.85rem] font-semibold text-ink">
                          {o.id}
                        </p>
                        <p className="mt-1 text-xs text-ink-faint">
                          {new Date(o.date).toLocaleString("es-MX")} ·{" "}
                          {o.items.reduce((n, i) => n + i.qty, 0)} artículos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg text-ink">
                          {mxn(o.total)}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {sinCosto > 0
                            ? `${sinCosto} partidas sin costo`
                            : `Utilidad ${mxn(o.total - costo)}`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["En proceso", "Completado", "Cancelado"] as const).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setOrderStatus(o.id, st)}
                            className={`chip ${o.status === st ? "chip-on" : "chip-off"}`}
                          >
                            {st}
                          </button>
                        ),
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </Reveal>
    </div>
  );
}
