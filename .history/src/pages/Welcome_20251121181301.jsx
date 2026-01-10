export default function Welcome() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      paddingTop: "50px"
    }}>
      <img src="/robot.png" alt="robot" style={{ width: 200 }} />

      <h2>¡Hola! Soy GlucoBot</h2>
      <p>Estoy aquí para acompañarte en tu cuidado diario.</p>

      <button
        style={{
          marginTop: 30,
          padding: "15px 30px",
          fontSize: "18px",
          borderRadius: "10px",
          background: "#1F4FFF",
          color: "white",
          border: "none"
        }}
        onClick={() => window.location.href = "/register"}
      >
        Empezar
      </button>
    </div>
  );
}
