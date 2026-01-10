export default function Robot() {
  return (
    <div style={{ textAlign: "center" }}>
      <img src="/robot.png" style={{ width: "180px" }} />

      <h2>GlucoBot</h2>
      <p style={{ color: "#555" }}>
        ¡Hola! Estoy aquí para ayudarte con tu salud.
      </p>

      <button
        style={{
          width: "100%",
          padding: "15px",
          background: "#10B981",
          borderRadius: "12px",
          color: "white",
          border: "none",
          fontSize: "18px",
          marginTop: "10px",
        }}
      >
        🎤 Hablar
      </button>
    </div>
  );
}
