import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SimulatedCall from "../../components/SimulatedCall";

// @ts-ignore
import { saveGlucose, getGlucoseHistory } from "../../services/glucoseStorage";

// ============ INTELLIGENT RECOMMENDATION SYSTEM ============

interface GlucoseAnalysis {
  level: "hypo" | "normal" | "hyper";
  trend: "rising" | "falling" | "stable" | "unknown";
  timeContext: "morning" | "midday" | "afternoon" | "evening" | "night";
  urgency: "urgent" | "warning" | "info" | "positive";
}

const analyzeGlucose = (value: number, history: any[]): GlucoseAnalysis => {
  const hour = new Date().getHours();

  // Determine level
  let level: GlucoseAnalysis["level"] = "normal";
  if (value < 70) level = "hypo";
  else if (value > 180) level = "hyper";

  // Determine time context
  let timeContext: GlucoseAnalysis["timeContext"] = "afternoon";
  if (hour >= 5 && hour < 10) timeContext = "morning";
  else if (hour >= 10 && hour < 14) timeContext = "midday";
  else if (hour >= 14 && hour < 19) timeContext = "afternoon";
  else if (hour >= 19 && hour < 22) timeContext = "evening";
  else timeContext = "night";

  // Determine trend (last 3 readings)
  let trend: GlucoseAnalysis["trend"] = "unknown";
  if (history.length >= 2) {
    const recent = history.slice(-3).map(h => h.valor);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    if (value > avg + 15) trend = "rising";
    else if (value < avg - 15) trend = "falling";
    else trend = "stable";
  }

  // Determine urgency
  let urgency: GlucoseAnalysis["urgency"] = "positive";
  if (value < 55 || value > 300) urgency = "urgent";
  else if (value < 70 || value > 250) urgency = "warning";
  else if (value > 180) urgency = "info";

  return { level, trend, timeContext, urgency };
};

const getTimeGreeting = (context: GlucoseAnalysis["timeContext"]): string => {
  const greetings = {
    morning: "Buenos días",
    midday: "Es media mañana",
    afternoon: "Buenas tardes",
    evening: "Buenas noches",
    night: "Es hora de descansar"
  };
  return greetings[context];
};

const getTrendText = (trend: GlucoseAnalysis["trend"]): string => {
  const trends = {
    rising: "Tu glucosa está subiendo ↗️",
    falling: "Tu glucosa está bajando ↘️",
    stable: "Tu glucosa se mantiene estable ➡️",
    unknown: ""
  };
  return trends[trend];
};

const getSmartRecommendation = (
  value: number,
  userName: string,
  analysis: GlucoseAnalysis
): { title: string; message: string; speech: string } => {

  const { level, trend, timeContext } = analysis;
  const trendText = getTrendText(trend);
  const greeting = getTimeGreeting(timeContext);

  if (level === "hypo") {
    // HIPOGLUCEMIA
    const isUrgent = value < 55;
    return {
      title: isUrgent ? "🚨 URGENTE: Hipoglucemia Severa" : "⚠️ ALERTA: Hipoglucemia",
      message: `${userName}, tu nivel de ${value} mg/dL es ${isUrgent ? "peligrosamente bajo" : "muy bajo"}.

ACCIÓN INMEDIATA:
• Consume 15g de carbohidratos rápidos (jugo, caramelo, 3 cucharadas de azúcar)
• Espera 15 minutos y vuelve a medir
• ${isUrgent ? "Si persiste, busca ayuda médica URGENTE" : "Evita actividades físicas hasta normalizar"}

${trendText}`,
      speech: `¡Alerta ${isUrgent ? "urgente" : ""}! ${userName}, tu glucosa está en ${value}, muy bajo. 
Necesitas consumir carbohidratos rápidos ahora mismo. Toma jugo, un caramelo o azúcar. 
Espera 15 minutos y vuelve a medir. ${isUrgent ? "Si no mejora, busca ayuda médica inmediatamente." : "Evita hacer ejercicio hasta que se normalice."}`
    };
  }

  if (level === "hyper") {
    // HIPERGLUCEMIA
    const isSevere = value > 250;
    return {
      title: isSevere ? "🚨 ALERTA: Glucosa Muy Alta" : "⚠️ Nivel Elevado",
      message: `${userName}, ${value} mg/dL está ${isSevere ? "muy por encima" : "por encima"} del rango.

RECOMENDACIONES:
• Toma agua abundante para mantenerte hidratado
• Evita carbohidratos simples las próximas horas
• ${isSevere ? "Si usas insulina, revisa tu esquema de corrección" : "Considera una caminata suave de 15 minutos"}
• ${timeContext === "evening" || timeContext === "night" ? "Vigila antes de dormir" : "Monitorea en 2 horas"}

${trendText}`,
      speech: `${greeting} ${userName}. Tu glucosa está en ${value}, ${isSevere ? "bastante alta" : "elevada"}. 
Te recomiendo tomar agua para mantenerte hidratado y evitar carbohidratos simples. 
${isSevere ? "Si usas insulina, revisa tu esquema de corrección." : "Una caminata corta puede ayudar."} 
${trendText.replace("↗️", "subiendo").replace("↘️", "bajando").replace("➡️", "estable")}`
    };
  }

  // NIVEL NORMAL
  const messages = {
    morning: "¡Excelente forma de empezar el día! Tu ayuno está en buen rango.",
    midday: "Muy bien controlado. Mantén este ritmo para el almuerzo.",
    afternoon: "Buen nivel post-almuerzo. Sigue así para la cena.",
    evening: "Nivel óptimo para la noche. Bien hecho.",
    night: "Buen nivel nocturno. Descansa tranquilo."
  };

  return {
    title: "✅ ¡Excelente Control!",
    message: `${userName}, ${value} mg/dL está en rango saludable.

${greeting}! ${messages[timeContext]}

${trendText}

Sigue con tus buenos hábitos y mantén tu monitoreo regular.`,
    speech: `¡Felicidades ${userName}! Tu glucosa está en ${value}, un nivel muy saludable. 
${messages[timeContext]} ${trendText.replace("↗️", "subiendo").replace("↘️", "bajando").replace("➡️", "estable")}
Sigue así.`
  };
};

