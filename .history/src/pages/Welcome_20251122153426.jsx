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
      {/* 🌊 ONDAS AZULES ANIMADAS */}
      <div
        style={{
          position: "absolute",
          bottom: "-35%",
          right: "-20%",
          width: "1100px",
          height: "1100px",
          background:
            "radial-gradient(circle at center, rgba(31,79,255,0.17) 0%, rgba(31,79,255,0.14) 25%, rgba(31,79,255,0.1) 45%, rgba(31,79,255,0.06) 65%, transparent 85%)",
          animation: "pulseWaves 9s ease-in-out infinite",
          zIndex: 0,
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

        <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
          ¡Hola! Soy GlucoBot 🤖
        </h1>

        <p
          style={{
            maxWidth: "320px",
            color: "#444",
            margin: "0 auto",
            fontSize: "16px",
          }}
        >
          Tu compañero diario para ayudarte a controlar la diabetes con apoyo,
          recordatorios y educación personalizada.
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
        <p>© {new Date().getFullYear()} Leucode.IA — Todos los derechos reservados</p>
        <div>
          <a href="https://indepsalud.cl" target="_blank" style={fl}>
            indepsalud.cl
          </a>{" "}
          |{" "}
          <a href="https://leucode.cl" target="_blank" style={fl}>
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
          @keyframes pulseWaves {
            0% { transform: scale(1); opacity: .8; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: .8; }
          }
        `}
      </style>
    </div>
  );
}

const fl: React.CSSProperties = {
  color: "#1F4FFF",
  textDecoration: "none",
};
