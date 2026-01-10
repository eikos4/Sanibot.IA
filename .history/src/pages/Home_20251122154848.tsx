import { useEffect, useState } from "react";
import { getPatientData } from "../services/patientStorage";

export default function Home() {
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const data = getPatientData();
    setPatient(data);
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🔵 Fondo de ondas suaves */}
      <div
        style={{
          position: "absolute",
          top: "-40%",
          left: "-20%",
          width: "1200px",
          height: "1200px",
          background:
            "radial-gradient(circle at center, rgba(31,79,255,0.18) 0%, rgba(31,79,255,0.12) 25%, rgba(31,79,255,0.08) 40%, transparent 70%)",
          animation: "pulseBG 8s ease-in-out infinite",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* CONTENIDO */}
      <div style={{ zIndex: 2, width: "100%", maxWidth: "450px" }}>
        {/* ROBOT */}
        <img
          src="/robot.png"
          alt="GlucoBot"
          style={{
            width: "160px",
            margin: "0 auto 20px",
            animation: "float 3s ease-in-out infinite",
          }}
        />

        {/* SALUDO */}
        <h1 style={{ fontSize: "26px", marginBottom: "10px" }}>
          ¡Hola {patient?.nombre || "usuario"}! 👋
        </h1>

        <p style={{ color: "#444", marginBottom: "20px" }}>
          ¿Qué deseas hacer hoy?
        </p>

        {/* BOTONES */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "10px",
          }}
        >
          <button style={btn} onClick={() => (window.location.href = "/medicines")}>
            💊 Medicamentos
          </button>

          <button style={btn} onClick={() => (window.location.href = "/glucose")}>
            🩸 Registrar Glicemia
          </button>

          <button style={btn} onClick={() => (window.location.href = "/food")}>
            🍽 Alimentación
          </button>

          <button style={btn} onClick={() => (window.location.href = "/appointments")}>
            📅 Citas Médicas
          </button>

          <button style={btn} onClick={() => (window.location.href = "/robot")}>
            🤖 Hablar con GlucoBot
          </button>
        </div>
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
        <p>© {new Date().getFullYear()} Leucode.IA — Todos los derechos reservados</p>
        <a href="https://indepsalud.cl" target="_blank" style={footerLink}>
          indepsalud.cl
        </a>{" "}
        |{" "}
        <a href="https://leucode.cl" target="_blank" style={footerLink}>
          leucode.cl
        </a>
      </footer>

      {/* ANIMACIONES */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes pulseBG {
            0% { transform: scale(1); opacity: .8; }
            50% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); opacity: .8; }
          }
        `}
      </style>
    </div>
  );
}

const btn = {
  width: "100%",
  padding: "15px",
  backgroundColor: "#1F4FFF",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontSize: "18px",
  cursor: "pointer",
};

const footerLink = {
  color: "#1F4FFF",
  textDecoration: "none",
};