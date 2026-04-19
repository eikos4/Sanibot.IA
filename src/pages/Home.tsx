import { useEffect, useState } from "react";
import { getPatientData } from "../services/patientStorage";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


// @ts-ignore
import { getLastGlucose, getGlucoseHistory } from "../services/glucoseStorage";
// @ts-ignore
import { getNextAppointment } from "../services/appointmentStorage";
import HealthTrendChart from "../components/HealthTrendChart";
import HydrationWidget from "../components/HydrationWidget";
import LinkRequestsWidget from "../components/LinkRequestsWidget";
import SaniBotScene from "../components/SaniBotScene";

// Basic User Interface
interface User {
  nombre: string;
}

interface HomeProps {
  greeting: string;
  patient: User | null;
  navigate: (path: string) => void;
  // New props for async data
  lastGlucose?: any;
  glucoseHistory?: any[];
  nextAppointment?: any;
}

export default function Home() {
  const { user: authUser } = useAuth();
  const [patient, setPatient] = useState<User | null>(null);
  const [greeting, setGreeting] = useState("¡Hola!");
  const [isDesktop, setIsDesktop] = useState(false);
  // States for async data
  const [lastGlucose, setLastGlucose] = useState<any>(null);
  const [glucoseHistory, setGlucoseHistory] = useState<any[]>([]);
  const [nextAppointment, setNextAppointment] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPatientData();
      setPatient(data as any);

      const lastG = await getLastGlucose();
      setLastGlucose(lastG);

      const history = await getGlucoseHistory();
      setGlucoseHistory(history);

      const nextApp = await getNextAppointment();
      setNextAppointment(nextApp);
    };
    fetchData();

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

  // Merge: use auth display name as fallback while patient data loads
  const effectivePatient: User | null = patient || (authUser?.name ? { nombre: authUser.name } : null);

  return isDesktop ? (
    <HomeDesktop
      greeting={greeting}
      patient={effectivePatient}
      navigate={navigate}
      lastGlucose={lastGlucose}
      glucoseHistory={glucoseHistory}
      nextAppointment={nextAppointment}
    />
  ) : (
    <HomeMobile
      greeting={greeting}
      patient={effectivePatient}
      navigate={navigate}
      lastGlucose={lastGlucose}
      glucoseHistory={glucoseHistory}
      nextAppointment={nextAppointment}
    />
  );
}

