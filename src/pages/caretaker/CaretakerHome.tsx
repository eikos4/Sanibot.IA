import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

// Mock data for assigned patients
const PATIENTS = [
  { id: 1, name: "María González", status: "stable", lastGlucose: 110, lastMed: "14:00" },
  { id: 2, name: "Roberto Díaz", status: "warning", lastGlucose: 195, lastMed: "09:00" },
  { id: 3, name: "Ana Silva", status: "critical", lastGlucose: 45, lastMed: "12:00" },
];

export default function CaretakerHome() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <header style={{ marginBottom: "30px", textAlign: "center" }}>
        <h2 style={{ fontSize: "28px", color: "#1F2937" }}>Panel de Monitoreo 🩺</h2>
        <p style={{ color: "#6B7280" }}>Estado en tiempo real de tus pacientes asignados</p>
      </header>

      <div style={{ display: "grid", gap: "20px" }}>
        {PATIENTS.map((patient) => (
          <PatientCard key={patient.id} patient={patient} navigate={navigate} />
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
        <Button variant="secondary" onClick={() => navigate("/caretaker/alerts")}>
          🚨 Ver Alertas
        </Button>
        <Button variant="secondary" onClick={() => navigate("/caretaker/messages")}>
          💬 Mensajes
        </Button>
      </div>
    </div>
  );
}

interface PatientCardProps {
  patient: any;
  navigate: any;
}

function PatientCard({ patient, navigate }: PatientCardProps) {
  const getStatusColor = (s: string) => {
    if (s === "stable") return "#10B981"; // Green
    if (s === "warning") return "#F59E0B"; // Yellow
    if (s === "critical") return "#EF4444"; // Red
    return "#9CA3AF";
  };

  const getStatusText = (s: string) => {
    if (s === "stable") return "Estable";
    if (s === "warning") return "Revisión necesaria";
    if (s === "critical") return "CRÍTICO";
    return "Desconocido";
  };

  const color = getStatusColor(patient.status);

  return (
    <Card
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderLeft: `6px solid ${color}`,
        cursor: "pointer",
        transition: "transform 0.2s"
      }}
      onClick={() => navigate(`/caretaker/patient/${patient.id}`)}
    >
      <div>
        <h3 style={{ margin: "0 0 5px 0", fontSize: "18px" }}>{patient.name}</h3>
        <div style={{ display: "flex", gap: "15px", color: "#6B7280", fontSize: "14px" }}>
          <span>🩸 {patient.lastGlucose} mg/dL</span>
          <span>💊 {patient.lastMed}</span>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <span style={{
          background: `${color}20`,
          color: color,
          padding: "5px 10px",
          borderRadius: "99px",
          fontWeight: "bold",
          fontSize: "12px"
        }}>
          {getStatusText(patient.status)}
        </span>
      </div>
    </Card>
  );
}


