export default function Welcome() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        textAlign: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🔮 GRADIENTE AZUL ANIMADO */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(31,79,255,0.2), rgba(90,150,255,0.15), rgba(160,120,255,0.2))",
          backgroundSize: "300% 300%",
          animation: "gradientMove 12s ease infinite",
          zIndex: 0,
        }}
      />

      {/* ✨ PARTÍCULAS FLOTANTES */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${6 + Math.random() * 10}px`,
              height: `${6 + Math.random() * 10}px`,
              background: "rgba(31, 79, 255, 0.35)",
              borderRadius: "50%",
              animation: `floatParticle ${4 + Math.random() * 6}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* CONTENIDO */}
      <div style={{ zIndex: 2 }}>
        <img
          src="/robot.png"
          alt="GlucoBot"
          style={{
            width: "200px",
            marginBottom: "20px",
            animation: "float 3s ease-in-out infinite",
          }}
        />

        <h1
          style={{
            fontSize: "32px",
            marginBottom: "10px",
            color: "#1F1F1F",
          }}
        >
          ¡Hola! Soy GlucoBot 🤖
        </h1>

        <p
          style={{
            maxWidth: "300px",
            color: "#444",
            margin: "0 auto",
            fontSize: "16px",
          }}
        >
          Estaré contigo todos los días para ayudarte a controlar tu diabetes con
          recordatorios, educación y apoyo personalizado.
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
            width: "100%",
            maxWidth: "260px",
          }}
          onClick={() => (window.location.href = "/register")}
        >
          Comenzar
        </button>
      </div>

      {/* FOOTER */}
      <footer
        style={{
          zIndex: 2,
          marginTop: "40px",
          paddingBottom: "10px",
          color: "#777",
          fontSize: "12px",
        }}
      >
        <p style={{ marginBottom: "4px" }}>
          © {new Date().getFullYear()} Leucode.IA — Todos los derechos reservados
        </p>
        <div>
          <a href="https://indepsalud.cl" target="_blank" style={footerLink}>
            indepsalud.cl
          </a>{" "}
          |{" "}
          <a href="https://leucode.cl" target="_blank" style={footerLink}>
            leucode.cl
          </a>
        </div>
      </footer>

      {/* ANIMACIONES */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes floatParticle {
            0% { transform: translateY(0px); opacity: 0.7; }
            50% { transform: translateY(-30px); opacity: 1; }
            100% { transform: translateY(0px); opacity: 0.7; }
          }

          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
}

const footerLink = {
  color: "#1F4FFF",
  textDecoration: "none",
};
