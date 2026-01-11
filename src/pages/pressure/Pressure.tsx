import { useState, useEffect } from "react";
// @ts-ignore
import SimulatedCall from "../../components/SimulatedCall";

export default function Pressure() {
    const [systolic, setSystolic] = useState("");
    const [diastolic, setDiastolic] = useState("");
    const [callData, setCallData] = useState<{ active: boolean; message: string; title: string } | null>(null);
    const [userName, setUserName] = useState("Paciente");
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");
        if (user.name) setUserName(user.name);
        loadHistory();
    }, []);

    const loadHistory = () => {
        const data = JSON.parse(localStorage.getItem("pressureHistory") || "[]");
        setHistory(data);
    };

    const save = () => {
        if (!systolic || !diastolic) return alert("Ingresa ambos valores");

        const record = {
            fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
            sistolica: parseInt(systolic),
            diastolica: parseInt(diastolic),
            timestamp: Date.now()
        };

        // Guardar en localStorage
        const newHistory = [...history, record];
        localStorage.setItem("pressureHistory", JSON.stringify(newHistory));
        setHistory(newHistory);

        // FEEDBACK AUTOMÁTICO INTELIGENTE
        const s = parseInt(systolic);
        const d = parseInt(diastolic);

        setSystolic("");
        setDiastolic("");

        if (s > 180 || d > 120) {
            setCallData({
                active: true,
                title: "🚨 ALERTA ROJA",
                message: `¡ALERTA ROJA ${userName}! Tu presión es crítica (${s}/${d}). Llama a urgencias.`
            });
        } else if (s >= 140 || d >= 90) {
            setCallData({
                active: true,
                title: "⚠️ Hipertensión Nivel 2",
                message: `Atención ${userName}. Hipertensión Nivel 2 detectada. Reduce la sal hoy.`
            });
        } else if (s >= 130 || d >= 80) {
            setCallData({
                active: true,
                title: "⚠️ Hipertensión Nivel 1",
                message: `Aviso ${userName}. Presión un poco alta. Relájate y mide de nuevo luego.`
            });
        } else if (s >= 120 && d < 80) {
            setCallData({
                active: true,
                title: "⚠️ Presión Elevada",
                message: `Presión ligeramente elevada. Vigila tu consumo de sodio.`
            });
        } else {
            setCallData({
                active: true,
                title: "✅ Presión Saludable",
                message: `¡Felicidades ${userName}! ${s}/${d} es una presión perfecta.`
            });
        }
    };

    /* Lógica de color dinámica */
    const getStatusText = (sVal: string, dVal: string) => {
        if (!sVal || !dVal) return "Esperando datos...";
        const s = parseInt(sVal);
        const d = parseInt(dVal);

        if (s > 180 || d > 120) return "🚨 CRISIS HIPERTENSIVA";
        if (s >= 140 || d >= 90) return "Hipertensión Nivel 2 ⚠️";
        if (s >= 130 || d >= 80) return "Hipertensión Nivel 1 ⚠️";
        if (s >= 120 && d < 80) return "Elevada (Precaución)";
        return "Normal (Saludable) ✅";
    };

    // Usamos el último registro para el background color si no hay input actual
    const lastRec = history[history.length - 1];
    // Color logic simplificada para el fondo
    const bgColor = "#F3F4F6";

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

            <h2 style={headerTitle}>Presión Arterial</h2>
            <p style={{ color: "#555", marginBottom: "25px" }}>Monitoreo Cardíaco ❤️</p>

            {/* TARJETA PRINCIPAL */}
            <div style={mainCard}>
                <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
                    {/* SISTÓLICA */}
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#3B82F6" }}>SIS (Alta)</span>
                        <input
                            type="number"
                            value={systolic}
                            placeholder="120"
                            style={{ ...bigInput, color: "#3B82F6" }}
                            onChange={(e) => setSystolic(e.target.value)}
                        />
                    </div>
                    <div style={{ fontSize: "40px", color: "#ccc", fontWeight: "300", marginTop: "20px" }}>/</div>
                    {/* DIASTÓLICA */}
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#8B5CF6" }}>DIA (Baja)</span>
                        <input
                            type="number"
                            value={diastolic}
                            placeholder="80"
                            style={{ ...bigInput, color: "#8B5CF6" }}
                            onChange={(e) => setDiastolic(e.target.value)}
                        />
                    </div>
                </div>

                <div style={statusBadge(systolic, diastolic)}>
                    {getStatusText(systolic, diastolic)}
                </div>
            </div>

            <button style={actionBtn} onClick={save}>
                GUARDAR
            </button>

            {/* GRÁFICO */}
            <div style={{ marginTop: "40px", marginBottom: "30px" }}>
                <h3 style={{ fontSize: "18px", color: "#333", textAlign: "left", marginBottom: "15px" }}>
                    📈 Tendencia
                </h3>
                <PressureChart data={history} />
            </div>

            {/* HISTORIAL */}
            <div style={{ marginTop: "20px", textAlign: "left" }}>
                <h3 style={{ fontSize: "16px", color: "#666", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                    Últimos 3 registros
                </h3>
                {history.length === 0 ? (
                    <p style={{ color: "#999", fontStyle: "italic" }}>No hay mediciones recientes.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {[...history].reverse().slice(0, 3).map((item: any, i: number) => (
                            <div key={i} style={historyItem}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ fontWeight: "800", fontSize: "18px", color: "#3B82F6" }}>
                                        {item.sistolica}
                                    </span>
                                    <span style={{ color: "#ccc" }}>/</span>
                                    <span style={{ fontWeight: "800", fontSize: "18px", color: "#8B5CF6" }}>
                                        {item.diastolica}
                                    </span>
                                </div>
                                <span style={{ fontSize: "13px", color: "#666" }}>{item.fecha}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

// --- CHART COMPONENT ---
const PressureChart = ({ data }: { data: any[] }) => {
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
                fontSize: "14px",
                border: "1px dashed #E5E7EB"
            }}>
                Registra al menos 2 medidas.
            </div>
        );
    }

    const width = 320;
    const height = 180;
    const padding = 20;
    const maxVal = 200;
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

    const pointsSys = recentData.map((d, i) => `${getX(i)},${getY(d.sistolica)}`).join(" ");
    const pointsDia = recentData.map((d, i) => `${getX(i)},${getY(d.diastolica)}`).join(" ");

    const hazardY = getY(140); // Línea de peligro sistólica

    return (
        <div style={{ background: "white", padding: "15px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`}>
                {/* Zona de Peligro (>140) */}
                <rect x={padding} y={padding} width={width - padding * 2} height={Math.max(0, hazardY - padding)} fill="#FEF2F2" rx="4" />

                {/* Grid Line 140 */}
                <line x1={padding} y1={hazardY} x2={width - padding} y2={hazardY} stroke="#FECACA" strokeWidth="1" strokeDasharray="4 2" />

                {/* DIASTOLIC LINE (Purple) */}
                <polyline
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="3"
                    points={pointsDia}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                />

                {/* SYSTOLIC LINE (Blue) */}
                <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    points={pointsSys}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* POINTS */}
                {recentData.map((d, i) => (
                    <g key={i}>
                        {/* Sys Dot */}
                        <circle cx={getX(i)} cy={getY(d.sistolica)} r="4" fill="white" stroke="#3B82F6" strokeWidth="2" />
                        {/* Dia Dot */}
                        <circle cx={getX(i)} cy={getY(d.diastolica)} r="4" fill="white" stroke="#8B5CF6" strokeWidth="2" />
                    </g>
                ))}

                <text x="5" y={hazardY + 4} fontSize="10" fill="#EF4444">140</text>
            </svg>
            <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "5px", fontSize: "11px" }}>
                <span style={{ color: "#3B82F6", fontWeight: "bold" }}>● Sistólica</span>
                <span style={{ color: "#8B5CF6", fontWeight: "bold" }}>● Diastólica</span>
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
    padding: "30px 20px",
    borderRadius: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    marginBottom: "25px",
};

const bigInput: React.CSSProperties = {
    width: "100%",
    textAlign: "center",
    fontSize: "36px",
    fontWeight: "bold",
    border: "none",
    borderBottom: "2px solid #eee",
    background: "transparent",
    outline: "none",
    fontFamily: "monospace",
    padding: "5px 0"
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
    boxShadow: "0 8px 25px rgba(31, 79, 255, 0.3)",
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

const statusBadge = (s: string, d: string): React.CSSProperties => ({
    marginTop: "10px",
    padding: "6px 15px",
    borderRadius: "20px",
    background: (s && d) ? "rgba(0,0,0,0.05)" : "transparent",
    display: "inline-block",
    fontWeight: "bold",
    color: "#444",
    fontSize: "14px"
});
