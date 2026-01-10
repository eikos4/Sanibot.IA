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

    // Detectar escritorio
    const handleResize = () => {
      setIsDesktop(window.matchMedia("(min-width: 800px)").matches);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: isDesktop ? "40px" : "20px",
        textAlign: "center",
        position: "relative",
        background:  #F7F9FF)",
        overflow: "hidden",
      }}
    >
      {/* 🔵 FONDO ANIMADO – SE VE COMPLETO EN DESKTOP */}
      <div
        style={{
          position: "absolute",
          top: isDesktop ? "-20%" : "-40%",
          left: isDesktop ? "-10%" : "-30%",
          width: isDesktop ? "1600px" : "1000px",
          height: isDesktop ? "1600px" : "1000px",
          background:
            "radial-gradient(circle at center, rgba(31,79,255,0.18) 0%, rgba(31,79,255,0.10) 28%, rgba(31,79,255,0.05) 45%, transparent 70%)",
          animation: "pulseBG 9s ease-in-out infinite",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* CONTENIDO */}
      <div
        style={{
          zIndex: 2,
          width: "100%",
          maxWidth: isDesktop ? "900px" : "450px",
        }}
      >
        <img
          src="/robot.png"
          alt="GlucoBot"
          style={{
            width: isDesktop ? "220px" : "170px",
            margin: "0 auto 10px",
            animation: "float 3s ease-in-out infinite",
          }}
        />

        <h1 style={{ fontSize: isDesktop ? "32px" : "24px", marginBottom: "8px" }}>
          {greeting} {patient?.nombre || "usuario"} 👋
        </h1>

        <p style={{ color: "#555", marginBottom: "30px", fontSize: "15px" }}>
          ¿Qué deseas hacer hoy?
        </p>

        {/* GRID — 2 columnas en mobile, 3 columnas en desktop */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
            gap: "20px",
          }}
        >
          {optionCard("💊", "Medicamentos", "/medicines")}
          {optionCard("🩸", "Glicemia", "/glucose")}
          {optionCard("🍽", "Alimentación", "/food")}
          {optionCard("📅", "Citas", "/appointments")}
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
        <a href="https://indepsalud.cl" target="_blank" style={footerLink}>indepsalud.cl</a> |{" "}
        <a href="https://leucode.cl" target="_blank" style={footerLink}>leucode.cl</a>
      </footer>

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

function optionCard(icon, title, path) {
  return (
    <div
      onClick={() => (window.location.href = path)}
      style={{
        background: "#fff",
        borderRadius: "18px",
        padding: "24px 10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
        cursor: "pointer",
        transition: "transform .2s ease, box-shadow .2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.10)";
      }}
    >
      <div style={{ fontSize: "34px", marginBottom: "10px" }}>{icon}</div>
      <div style={{ fontSize: "16px", color: "#333" }}>{title}</div>
    </div>
  );
}

const footerLink = {
  color: "#1F4FFF",
  textDecoration: "none",
};
