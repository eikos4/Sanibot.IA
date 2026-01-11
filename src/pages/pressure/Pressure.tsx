import { useState, useEffect } from "react";
// @ts-ignore
import SimulatedCall from "../../components/SimulatedCall";

export default function Pressure() {
    const [systolic, setSystolic] = useState("");
    const [diastolic, setDiastolic] = useState("");
    const [callData, setCallData] = useState<{ active: boolean; message: string; title: string } | null>(null);
    const [userName, setUserName] = useState("Paciente");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");
        if (user.name) setUserName(user.name);
    }, []);

    const save = () => {
        if (!systolic || !diastolic) return alert("Ingresa ambos valores");

        const record = {
            fecha: new Date().toLocaleString(),
            sistolica: systolic,
            diastolica: diastolic,
        };

        // Guardar en localStorage
        const history = JSON.parse(localStorage.getItem("pressureHistory") || "[]");
        history.push(record);
        localStorage.setItem("pressureHistory", JSON.stringify(history));

        // FEEDBACK AUTOMÁTICO INTELIGENTE (Simulated Call)
        const s = parseInt(systolic);
        const d = parseInt(diastolic);

        setSystolic("");
        setDiastolic("");

        if (s > 180 || d > 120) {
            setCallData({
                active: true,
                title: "🚨 ALERTA ROJA",
                message: `¡ALERTA ROJA ${userName}! Tu presión es crítica (${s} con ${d}). Si sientes dolor de pecho, falta de aire o mareos, llama a urgencias inmediatamente. Por favor, recuéstate y trata de calmarte mientras llega ayuda.`
            });
        } else if (s >= 140 || d >= 90) {
            setCallData({
                active: true,
                title: "⚠️ Hipertensión Nivel 2",
                message: `Atención ${userName}. Tu registro indica Hipertensión Nivel 2. Es importante que contactes a tu médico para ajustar tu tratamiento. Te recomiendo reducir la sal por completo el día de hoy.`
            });
        } else if (s >= 130 || d >= 80) {
            setCallData({
                active: true,
                title: "⚠️ Hipertensión Nivel 1",
                message: `Aviso importante ${userName}. Tu presión está un poco alta, Nivel 1. Trata de relajarte, evita el café por ahora y vuelve a medirte en una hora.`
            });
        } else if (s >= 120 && d < 80) {
            setCallData({
                active: true,
                title: "⚠️ Presión Elevada",
                message: `Tu presión está ligeramente elevada. Nada grave, pero vigila tu consumo de sodio y trata de descansar un poco.`
            });
        } else {
            setCallData({
                active: true,
                title: "✅ Presión Saludable",
                message: `¡Felicidades ${userName}! Tu presión arterial de ${s} con ${d} es perfecta. Tu corazón está trabajando muy bien. Sigue así.`
            });
        }
    };

    /* Lógica de color dinámica (Basada en AHA) */
    const getStatusColor = (sVal: string, dVal: string) => {
        if (!sVal || !dVal) return "#F3F4F6";
        const s = parseInt(sVal);
        const d = parseInt(dVal);

        if (s > 140 || d > 90) return "#FECACA"; // Rojo (Crisis/Hiper 2)
        if (s > 130 || d > 80) return "#FED7AA"; // Naranja (Hiper 1)
        if (s > 120 && d < 80) return "#FEF08A"; // Amarillo (Elevada)
        return "#D1FAE5"; // Verde (Normal)
    };

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

    const bgColor = getStatusColor(systolic, diastolic);
    const historyList = JSON.parse(localStorage.getItem("pressureHistory") || "[]").reverse().slice(0, 3);

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
            <p style={{ color: "#555", marginBottom: "25px" }}>Registro preventivo del corazón ❤️</p>

            {/* TARJETA PRINCIPAL */}
            <div style={mainCard}>
                <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>

                    {/* SISTÓLICA */}
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#666" }}>SIS (Alta)</span>
                        <input
                            type="number"
                            value={systolic}
                            placeholder="120"
                            style={bigInput}
                            onChange={(e) => setSystolic(e.target.value)}
                        />
                    </div>

                    <div style={{ fontSize: "40px", color: "#ccc", fontWeight: "300", marginTop: "20px" }}>/</div>

                    {/* DIASTÓLICA */}
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#666" }}>DIA (Baja)</span>
                        <input
                            type="number"
                            value={diastolic}
                            placeholder="80"
                            style={bigInput}
                            onChange={(e) => setDiastolic(e.target.value)}
                        />
                    </div>

                </div>

                <div style={{
                    marginTop: "5px",
                    padding: "8px 15px",
                    borderRadius: "20px",
                    background: (systolic && diastolic) ? "rgba(0,0,0,0.05)" : "transparent",
                    display: "inline-block",
                    fontWeight: "bold",
                    color: "#444"
                }}>
                    {getStatusText(systolic, diastolic)}
                </div>
            </div>

            {/* BOTÓN */}
            <button style={actionBtn} onClick={save}>
                GUARDAR REGISTRO
            </button>

            {/* HISTORIAL */}
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
                                <span style={{ fontWeight: "bold", fontSize: "18px", color: "#1F4FFF" }}>
                                    {item.sistolica}/{item.diastolica}
                                </span>
                                <span style={{ fontSize: "14px", color: "#666" }}>{item.fecha.split(',')[0]}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
};

const bigInput: React.CSSProperties = {
    width: "100%",
    textAlign: "center",
    fontSize: "40px",
    fontWeight: "bold",
    color: "#1F1F1F",
    border: "none",
    borderBottom: "2px solid #eee",
    background: "transparent",
    outline: "none",
    fontFamily: "monospace",
    padding: "10px 0"
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
