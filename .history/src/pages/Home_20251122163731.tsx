import { useEffect, useState } from "react";
import { getPatientData } from "../services/patientStorage";

export default function Home() {
  const [patient, setPatient] = useState(null);
  const [greeting, setGreeting] = useState("¡Hola!");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const data = getPatientData();
    setPatient(data);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("¡Buenos días!");
    else if (hour < 18) setGreeting("¡Buenas tardes!");
    else setGreeting("¡Buenas noches!");

    const checkDesktop = () =>
      setIsDesktop(window.matchMedia("(min-width: 800px)").matches);

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        padding: isDesktop ? "50px 0" : "20px 0",
        background: "linear-gradient(to bottom, #F7F9FF, #EDF3FF)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🔵 Fondo animado premium */}
      <div
        style={{
          position: "absolute",
          top: isDesktop ? "-30%" : "-45%",
          left: isDesktop ? "20%" : "-20%",
          width: isDesktop ? "1400px" : "900px",
          height: isDesktop ? "1400px" : "900px",
          background:
            "radial-gradient(circle at center, rgba(31,79,255,0.20), rgba(31,79,255,0.12) 30%, rgba(31,79,255,0.05) 50%, transparent 80%)",
          animation: "pulseBG 10s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* CONTENIDO */}
      <div
        style={{
          zIndex: 2,
          width: "100%",
          maxWidth: isDesktop ? "1000px" : "450px",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        {/* Robot */}
        <img
          src="/robot.png"
          alt="GlucoBot"
          style={{
            width: isDesktop ? "240px" : "160px",
            margin: "0 auto 20px",
            animation: "float 3s ease-in-out infinite",
          }}
        />

        {/* Saludo */}
        <h1
          style={{
            fontSize: isDesktop ? "34px" : "24px",
            marginBottom: "8px",
            fontWeight: "700",
            color: "#1F1F1F",
          }}
        >
          {greeting} {patient?.nombre || "usuario"} 👋
        </h1>

        <p
          style={{
            color: "#555",
            marginBottom: "35px",
            fontSize: isDesktop ? "17px" : "15px",
          }}
        >
          ¿Qué deseas hacer hoy?
        </p>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
            gap: isDesktop ? "28px" : "18px",
            paddingBottom: "20px",
          }}
        >
          {optionCard("💊", "Medicamentos", "/medicines", isDesktop)}
          {optionCard("🩸", "Glicemia", "/glucose", isDesktop)}
          {optionCard("🍽", "Alimentación", "/food", isDesktop)}
          {optionCard("📅", "Citas", "/appointments", isDesktop)}
          {optionCard("🤖", "Hablar con Bot", "/robot", isDesktop)}
          {optionCard("👤", "Perfil", "/profile", isDesktop)}
        </div>

        {/* FOOTER */}
        <footer
          style={{
            paddingTop: "20px",
            paddingBottom: "10px",
            color: "#777",
            fontSize: "13px",
          }}
        >
          <p style={{ marginBottom: "4px" }}>
            © {new Date().getFullYear()} Leucode.IA — Todos los derechos reservados
          </p>
          <a href="https://indepsalud.cl" style={footerLink}>indepsalud.cl</a> ·{" "}
          <a href="https://leucode.cl" style={footerLink}>leucode.cl</a>
        </footer>
      </div>

      {/* ANIMACIONES */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }

          @keyframes pulseBG {
            0% { transform: scale(1); opacity: .7; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: .7; }
          }
        `}
      </style>
    </div>
  );
}

function optionCard(icon, title, path, desktop) {
  return (
    <div
      onClick={() => (window.location.href = path)}
      style={{
        background: "#fff",
        borderRadius: "20px",
        padding: desktop ? "26px 10px" : "20px 8px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "all .25s ease",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        if (desktop) {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (desktop) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)";
        }
      }}
    >
      <div style={{ fontSize: desktop ? "38px" : "32px", marginBottom: "10px" }}>
        {icon}
      </div>
      <div style={{ fontSize: desktop ? "17px" : "15px", color: "#333" }}>
        {title}
      </div>
    </div>
  );
}

const footerLink = {
  color: "#1F4FFF",
  textDecoration: "none",
  fontWeight: "500",
};
