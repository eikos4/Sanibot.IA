import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SimulatedCall from "../../components/SimulatedCall";

// @ts-ignore
import { saveGlucose, getGlucoseHistory } from "../../services/glucoseStorage";

// ============ AUTO CONTEXT DETECTION ============
type MealContext = "ayunas" | "desayuno" | "almuerzo" | "once" | "cena" | "noche";

const getAutoContext = (): { context: MealContext; label: string; icon: string; description: string } => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 9) return { context: "ayunas", label: "Ayunas", icon: "🌅", description: "Medición en ayunas (mañana)" };
  if (hour >= 9 && hour < 11) return { context: "desayuno", label: "Post-Desayuno", icon: "🍳", description: "2 horas después del desayuno" };
  if (hour >= 11 && hour < 14) return { context: "almuerzo", label: "Pre-Almuerzo", icon: "🍽️", description: "Antes del almuerzo" };
  if (hour >= 14 && hour < 17) return { context: "almuerzo", label: "Post-Almuerzo", icon: "🥗", description: "2 horas después del almuerzo" };
  if (hour >= 17 && hour < 19) return { context: "once", label: "Once/Merienda", icon: "☕", description: "Hora de la once" };
  if (hour >= 19 && hour < 22) return { context: "cena", label: "Post-Cena", icon: "🌙", description: "Después de cenar" };
  return { context: "noche", label: "Antes de Dormir", icon: "😴", description: "Medición nocturna" };
};

// ============ ANALYSIS ============
interface GlucoseAnalysis {
  level: "hypo" | "normal" | "hyper";
  trend: "rising" | "falling" | "stable" | "unknown";
  urgency: "urgent" | "warning" | "info" | "positive";
}

const analyzeGlucose = (value: number, history: any[]): GlucoseAnalysis => {
  let level: GlucoseAnalysis["level"] = "normal";
  if (value < 70) level = "hypo";
  else if (value > 180) level = "hyper";

  let trend: GlucoseAnalysis["trend"] = "unknown";
  if (history.length >= 2) {
    const recent = history.slice(-3).map(h => h.valor);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    if (value > avg + 15) trend = "rising";
    else if (value < avg - 15) trend = "falling";
    else trend = "stable";
  }

  let urgency: GlucoseAnalysis["urgency"] = "positive";
  if (value < 55 || value > 300) urgency = "urgent";
  else if (value < 70 || value > 250) urgency = "warning";
  else if (value > 180) urgency = "info";

  return { level, trend, urgency };
};

const getSmartRecommendation = (value: number, userName: string, analysis: GlucoseAnalysis): { title: string; message: string; speech: string } => {
  const { level } = analysis;

  if (level === "hypo") {
    const isUrgent = value < 55;
    return {
      title: isUrgent ? "🚨 ¡URGENTE!" : "⚠️ Glucosa Baja",
      message: `${value} mg/dL - Necesitas comer algo dulce AHORA`,
      speech: `¡Atención ${userName}! Tu glucosa está en ${value}, muy baja. Necesitas comer algo dulce ahora mismo. Un jugo, caramelo o azúcar. ${isUrgent ? "Si no mejoras en 15 minutos, llama a emergencias." : ""}`
    };
  }

  if (level === "hyper") {
    const isSevere = value > 250;
    return {
      title: isSevere ? "🚨 Glucosa Muy Alta" : "⚠️ Glucosa Alta",
      message: `${value} mg/dL - Toma agua y evita dulces`,
      speech: `${userName}, tu glucosa está en ${value}, ${isSevere ? "muy alta" : "elevada"}. Toma bastante agua y evita comer dulces o pan. ${isSevere ? "Si usas insulina, revisa tu dosis." : "Una caminata corta puede ayudar."}`
    };
  }

  return {
    title: "✅ ¡Muy Bien!",
    message: `${value} mg/dL - Nivel saludable`,
    speech: `¡Excelente ${userName}! Tu glucosa está en ${value}, un nivel muy bueno. Sigue así con tus buenos hábitos.`
  };
};

