export default function Welcome() {
  return (
    <div style={{ textAlign: "center" }}>
      <img
        src="/robot.png"
        alt="robot"
        style={{
          width: "180px",
          marginBottom: "20px",
        }}
      />

      <h1>¡Hola! Soy GlucoBot</h1>

      <p style={{ maxWidth: "300px", margin: "10px auto" }}>
        Estoy aquí para acompañarte en tu cuidado diario.
      </p>

      <button
        style={{
          width: "100%",
          padding: "15px",
          borderRadius: "12px",
          background: "#1F4FFF",
          color: "#fff",
          marginTop: "20px",
          fontSize: "18px",
        }}
        onClick={() => (window.location.href = "/register")}
      >
        Empezar
      </button>
    </div>
  );
}
