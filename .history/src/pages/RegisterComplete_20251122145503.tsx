export default function RegisterComplete() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <img
        src="/robot.png"
        alt="GlucoBot"
        style={{
          width: "200px",
          marginBottom: "20px",
          animation: "float 3s ease-in-out infinite",
        }}
      />

      <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>
        ¡Registro Completado!
      </h2>

      <p
        style={{
          maxWidth: "300px",
          fontSize: "16px",
          color: "#444",
          marginBottom: "30px",
        }}
      >
        Tu ficha clínica está lista.  
        A partir de ahora GlucoBot te acompañará todos los días.
      </p>

      <button
        style={{
          padding: "15px 40px",
          fontSize: "18px",
          background: "#1F4FFF",
          borderRadius: "12px",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          width: "100%",
          maxWidth: "260px",
        }}
        onClick={() => (window.location.href = "/home")}
      >
        Ir al Inicio
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
