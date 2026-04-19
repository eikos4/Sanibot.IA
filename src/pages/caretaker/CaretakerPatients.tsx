import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  getAllPatientSummaries, 
  requestPatientLink,
  type PatientSummary 
} from "../../services/caretakerService";

export default function CaretakerPatients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatientEmail, setNewPatientEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadPatients();
    }
  }, [user?.id]);

  const loadPatients = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await getAllPatientSummaries(user.id);
    setPatients(data);
    setLoading(false);
  };

  const handleAddPatient = async () => {
    if (!user?.id || !newPatientEmail.trim()) return;
    
    setAddError("");
    setAddSuccess("");
    
    const result = await requestPatientLink(user.id, newPatientEmail.trim());
    
    if (result.success) {
      setAddSuccess("Solicitud enviada. El paciente debe aceptarla.");
      setNewPatientEmail("");
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess("");
      }, 2000);
    } else {
      setAddError(result.error || "Error al enviar solicitud");
    }
  };

  const getGlucoseColor = (status?: string) => {
    switch (status) {
      case "critical": return "#DC2626";
      case "high": return "#F59E0B";
      case "low": return "#3B82F6";
      default: return "#10B981";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <header style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "24px", margin: "0 0 5px 0" }}>Mis Pacientes</h2>
          <p style={{ color: "#6B7280", margin: 0 }}>{patients.length} paciente{patients.length !== 1 ? "s" : ""} vinculado{patients.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#1F2937",
            color: "white",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          + Agregar Paciente
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>Cargando pacientes...</div>
      ) : patients.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#F9FAFB", borderRadius: "12px" }}>
          <p style={{ fontSize: "48px", margin: "0 0 15px 0" }}>👥</p>
          <h3 style={{ margin: "0 0 10px 0", color: "#374151" }}>Sin pacientes vinculados</h3>
          <p style={{ color: "#6B7280", margin: 0 }}>
            Agrega pacientes usando su correo electrónico
          </p>
        </div>
      ) : (
        <div>
          {patients.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/caretaker/patient/${p.id}`)}
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "12px",
                border: "1px solid #E5E7EB",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "16px" }}>{p.name}</strong>
                  <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
                    {p.tipoDiabetes || "Diabetes"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  {p.lastGlucose ? (
                    <div style={{
                      background: `${getGlucoseColor(p.lastGlucose.status)}15`,
                      color: getGlucoseColor(p.lastGlucose.status),
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontWeight: 600
                    }}>
                      {p.lastGlucose.value} mg/dL
                    </div>
                  ) : (
                    <span style={{ color: "#9CA3AF", fontSize: "14px" }}>Sin lecturas</span>
                  )}
                  {p.pendingAlerts > 0 && (
                    <div style={{
                      marginTop: "6px",
                      background: "#FEE2E2",
                      color: "#DC2626",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 600
                    }}>
                      {p.pendingAlerts} alerta{p.pendingAlerts > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para agregar paciente */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "400px"
          }}>
            <h3 style={{ margin: "0 0 20px 0" }}>Agregar Paciente</h3>
            
            <input
              type="email"
              placeholder="Correo del paciente"
              value={newPatientEmail}
              onChange={(e) => setNewPatientEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                fontSize: "16px",
                marginBottom: "15px",
                boxSizing: "border-box"
              }}
            />
            
            {addError && (
              <p style={{ color: "#DC2626", fontSize: "14px", margin: "0 0 15px 0" }}>{addError}</p>
            )}
            {addSuccess && (
              <p style={{ color: "#10B981", fontSize: "14px", margin: "0 0 15px 0" }}>{addSuccess}</p>
            )}
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewPatientEmail("");
                  setAddError("");
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #D1D5DB",
                  background: "white",
                  cursor: "pointer"
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPatient}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#1F2937",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
