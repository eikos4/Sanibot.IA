import { useEffect, useState } from "react";
import { getPatientData } from "../services/patientStorage";
import { useNavigate } from "react-router-dom";


// @ts-ignore
import { getLastGlucose, getGlucoseHistory } from "../services/glucoseStorage";
// @ts-ignore
import { getNextAppointment } from "../services/appointmentStorage";
import HealthTrendChart from "../components/HealthTrendChart";
import HydrationWidget from "../components/HydrationWidget";

// Basic User Interface
interface User {
  nombre: string;
}

interface HomeProps {
  greeting: string;
  patient: User | null;
  navigate: (path: string) => void;
}

export default function Home() {
  const [patient, setPatient] = useState(null);
  const [greeting, setGreeting] = useState("¡Hola!");
  const [isDesktop, setIsDesktop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setPatient(getPatientData());

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("¡Buenos días!");
    else if (hour < 18) setGreeting("¡Buenas tardes!");
    else setGreeting("¡Buenas noches!");

    const checkDesktop = () =>
      setIsDesktop(window.matchMedia("(min-width: 1024px)").matches);

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return isDesktop ? (
    <HomeDesktop greeting={greeting} patient={patient} navigate={navigate} />
  ) : (
    <HomeMobile greeting={greeting} patient={patient} navigate={navigate} />
  );
}

/* --------------------------  MODO DESKTOP  -------------------------- */
function HomeDesktop({ greeting, patient, navigate }: HomeProps) {
  return (
    <div className="desktop-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon">🩺</span>
            <h2 className="logo-text">GlucoBot</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarItem("💊", "Medicamentos", "/medicines", navigate)}
          {sidebarItem("🩸", "Glicemia", "/glucose", navigate)}
          {sidebarItem("🍽", "Alimentación", "/food", navigate)}
          {sidebarItem("📅", "Citas", "/appointments", navigate)}
          {sidebarItem("🤖", "GlucoBot", "/robot", navigate)}
          {sidebarItem("👤", "Mi Perfil", "/profile", navigate)}
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        {/* Robot flotante eliminado (ahora es global en MainLayout) */}

        {/* ENCABEZADO */}
        <header className="page-header">
          <h1 className="page-title">
            {greeting}, {patient?.nombre || "usuario"} 👋
          </h1>
          <p className="page-subtitle">Tu panel de control personal</p>

          <div style={{ display: "flex", gap: "20px", marginTop: "30px", marginBottom: "10px" }}>
            <div style={{ flex: 1, background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "12px", color: "#666" }}>Última Glicemia</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: getLastGlucose()?.valor > 180 ? "#EF4444" : "#10B981" }}>
                {getLastGlucose()?.valor ? `${getLastGlucose().valor} mg/dL` : "Sin datos"}
              </div>
            </div>
            {/* WIDGET PRÓXIMA CITA */}
            <div style={{ flex: 1, background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "12px", color: "#666" }}>Próxima Cita</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#6366F1" }}>
                {(() => {
                  const next = getNextAppointment();
                  if (!next) return "Sin citas pendientes";
                  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
                  const d = new Date(next.fecha);
                  // Ajustamos por la zona horaria si es necesario o asumimos local
                  return `${dias[d.getDay()]} ${d.getDate()} - ${next.hora}`;
                })()}
              </div>
            </div>
          </div>
        </header>

        {/* GRID DE CARDS */}
        <div className="cards-grid">
          {/* Insertamos los gráficos */}
          <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <HealthTrendChart
              title="Tendencia Glucosa"
              data={getGlucoseHistory()}
              type="glucose"
            />
            <HealthTrendChart
              title="Tendencia Presión Arterial"
              data={JSON.parse(localStorage.getItem("pressureHistory") || "[]")}
              type="pressure"
            />
          </div>
          <div style={{ gridColumn: "1 / -1", marginBottom: "20px" }}>
            <HydrationWidget />
          </div>

          {bigCard("💊", "Gestión de Medicamentos", "/medicines", "#EEF2FF", "#6366F1", navigate)}
          {bigCard("🩸", "Registro de Glicemia", "/glucose", "#FEF2F2", "#EF4444", navigate)}
          {bigCard("❤️", "Presión Arterial", "/pressure", "#FFF1F2", "#BE123C", navigate)}
          {bigCard("⚖️", "Control de Peso", "/weight", "#F3E8FF", "#7C3AED", navigate)}
          {bigCard("🍽", "Control de Alimentación", "/food", "#F0FDF4", "#10B981", navigate)}
          {bigCard("📅", "Citas Médicas", "/appointments", "#FFF7ED", "#F59E0B", navigate)}
          {bigCard("🤖", "Hablar con GlucoBot", "/robot", "#F5F3FF", "#8B5CF6", navigate)}
          {bigCard("📊", "Historia y Datos", "/profile", "#ECFEFF", "#06B6D4", navigate)}
        </div>

        {/* FOOTER */}
        <footer className="footer">
          © {new Date().getFullYear()} Leucode.IA — Todos los derechos
          reservados ·{" "}
          <a
            href="https://indepsalud.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            indepsalud.cl
          </a>{" "}
          ·{" "}
          <a
            href="https://leucode.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            leucode.cl
          </a>
        </footer>
      </main>

      {/* ESTILOS */}
      <style>{`
        .desktop-container {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #F0F4FF 0%, #E8ECFF 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* SIDEBAR */
        .sidebar {
          width: 280px;
          background: white;
          padding: 0;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .sidebar-header {
          padding: 32px 24px;
          border-bottom: 1px solid #F1F5F9;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          font-size: 28px;
        }

        .logo-text {
          font-weight: 800;
          font-size: 24px;
          margin: 0;
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-nav {
          padding: 20px 16px;
          flex: 1;
          overflow-y: auto;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 12px;
          cursor: pointer;
          margin-bottom: 8px;
          transition: all 0.2s ease;
          font-size: 15px;
          font-weight: 500;
          color: #334155;
          background: transparent;
        }

        .sidebar-item:hover {
          background: #EEF2FF;
          color: #6366F1;
          transform: translateX(4px);
        }

        .sidebar-item-icon {
          font-size: 22px;
          transition: transform 0.2s ease;
        }

        .sidebar-item:hover .sidebar-item-icon {
          transform: scale(1.1);
        }

        /* MAIN CONTENT */
        .main-content {
          flex: 1;
          padding: 48px 64px;
          position: relative;
          overflow-y: auto;
          max-width: 1600px;
          margin: 0 auto;
        }

        .floating-robot {
          width: 140px;
          position: absolute;
          top: 24px;
          right: 24px;
          animation: float 3s ease-in-out infinite;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
          z-index: 10;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }

        /* HEADER */
        .page-header {
          margin-bottom: 48px;
          max-width: 600px;
        }

        .page-title {
          font-size: 36px;
          margin: 0 0 12px 0;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.5px;
        }

        .page-subtitle {
          color: #64748B;
          margin: 0;
          font-size: 18px;
          font-weight: 400;
        }

        /* CARDS GRID */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 28px;
          margin-bottom: 60px;
        }

        .big-card {
          background: white;
          border-radius: 20px;
          padding: 36px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .big-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--card-accent);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .big-card:hover::before {
          transform: scaleX(1);
        }

        .big-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        }

        .card-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          background: var(--card-bg);
          transition: transform 0.3s ease;
        }

        .big-card:hover .card-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        .card-icon {
          font-size: 36px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
          line-height: 1.4;
        }

        /* FOOTER */
        .footer {
          margin-top: 80px;
          padding-top: 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          color: #64748B;
          font-size: 14px;
          text-align: center;
        }

        .footer-link {
          color: #6366F1;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: #4F46E5;
          text-decoration: underline;
        }

        /* RESPONSIVE ADJUSTMENTS */
        @media (max-width: 1400px) {
          .main-content {
            padding: 40px 48px;
          }

          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 1200px) {
          .sidebar {
            width: 240px;
          }

          .floating-robot {
            width: 100px;
          }
        }
      `}</style>
    </div>
  );
}