/* --------------------------  MODO DESKTOP  -------------------------- */
function HomeDesktop({ greeting, patient, navigate, lastGlucose, glucoseHistory, nextAppointment }: HomeProps) {
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
          {sidebarItem("🚭", "Dejar de Fumar", "/quit-smoking", navigate)}
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
              <div style={{ fontSize: "18px", fontWeight: "bold", color: (lastGlucose?.valor || 0) > 180 ? "#EF4444" : "#10B981" }}>
                {lastGlucose ? `${lastGlucose.valor} mg/dL` : "Sin datos"}
              </div>
            </div>
            {/* WIDGET PRÓXIMA CITA */}
            <div style={{ flex: 1, background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "12px", color: "#666" }}>Próxima Cita</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#6366F1" }}>
                {(() => {
                  if (!nextAppointment) return "Sin citas pendientes";
                  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
                  const d = new Date(nextAppointment.fecha);
                  // Ajustamos por la zona horaria si es necesario o asumimos local
                  return `${dias[d.getDay()]} ${d.getDate()} - ${nextAppointment.hora}`;
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
              data={glucoseHistory || []}
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
          {bigCard("💉", "Control de Insulina", "/insulin", "#EEE", "#4F46E5", navigate)}
          {bigCard("❤️", "Presión Arterial", "/pressure", "#FFF1F2", "#BE123C", navigate)}
          {bigCard("⚖️", "Control de Peso", "/weight", "#F3E8FF", "#7C3AED", navigate)}
          {bigCard("🍽", "Control de Alimentación", "/food", "#F0FDF4", "#10B981", navigate)}
          {bigCard("🚭", "Dejar de Fumar", "/quit-smoking", "#ECFDF5", "#059669", navigate)}
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
function HomeMobile({ greeting, patient, navigate, lastGlucose, glucoseHistory, nextAppointment }: HomeProps) {
  const [botMessage, setBotMessage] = useState<string | null>(null);
  const [botOpen, setBotOpen] = useState(false);
  const [botSpeaking, setBotSpeaking] = useState(false);
  const fixedVoiceName = "Google español";

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.name === fixedVoiceName);
    const spanishVoice = voices.find((v) => v.lang?.toLowerCase().includes("es"));
    if (preferred) utterance.voice = preferred;
    else if (spanishVoice) utterance.voice = spanishVoice;

    utterance.onstart = () => setBotSpeaking(true);
    utterance.onend = () => setBotSpeaking(false);
    utterance.onerror = () => setBotSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const buildBotMessage = () => {
    const name = (patient?.nombre || "Paciente").split(" ")[0] || "Paciente";

    const glucoseText = (() => {
      const value = lastGlucose?.valor;
      if (typeof value !== "number") return null;

      if (value < 70) return `Tu última glicemia fue ${value} mg/dL. Está baja. Come algo con carbohidratos y vuelve a medir en 15 minutos.`;
      if (value > 180) return `Tu última glicemia fue ${value} mg/dL. Está alta. Toma agua y revisa tu plan de insulina o indicaciones médicas.`;
      return `Tu última glicemia fue ${value} mg/dL. ¡Buen control!`;
    })();

    const appointmentText = (() => {
      if (!nextAppointment) return null;
      const dateLabel = nextAppointment?.fecha ? new Date(nextAppointment.fecha).toLocaleDateString() : "";
      const timeLabel = nextAppointment?.hora ? ` a las ${nextAppointment.hora}` : "";
      const doctorLabel = nextAppointment?.doctor ? ` con ${nextAppointment.doctor}` : "";
      return `Recuerda tu próxima cita el ${dateLabel}${timeLabel}${doctorLabel}.`;
    })();

    const parts = [glucoseText, appointmentText].filter(Boolean) as string[];
    if (parts.length === 0) return `Hola ${name}. Presióname cuando quieras y te daré recomendaciones según tus registros.`;

    return `Hola ${name}. ${parts.join(" ")}`;
  };

  const handleRobotPress = () => {
    const text = buildBotMessage();
    setBotMessage(text);
    setBotOpen(true);

    speak(text);
  };

  const getGlucoseStatus = (value: number) => {
    if (value < 70) return { color: "#3B82F6", bg: "rgba(59,130,246,0.1)", label: "Baja", icon: "↓" };
    if (value > 180) return { color: "#EF4444", bg: "rgba(239,68,68,0.1)", label: "Alta", icon: "↑" };
    return { color: "#10B981", bg: "rgba(16,185,129,0.1)", label: "Normal", icon: "✓" };
  };

  const glucoseStatus = lastGlucose?.valor ? getGlucoseStatus(lastGlucose.valor) : null;

  return (
    <div className="m-container">
      {/* Animated Background */}
      <div className="m-bg-gradient" />
      <div className="m-bg-orbs">
        <div className="m-orb m-orb-1" />
        <div className="m-orb m-orb-2" />
        <div className="m-orb m-orb-3" />
      </div>

      {/* Hero Section with SaniBot Scene */}
      <div className="m-hero fade-in">
        <SaniBotScene 
          onPress={handleRobotPress} 
          isSpeaking={botSpeaking}
          userName={patient?.nombre || "Usuario"}
        />

        {botOpen && botMessage && (
          <div className="m-bubble slide-up" onClick={() => setBotOpen(false)}>
            <div className="m-bubble-content">{botMessage}</div>
            <div className="m-bubble-close">✕</div>
          </div>
        )}

        <div className="m-greeting slide-up">
          <span className="m-greeting-text">{greeting}</span>
          <h1 className="m-name">{patient?.nombre || "Usuario"}</h1>
          <p className="m-subtitle">Tu asistente de salud personal</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="m-stats slide-up-delay-1">
        <div className="m-stat-card m-stat-glucose" onClick={() => navigate("/glucose")}>
          <div className="m-stat-icon" style={{ background: glucoseStatus?.bg || "rgba(107,114,128,0.1)" }}>
            <span style={{ color: glucoseStatus?.color || "#6B7280" }}>🩸</span>
          </div>
          <div className="m-stat-info">
            <span className="m-stat-label">Glucosa</span>
            <div className="m-stat-value" style={{ color: glucoseStatus?.color || "#6B7280" }}>
              {lastGlucose?.valor ? (
                <><span className="m-stat-number">{lastGlucose.valor}</span> <span className="m-stat-unit">mg/dL</span></>
              ) : "Sin datos"}
            </div>
            {glucoseStatus && <span className="m-stat-badge" style={{ background: glucoseStatus.bg, color: glucoseStatus.color }}>{glucoseStatus.icon} {glucoseStatus.label}</span>}
          </div>
          <div className="m-stat-arrow">→</div>
        </div>

        <div className="m-stat-card m-stat-appointment" onClick={() => navigate("/appointments")}>
          <div className="m-stat-icon" style={{ background: "rgba(99,102,241,0.1)" }}>
            <span style={{ color: "#6366F1" }}>📅</span>
          </div>
          <div className="m-stat-info">
            <span className="m-stat-label">Próxima Cita</span>
            <div className="m-stat-value" style={{ color: "#6366F1" }}>
              {nextAppointment ? (
                <span className="m-stat-date">{new Date(nextAppointment.fecha).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })}</span>
              ) : "Sin citas"}
            </div>
            {nextAppointment?.hora && <span className="m-stat-badge" style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1" }}>🕐 {nextAppointment.hora}</span>}
          </div>
          <div className="m-stat-arrow">→</div>
        </div>
      </div>

      {/* Link Requests */}
      <div className="m-section slide-up-delay-2">
        <LinkRequestsWidget />
      </div>

      {/* SOS Button */}
      <div className="m-section slide-up-delay-2">
        <button className="m-sos-btn" onClick={() => window.open("tel:131")}>
          <span className="m-sos-icon">🆘</span>
          <span className="m-sos-text">Emergencia</span>
          <span className="m-sos-pulse" />
        </button>
      </div>

      {/* Charts Section */}
      <div className="m-section slide-up-delay-3">
        <h2 className="m-section-title">📊 Tendencias</h2>
        <div className="m-charts">
          <HealthTrendChart title="Glucosa" data={glucoseHistory || []} type="glucose" color="#10B981" />
          <HealthTrendChart title="Presión" data={JSON.parse(localStorage.getItem("pressureHistory") || "[]")} type="pressure" color="#F59E0B" />
        </div>
        <HydrationWidget />
      </div>

      {/* Quick Actions Grid */}
      <div className="m-section">
        <h2 className="m-section-title">⚡ Acciones Rápidas</h2>
        <div className="m-grid">
          {[
            { icon: "💊", title: "Medicamentos", path: "/medicines", color: "#6366F1", bg: "#EEF2FF" },
            { icon: "🩸", title: "Glicemia", path: "/glucose", color: "#EF4444", bg: "#FEF2F2" },
            { icon: "💉", title: "Insulina", path: "/insulin", color: "#8B5CF6", bg: "#F5F3FF" },
            { icon: "❤️", title: "Presión", path: "/pressure", color: "#EC4899", bg: "#FDF2F8" },
            { icon: "⚖️", title: "Peso", path: "/weight", color: "#7C3AED", bg: "#F3E8FF" },
            { icon: "🍽️", title: "Alimentación", path: "/food", color: "#10B981", bg: "#ECFDF5" },
            { icon: "🚭", title: "Dejar Fumar", path: "/quit-smoking", color: "#059669", bg: "#D1FAE5" },
            { icon: "📅", title: "Citas", path: "/appointments", color: "#F59E0B", bg: "#FEF3C7" },
            { icon: "🤖", title: "GlucoBot", path: "/robot", color: "#6366F1", bg: "#E0E7FF" },
            { icon: "👤", title: "Perfil", path: "/profile", color: "#0EA5E9", bg: "#E0F2FE" },
          ].map((item, i) => (
            <div key={item.path} className={`m-card slide-up-delay-${Math.min(i % 4 + 3, 6)}`} onClick={() => navigate(item.path)} style={{ "--card-color": item.color, "--card-bg": item.bg } as React.CSSProperties}>
              <div className="m-card-icon">{item.icon}</div>
              <span className="m-card-title">{item.title}</span>
              <div className="m-card-shine" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="m-footer">
        <p>Powered by <strong>Leucode.IA</strong></p>
      </footer>

      <style>{`
        .m-container {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Animated Background */
        .m-bg-gradient {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          opacity: 0.03;
          z-index: -2;
        }

        .m-bg-orbs {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
        }

        .m-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          animation: orbFloat 20s ease-in-out infinite;
        }

        .m-orb-1 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          top: -100px;
          right: -100px;
          animation-delay: 0s;
        }

        .m-orb-2 {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, #10B981, #34D399);
          bottom: 20%;
          left: -50px;
          animation-delay: -7s;
        }

        .m-orb-3 {
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, #F59E0B, #FBBF24);
          bottom: -50px;
          right: 20%;
          animation-delay: -14s;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 30px) scale(1.05); }
        }

        /* Hero */
        .m-hero {
          padding: 40px 20px 30px;
          text-align: center;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 0 0 40px 40px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          margin-bottom: 20px;
        }

        .m-robot-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 15px;
        }

        .m-robot {
          width: 120px;
          height: auto;
          position: relative;
          z-index: 2;
          animation: robotFloat 4s ease-in-out infinite;
          filter: drop-shadow(0 10px 20px rgba(99,102,241,0.3));
        }

        .m-robot-talk {
          animation: robotTalk 0.3s ease-in-out infinite alternate;
        }

        .m-robot-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%);
          border-radius: 50%;
          z-index: 1;
        }

        .m-robot-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          border: 2px solid rgba(99,102,241,0.3);
          border-radius: 50%;
          animation: pulse 2s ease-out infinite;
          z-index: 0;
        }

        @keyframes robotFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes robotTalk {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-5px) scale(1.02); }
        }

        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }

        .m-bubble {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 16px 20px;
          margin: 0 auto 20px;
          max-width: 320px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          position: relative;
          cursor: pointer;
        }

        .m-bubble-content {
          font-size: 14px;
          line-height: 1.5;
          color: #1F2937;
        }

        .m-bubble-close {
          position: absolute;
          top: 8px;
          right: 12px;
          font-size: 12px;
          color: #9CA3AF;
        }

        .m-greeting-text {
          font-size: 16px;
          color: #6B7280;
          display: block;
          margin-bottom: 4px;
        }

        .m-name {
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }

        .m-subtitle {
          font-size: 14px;
          color: #9CA3AF;
          margin: 0;
        }

        /* Stats */
        .m-stats {
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .m-stat-card {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border: 1px solid rgba(255,255,255,0.8);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .m-stat-card:active {
          transform: scale(0.98);
        }

        .m-stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .m-stat-info {
          flex: 1;
        }

        .m-stat-label {
          font-size: 12px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .m-stat-value {
          font-size: 20px;
          font-weight: 700;
          margin: 2px 0;
        }

        .m-stat-number {
          font-size: 28px;
        }

        .m-stat-unit {
          font-size: 14px;
          font-weight: 500;
          opacity: 0.7;
        }

        .m-stat-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .m-stat-arrow {
          font-size: 18px;
          color: #D1D5DB;
        }

        /* SOS Button */
        .m-sos-btn {
          width: 100%;
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 16px;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(239,68,68,0.4);
          transition: all 0.3s ease;
        }

        .m-sos-btn:active {
          transform: scale(0.98);
        }

        .m-sos-icon {
          font-size: 20px;
        }

        .m-sos-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: rgba(255,255,255,0.3);
          border-radius: 16px;
          animation: sosPulse 2s ease-out infinite;
        }

        @keyframes sosPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }

        /* Sections */
        .m-section {
          padding: 0 16px;
          margin-bottom: 24px;
        }

        .m-section-title {
          font-size: 18px;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 16px;
        }

        .m-charts {
          display: grid;
          gap: 12px;
          margin-bottom: 12px;
        }

        /* Cards Grid */
        .m-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .m-card {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 24px 16px;
          text-align: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border: 1px solid rgba(255,255,255,0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .m-card:active {
          transform: scale(0.95);
        }

        .m-card-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 12px;
          background: var(--card-bg);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .m-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .m-card-shine {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .m-card:hover .m-card-shine {
          transform: translateX(100%);
        }

        /* Footer */
        .m-footer {
          text-align: center;
          padding: 30px 20px 40px;
          color: #9CA3AF;
          font-size: 12px;
        }

        .m-footer strong {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Animations */
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }

        .slide-up-delay-1 { animation: slideUp 0.6s ease-out 0.1s forwards; opacity: 0; }
        .slide-up-delay-2 { animation: slideUp 0.6s ease-out 0.2s forwards; opacity: 0; }
        .slide-up-delay-3 { animation: slideUp 0.6s ease-out 0.3s forwards; opacity: 0; }
        .slide-up-delay-4 { animation: slideUp 0.6s ease-out 0.4s forwards; opacity: 0; }
        .slide-up-delay-5 { animation: slideUp 0.6s ease-out 0.5s forwards; opacity: 0; }
        .slide-up-delay-6 { animation: slideUp 0.6s ease-out 0.6s forwards; opacity: 0; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive */
        @media (max-width: 360px) {
          .m-name { font-size: 26px; }
          .m-card { padding: 20px 12px; }
          .m-card-icon { width: 48px; height: 48px; font-size: 24px; }
        }
      `}</style>
    </div>
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