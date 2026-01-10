export default function Welcome() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        minHeight: "100dvh",
        padding: "20px",
      }}
    >
      <img
        src="/robot.png"
        alt="GlucoBot"
        style={{ width: "180px", marginBottom: "20px" }}
      />

      <h1 style={{ fontSize: "32px", margin: 0 }}>¡Hola! Soy GlucoBot</h1>

      <p style={{ maxWidth: "300px", marginTop: "10px", color: "#444" }}>
        Estoy aquí para acompañarte en tu cuidado diario.
      </p>

      <button
        style={{
          marginTop: "30px",
          padding: "15px 40px",
          background: "#1F4FFF",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          fontSize: "18px",
          cursor: "pointer",
        }}
        onClick={() => (window.location.href = "/register")}
      >
        Empezar
      </button>
    </div>
  );
}
