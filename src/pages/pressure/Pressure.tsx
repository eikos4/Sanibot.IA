import { useState, useEffect } from "react";
import SimulatedCall from "../../components/SimulatedCall";

interface PressureRecord {
  fecha: string;
  sistolica: number;
  diastolica: number;
  hora: string;
  timestamp: number;
}

// Valores rápidos comunes
const QUICK_SYS = [100, 110, 120, 130, 140, 150];
const QUICK_DIA = [60, 70, 80, 90, 100, 110];

// Clasificación de presión
const getClassification = (sys: number, dia: number) => {
  if (sys > 180 || dia > 120) return { level: "crisis", label: "CRISIS", color: "#DC2626", bg: "#FEE2E2", icon: "🚨" };
  if (sys >= 140 || dia >= 90) return { level: "high2", label: "ALTA", color: "#EA580C", bg: "#FFEDD5", icon: "⚠️" };
  if (sys >= 130 || dia >= 80) return { level: "high1", label: "ELEVADA", color: "#F59E0B", bg: "#FEF3C7", icon: "⚠️" };
  if (sys >= 120 && dia < 80) return { level: "elevated", label: "PRECAUCIÓN", color: "#EAB308", bg: "#FEF9C3", icon: "👀" };
  if (sys < 90 || dia < 60) return { level: "low", label: "BAJA", color: "#3B82F6", bg: "#DBEAFE", icon: "💧" };
  return { level: "normal", label: "NORMAL", color: "#059669", bg: "#D1FAE5", icon: "✅" };
};

