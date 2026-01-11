import { useState, useEffect } from "react";
import SimulatedCall from "../../components/SimulatedCall";

export default function Glucose() {
  const [value, setValue] = useState("");
  const [callData, setCallData] = useState<{ active: boolean; message: string; title: string } | null>(null);
  const [userName, setUserName] = useState("Paciente");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");
    if (user.name) setUserName(user.name);
  }, []);

  const save = () => {
    if (!value) return alert("Debes ingresar un valor");

    const val = parseInt(value);
    const record = {
      fecha: new Date().toLocaleString(),
      valor: value,
    };

    // Guardar en localStorage
    const history = JSON.parse(localStorage.getItem("glucoseHistory") || "[]");
    history.push(record);
    localStorage.setItem("glucoseHistory", JSON.stringify(history));

    setValue("");

    // Lógica Inteligente de Alertas (Simulated Call)
    if (val < 70) {
      setCallData({
        active: true,
        title: "⚠️ ALERTA: Hipoglucemia",
        message: `¡Alerta de hipoglucemia! ${userName}, tu nivel de ${val} es peligrosamente bajo. Por favor, consume 15 gramos de azúcar de inmediato, como un jugo de frutas o dulces. Espera 15 minutos y vuelve a medirte. Estoy aquí contigo.`
      });
    } else if (val > 180) {
      setCallData({
        active: true,
        title: "⚠️ ALERTA: Hiperglucemia",
        message: `¡Atención ${userName}! Tu nivel de glucosa es alto: ${val}. Te recomiendo beber mucha agua para hidratarte. Si usas insulina, verifica si necesitas una dosis de corrección según tu pauta médica. Si tienes náuseas o vómitos, busca ayuda médica.`
      });
    } else {
      // Feedback positivo (opcional, puede ser solo un toast, pero hagamos llamada corta positiva)
      setCallData({
        active: true,
        title: "✅ Glucosa en Rango",
        message: `¡Excelente ${userName}! Tu nivel de ${val} está dentro del rango saludable. Buen trabajo cuidando tu salud hoy. Sigue así.`
      });
    }
  };

  /* Lógica de color dinámica */
  const getValueColor = (val: number) => {
    if (!val) return "#F3F4F6"; // Gris default
    if (val < 70) return "#FECACA"; // Rojo Hipo
    if (val > 180) return "#FED7AA"; // Naranja Hiper
    return "#D1FAE5"; // Verde Normal
  };

  const getStatusText = (val: number) => {
    if (!val) return "Esperando dato...";
    if (val < 70) return "Hipoglucemia (Bajo)";
    if (val > 180) return "Hiperglucemia (Alto)";
    return "Nivel Saludable";
  };

  const bgColor = getValueColor(Number(value));

  // Obtener historial par mostrar abajo
  const historyList = JSON.parse(localStorage.getItem("glucoseHistory") || "[]").reverse().slice(0, 3);

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

      {/* HEADER AMIGABLE */}
      <h2 style={headerTitle}>Medición de Glucosa</h2>
      <p style={{ color: "#555", marginBottom: "30px" }}>¿Cómo te sientes ahora?</p>

      {/* TARJETA PRINCIPAL DE MEDICIÓN */}
      <div style={mainCard}>
        <span style={{ fontSize: "60px", display: "block", marginBottom: "10px" }}>🩸</span>

        <label style={{ fontWeight: "bold", color: "#666", display: "block", marginBottom: "10px" }}>
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
          marginTop: "15px",
          padding: "8px 15px",
          borderRadius: "20px",
          background: value ? "rgba(0,0,0,0.05)" : "transparent",
          display: "inline-block",
          fontWeight: "bold",
          color: "#444"
        }}>
          {getStatusText(Number(value))}
        </div>
      </div>

      {/* BOTÓN GRANDE */}
      <button style={actionBtn} onClick={save}>
        GUARDAR REGISTRO
      </button>

      {/* HISTORIAL RÁPIDO */}
      <div style={{ marginTop: "40px", textAlign: "left" }}>
        <h3 style={{ fontSize: "18px", color: "#333", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
          🕒 Últimos Registros
        </h3>
        {historyList.length === 0 ? (
          <p style={{ color: "#999", fontStyle: "italic" }}>No hay mediciones recientes.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {historyList.map((item: any, i: number) => (
              <div key={i} style={historyItem}>
                <span style={{ fontWeight: "bold", fontSize: "18px", color: "#1F4FFF" }}>{item.valor}</span>
                <span style={{ fontSize: "14px", color: "#666" }}>{item.fecha}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes popIn {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

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
  padding: "30px 20px",
  borderRadius: "30px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  marginBottom: "25px",
  animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
};

const bigInput: React.CSSProperties = {
  width: "100%",
  textAlign: "center",
  fontSize: "48px",
  fontWeight: "bold",
  color: "#1F1F1F",
  border: "none",
  background: "transparent",
  outline: "none",
  fontFamily: "monospace" // Para alinear números
};

const actionBtn: React.CSSProperties = {
  width: "100%",
  padding: "20px",
  backgroundColor: "#1F4FFF",
  color: "white",
  borderRadius: "20px",
  border: "none",
  fontSize: "20px",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 8px 25px rgba(31, 79, 255, 0.3)",
  letterSpacing: "1px",
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
