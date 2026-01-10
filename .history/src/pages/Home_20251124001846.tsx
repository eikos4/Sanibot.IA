import { useEffect, useState } from "react";
import { getPatientData } from "../services/patientStorage";

export default function Home() {
  const [patient, setPatient] = useState(null);
  const [greeting, setGreeting] = useState("¡Hola!");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setPatient(getPatientData());

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("¡Buenos días!");
    else if (hour < 18) setGreeting("¡Buenas tardes!");
    else setGreeting("¡Buenas noches!");

    const checkDesktop = () =>
      setIsDesktop(window.matchMedia("(min-width: 900px)").matches);

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return isDesktop ? <HomeDesktop greeting={greeting} patient={patient}/> : <HomeMobile greeting={greeting} patient={patient}/>;
}


/* --------------------------  MODO DESKTOP  -------------------------- */
function HomeDesktop({ greeting, patient }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F4F6FF",
        overflow: "hidden",
      }}
    >

      {/* SIDEBAR */}
      <aside
        style={{
          width: "260px",
          background: "white",
          padding: "30px 20px",
          boxShadow: "2px 0 12px rgba(0,0,0,0.05)"
        }}
      >
        <h2 style={{ fontWeight: 800, fontSize: "22px", marginBottom: "30px" }}>
          GlucoBot Panel
        </h2>

        {sidebarItem("💊", "Medicamentos", "/medicines")}
        {sidebarItem("🩸", "Glicemia", "/glucose")}
        {sidebarItem("🍽", "Alimentación", "/food")}
        {sidebarItem("📅", "Citas", "/appointments")}
        {sidebarItem("🤖", "GlucoBot", "/robot")}
        {sidebarItem("👤", "Mi Perfil", "/profile")}
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main
        style={{
          flexGrow: 1,
          padding: "40px 60px",
          position: "relative",
        }}
      >

        {/* Robot esquina */}
        <img
          src="/robot.png"
          alt="GlucoBot"
          style={{
            width: "120px",
            position: "absolute",
            top: "20px",
            right: "20px",
            animation: "float 3s ease-in-out infinite",
            opacity: .9
          }}
        />

        {/* ENCABEZADO */}
        <h1 style={{ fontSize: "32px", marginBottom: "10px", fontWeight: 700 }}>
          {greeting}, {patient?.nombre || "usuario"} 👋
        </h1>

        <p style={{ color: "#666", marginBottom: "40px", fontSize: "18px" }}>
          Tu panel de control personal
        </p>

        {/* GRID 3 COLUMNAS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "28px",
          }}
        >
          {bigCard("💊", "Gestión de Medicamentos", "/medicines")}
          {bigCard("🩸", "Registro de Glicemia", "/glucose")}
          {bigCard("🍽", "Control de Alimentación", "/food")}
          {bigCard("📅", "Citas Médicas", "/appointments")}
          {bigCard("🤖", "Hablar con GlucoBot", "/robot")}
          {bigCard("📊", "Historia y Datos", "/profile")}
        </div>

        {/* FOOTER WEB */}
        <footer
          style={{
            marginTop: "60px",
            color: "#777",
            fontSize: "13px",
          }}
        >
          © {new Date().getFullYear()} Leucode.IA — Todos los derechos reservados ·{" "}
          <a href="https://indepsalud.cl" target="_blank" style={footerLink}>indepsalud.cl</a>{" "}
          ·{" "}
          <a href="https://leucode.cl" target="_blank" style={footerLink}>leucode.cl</a>
        </footer>

        {/* ANIMACIONES */}
        <style>
          {`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
              100% { transform: translateY(0px); }
            }
          `}
        </style>
      </main>
    </div>
  );
}

/* Sidebar item */
function sidebarItem(icon, title, path) {
  return (
    <div
      onClick={() => (window.location.href = path)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 10px",
        borderRadius: "10px",
        cursor: "pointer",
        marginBottom: "6px",
        transition: "background .2s",
        fontSize: "16px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#EDF2FF")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ fontSize: "22px" }}>{icon}</span>
      {title}
    </div>
  );
}

/* Card grande web */
function bigCard(icon, title, path) {
  return (
    <div
      onClick={() => (window.location.href = path)}
      style={{
        background: "white",
        borderRadius: "18px",
        padding: "30px",
        cursor: "pointer",
        boxShadow: "0 6px 18px rgba(0,0,0,0.07)",
        transition: "transform .25s, box-shadow .25s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.07)";
      }}
    >
      <div style={{ fontSize: "40px", marginBottom: "10px" }}>{icon}</div>
      <div style={{ fontSize: "18px", fontWeight: 600 }}>{title}</div>
    </div>
  );
}



/* --------------------------  MODO MOBILE  -------------------------- */
function HomeMobile({ greeting, patient }) {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <img src="/robot.png" style={{ width: "150px" }} />
      <h2>{greeting} {patient?.nombre}</h2>
      {/* ... mismos botones mobile que ya tienes ... */}
    </div>
  );
}

const footerLink = {
  color: "#1F4FFF",
  textDecoration: "none",
};