export default function Pressure() {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [callData, setCallData] = useState<{ active: boolean; message: string; title: string } | null>(null);
  const [userName, setUserName] = useState("Paciente");
  const [history, setHistory] = useState<PressureRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeInput, setActiveInput] = useState<"sys" | "dia">("sys");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");
    if (user.name) setUserName(user.name.split(" ")[0]);
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = JSON.parse(localStorage.getItem("pressureHistory") || "[]");
    setHistory(data);
  };

  const save = () => {
    if (!systolic || !diastolic) return;
    const s = parseInt(systolic);
    const d = parseInt(diastolic);
    if (isNaN(s) || isNaN(d) || s < 50 || s > 250 || d < 30 || d > 150) return;

    setIsLoading(true);

    const record: PressureRecord = {
      fecha: new Date().toISOString().slice(0, 10),
      hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      sistolica: s,
      diastolica: d,
      timestamp: Date.now()
    };

    const newHistory = [...history, record];
    localStorage.setItem("pressureHistory", JSON.stringify(newHistory));
    setHistory(newHistory);

    const classification = getClassification(s, d);
    
    let message = "";
    if (classification.level === "crisis") {
      message = `¡URGENTE ${userName}! Presión ${s}/${d} es muy peligrosa. Llama a emergencias ahora.`;
    } else if (classification.level === "high2") {
      message = `Atención ${userName}. Presión ${s}/${d} está alta. Descansa, evita sal y mide de nuevo en 30 minutos.`;
    } else if (classification.level === "high1" || classification.level === "elevated") {
      message = `${userName}, presión ${s}/${d} está un poco elevada. Relájate y toma agua.`;
    } else if (classification.level === "low") {
      message = `${userName}, presión ${s}/${d} está baja. Siéntate, toma agua con sal y descansa.`;
    } else {
      message = `¡Excelente ${userName}! Presión ${s}/${d} está perfecta. Sigue así.`;
    }

    setCallData({ active: true, title: `${classification.icon} ${classification.label}`, message });
    setSystolic("");
    setDiastolic("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setIsLoading(false);
  };

  const classification = systolic && diastolic 
    ? getClassification(parseInt(systolic), parseInt(diastolic)) 
    : null;

  const lastReading = history[history.length - 1];
  const avgSys = history.length > 0 ? Math.round(history.slice(-7).reduce((a, b) => a + b.sistolica, 0) / Math.min(history.length, 7)) : null;
  const avgDia = history.length > 0 ? Math.round(history.slice(-7).reduce((a, b) => a + b.diastolica, 0) / Math.min(history.length, 7)) : null;

  return (
    <div className="bp-container">
      {/* Background */}
      <div className="bp-bg" />
      <div className="bp-orb bp-orb-1" />
      <div className="bp-orb bp-orb-2" />

      {callData?.active && (
        <SimulatedCall userName={userName} title={callData.title} message={callData.message} onEndCall={() => setCallData(null)} />
      )}

      {showSuccess && <div className="bp-toast">✅ Guardado correctamente</div>}

      {/* Header */}
      <header className="bp-header fade-in">
        <div className="bp-header-icon">❤️</div>
        <div>
          <h1 className="bp-title">Presión Arterial</h1>
          <p className="bp-subtitle">Cuida tu corazón</p>
        </div>
      </header>

      {/* Reference Card */}
      <div className="bp-reference slide-up">
        <div className="bp-ref-item" style={{ borderLeft: "3px solid #059669" }}>
          <span className="bp-ref-label">Normal</span>
          <span className="bp-ref-value">&lt;120/80</span>
        </div>
        <div className="bp-ref-item" style={{ borderLeft: "3px solid #F59E0B" }}>
          <span className="bp-ref-label">Elevada</span>
          <span className="bp-ref-value">120-139</span>
        </div>
        <div className="bp-ref-item" style={{ borderLeft: "3px solid #DC2626" }}>
          <span className="bp-ref-label">Alta</span>
          <span className="bp-ref-value">≥140/90</span>
        </div>
      </div>

      {/* Main Input Card */}
      <div className="bp-main slide-up-delay-1" style={{ background: classification?.bg || "#F3F4F6" }}>
        <div className="bp-inputs">
          {/* Systolic */}
          <div className={`bp-input-group ${activeInput === "sys" ? "active" : ""}`} onClick={() => setActiveInput("sys")}>
            <span className="bp-input-label" style={{ color: "#EC4899" }}>SISTÓLICA</span>
            <span className="bp-input-sublabel">Número alto</span>
            <input
              type="number"
              inputMode="numeric"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              onFocus={() => setActiveInput("sys")}
              placeholder="---"
              className="bp-input"
              style={{ color: "#EC4899" }}
            />
          </div>

          <div className="bp-divider">/</div>

          {/* Diastolic */}
          <div className={`bp-input-group ${activeInput === "dia" ? "active" : ""}`} onClick={() => setActiveInput("dia")}>
            <span className="bp-input-label" style={{ color: "#8B5CF6" }}>DIASTÓLICA</span>
            <span className="bp-input-sublabel">Número bajo</span>
            <input
              type="number"
              inputMode="numeric"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              onFocus={() => setActiveInput("dia")}
              placeholder="---"
              className="bp-input"
              style={{ color: "#8B5CF6" }}
            />
          </div>
        </div>

        {/* Status Badge */}
        {classification && (
          <div className="bp-status" style={{ background: classification.color }}>
            <span>{classification.icon}</span>
            <span>{classification.label}</span>
          </div>
        )}

        {/* Quick Values */}
        <div className="bp-quick">
          <span className="bp-quick-label">{activeInput === "sys" ? "Sistólica" : "Diastólica"}</span>
          <div className="bp-quick-grid">
            {(activeInput === "sys" ? QUICK_SYS : QUICK_DIA).map(v => (
              <button
                key={v}
                className="bp-quick-btn"
                onClick={() => activeInput === "sys" ? setSystolic(String(v)) : setDiastolic(String(v))}
                style={{
                  background: (activeInput === "sys" ? systolic : diastolic) === String(v) 
                    ? (activeInput === "sys" ? "#EC4899" : "#8B5CF6") 
                    : "white",
                  color: (activeInput === "sys" ? systolic : diastolic) === String(v) ? "white" : "#374151"
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button className="bp-save-btn slide-up-delay-2" onClick={save} disabled={!systolic || !diastolic || isLoading}>
        {isLoading ? "⏳ Guardando..." : (
          <>
            <span className="bp-save-icon">💾</span>
            <span>GUARDAR</span>
          </>
        )}
      </button>

      {/* Stats Row */}
      {(lastReading || avgSys) && (
        <div className="bp-stats slide-up-delay-3">
          {lastReading && (
            <div className="bp-stat-card">
              <span className="bp-stat-label">Última medición</span>
              <div className="bp-stat-value">
                <span style={{ color: "#EC4899" }}>{lastReading.sistolica}</span>
                <span className="bp-stat-slash">/</span>
                <span style={{ color: "#8B5CF6" }}>{lastReading.diastolica}</span>
              </div>
              <span className="bp-stat-time">{lastReading.hora}</span>
            </div>
          )}
          {avgSys && avgDia && (
            <div className="bp-stat-card">
              <span className="bp-stat-label">Promedio (7 días)</span>
              <div className="bp-stat-value">
                <span style={{ color: "#EC4899" }}>{avgSys}</span>
                <span className="bp-stat-slash">/</span>
                <span style={{ color: "#8B5CF6" }}>{avgDia}</span>
              </div>
              <span className="bp-stat-badge" style={{ background: getClassification(avgSys, avgDia).bg, color: getClassification(avgSys, avgDia).color }}>
                {getClassification(avgSys, avgDia).label}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mini Chart */}
      {history.length >= 2 && (
        <div className="bp-chart-wrap slide-up-delay-4">
          <h3 className="bp-chart-title">📈 Tendencia</h3>
          <div className="bp-mini-chart">
            {history.slice(-7).map((h, i) => {
              const sysHeight = Math.min(Math.max(((h.sistolica - 60) / 140) * 100, 15), 100);
              const diaHeight = Math.min(Math.max(((h.diastolica - 40) / 100) * 100, 10), 100);
              return (
                <div key={i} className="bp-bar-group">
                  <div className="bp-bar-wrap">
                    <div className="bp-bar bp-bar-sys" style={{ height: `${sysHeight}%` }} />
                    <div className="bp-bar bp-bar-dia" style={{ height: `${diaHeight}%` }} />
                  </div>
                  <span className="bp-bar-label">{h.sistolica}/{h.diastolica}</span>
                </div>
              );
            })}
          </div>
          <div className="bp-chart-legend">
            <span><span style={{ color: "#EC4899" }}>●</span> Sistólica</span>
            <span><span style={{ color: "#8B5CF6" }}>●</span> Diastólica</span>
          </div>
        </div>
      )}

      <style>{`
        .bp-container {
          min-height: 100vh;
          padding: 20px;
          padding-bottom: 100px;
          position: relative;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .bp-bg {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #FDF2F8 0%, #FAF5FF 50%, #EFF6FF 100%);
          z-index: -2;
        }

        .bp-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          z-index: -1;
          animation: orbFloat 15s ease-in-out infinite;
        }

        .bp-orb-1 {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, #EC4899, #F472B6);
          top: -60px;
          right: -60px;
        }

        .bp-orb-2 {
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, #8B5CF6, #A78BFA);
          bottom: 20%;
          left: -40px;
          animation-delay: -7s;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -15px) scale(1.1); }
        }

        .bp-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #10B981;
          color: white;
          padding: 14px 28px;
          border-radius: 16px;
          font-weight: 700;
          z-index: 100;
          animation: toastIn 0.3s ease-out;
          box-shadow: 0 8px 30px rgba(16,185,129,0.4);
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* Header */
        .bp-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          padding: 20px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        .bp-header-icon {
          font-size: 40px;
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.15); }
          30% { transform: scale(1); }
          45% { transform: scale(1.1); }
        }

        .bp-title {
          font-size: 24px;
          font-weight: 800;
          color: #1F2937;
          margin: 0;
        }

        .bp-subtitle {
          font-size: 14px;
          color: #6B7280;
          margin: 4px 0 0;
        }

        /* Reference */
        .bp-reference {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .bp-ref-item {
          flex: 1;
          background: rgba(255,255,255,0.9);
          padding: 12px;
          border-radius: 14px;
          text-align: center;
        }

        .bp-ref-label {
          display: block;
          font-size: 11px;
          color: #6B7280;
          text-transform: uppercase;
        }

        .bp-ref-value {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #374151;
          margin-top: 4px;
        }

        /* Main Input */
        .bp-main {
          padding: 24px;
          border-radius: 32px;
          margin-bottom: 20px;
          transition: background 0.3s ease;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        }

        .bp-inputs {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .bp-input-group {
          flex: 1;
          text-align: center;
          padding: 16px 12px;
          background: rgba(255,255,255,0.8);
          border-radius: 20px;
          border: 3px solid transparent;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .bp-input-group.active {
          border-color: currentColor;
          background: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .bp-input-label {
          display: block;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .bp-input-sublabel {
          display: block;
          font-size: 10px;
          color: #9CA3AF;
          margin-bottom: 8px;
        }

        .bp-input {
          width: 100%;
          text-align: center;
          font-size: 48px;
          font-weight: 800;
          border: none;
          background: transparent;
          outline: none;
        }

        .bp-input::placeholder {
          color: #D1D5DB;
        }

        .bp-divider {
          font-size: 48px;
          font-weight: 300;
          color: #D1D5DB;
        }

        .bp-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: 20px;
          color: white;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .bp-quick {
          margin-top: 16px;
        }

        .bp-quick-label {
          display: block;
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .bp-quick-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }

        .bp-quick-btn {
          padding: 14px 8px;
          border-radius: 14px;
          border: 2px solid #E5E7EB;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bp-quick-btn:active {
          transform: scale(0.95);
        }

        /* Save Button */
        .bp-save-btn {
          width: 100%;
          padding: 20px;
          border-radius: 20px;
          border: none;
          background: linear-gradient(135deg, #EC4899, #8B5CF6);
          color: white;
          font-size: 20px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 8px 30px rgba(236,72,153,0.4);
          transition: all 0.3s ease;
          margin-bottom: 24px;
        }

        .bp-save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .bp-save-btn:not(:disabled):active {
          transform: scale(0.98);
        }

        .bp-save-icon {
          font-size: 24px;
        }

        /* Stats */
        .bp-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .bp-stat-card {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 16px;
          text-align: center;
        }

        .bp-stat-label {
          font-size: 11px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .bp-stat-value {
          font-size: 28px;
          font-weight: 800;
          margin: 8px 0;
        }

        .bp-stat-slash {
          color: #D1D5DB;
          margin: 0 4px;
        }

        .bp-stat-time {
          font-size: 12px;
          color: #9CA3AF;
        }

        .bp-stat-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 10px;
        }

        /* Chart */
        .bp-chart-wrap {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .bp-chart-title {
          font-size: 16px;
          font-weight: 700;
          color: #374151;
          margin: 0 0 16px;
        }

        .bp-mini-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 100px;
          gap: 8px;
        }

        .bp-bar-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .bp-bar-wrap {
          display: flex;
          gap: 3px;
          height: 80px;
          align-items: flex-end;
        }

        .bp-bar {
          width: 12px;
          border-radius: 6px 6px 0 0;
          transition: height 0.3s ease;
        }

        .bp-bar-sys {
          background: linear-gradient(180deg, #EC4899, #F472B6);
        }

        .bp-bar-dia {
          background: linear-gradient(180deg, #8B5CF6, #A78BFA);
        }

        .bp-bar-label {
          font-size: 9px;
          font-weight: 600;
          color: #6B7280;
          margin-top: 6px;
        }

        .bp-chart-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 16px;
          font-size: 12px;
          color: #6B7280;
        }

        /* Animations */
        .fade-in { animation: fadeIn 0.5s ease-out; }
        .slide-up { animation: slideUp 0.5s ease-out; }
        .slide-up-delay-1 { animation: slideUp 0.5s ease-out 0.1s both; }
        .slide-up-delay-2 { animation: slideUp 0.5s ease-out 0.2s both; }
        .slide-up-delay-3 { animation: slideUp 0.5s ease-out 0.3s both; }
        .slide-up-delay-4 { animation: slideUp 0.5s ease-out 0.4s both; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 360px) {
          .bp-input { font-size: 36px; }
          .bp-quick-btn { padding: 12px 6px; font-size: 14px; }
          .bp-stat-value { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}
