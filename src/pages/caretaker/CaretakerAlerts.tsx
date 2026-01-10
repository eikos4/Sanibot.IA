import { useState, useEffect } from "react";
// @ts-ignore
import { getGlucoseReadings } from "../../services/glucoseStorage";

export default function CaretakerAlerts() {
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const readings = getGlucoseReadings();
    const newAlerts: string[] = [];

    // Análisis simple de datos para generar alertas
    if (readings) {
      readings.forEach((r: any) => {
        const val = parseInt(r.value);
        // Si es muy reciente (ej. hoy) y es alto/bajo
        const date = new Date(r.date);
        const today = new Date();
        const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();

        if (isToday) {
          if (val > 180) newAlerts.push(`Glicemia ALTA (${val} mg/dL) a las ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`);
          if (val < 70) newAlerts.push(`Glicemia BAJA (${val} mg/dL) a las ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`);
        }
      });
    }

    if (newAlerts.length === 0) {
      // Alerta mock si no hay datos reales para demo
      newAlerts.push("No se han detectado anomalías hoy.");
    }

    setAlerts(newAlerts);
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "0 20px" }}>
      <h2>Centro de Alertas</h2>

      <div style={{ marginTop: "20px" }}>
        {alerts.map((a, i) => (
          <div
            key={i}
            style={{
              background: a.includes("ALTA") || a.includes("BAJA") ? "#FFE5E5" : "#F0FDF4",
              borderLeft: a.includes("ALTA") || a.includes("BAJA") ? "6px solid #FF4444" : "6px solid #10B981",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "15px",
              textAlign: "left",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <span style={{ fontSize: "24px" }}>
              {a.includes("ALTA") || a.includes("BAJA") ? "⚠️" : "✅"}
            </span>
            <p style={{ margin: 0, fontWeight: "500" }}>{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
