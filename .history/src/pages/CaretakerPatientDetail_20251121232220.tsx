export default function CaretakerPatientDetail() {
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Ficha del Paciente</h2>

      <div
        style={{
          background: "#F5F5F5",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "20px",
        }}
      >
        <p><strong>Nombre:</strong> María González</p>
        <p><strong>Edad:</strong> 62 años</p>
        <p><strong>Tipo de Diabetes:</strong> Tipo 2</p>
        <p><strong>Contacto de emergencia:</strong> Juan González</p>
      </div>

      <button
        style={btn}
        onClick={() => (window.location.href = "/caretaker/alerts")}
      >
        🚨 Ver Alertas
      </button>

      <button
        style={{ ...btn, background: "#10B981" }}
        onClick={() => (window.location.href = "/caretaker/messages")}
      >
        🤖 Mensajes del Robot
      </button>
    </div>
  );
}

const btn = {
  width: "100%",
  padding: "15px",
  marginTop: "20px",
  background: "#1F4FFF",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontSize: "18px",
};
