import { useEffect, useState } from "react";
import { getPatientData } from "../services/patientStorage";

export default function Home() {
  const [patient, setPatient] = useState<any>(null);

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
        textAlign: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🌌 Fondo Animado */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          left: "-50px",
          width: "200%",
          height: "200%",
          background:
            "radial-gradient(circle at center, #1F4FFF22 0%, transparent 70%)",
          animation: "pulse 6s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ zIndex: 1, width: "100%", maxWidth: "450px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
          ¡Hola {patient?.nombre || "usuario"}! 👋
        </h1>

        <p style={{ marginTop: "5px", color: "#555", fontSize: "16px" }}>
          GlucoBot está listo para acompañarte hoy.
        </p>

        <img
          src="/robot.png"
          alt="GlucoBot"
          style={{
            width: "180px",
            margin: "25px auto",
            animation: "float 3s ease-in-out infinite",
          }}
        />

        {/* Accesos rápidos */}
        <div style={{ marginTop: "20px" }}>
          <button style={btn} onClick={() => (window.location.href = "/medicines")}>
            💊 Mis Medicinas
          </button>

          <button style={btn} onClick={() => (window.location.href = "/glucose")}>
            🩸 Glicemia
          </button>

          <button style={btn} onClick={() => (window.location.href = "/food")}>
            🍽️ Alimentación
          </button>

          <button style={btn} onClick={() => (window.location.href = "/appointments")}>
            📅 Mis Citas
          </button>
        </div>
      </div>

      {/* FOOTER CORPORATIVO */}
      <footer
        style={{
          zIndex: 1,
          width: "100%",
          maxWidth: "450px",
          textAlign: "center",
          marginTop: "30px",
          padding: "15px 0",
          color: "#777",
          fontSize: "12px",
        }}
      >
        <p style={{ marginBottom: "6px" }}>
          © {new Date().getFullYear()} Todos los derechos reservados – <strong>Leucode.IA</strong>
        </p>

        <div style={{ fontSize: "12px" }}>
          <a href="https://indepsalud.cl" target="_blank" style={footerLink}>
            indepsalud.cl
          </a>{" "}
          |
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

          @keyframes pulse {
            0% { opacity: 0.35; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.15); }
            100% { opacity: 0.35; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}

const btn: React.CSSProperties = {
  width: "100%",
  padding: "15px",
  marginTop: "10px",
  background: "#1F4FFF",
  color: "white",
  borderRadius: "12px",
  fontSize: "17px",
  border: "none",
  cursor: "pointer",
};

const footerLink: React.CSSProperties = {
  color: "#1F4FFF",
  marginLeft: "5px",
  marginRight: "5px",
  textDecoration: "none",
};
