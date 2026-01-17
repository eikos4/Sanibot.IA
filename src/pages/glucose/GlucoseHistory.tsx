import { useEffect, useMemo, useState } from "react";
import HealthTrendChart from "../../components/HealthTrendChart";
import { getGlucoseHistory, type GlucoseRecord } from "../../services/glucoseStorage";

type RangeKey = "7d" | "30d" | "all";

const parseRecordDate = (r: GlucoseRecord): number => {
  // Prefer explicit timestamp if present
  const ts = (r as any)?.timestamp;
  if (typeof ts === "number") return ts;
  if (ts?.toMillis) return ts.toMillis();

  // Fallback: fecha + hora
  const time = r.hora && r.hora.includes(":") ? r.hora : "00:00";
  const d = new Date(`${r.fecha}T${time}`);
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : 0;
};

type TargetRange = {
  label: string;
  low: number;
  high: number;
};

// Targets commonly used in Chilean clinical practice for diabetes control:
// - Preprandial/fasting: 80–130 mg/dL
// - 2h postprandial: <180 mg/dL (we use 80–180 as "in range")
// Hypoglycemia: <70 mg/dL (severe: <54)
const getTargetForRecord = (r: GlucoseRecord): TargetRange => {
  const c = (r.comida || "").toLowerCase();

  const looksPreprandial =
    c.includes("ayunas") ||
    c.includes("preprand") ||
    c.includes("antes") ||
    c.includes("antes de") ||
    c.includes("basal");

  const looksPostprandial =
    c.includes("post") ||
    c.includes("postprand") ||
    c.includes("despues") ||
    c.includes("después") ||
    c.includes("2h") ||
    c.includes("2 h") ||
    c.includes("cena") ||
    c.includes("almuerzo") ||
    c.includes("desayuno");

  if (looksPreprandial) return { label: "Ayunas / Preprandial", low: 80, high: 130 };
  if (looksPostprandial) return { label: "Postprandial", low: 80, high: 180 };

  // Default: general safe range
  return { label: "General", low: 70, high: 180 };
};

