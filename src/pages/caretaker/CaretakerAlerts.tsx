import { useState, useEffect } from "react";
// @ts-ignore
import { getGlucoseReadings } from "../../services/glucoseStorage";

export default function CaretakerAlerts() {
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      // @ts-ignore
      const readings = await getGlucoseReadings();
      const newAlerts: string[] = [];

      // Análisis simple de datos para generar alertas
      if (readings) {
        readings.forEach((r: any) => {
          // r.valor is the new field, r.value might be old. Check interface. 
          // Interface says 'valor'. 'value' might be old data or legacy.
          // r.fecha instead of r.date.
          const val = r.valor || r.value;

          let date;
          if (r.fecha) {
            date = new Date(`${r.fecha}T${r.hora || "00:00"}`);
          } else if (r.date) {
            date = new Date(r.date);
          } else {
            date = new Date();
          }

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
    };
    fetchAlerts();
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
