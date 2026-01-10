export default function Food() {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Registro de Alimentación</h2>
      <p style={{ color: "#666" }}>Describe tu comida o usa dictado por voz.</p>

      <textarea
        placeholder="Ej: Hoy comí ensalada con pollo..."
        style={{
          width: "100%",
          height: "120px",
          padding: "12px",
          borderRadius: "12px",
          border: "1px solid #ccc",
          marginTop: "10px",
        }}
      />

      <button style={btn}>Guardar</button>
      <button style={{ ...btn, backgroundColor: "#10B981", marginTop: "10px" }}>
        🎤 Dictar por voz
      </button>
    </div>
  );
}

const btn = {
  width: "100%",
  padding: "15px",
  backgroundColor: "#1F4FFF",
  color: "white",
  fontSize: "18px",
  borderRadius: "12px",
  marginTop: "20px",
  border: "none",
};
