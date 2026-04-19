import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  getPatientSummary, 
  getCaretakerAlerts,
  removePatientLink,
  type PatientSummary,
  type PatientAlert
} from "../../services/caretakerService";
import { getPatientHealthSummary } from "../../services/adminService";

interface HealthData {
  glucoseReadings: Array<{ id: string; valor: number; fecha: string; hora: string; comida?: string }>;
  medicines: Array<{ id: string; nombre: string; dosis: string; frecuencia: string }>;
  appointments: Array<{ id: string; fecha: string; hora: string; doctor?: string }>;
}

export default function CaretakerPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  useEffect(() => {
    if (id && user?.id) loadData();
  }, [id, user?.id]);

  const loadData = async () => {
    if (!id || !user?.id) return;
    setLoading(true);
    
    const [patientData, health, patientAlerts] = await Promise.all([
      getPatientSummary(id),
      getPatientHealthSummary(id),
      getCaretakerAlerts(user.id, false)
    ]);
    
    setPatient(patientData);
    setHealthData(health as HealthData);
    setAlerts(patientAlerts.filter(a => a.patientId === id));
    setLoading(false);
  };

  const handleRemoveLink = async () => {
    if (!id || !user?.id) return;
    const success = await removePatientLink(user.id, id);
    if (success) {
      navigate("/caretaker/patients");
    }
  };

  const getGlucoseColor = (value: number) => {
    if (value < 70) return "#3B82F6";
    if (value > 180) return "#EF4444";
    return "#10B981";
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px", color: "#6B7280" }}>Cargando paciente...</div>;
  }

  if (!patient) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <p style={{ fontSize: "48px", margin: "0 0 15px 0" }}>❌</p>
        <h3 style={{ color: "#374151" }}>Paciente no encontrado</h3>
        <button onClick={() => navigate("/caretaker/patients")} style={{ ...btnStyle, marginTop: "20px", background: "#6B7280" }}>
          Volver a Pacientes
        </button>
      </div>
    );
  }

  const lastGlucose = healthData?.glucoseReadings?.[0];
  const unreadAlerts = alerts.filter(a => !a.read).length;

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <button onClick={() => navigate("/caretaker/patients")} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", marginBottom: "20px" }}>
        ← Volver a Pacientes
      </button>

      {/* Header Card */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h2 style={{ margin: "0 0 5px 0", fontSize: "22px" }}>{patient.name}</h2>
            <p style={{ color: "#666", margin: 0 }}>{patient.tipoDiabetes || "Diabetes"}</p>
          </div>
          <div style={statusTag}>✅ Monitoreo Activo</div>
        </div>
      </div>

      {/* Alerts Banner */}
      {unreadAlerts > 0 && (
        <div 
          onClick={() => navigate("/caretaker/alerts")}
          style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "12px", padding: "14px", marginBottom: "15px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
        >
          <span style={{ fontSize: "24px" }}>🚨</span>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: "#DC2626" }}>{unreadAlerts} alerta{unreadAlerts > 1 ? "s" : ""} sin leer</p>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#991B1B" }}>Toca para ver</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div style={statGrid}>
        <div style={statCard}>
          <span style={{ fontSize: "28px" }}>🩸</span>
          <p style={{ margin: "8px 0 4px", fontSize: "13px", color: "#666" }}>Última Glicemia</p>
          {lastGlucose ? (
            <>
              <strong style={{ fontSize: "24px", color: getGlucoseColor(lastGlucose.valor) }}>
                {lastGlucose.valor}
              </strong>
              <span style={{ fontSize: "12px", color: "#6B7280" }}> mg/dL</span>
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#9CA3AF" }}>{lastGlucose.fecha} {lastGlucose.hora}</p>
            </>
          ) : (
            <strong style={{ fontSize: "18px", color: "#9CA3AF" }}>Sin datos</strong>
          )}
        </div>
        <div style={statCard}>
          <span style={{ fontSize: "28px" }}>💊</span>
          <p style={{ margin: "8px 0 4px", fontSize: "13px", color: "#666" }}>Medicamentos</p>
          <strong style={{ fontSize: "24px", color: "#10B981" }}>{healthData?.medicines?.length || 0}</strong>
          <span style={{ fontSize: "12px", color: "#6B7280" }}> activos</span>
        </div>
        <div style={statCard}>
          <span style={{ fontSize: "28px" }}>📅</span>
          <p style={{ margin: "8px 0 4px", fontSize: "13px", color: "#666" }}>Próximas Citas</p>
          <strong style={{ fontSize: "24px", color: "#6366F1" }}>{healthData?.appointments?.length || 0}</strong>
        </div>
        <div style={statCard}>
          <span style={{ fontSize: "28px" }}>⚠️</span>
          <p style={{ margin: "8px 0 4px", fontSize: "13px", color: "#666" }}>Alertas</p>
          <strong style={{ fontSize: "24px", color: unreadAlerts > 0 ? "#EF4444" : "#10B981" }}>{unreadAlerts}</strong>
          <span style={{ fontSize: "12px", color: "#6B7280" }}> pendientes</span>
        </div>
      </div>

      {/* Recent Glucose */}
      {healthData?.glucoseReadings && healthData.glucoseReadings.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#374151" }}>Últimas Lecturas de Glucosa</h3>
          <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
            {healthData.glucoseReadings.slice(0, 5).map((r, i) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i < 4 ? "1px solid #F3F4F6" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: getGlucoseColor(r.valor) }} />
                  <span style={{ fontWeight: 600, color: getGlucoseColor(r.valor) }}>{r.valor} mg/dL</span>
                  {r.comida && <span style={{ fontSize: "12px", color: "#9CA3AF" }}>({r.comida})</span>}
                </div>
                <span style={{ fontSize: "12px", color: "#6B7280" }}>{r.fecha} {r.hora}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: "25px", display: "grid", gap: "12px" }}>
        <button onClick={() => navigate("/caretaker/alerts")} style={{ ...btnStyle, background: "#EF4444" }}>
          🚨 Ver Todas las Alertas
        </button>
      </div>

      {/* Remove Link */}
      <div style={{ marginTop: "40px", borderTop: "1px solid #E5E7EB", paddingTop: "20px" }}>
        {!showRemoveConfirm ? (
          <button onClick={() => setShowRemoveConfirm(true)} style={{ ...btnStyle, background: "#FEE2E2", color: "#DC2626" }}>
            Dejar de monitorear este paciente
          </button>
        ) : (
          <div style={{ background: "#FEF2F2", padding: "16px", borderRadius: "12px" }}>
            <p style={{ margin: "0 0 15px 0", color: "#991B1B" }}>
              ¿Estás seguro? Dejarás de recibir alertas de este paciente.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowRemoveConfirm(false)} style={{ ...btnStyle, background: "#6B7280", flex: 1 }}>
                Cancelar
              </button>
              <button onClick={handleRemoveLink} style={{ ...btnStyle, background: "#DC2626", flex: 1 }}>
                Sí, dejar de monitorear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: "15px" };
const statusTag: React.CSSProperties = { background: "#ECFDF5", color: "#10B981", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 };
const statGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" };
const statCard: React.CSSProperties = { background: "white", padding: "16px", borderRadius: "12px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" };
const btnStyle: React.CSSProperties = { width: "100%", padding: "14px", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 600, cursor: "pointer", color: "white" };