// ============ MAIN COMPONENT ============

export default function Glucose() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [context, setContext] = useState<"ayunas" | "pre" | "post" | "antes_dormir">("ayunas");
  const [callData, setCallData] = useState<{ active: boolean; message: string; title: string; speech: string } | null>(null);
  const [userName, setUserName] = useState("Paciente");
  const [history, setHistory] = useState<any[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<GlucoseAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");
    if (user.name) setUserName(user.name.split(" ")[0]);
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getGlucoseHistory();
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const save = async () => {
    if (!value) {
      alert("Debes ingresar un valor");
      return;
    }

    const val = parseInt(value);
    if (isNaN(val) || val < 20 || val > 600) {
      alert("Ingresa un valor válido entre 20 y 600 mg/dL");
      return;
    }

    setIsLoading(true);
    console.log("Saving glucose:", val);

    const contextLabel =
      context === "ayunas"
        ? "Ayunas"
        : context === "pre"
          ? "Antes de comer"
          : context === "post"
            ? "2h después de comer"
            : "Antes de dormir";

    const record = {
      fecha: new Date().toISOString().slice(0, 10),
      valor: val,
      hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      comida: contextLabel,
    };

    try {
      // Save to Firestore (or localStorage fallback)
      const saved = await saveGlucose(record);
      console.log("Save result:", saved);

      if (!saved) {
        console.warn("saveGlucose returned false - possibly no user ID");
      }

      // Refresh history
      await loadHistory();

      // Analyze and get smart recommendation
      const analysis = analyzeGlucose(val, history);
      setLastAnalysis(analysis);
      console.log("Analysis:", analysis);

      const recommendation = getSmartRecommendation(val, userName, analysis);
      console.log("Recommendation:", recommendation);

      // Trigger the call
      setCallData({
        active: true,
        title: recommendation.title,
        message: recommendation.message,
        speech: recommendation.speech
      });

      // Clear input
      setValue("");

    } catch (error) {
      console.error("Error saving glucose:", error);
      alert("Error al guardar. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  /* Dynamic color logic */
  const getValueColor = (val: number) => {
    if (!val) return "#F3F4F6";
    if (val < 70) return "#FECACA";
    if (val > 180) return "#FED7AA";
    return "#D1FAE5";
  };

  const getStatusText = (val: number) => {
    if (!val) return "Esperando dato...";
    if (val < 70) return "⚠️ Hipoglucemia (Bajo)";
    if (val > 180) return "⚠️ Hiperglucemia (Alto)";
    return "✅ Nivel Saludable";
  };

  const bgColor = getValueColor(Number(value));

  // Trend badge for UI
  const getTrendBadge = () => {
    if (!lastAnalysis || lastAnalysis.trend === "unknown") return null;
    const badges = {
      rising: { emoji: "↗️", text: "Subiendo", color: "#FEF3C7" },
      falling: { emoji: "↘️", text: "Bajando", color: "#DBEAFE" },
      stable: { emoji: "➡️", text: "Estable", color: "#D1FAE5" }
    };
    const badge = badges[lastAnalysis.trend];
    return (
      <span style={{
        background: badge.color,
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        marginLeft: "10px"
      }}>
        {badge.emoji} {badge.text}
      </span>
    );
  };

  return (
    <div style={{ ...container, background: `linear-gradient(180deg, ${bgColor} 0%, #FFFFFF 100%)` }}>

      {callData?.active && (
        <SimulatedCall
          userName={userName}
          title={callData.title}
          message={callData.speech}
          onEndCall={() => setCallData(null)}
        />
      )}

      {/* HEADER */}
      <h2 style={headerTitle}>Medición de Glucosa</h2>
      <p style={{ color: "#555", marginBottom: "20px" }}>
        Registro y monitoreo inteligente
        {getTrendBadge()}
      </p>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "18px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => navigate("/glucose/history")}
          style={{
            padding: "10px 14px",
            borderRadius: "14px",
            border: "1px solid rgba(15, 23, 42, 0.12)",
            background: "rgba(255,255,255,0.9)",
            fontWeight: 800,
            color: "#0F172A",
            cursor: "pointer",
          }}
        >
          📚 Ver historial completo
        </button>
      </div>

      {/* MAIN CARD */}
      <div style={mainCard}>
        <span style={{ fontSize: "50px", display: "block", marginBottom: "5px" }}>🩸</span>
        <label style={{ fontWeight: "bold", color: "#666", display: "block" }}>
          Nivel actual (mg/dL)
        </label>
        <input
          type="number"
          value={value}
          placeholder="000"
          style={bigInput}
          onChange={(e) => setValue(e.target.value)}
        />
        <div style={{
          marginTop: "10px",
          padding: "6px 12px",
          borderRadius: "15px",
          background: value ? "rgba(0,0,0,0.05)" : "transparent",
          display: "inline-block",
          fontWeight: "bold",
          color: "#444",
          fontSize: "14px"
        }}>
          {getStatusText(Number(value))}
        </div>

        <div style={{ marginTop: "14px", width: "100%" }}>
          <label style={{ fontWeight: "bold", color: "#666", display: "block", marginBottom: "6px" }}>
            Contexto de la medición
          </label>
          <select
            value={context}
            onChange={(e) => setContext(e.target.value as any)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "14px",
              border: "1px solid rgba(15, 23, 42, 0.12)",
              background: "rgba(255,255,255,0.9)",
              fontWeight: 700,
              color: "#0F172A",
              outline: "none",
            }}
          >
            <option value="ayunas">Ayunas</option>
            <option value="pre">Antes de comer</option>
            <option value="post">2h después de comer</option>
            <option value="antes_dormir">Antes de dormir</option>
          </select>
        </div>
      </div>

      <button
        style={{ ...actionBtn, opacity: isLoading ? 0.7 : 1 }}
        onClick={save}
        disabled={isLoading}
      >
        {isLoading ? "⏳ Guardando..." : "GUARDAR Y ANALIZAR"}
      </button>

      {/* RECOMMENDATION DISPLAY (after save) */}
      {callData && !callData.active && (
        <div style={recommendationCard}>
          <h4 style={{ margin: "0 0 10px", color: "#1F4FFF" }}>{callData.title}</h4>
          <p style={{ margin: 0, whiteSpace: "pre-line", fontSize: "14px", lineHeight: "1.6" }}>
            {callData.message}
          </p>
        </div>
      )}

      {/* CHART */}
      <div style={{ marginTop: "40px", marginBottom: "30px" }}>
        <h3 style={{ fontSize: "18px", color: "#333", textAlign: "left", marginBottom: "15px" }}>
          📈 Tendencia Reciente
        </h3>
        <GlucoseChart data={history} />
      </div>

      {/* HISTORY */}
      <div style={{ textAlign: "left" }}>
        <h3 style={{ fontSize: "16px", color: "#666", marginBottom: "10px" }}>
          Últimos 3 registros
        </h3>
        {history.length === 0 ? (
          <p style={{ color: "#999", fontStyle: "italic" }}>Sin datos aún.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[...history].reverse().slice(0, 3).map((item: any, i: number) => (
              <div key={i} style={historyItem}>
                <div>
                  <span style={{ fontWeight: "bold", fontSize: "18px", color: "#1F4FFF" }}>{item.valor}</span>
                  <span style={{ fontSize: "12px", color: "#999", marginLeft: "5px" }}>mg/dL</span>
                </div>
                <span style={{ fontSize: "13px", color: "#666" }}>{item.fecha}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const GlucoseChart = ({ data }: { data: any[] }) => {
  const recentData = data.slice(-7);

  if (recentData.length < 2) {
    return (
      <div style={{
        height: "200px",
        background: "#F9FAFB",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9CA3AF",
        fontSize: "14px"
      }}>
        Necesitas al menos 2 registros para ver la gráfica.
      </div>
    );
  }

  const width = 320;
  const height = 180;
  const padding = 20;

  const maxVal = 300;
  const minVal = 40;

  const getX = (index: number) => {
    const effectiveWidth = width - (padding * 2);
    const step = effectiveWidth / (recentData.length - 1);
    return padding + (index * step);
  };

  const getY = (val: number) => {
    const effectiveHeight = height - (padding * 2);
    const range = maxVal - minVal;
    const normalized = (val - minVal) / range;
    return height - padding - (normalized * effectiveHeight);
  };

  const points = recentData.map((d, i) => `${getX(i)},${getY(d.valor)}`).join(" ");
  const hypoY = getY(70);
  const hyperY = getY(180);

  return (
    <div style={{ background: "white", padding: "15px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
      <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`}>
        {/* Background zones */}
        <rect x={padding} y={padding} width={width - padding * 2} height={Math.max(0, hyperY - padding)} fill="#FEF2F2" rx="4" />
        <rect x={padding} y={hyperY} width={width - padding * 2} height={Math.max(0, hypoY - hyperY)} fill="#ECFDF5" />
        <rect x={padding} y={hypoY} width={width - padding * 2} height={Math.max(0, height - padding - hypoY)} fill="#FFF1F2" />

        <line x1={padding} y1={hyperY} x2={width - padding} y2={hyperY} stroke="#FECACA" strokeWidth="1" strokeDasharray="4 2" />
        <line x1={padding} y1={hypoY} x2={width - padding} y2={hypoY} stroke="#FECACA" strokeWidth="1" strokeDasharray="4 2" />

        <polyline
          fill="none"
          stroke="#1F4FFF"
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {recentData.map((d, i) => (
          <g key={i}>
            <circle
              cx={getX(i)}
              cy={getY(d.valor)}
              r="5"
              fill="white"
              stroke="#1F4FFF"
              strokeWidth="2"
            />
            <text
              x={getX(i)}
              y={getY(d.valor) - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#555"
              fontWeight="bold"
            >
              {d.valor}
            </text>
          </g>
        ))}

        <text x="5" y={hyperY + 4} fontSize="10" fill="#EF4444">180</text>
        <text x="5" y={hypoY + 4} fontSize="10" fill="#EF4444">70</text>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px", fontSize: "11px", color: "#999" }}>
        <span>{recentData[0]?.fecha?.split(',')[0] || ""}</span>
        <span>Hoy</span>
      </div>
    </div>
  );
};

// --- STYLES ---

const container: React.CSSProperties = {
  minHeight: "100vh",
  padding: "20px",
  maxWidth: "480px",
  margin: "0 auto",
  textAlign: "center",
  transition: "background 0.5s ease"
};

const headerTitle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#1F1F1F",
  margin: "10px 0 5px"
};

const mainCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.9)",
  padding: "20px",
  borderRadius: "30px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  marginBottom: "20px",
  animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
};

const bigInput: React.CSSProperties = {
  width: "100%",
  textAlign: "center",
  fontSize: "42px",
  fontWeight: "bold",
  color: "#1F1F1F",
  border: "none",
  background: "transparent",
  outline: "none",
  fontFamily: "monospace"
};

const actionBtn: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  backgroundColor: "#1F4FFF",
  color: "white",
  borderRadius: "20px",
  border: "none",
  fontSize: "18px",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(31, 79, 255, 0.3)",
  letterSpacing: "0.5px",
  transition: "transform 0.2s"
};

const historyItem: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px",
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.03)"
};

const recommendationCard: React.CSSProperties = {
  background: "white",
  padding: "20px",
  borderRadius: "16px",
  marginTop: "20px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  textAlign: "left",
  borderLeft: "4px solid #1F4FFF"
};