export default function GlucoseHistory() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getGlucoseHistory();
        if (!mounted) return;
        setRecords(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setError("No se pudo cargar el historial.");
        setRecords([]);
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff =
      range === "7d" ? now - 7 * 24 * 60 * 60 * 1000 : range === "30d" ? now - 30 * 24 * 60 * 60 * 1000 : 0;

    const withDates = records
      .map((r) => ({ r, ms: parseRecordDate(r) }))
      .filter(({ r }) => typeof r.valor === "number" && Number.isFinite(r.valor));

    const inRange = cutoff ? withDates.filter(({ ms }) => ms >= cutoff) : withDates;

    // Sort newest first
    return inRange
      .sort((a, b) => b.ms - a.ms)
      .map(({ r }) => r);
  }, [records, range]);

  const stats = useMemo(() => {
    if (!filtered.length) return null;
    const values = filtered.map((r) => r.valor).filter((v) => Number.isFinite(v));
    if (!values.length) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / values.length) * 10) / 10;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { avg, min, max, count: values.length };
  }, [filtered]);

  const insights = useMemo(() => {
    if (!filtered.length) return null;

    let inRange = 0;
    let low = 0;
    let high = 0;
    let severeLow = 0;
    let severeHigh = 0;

    filtered.forEach((r) => {
      const v = r.valor;
      if (!Number.isFinite(v)) return;
      if (v < 70) {
        low += 1;
        if (v < 54) severeLow += 1;
        return;
      }

      const target = getTargetForRecord(r);
      if (v > target.high) {
        high += 1;
        if (v > 250) severeHigh += 1;
        return;
      }

      if (v >= target.low && v <= target.high) {
        inRange += 1;
        return;
      }

      // If it's not hypo and below target.low (e.g. 70-79 in preprandial targets), count as low-ish.
      low += 1;
    });

    const total = filtered.length;
    const pct = (n: number) => Math.round((n / total) * 100);

    const alert =
      severeLow > 0
        ? "Hay episodios de hipoglicemia severa (<54). Considera medidas de seguridad y consulta clínica."
        : severeHigh > 0
          ? "Hay valores muy elevados (>250). Revisa hidratación, adherencia y plan terapéutico."
          : high > 0
            ? "Se observan lecturas sobre objetivo. Revisa alimentación, medicación y horarios de medición."
            : low > 0
              ? "Se observan lecturas bajo objetivo. Ten a mano carbohidratos de acción rápida."
              : "Buen control según objetivos.";

    return {
      total,
      inRange,
      low,
      high,
      severeLow,
      severeHigh,
      inRangePct: pct(inRange),
      lowPct: pct(low),
      highPct: pct(high),
      alert,
    };
  }, [filtered]);

  return (
    <div style={{ padding: "16px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Historial de Glicemia</h2>
          <p style={{ margin: "6px 0 0", color: "#64748B" }}>Revisa tus registros y tendencias.</p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as RangeKey)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(15, 23, 42, 0.12)",
              background: "#fff",
              fontWeight: 600,
            }}
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="all">Todo</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <HealthTrendChart title="Tendencia Glucosa" data={filtered} type="glucose" color="#10B981" />
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 10,
            }}
          >
            <div style={{ background: "#fff", border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#64748B" }}>Registros</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{stats.count}</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#64748B" }}>Promedio</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{stats.avg} mg/dL</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#64748B" }}>Mínimo</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{stats.min} mg/dL</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#64748B" }}>Máximo</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{stats.max} mg/dL</div>
            </div>
          </div>
        )}

        {insights && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <div style={{ background: "#ECFDF5", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#065F46", fontWeight: 700 }}>En rango (objetivo)</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#065F46" }}>{insights.inRangePct}%</div>
              <div style={{ fontSize: 12, color: "#065F46" }}>{insights.inRange}/{insights.total}</div>
            </div>
            <div style={{ background: "#FEF2F2", border: "1px solid rgba(239, 68, 68, 0.20)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#991B1B", fontWeight: 700 }}>Bajas</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#991B1B" }}>{insights.lowPct}%</div>
              <div style={{ fontSize: 12, color: "#991B1B" }}>{insights.low} ({insights.severeLow} severas)</div>
            </div>
            <div style={{ background: "#FFF7ED", border: "1px solid rgba(249, 115, 22, 0.25)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#9A3412", fontWeight: 700 }}>Altas</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#9A3412" }}>{insights.highPct}%</div>
              <div style={{ fontSize: 12, color: "#9A3412" }}>{insights.high} ({insights.severeHigh} muy altas)</div>
            </div>
            <div style={{ background: "#EEF2FF", border: "1px solid rgba(99, 102, 241, 0.20)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#3730A3", fontWeight: 700 }}>Resumen</div>
              <div style={{ fontSize: 12, color: "#3730A3", lineHeight: 1.25 }}>{insights.alert}</div>
            </div>
          </div>
        )}

        {isLoading && (
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 14, color: "#334155" }}>Cargando historial...</div>
        )}

        {!isLoading && error && (
          <div style={{ background: "#FEF2F2", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: 14, padding: 14, color: "#991B1B" }}>
            {error}
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 14, color: "#334155" }}>
            No hay registros aún.
          </div>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: 12, fontWeight: 800, borderBottom: "1px solid rgba(15, 23, 42, 0.06)" }}>Registros</div>
            <div style={{ maxHeight: 420, overflow: "auto" }}>
              {filtered.map((r) => {
                const valueColor = r.valor < 70 ? "#EF4444" : r.valor > 180 ? "#F97316" : "#10B981";
                return (
                  <div
                    key={r.id || `${r.fecha}-${r.hora}-${r.valor}`}
                    className="gh-row"
                  >
                    <div className="gh-date" style={{ fontWeight: 700 }}>{r.fecha}</div>
                    <div className="gh-time" style={{ color: "#64748B", fontWeight: 700 }}>{r.hora}</div>
                    <div className="gh-context" style={{ color: "#64748B" }}>{r.comida || "—"}</div>
                    <div className="gh-value" style={{ fontWeight: 900, color: valueColor, textAlign: "right" }}>{r.valor} mg/dL</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .gh-row {
          display: grid;
          grid-template-columns: 140px 100px 1fr 110px;
          gap: 10px;
          padding: 12px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          align-items: center;
        }

        @media (max-width: 520px) {
          .gh-row {
            grid-template-columns: 1fr auto;
            grid-template-areas:
              "date value"
              "time value"
              "context context";
            align-items: start;
          }

          .gh-date { grid-area: date; }
          .gh-time { grid-area: time; }
          .gh-context { grid-area: context; }
          .gh-value { grid-area: value; }

          .gh-value {
            text-align: right;
            font-size: 16px;
            white-space: nowrap;
          }

          .gh-context {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
