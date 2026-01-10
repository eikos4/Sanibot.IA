export default function CaretakerHome() {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Panel del Cuidador</h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Selecciona qué deseas revisar.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <button style={btn} onClick={() => (window.location.href = "/caretaker/patients")}>
          👥 Ver Pacientes
        </button>

        <button style={btn} onClick={() => (window.location.href = "/caretaker/alerts")}>
          🚨 Alertas del Paciente
        </button>

        <button style={btn} onClick={() => (window.location.href = "/caretaker/messages")}>
          🤖 Mensajes de GlucoBot
        </button>
      </div>
    </div>
  );
}

const btn = {
  width: "100%",
  padding: "15px",
  backgroundColor: "#1F4FFF",
  color: "#fff",
  borderRadius: "12px",
  border: "none",
  fontSize: "18px",
  cursor: "pointer"
};
