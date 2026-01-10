export default function Welcome() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      height: "100vh",
      padding: "20px",
      background: "#FFFFFF"
    }}>
      
      <img 
        src="/robot.png" 
        alt="GlucoBot"
        style={{
          width: "200px",
          marginBottom: "30px",
          animation: "float 3s ease-in-out infinite"
        }}
      />

      <h1 style={{ fontSize: "28px", margin: "0", color: "#1A1A1A" }}>
        ¡Hola! Soy GlucoBot
      </h1>

      <p style={{
        fontSize: "18px",
        marginTop: "10px",
        marginBottom: "40px",
        color: "#444",
        maxWidth: "300px"
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
          width: "80%",
          maxWidth: "250px"
        }}
        onClick={() => window.location.href = "/register"}
      >
        Empezar
      </button>

      {/* Animación del robot */}
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
