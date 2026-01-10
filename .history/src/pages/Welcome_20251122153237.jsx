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
      {/* 🌌 Fondo Animado */}
      <div
        style={{
          
        }}
      ></div>

      {/* CONTENIDO */}
      <div style={{ zIndex: 1 }}>
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
          zIndex: 1,
          marginTop: "40px",
          paddingBottom: "10px",
          color: "#777",
          fontSize: "12px",
        }}
      >
        <p style={{ marginBottom: "4px" }}>
          © {new Date().getFullYear()} Leucode.IA — Todos los derechos
          reservados
        </p>
        <div>
          <a
            href="https://indepsalud.cl"
            target="_blank"
            style={footerLink}
          >
            indepsalud.cl
          </a>{" "}
          |{" "}
          <a
            href="https://leucode.cl"
            target="_blank"
            style={footerLink}
          >
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

          @keyframes wavePulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
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
