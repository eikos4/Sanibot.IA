import { useState, useEffect } from "react";
import SimulatedCall from "../../components/SimulatedCall";

export default function Glucose() {
  const [value, setValue] = useState("");
  const [callData, setCallData] = useState<{ active: boolean; message: string; title: string } | null>(null);
  const [userName, setUserName] = useState("Paciente");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");
    if (user.name) setUserName(user.name);
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = JSON.parse(localStorage.getItem("glucoseHistory") || "[]");
    setHistory(data);
  };

  const save = () => {
    if (!value) return alert("Debes ingresar un valor");

    const val = parseInt(value);
    const record = {
      fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      valor: val,
      timestamp: Date.now()
    };

    // Guardar en localStorage
    const newHistory = [...history, record];
    localStorage.setItem("glucoseHistory", JSON.stringify(newHistory));
    setHistory(newHistory);
    setValue("");

    // Lógica Inteligente de Alertas (Simulated Call)
    if (val < 70) {
      setCallData({
        active: true,
        title: "⚠️ ALERTA: Hipoglucemia",
        message: `¡Alerta! ${userName}, nivel de ${val} es muy bajo. Ingiere azúcar rápido.`
      });
    } else if (val > 180) {
      setCallData({
        active: true,
        title: "⚠️ ALERTA: Hiperglucemia",
        message: `¡Atención ${userName}! Nivel alto: ${val}. Hidrátate bien.`
      });
    } else {
      setCallData({
        active: true,
        title: "✅ Glucosa en Rango",
        message: `¡Excelente ${userName}! ${val} es un nivel saludable. Sigue así.`
      });
    }
  };

  /* Lógica de color dinámica */
  const getValueColor = (val: number) => {
    if (!val) return "#F3F4F6";
    if (val < 70) return "#FECACA";
    if (val > 180) return "#FED7AA";
    return "#D1FAE5";
  };

  const getStatusText = (val: number) => {
    if (!val) return "Esperando dato...";
    if (val < 70) return "Hipoglucemia (Bajo)";
    if (val > 180) return "Hiperglucemia (Alto)";
    return "Nivel Saludable";
  };

  const bgColor = getValueColor(Number(value));

  return (
    <div style={{ ...container, background: `linear-gradient(180deg, ${bgColor} 0%, #FFFFFF 100%)` }}>

      {callData?.active && (
        <SimulatedCall
          userName={userName}
          title={callData.title}
          message={callData.message}
          onEndCall={() => setCallData(null)}
        />
      )}

      {/* HEADER */}
      <h2 style={headerTitle}>Medición de Glucosa</h2>
      <p style={{ color: "#555", marginBottom: "20px" }}>Registro y monitoreo</p>

      {/* TARJETA PRINCIPAL */}
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
      </div>

      <button style={actionBtn} onClick={save}>
        GUARDAR
      </button>

      {/* COMPONENTE DE GRÁFICO */}
      <div style={{ marginTop: "40px", marginBottom: "30px" }}>
        <h3 style={{ fontSize: "18px", color: "#333", textAlign: "left", marginBottom: "15px" }}>
          📈 Tendencia Reciente
        </h3>
        <GlucoseChart data={history} />
      </div>

      {/* HISTORIAL TEXTO */}
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
  // Tomamos los últimos 7 registros para que el gráfico sea legible
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

  // Dimensiones
  const width = 320;
  const height = 180;
  const padding = 20;

  // Escalas
  const maxVal = 300; // Tope fijo para consistencia clínica
  const minVal = 40;  // Base fija

  const getX = (index: number) => {
    const effectiveWidth = width - (padding * 2);
    const step = effectiveWidth / (recentData.length - 1);
    return padding + (index * step);
  };

  const getY = (val: number) => {
    const effectiveHeight = height - (padding * 2);
    const range = maxVal - minVal;
    const normalized = (val - minVal) / range; // 0..1
    // SVG Y crece hacia abajo, así que invertimos
    return height - padding - (normalized * effectiveHeight);
  };

  // Generar línea SVG
  const points = recentData.map((d, i) => `${getX(i)},${getY(d.valor)}`).join(" ");

  // Zona de Hipoglucemia (<70)
  const hypoY = getY(70);
  // Zona de Hiperglucemia (>180)
  const hyperY = getY(180);

  return (
    <div style={{ background: "white", padding: "15px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
      <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`}>
        {/* ZONAS DE FONDO */}
        {/* Zona Hiper (>180) - Roja suave */}
        <rect x={padding} y={padding} width={width - padding * 2} height={Math.max(0, hyperY - padding)} fill="#FEF2F2" rx="4" />

        {/* Zona Normal (70-180) - Verde suave */}
        <rect x={padding} y={hyperY} width={width - padding * 2} height={Math.max(0, hypoY - hyperY)} fill="#ECFDF5" />

        {/* Zona Hipo (<70) - Roja suave */}
        <rect x={padding} y={hypoY} width={width - padding * 2} height={Math.max(0, height - padding - hypoY)} fill="#FFF1F2" />

        {/* Grid Lines (Opcional) */}
        <line x1={padding} y1={hyperY} x2={width - padding} y2={hyperY} stroke="#FECACA" strokeWidth="1" strokeDasharray="4 2" />
        <line x1={padding} y1={hypoY} x2={width - padding} y2={hypoY} stroke="#FECACA" strokeWidth="1" strokeDasharray="4 2" />

        {/* LÍNEA DE DATOS */}
        <polyline
          fill="none"
          stroke="#1F4FFF"
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* PUNTOS */}
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
            {/* Tooltip básico (texto SVG) */}
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

        {/* ETIQUETAS EJE Y */}
        <text x="5" y={hyperY + 4} fontSize="10" fill="#EF4444">180</text>
        <text x="5" y={hypoY + 4} fontSize="10" fill="#EF4444">70</text>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px", fontSize: "11px", color: "#999" }}>
        <span>{recentData[0]?.fecha.split(',')[0]}</span>
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
