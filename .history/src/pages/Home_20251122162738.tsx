import { useEffect, useState } from "react";
import { getPatientData } from "../services/patientStorage";

export default function Home() {
  const [patient, setPatient] = useState(null);
  const [greeting, setGreeting] = useState("¡Hola!");

  useEffect(() => {
    const data = getPatientData();
    setPatient(data);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("¡Buenos días!");
    else if (hour < 18) setGreeting("¡Buenas tardes!");
    else setGreeting("¡Buenas noches!");
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        textAlign: "center",
        position: "relative",
        background: "linear-gradient(to top, #E9EEFF, #F7F9FF)",
        overflow: "hidden",
      }}
    >
      {/* Fondo animado */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: "-20%",
          width: "1000px",
          height: "1000px",
          background:
            "radial-gradient(circle at center, rgba(31,79,255,0.18) 0%, rgba(31,79,255,0.1) 28%, rgba(31,79,255,0.05) 45%, transparent 70%)",
          animation: "pulseBG 9s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      {/* CONTENIDO */}
      <div
        style={{
          zIndex: 2,
          width: "100%",
          maxWidth: "1000px",
          padding: "0 20px",
        }}
      >
        {/* ROBOT */}
        <img
          src="/robot.png"
          alt="GlucoBot"
          style={{
            width: "200px",
            margin: "0 auto 10px",
            animation: "float 3s ease-in-out infinite",
          }}
        />

        {/* SALUDO */}
        <h1 style={{ fontSize: "32px", marginBottom: "5px" }}>
          {greeting} {patient?.nombre || "usuario"} 👋
        </h1>

        <p style={{ color: "#555", marginBottom: "25px", fontSize: "16px" }}>
          ¿Qué deseas hacer hoy?
        </p>

        {/* GRID RESPONSIVE (2 columnas en mobile / 3 en escritorio) */}
        <div
          style={{
            display: "grid",
            gap: "20px",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          {optionCard("💊", "Medicamentos", "/medicines")}
          {optionCard("🩸", "Glicemia", "/glucose")}
          {optionCard("🍽", "Alimentación", "/food")}
          {optionCard("📅", "Citas Médicas", "/appointments")}
          {optionCard("🤖", "Hablar con Bot", "/robot")}
          {optionCard("👤", "Mi Perfil", "/profile")}
        </div>
      </div>

      {/* FOOTER */}
      <footer
        style={{
          zIndex: 2,
          marginTop: "40px",
          paddingBottom: "20px",
          color: "#777",
          fontSize: "12px",
        }}
      >
        <p style={{ marginBottom: "4px" }}>
          © {new Date().getFullYear()} Leucode.IA — Todos los derechos reservados
        </p>

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
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }

          @keyframes pulseBG {
            0% { transform: scale(1); opacity: .75; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: .75; }
          }
        `}
      </style>
    </div>
  );
}

/* CARD COMPONENT */
function optionCard(icon, title, path) {
  return (
    <div
      onClick={() => (window.location.href = path)}
      style={{
        background: "#ffsdfdffdf",
        borderRadius: "18px",
        padding: "25px 10px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.10)",
        cursor: "pointer",
        transition: "transform .2s ease, box-shadow .2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.10)";
      }}
    >
      <div style={{ fontSize: "36px", marginBottom: "10px" }}>{icon}</div>
      <div style={{ fontSize: "17px", color: "#333" }}>{title}</div>
    </div>
  );
}

const footerLink = {
  color: "#1F4FFF",
  textDecoration: "none",
};
