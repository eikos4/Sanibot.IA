export default function Home() {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Bienvenido a GlucoBot</h2>
      <p style={{ marginBottom: "25px", color: "#555" }}>
        ¿Qué deseas hacer hoy?
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <button style={btn} onClick={() => (window.location.href = "/medicines")}>
          💊 Medicamentos
        </button>

        <button style={btn} onClick={() => (window.location.href = "/glucose")}>
          🩸 Registrar Glicemia
        </button>

        <button style={btn} onClick={() => (window.location.href = "/food")}>
          🍽 Alimentación
        </button>

        <button style={btn} onClick={() => (window.location.href = "/appointments")}>
          📅 Citas Médicas
        </button>

        <button style={btn} onClick={() => (window.location.href = "/robot")}>
          🤖 Hablar con GlucoBot
        </button>

      </div>
    </div>
  );
}

const btn = {
  width: "100%",
  padding: "15px",
  backgroundColor: "#1F4FFF",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontSize: "18px",
  cursor: "pointer",
};