/* Sidebar item helper */
function sidebarItem(icon: string, title: string, path: string, navigate: (path: string) => void) {
  return (
    <div
      onClick={() => navigate(path)}
      className="sidebar-item"
    >
      <span className="sidebar-item-icon">{icon}</span>
      <span>{title}</span>
    </div>
  );
}

/* Card helper con colores personalizados */
function bigCard(icon: string, title: string, path: string, bgColor: string, accentColor: string, navigate: (path: string) => void) {
  return (
    <div
      onClick={() => navigate(path)}
      className="big-card"
      style={{
        "--card-bg": bgColor,
        "--card-accent": accentColor,
      } as React.CSSProperties}
    >
      <div className="card-icon-wrapper">
        <span className="card-icon">{icon}</span>
      </div>
      <h3 className="card-title">{title}</h3>
    </div>
  );
}

/* --------------------------  MODO MOBILE  -------------------------- */
function HomeMobile({ greeting, patient, navigate }: HomeProps) {
  return (
    <div className="mobile-container">
      {/* Hero Section */}
      <div className="mobile-hero">
        <img src="/robot.png" alt="GlucoBot" className="mobile-robot" />
        <h1 className="mobile-greeting">
          {greeting}
          <br />
          <span className="mobile-name">{patient?.nombre || "usuario"}</span> 👋
        </h1>
        <p className="mobile-subtitle">¿Qué quieres hacer hoy?</p>

        <div style={{ padding: "0 16px", marginTop: "20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>Resumen</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1, background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "12px", color: "#666" }}>Última Glicemia</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: getLastGlucose()?.valor > 180 ? "#EF4444" : "#10B981" }}>
                {getLastGlucose()?.valor ? `${getLastGlucose().valor} mg/dL` : "Sin datos"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SOS BUTTON */}
      <div style={{ marginTop: "25px", padding: "0 16px" }}>
        <button
          onClick={() => window.open("tel:131")}
          style={{
            width: "100%",
            background: "#EF4444",
            color: "white",
            padding: "15px",
            borderRadius: "16px",
            border: "none",
            fontWeight: "bold",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)"
          }}
        >
          🆘 LLAMADA DE EMERGENCIA
        </button>
      </div>


      {/* Quick Actions */}
      <div className="mobile-cards">
        <div style={{ gridColumn: "1 / -1", display: "grid", gap: "15px" }}>
          <HealthTrendChart
            title="Tendencia Glucosa"
            data={getGlucoseHistory()}
            type="glucose"
            color="#10B981"
          />
          {/* Gráfico de Presión - Leemos directamente del localStorage por ahora ya que no tenemos helper exportado */}
          <HealthTrendChart
            title="Tendencia Presión Arterial"
            data={JSON.parse(localStorage.getItem("pressureHistory") || "[]")}
            type="pressure"
            color="#F59E0B" // Naranja para sistólica
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <HydrationWidget />
        </div>
        {mobileCard("💊", "Medicamentos", "/medicines", "#EEF2FF", navigate)}
        {mobileCard("🩸", "Glicemia", "/glucose", "#FEF2F2", navigate)}
        {mobileCard("❤️", "Presión Arterial", "/pressure", "#FFF1F2", navigate)}
        {mobileCard("⚖️", "Control de Peso", "/weight", "#F3E8FF", navigate)}
        {mobileCard("🍽", "Alimentación", "/food", "#F0FDF4", navigate)}
        {mobileCard("📅", "Citas", "/appointments", "#FFF7ED", navigate)}
        {mobileCard("🤖", "GlucoBot", "/robot", "#F5F3FF", navigate)}
        {mobileCard("👤", "Mi Perfil", "/profile", "#ECFEFF", navigate)}
      </div>

      {/* ESTILOS MOBILE */}
      <style>{`
        .mobile-container {
          min-height: 100vh;
          background: linear-gradient(180deg, #F0F4FF 0%, #FFFFFF 100%);
          padding: 0;
        }

        .mobile-hero {
          text-align: center;
          padding: 40px 20px 32px;
          background: white;
          border-radius: 0 0 32px 32px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          margin-bottom: 24px;
        }

        .mobile-robot {
          width: 140px;
          height: auto;
          margin-bottom: 20px;
          animation: float 3s ease-in-out infinite;
        }

        .mobile-greeting {
          font-size: 24px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .mobile-name {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mobile-subtitle {
          color: #64748B;
          font-size: 16px;
          margin: 0;
        }

        .mobile-cards {
          padding: 0 16px 24px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .mobile-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.04);
          min-height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .mobile-card:active {
          transform: scale(0.95);
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
        }

        .mobile-card-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          background: var(--card-bg);
          margin-bottom: 4px;
        }

        .mobile-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #0F172A;
          margin: 0;
          line-height: 1.3;
        }

        /* Mejoras táctiles para Android */
        @media (max-width: 767px) {
          .mobile-card {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
        }

        /* Pantallas muy pequeñas */
        @media (max-width: 360px) {
          .mobile-cards {
            gap: 12px;
          }

          .mobile-card {
            padding: 20px 16px;
            min-height: 120px;
          }

          .mobile-card-icon {
            width: 48px;
            height: 48px;
            font-size: 28px;
          }

          .mobile-card-title {
            font-size: 14px;
          }
        }
      `}</style>
    </div >
  );
}

/* Mobile card helper */
function mobileCard(icon: string, title: string, path: string, bgColor: string, navigate: (path: string) => void) {
  return (
    <div
      onClick={() => navigate(path)}
      className="mobile-card"
      style={{ "--card-bg": bgColor } as React.CSSProperties}
    >
      <div className="mobile-card-icon">
        <span>{icon}</span>
      </div>
      <h3 className="mobile-card-title">{title}</h3>
    </div>
  );
}