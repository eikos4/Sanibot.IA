import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, getPatientHealthSummary, type UserProfile } from "../../services/adminService";

interface GlucoseReading {
  id: string;
  valor: number;
  fecha: string;
  hora: string;
  comida?: string;
}

interface Medicine {
  id: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
}

interface Appointment {
  id: string;
  fecha: string;
  hora: string;
  doctor?: string;
  especialidad?: string;
}

export default function AdminPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<UserProfile | null>(null);
  const [healthData, setHealthData] = useState<{
    glucoseReadings: GlucoseReading[];
    medicines: Medicine[];
    appointments: Appointment[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"glucose" | "medicines" | "appointments">("glucose");

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const [userData, health] = await Promise.all([
      getUserById(id),
      getPatientHealthSummary(id)
    ]);
    setPatient(userData);
    setHealthData(health as { glucoseReadings: GlucoseReading[]; medicines: Medicine[]; appointments: Appointment[] });
    setLoading(false);
  };

  const getGlucoseColor = (value: number) => {
    if (value < 70) return "#3B82F6";
    if (value > 180) return "#EF4444";
    return "#10B981";
  };

  const getGlucoseStatus = (value: number) => {
    if (value < 70) return "Baja";
    if (value > 180) return "Alta";
    return "Normal";
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px", color: "#6B7280" }}>Cargando paciente...</div>;
  }

  if (!patient) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <p style={{ fontSize: "48px", margin: "0 0 15px 0" }}>❌</p>
        <h3 style={{ color: "#374151" }}>Paciente no encontrado</h3>
        <button onClick={() => navigate("/admin/patients")} style={{ ...btnStyle, marginTop: "20px", background: "#6B7280" }}>
          Volver a Pacientes
        </button>
      </div>
    );
  }

  const lastGlucose = healthData?.glucoseReadings?.[0];

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={() => navigate("/admin/patients")} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", marginBottom: "20px" }}>
        ← Volver a Pacientes
      </button>

      {/* Header Card */}
      <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "24px" }}>{patient.name || "Sin nombre"}</h2>
            <p style={{ margin: 0, color: "#6B7280" }}>{patient.email || patient.username}</p>
            {patient.tipoDiabetes && (
              <span style={{ display: "inline-block", marginTop: "10px", background: "#DBEAFE", color: "#1D4ED8", padding: "4px 12px", borderRadius: "12px", fontSize: "13px", fontWeight: 600 }}>
                {patient.tipoDiabetes}
              </span>
            )}
          </div>
          {lastGlucose && (
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6B7280" }}>Última Glucosa</p>
              <div style={{ fontSize: "28px", fontWeight: 700, color: getGlucoseColor(lastGlucose.valor) }}>
                {lastGlucose.valor} <span style={{ fontSize: "14px" }}>mg/dL</span>
              </div>
              <span style={{ fontSize: "12px", color: getGlucoseColor(lastGlucose.valor) }}>
                {getGlucoseStatus(lastGlucose.valor)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "20px" }}>
        <div style={statCard}>
          <span style={{ fontSize: "24px" }}>🩸</span>
          <p style={{ margin: "5px 0 0", fontSize: "24px", fontWeight: 700 }}>{healthData?.glucoseReadings?.length || 0}</p>
          <p style={{ margin: 0, fontSize: "12px", color: "#6B7280" }}>Lecturas</p>
        </div>
        <div style={statCard}>
          <span style={{ fontSize: "24px" }}>💊</span>
          <p style={{ margin: "5px 0 0", fontSize: "24px", fontWeight: 700 }}>{healthData?.medicines?.length || 0}</p>
          <p style={{ margin: 0, fontSize: "12px", color: "#6B7280" }}>Medicamentos</p>
        </div>
        <div style={statCard}>
          <span style={{ fontSize: "24px" }}>📅</span>
          <p style={{ margin: "5px 0 0", fontSize: "24px", fontWeight: 700 }}>{healthData?.appointments?.length || 0}</p>
          <p style={{ margin: 0, fontSize: "12px", color: "#6B7280" }}>Citas</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        {(["glucose", "medicines", "appointments"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: activeTab === tab ? "#1F2937" : "#F3F4F6",
              color: activeTab === tab ? "white" : "#374151",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            {tab === "glucose" ? "🩸 Glucosa" : tab === "medicines" ? "💊 Medicamentos" : "📅 Citas"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        {activeTab === "glucose" && (
          healthData?.glucoseReadings?.length ? (
            <div style={{ display: "grid", gap: "10px" }}>
              {healthData.glucoseReadings.map((r) => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#F9FAFB", borderRadius: "10px" }}>
                  <div>
                    <span style={{ fontWeight: 600, color: getGlucoseColor(r.valor) }}>{r.valor} mg/dL</span>
                    <span style={{ marginLeft: "10px", fontSize: "12px", color: "#6B7280" }}>{r.comida || ""}</span>
                  </div>
                  <span style={{ fontSize: "13px", color: "#6B7280" }}>{r.fecha} {r.hora}</span>
                </div>
              ))}
            </div>
          ) : <p style={{ textAlign: "center", color: "#6B7280" }}>Sin lecturas de glucosa</p>
        )}

        {activeTab === "medicines" && (
          healthData?.medicines?.length ? (
            <div style={{ display: "grid", gap: "10px" }}>
              {healthData.medicines.map((m) => (
                <div key={m.id} style={{ padding: "12px", background: "#F9FAFB", borderRadius: "10px" }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{m.nombre}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6B7280" }}>{m.dosis} - {m.frecuencia}</p>
                </div>
              ))}
            </div>
          ) : <p style={{ textAlign: "center", color: "#6B7280" }}>Sin medicamentos registrados</p>
        )}

        {activeTab === "appointments" && (
          healthData?.appointments?.length ? (
            <div style={{ display: "grid", gap: "10px" }}>
              {healthData.appointments.map((a) => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#F9FAFB", borderRadius: "10px" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{a.doctor || "Cita médica"}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6B7280" }}>{a.especialidad || ""}</p>
                  </div>
                  <span style={{ fontSize: "13px", color: "#6366F1", fontWeight: 500 }}>{a.fecha} {a.hora}</span>
                </div>
              ))}
            </div>
          ) : <p style={{ textAlign: "center", color: "#6B7280" }}>Sin citas registradas</p>
        )}
      </div>
    </div>
  );
}

const statCard: React.CSSProperties = { background: "white", padding: "20px", borderRadius: "12px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" };
const btnStyle: React.CSSProperties = { padding: "14px 24px", borderRadius: "12px", border: "none", color: "white", fontSize: "16px", fontWeight: 600, cursor: "pointer" };
