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

    const check = () =>
      setIsDesktop(window.matchMedia("(min-width: 900px)").matches);

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "linear-gradient(to bottom, #F6F8FF, #E9EEFF)",
        position: "relative",
        overflow: "hidden",
        paddingTop: isDesktop ? "60px" : "20px",
      }}
    >
      {/* 🔵 Fondo animado profesional */}
      <div
        style={{
          position: "absolute",
          top: isDesktop ? "-25%" : "-40%",
          left: isDesktop ? "30%" : "-20%",
          width: isDesktop ? "1500px" : "900px",
          height: isDesktop ? "1500px" : "900px",
          background:
           
          animation: "pulseBG 12s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      {/* CONTENEDOR PRINCIPAL RESPONSIVE */}
      <div
        style={{
          zIndex: 2,<
          width: "100%",
          maxWidth: isDesktop ? "1100px" : "450px",
          padding: "0 20px",
        }}
      >
        {/* HEADER CON SANIBOT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "18px",
          }}
        >
          <img
            src="/sanibot.png"
            alt="SaniBot"
            style={{
              width: isDesktop ? "90px" : "70px",
              animation: "float 3s ease-in-out infinite",
            }}
          />

          <div style={{ textAlign: "left" }}>
            <h1
              style={{
                margin: 0,
                fontSize: isDesktop ? "34px" : "24px",
                fontWeight: 700,
                color: "#1F1F1F",
              }}
            >
              {greeting} {patient?.nombre || "usuario"} 👋
            </h1>
            <p
              style={{
                margin: 0,
                color: "#555",
                fontSize: isDesktop ? "17px" : "14px",
              }}
            >
              Estoy aquí para guiarte hoy 📅
            </p>
          </div>
        </div>

        {/* GRID DE OPCIONES (mobile 2 columnas / desktop 3 columnas) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop
              ? "repeat(3, 1fr)"
              : "repeat(2, 1fr)",
            gap: isDesktop ? "26px" : "16px",
            marginTop: "30px",
          }}
        >
          {optionCard("💊", "Medicamentos", "/medicines", isDesktop)}
          {optionCard("🩸", "Glicemia", "/glucose", isDesktop)}
          {optionCard("🍽", "Alimentación", "/food", isDesktop)}
          {optionCard("📅", "Citas Médicas", "/appointments", isDesktop)}
          {optionCard("🤖", "Hablar con Bot", "/robot", isDesktop)}
          {optionCard("👤", "Mi Perfil", "/profile", isDesktop)}
        </div>

        {/* FOOTER */}
        <footer
          style={{
            textAlign: "center",
            marginTop: "40px",
            paddingBottom: "15px",
            color: "#777",
            fontSize: "13px",
          }}
        >
          © {new Date().getFullYear()} <b>Leucode.IA</b> — Salud Inteligente  
          <br />
          <a href="https://indepsalud.cl" style={footerLink}>
            indepsalud.cl
          </a>{" "}
          ·{" "}
          <a href="https://leucode.cl" style={footerLink}>
            leucode.cl
          </a>
        </footer>
      </div>

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
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
        padding: desktop ? "28px 10px" : "20px 10px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        cursor: "pointer",
        userSelect: "none",
        transition: "all .25s ease",
        textAlign: "center",
      }}
      onMouseEnter={(e) => {
        if (desktop) {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "0 10px 26px rgba(0,0,0,0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (desktop) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
        }
      }}
    >
      <div style={{ fontSize: desktop ? "40px" : "32px" }}>{icon}</div>
      <div style={{ marginTop: "10px", fontSize: desktop ? "17px" : "15px" }}>
        {title}
      </div>
    </div>
  );
}

const footerLink = {
  color: "#1F4FFF",
  textDecoration: "none",
  fontWeight: "600",
};
