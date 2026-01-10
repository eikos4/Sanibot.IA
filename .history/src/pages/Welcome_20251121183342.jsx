export default function Welcome() {
  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <img 
        src="/robot.png" 
        alt="GlucoBot"
        style={{
          width: "180px",
          marginBottom: "20px",
          animation: "float 3s ease-in-out infinite"
        }}
      />

      <h1 style={{ fontSize: "26px", margin: 0, color: "#1A1A1A" }}>
        ¡Hola! Soy GlucoBot
      </h1>

      <p style={{
        fontSize: "18px",
        marginTop: "10px",
        marginBottom: "40px",
        color: "#444",
        maxWidth: "320px",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        Estoy aquí para acompañarte en tu cuidado diario.
      </p>

      <button
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          borderRadius: "12px",
          background: "#1F4FFF",
          color: "white",
          border: "none",
          cursor: "pointer",
          width: "100%",
          maxWidth: "250px"
        }}
        onClick={() => (window.location.href = "/register")}
      >
        Empezar
      </button>

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </div>
  );
}