// ============ MAIN COMPONENT ============
export default function Glucose() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [autoContext, setAutoContext] = useState(getAutoContext());
  const [callData, setCallData] = useState<{ active: boolean; message: string; title: string; speech: string } | null>(null);
  const [userName, setUserName] = useState("Paciente");
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");
    if (user.name) setUserName(user.name.split(" ")[0]);
    loadHistory();
    
    // Update context every minute
    const interval = setInterval(() => setAutoContext(getAutoContext()), 60000);
    return () => clearInterval(interval);
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getGlucoseHistory();
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const quickValues = [80, 100, 120, 150, 180, 200];

  const save = async () => {
    if (!value) return;
    const val = parseInt(value);
    if (isNaN(val) || val < 20 || val > 600) return;

    setIsLoading(true);

    const record = {
      fecha: new Date().toISOString().slice(0, 10),
      valor: val,
      hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      comida: autoContext.label,
    };

    try {
      await saveGlucose(record);
      const updatedHistory = await getGlucoseHistory();
      setHistory(updatedHistory);

      const analysis = analyzeGlucose(val, updatedHistory);
      const recommendation = getSmartRecommendation(val, userName, analysis);

      setCallData({ active: true, ...recommendation });
      setValue("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving glucose:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (val: number) => {
    if (!val) return { color: "#6B7280", bg: "#F3F4F6", text: "Ingresa tu medición", icon: "🩸" };
    if (val < 70) return { color: "#DC2626", bg: "#FEE2E2", text: "BAJA - Come algo dulce", icon: "⚠️" };
    if (val > 180) return { color: "#EA580C", bg: "#FFEDD5", text: "ALTA - Toma agua", icon: "⚠️" };
    return { color: "#059669", bg: "#D1FAE5", text: "¡MUY BIEN!", icon: "✅" };
  };

  const status = getStatusInfo(Number(value));
  const lastReading = history[history.length - 1];

  return (
    <div className="gluc-container">
      {/* Background */}
      <div className="gluc-bg" />
      <div className="gluc-orb gluc-orb-1" />
      <div className="gluc-orb gluc-orb-2" />

      {callData?.active && (
        <SimulatedCall userName={userName} title={callData.title} message={callData.speech} onEndCall={() => setCallData(null)} />
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="gluc-toast">✅ Guardado correctamente</div>
      )}

      {/* Header */}
      <header className="gluc-header fade-in">
        <div className="gluc-header-icon">🩸</div>
        <div>
          <h1 className="gluc-title">Medir Glucosa</h1>
          <p className="gluc-subtitle">Toca los números para ingresar</p>
        </div>
        <button className="gluc-history-btn" onClick={() => navigate("/glucose/history")}>
          📊
        </button>
      </header>

      {/* Auto Context Card */}
      <div className="gluc-context slide-up">
        <div className="gluc-context-icon">{autoContext.icon}</div>
        <div className="gluc-context-info">
          <span className="gluc-context-label">{autoContext.label}</span>
          <span className="gluc-context-desc">{autoContext.description}</span>
        </div>
        <div className="gluc-context-auto">AUTO</div>
      </div>

      {/* Main Input Card */}
      <div className="gluc-main slide-up-delay-1" style={{ background: status.bg }}>
        <div className="gluc-input-wrap">
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="---"
            className="gluc-input"
            style={{ color: status.color }}
          />
          <span className="gluc-unit">mg/dL</span>
        </div>
        
        <div className="gluc-status" style={{ background: status.color, color: "white" }}>
          <span>{status.icon}</span>
          <span>{status.text}</span>
        </div>

        {/* Quick Value Buttons */}
        <div className="gluc-quick-values">
          {quickValues.map(v => (
            <button key={v} className="gluc-quick-btn" onClick={() => setValue(String(v))} style={{ background: Number(value) === v ? "#6366F1" : "white", color: Number(value) === v ? "white" : "#374151" }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button className="gluc-save-btn slide-up-delay-2" onClick={save} disabled={!value || isLoading}>
        {isLoading ? (
          <span className="gluc-loading">⏳ Guardando...</span>
        ) : (
          <>
            <span className="gluc-save-icon">💾</span>
            <span>GUARDAR</span>
          </>
        )}
      </button>

      {/* Last Reading */}
      {lastReading && (
        <div className="gluc-last slide-up-delay-3">
          <span className="gluc-last-label">Última medición</span>
          <div className="gluc-last-value">
            <span className="gluc-last-number" style={{ color: getStatusInfo(lastReading.valor).color }}>{lastReading.valor}</span>
            <span className="gluc-last-unit">mg/dL</span>
          </div>
          <span className="gluc-last-time">{lastReading.hora} - {lastReading.comida}</span>
        </div>
      )}

      {/* Mini Chart */}
      {history.length >= 2 && (
        <div className="gluc-chart-wrap slide-up-delay-4">
          <h3 className="gluc-chart-title">📈 Últimas mediciones</h3>
          <div className="gluc-mini-chart">
            {history.slice(-7).map((h, i) => {
              const height = Math.min(Math.max(((h.valor - 40) / 260) * 100, 10), 100);
              const color = h.valor < 70 ? "#EF4444" : h.valor > 180 ? "#F59E0B" : "#10B981";
              return (
                <div key={i} className="gluc-bar-wrap">
                  <div className="gluc-bar" style={{ height: `${height}%`, background: color }} />
                  <span className="gluc-bar-val">{h.valor}</span>
                </div>
              );
            })}
          </div>
          <div className="gluc-chart-legend">
            <span>🟢 Normal (70-180)</span>
            <span>🟡 Alta (&gt;180)</span>
            <span>🔴 Baja (&lt;70)</span>
          </div>
        </div>
      )}

      <style>{`
        .gluc-container {
          min-height: 100vh;
          padding: 20px;
          padding-bottom: 100px;
          position: relative;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .gluc-bg {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #FEF2F2 0%, #FFF7ED 50%, #ECFDF5 100%);
          z-index: -2;
        }

        .gluc-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          z-index: -1;
          animation: orbFloat 15s ease-in-out infinite;
        }

        .gluc-orb-1 {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, #EF4444, #F97316);
          top: -60px;
          right: -60px;
        }

        .gluc-orb-2 {
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, #10B981, #34D399);
          bottom: 20%;
          left: -40px;
          animation-delay: -7s;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -15px) scale(1.1); }
        }

        /* Toast */
        .gluc-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #10B981;
          color: white;
          padding: 14px 28px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 16px;
          z-index: 100;
          animation: toastIn 0.3s ease-out;
          box-shadow: 0 8px 30px rgba(16,185,129,0.4);
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* Header */
        .gluc-header {
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

        .gluc-header-icon {
          font-size: 40px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .gluc-title {
          font-size: 24px;
          font-weight: 800;
          color: #1F2937;
          margin: 0;
        }

        .gluc-subtitle {
          font-size: 14px;
          color: #6B7280;
          margin: 4px 0 0;
        }

        .gluc-history-btn {
          margin-left: auto;
          width: 50px;
          height: 50px;
          border-radius: 16px;
          border: none;
          background: #F3F4F6;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gluc-history-btn:active {
          transform: scale(0.9);
        }

        /* Context */
        .gluc-context {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .gluc-context-icon {
          font-size: 36px;
        }

        .gluc-context-info {
          flex: 1;
        }

        .gluc-context-label {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #1F2937;
        }

        .gluc-context-desc {
          font-size: 13px;
          color: #6B7280;
        }

        .gluc-context-auto {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        /* Main Input */
        .gluc-main {
          padding: 30px 24px;
          border-radius: 32px;
          margin-bottom: 20px;
          transition: background 0.3s ease;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        }

        .gluc-input-wrap {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .gluc-input {
          width: 180px;
          text-align: center;
          font-size: 72px;
          font-weight: 800;
          border: none;
          background: transparent;
          outline: none;
          font-family: -apple-system, system-ui, sans-serif;
        }

        .gluc-input::placeholder {
          color: #D1D5DB;
        }

        .gluc-unit {
          font-size: 20px;
          font-weight: 600;
          color: #6B7280;
        }

        .gluc-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .gluc-quick-values {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }

        .gluc-quick-btn {
          padding: 14px 8px;
          border-radius: 14px;
          border: 2px solid #E5E7EB;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gluc-quick-btn:active {
          transform: scale(0.95);
        }

        /* Save Button */
        .gluc-save-btn {
          width: 100%;
          padding: 20px;
          border-radius: 20px;
          border: none;
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
          font-size: 20px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 8px 30px rgba(16,185,129,0.4);
          transition: all 0.3s ease;
          margin-bottom: 24px;
        }

        .gluc-save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gluc-save-btn:not(:disabled):active {
          transform: scale(0.98);
        }

        .gluc-save-icon {
          font-size: 24px;
        }

        /* Last Reading */
        .gluc-last {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .gluc-last-label {
          font-size: 13px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .gluc-last-value {
          margin: 8px 0;
        }

        .gluc-last-number {
          font-size: 48px;
          font-weight: 800;
        }

        .gluc-last-unit {
          font-size: 18px;
          color: #6B7280;
          margin-left: 4px;
        }

        .gluc-last-time {
          font-size: 14px;
          color: #9CA3AF;
        }

        /* Mini Chart */
        .gluc-chart-wrap {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .gluc-chart-title {
          font-size: 16px;
          font-weight: 700;
          color: #374151;
          margin: 0 0 16px;
        }

        .gluc-mini-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 120px;
          gap: 8px;
        }

        .gluc-bar-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
        }

        .gluc-bar {
          width: 100%;
          max-width: 30px;
          border-radius: 8px 8px 0 0;
          transition: height 0.3s ease;
        }

        .gluc-bar-val {
          font-size: 11px;
          font-weight: 700;
          color: #6B7280;
          margin-top: 6px;
        }

        .gluc-chart-legend {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 16px;
          font-size: 11px;
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
          .gluc-input { font-size: 56px; width: 140px; }
          .gluc-quick-btn { padding: 12px 6px; font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
