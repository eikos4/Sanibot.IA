import { useState } from "react";

export default function DailyLog() {
    const [mood, setMood] = useState<"happy" | "neutral" | "sad" | null>(null);
    const [symptoms, setSymptoms] = useState("");

    const saveLog = () => {
        // Aquí iría la lógica para guardar en localStorage o backend
        console.log("Bitácora guardada:", { mood, symptoms, date: new Date() });
        alert("Bitácora guardada correctamente");
        setMood(null);
        setSymptoms("");
    };

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Bitácora Diaria</h2>
            <p style={{ color: "#666" }}>¿Cómo te sientes hoy?</p>

            <div style={{ display: "flex", justifyContent: "center", gap: "20px", margin: "30px 0" }}>
                <button
                    onClick={() => setMood("happy")}
                    style={{ ...moodBtn, transform: mood === "happy" ? "scale(1.2)" : "scale(1)" }}
                >
                    😄
                    <span style={label}>Bien</span>
                </button>
                <button
                    onClick={() => setMood("neutral")}
                    style={{ ...moodBtn, transform: mood === "neutral" ? "scale(1.2)" : "scale(1)" }}
                >
                    😐
                    <span style={label}>Normal</span>
                </button>
                <button
                    onClick={() => setMood("sad")}
                    style={{ ...moodBtn, transform: mood === "sad" ? "scale(1.2)" : "scale(1)" }}
                >
                    😔
                    <span style={label}>Mal</span>
                </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Síntomas o Notas</h3>
                <textarea
                    placeholder="Ej: Me duele un poco la cabeza..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    style={{
                        width: "100%",
                        height: "100px",
                        padding: "15px",
                        borderRadius: "12px",
                        border: "1px solid #ccc",
                        fontSize: "16px",
                        resize: "none",
                    }}
                />
            </div>

            <button style={saveBtn} onClick={saveLog}>
                Guardar Registro
            </button>
        </div>
    );
}

const moodBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    fontSize: "48px",
    cursor: "pointer",
    transition: "transform 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
};

const label: React.CSSProperties = {
    fontSize: "14px",
    color: "#333",
    marginTop: "5px",
    fontWeight: "bold",
};

const saveBtn: React.CSSProperties = {
    width: "100%",
    padding: "15px",
    backgroundColor: "#1F4FFF",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
};
