import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import { getGlucoseReadings } from "../../services/glucoseStorage";
// @ts-ignore
import { subscribeToMedicines } from "../../services/medicineStorage";

export default function CaretakerPatientDetail() {
  const navigate = useNavigate();
  const [lastGlucose, setLastGlucose] = useState<any>(null);
  const [medicineCount, setMedicineCount] = useState(0);


  useEffect(() => {
    const readings = getGlucoseReadings();
    if (readings && readings.length > 0) {
      setLastGlucose(readings[readings.length - 1]);
    }
    // Subscribe to patient's medicines (assuming id is patientId)
    // Note: If id is undefined, it returns empty
    // @ts-ignore
    const unsubscribe = subscribeToMedicines((meds) => {
      setMedicineCount(meds.length);
    }); // We are not passing ID yet as we don't know if 'id' from params is the userId. 
    // For now, assuming current user or empty. 
    // If this page is for viewing *another* patient, we'd pass `id`.

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Ficha del Paciente</h2>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 5px" }}>María González</p>
            <p style={{ color: "#666", margin: 0 }}>Diabetes Tipo 2</p>
          </div>
          <div style={statusTag}>Monitoreo Activo</div>
        </div>
      </div>

      <h3 style={{ fontSize: "18px", marginTop: "20px" }}>Resumen de hoy</h3>

      <div style={statGrid}>
        <div style={statCard}>
          <span style={{ fontSize: "24px" }}>🩸</span>
          <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>Última Glicemia</p>
          <strong style={{ fontSize: "20px", color: "#1F4FFF" }}>
            {lastGlucose ? `${lastGlucose.value} mg/dL` : "--"}
          </strong>
        </div>
        <div style={statCard}>
          <span style={{ fontSize: "24px" }}>💊</span>
          <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>Medicamentos</p>
          <strong style={{ fontSize: "20px", color: "#10B981" }}>
            {medicineCount} activos
          </strong>
        </div>
      </div>

      <button
        style={{ ...btn, background: "#EF4444" }}
        onClick={() => navigate("/caretaker/alerts")}
      >
        🚨 Ver Alertas
      </button>

      <button
        style={btn}
        onClick={() => navigate("/caretaker/messages")}
      >
        🤖 Mensajes del Robot
      </button>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "white",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  marginBottom: "10px",
};

const statusTag: React.CSSProperties = {
  background: "#ECFDF5",
  color: "#10B981",
  padding: "5px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "bold",
};

const statGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
  marginTop: "10px",
};

const statCard: React.CSSProperties = {
  background: "white",
  padding: "15px",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
};

const btn: React.CSSProperties = {
  width: "100%",
  padding: "15px",
  marginTop: "15px",
  background: "#1F4FFF",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontSize: "18px",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
};
