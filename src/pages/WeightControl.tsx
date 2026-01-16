import { useState, useEffect, useCallback } from "react";
import {
    getWeightHistory,
    saveWeightEntry,
    deleteWeightEntry,
    getSavedHeight,
    type WeightEntry
} from "../services/weightStorage";

export default function WeightControl() {
    const [history, setHistory] = useState<WeightEntry[]>([]);
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [heightLocked, setHeightLocked] = useState(false);
    const [bmi, setBmi] = useState<number | null>(null);
    const [status, setStatus] = useState({ label: "", color: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const loadHistory = useCallback(async () => {
        try {
            const data = await getWeightHistory();
            setHistory(data);

            // Load saved height
            const savedHeight = getSavedHeight();
            if (savedHeight) {
                setHeight(savedHeight.toString());
                setHeightLocked(true);
            }

            // If there's history, preload last weight
            if (data.length > 0) {
                setWeight(data[0].weight.toString());
                if (!savedHeight) {
                    setHeight(data[0].height.toString());
                    setHeightLocked(true);
                }
            }
        } catch (error) {
            console.error("Error loading history:", error);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    useEffect(() => {
        // Calculate BMI when weight or height changes
        const w = parseFloat(weight);
        const h = parseFloat(height);

        if (w > 0 && h > 0) {
            const hMeters = h / 100;
            const value = w / (hMeters * hMeters);
            setBmi(value);

            if (value < 18.5) setStatus({ label: "Bajo Peso", color: "#FBBF24" });
            else if (value < 25) setStatus({ label: "Peso Normal", color: "#10B981" });
            else if (value < 30) setStatus({ label: "Sobrepeso", color: "#F97316" });
            else setStatus({ label: "Obesidad", color: "#EF4444" });
        } else {
            setBmi(null);
            setStatus({ label: "", color: "" });
        }
    }, [weight, height]);

    const handleSave = async () => {
        if (!weight || !height) {
            alert("Ingresa tu peso y altura");
            return;
        }

        setIsLoading(true);
        try {
            await saveWeightEntry(parseFloat(weight), parseFloat(height), bmi || 0);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
            await loadHistory();
            setHeightLocked(true);
        } catch (error) {
            console.error("Error saving:", error);
            alert("Error al guardar");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Eliminar este registro?")) {
            await deleteWeightEntry(id);
            await loadHistory();
        }
    };

    const unlockHeight = () => {
        setHeightLocked(false);
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div style={{ padding: "20px", paddingBottom: "100px", maxWidth: "600px", margin: "0 auto" }}>

            {/* SUCCESS OVERLAY */}
            {showSuccess && (
                <div style={successOverlay}>
                    <div style={successCard}>
                        <div style={{ fontSize: "60px", marginBottom: "10px" }}>✅</div>
                        <h2 style={{ margin: "10px 0 5px", color: "#059669" }}>¡Guardado!</h2>
                        <p style={{ margin: 0, color: "#6B7280" }}>Tu peso ha sido registrado</p>
                    </div>
                </div>
            )}

            <header style={{ marginBottom: "30px", textAlign: "center" }}>
                <h2 style={{ fontSize: "24px", color: "#1F2937", margin: "0 0 10px" }}>⚖️ Control de Peso</h2>
                <p style={{ color: "#6B7280" }}>
                    Monitorea tu peso para mantener tu diabetes bajo control.
                </p>
            </header>

            {/* INPUT CARD */}
            <div style={card}>
                <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                    <div style={{ flex: 1 }}>
                        <label style={label}>Peso (kg)</label>
                        <input
                            type="number"
                            style={input}
                            placeholder="Ej: 75"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1, position: "relative" }}>
                        <label style={label}>
                            Altura (cm)
                            {heightLocked && (
                                <button
                                    onClick={unlockHeight}
                                    style={{
                                        marginLeft: "8px",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        color: "#6B7280"
                                    }}
                                >
                                    ✏️ editar
                                </button>
                            )}
                        </label>
                        <input
                            type="number"
                            style={{
                                ...input,
                                background: heightLocked ? "#E5E7EB" : "#F9FAFB",
                                color: heightLocked ? "#374151" : "#1F2937"
                            }}
                            placeholder="Ej: 175"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            readOnly={heightLocked}
                        />
                    </div>
                </div>

                {/* BMI Display */}
                {bmi && (
                    <div style={{
                        textAlign: "center",
                        padding: "15px",
                        background: `${status.color}20`,
                        borderRadius: "12px",
                        border: `1px solid ${status.color}`,
                        marginBottom: "15px"
                    }}>
                        <div style={{ fontSize: "32px", fontWeight: "bold", color: status.color }}>
                            {bmi.toFixed(1)}
                        </div>
                        <div style={{ fontWeight: "bold", color: status.color, fontSize: "18px" }}>
                            {status.label}
                        </div>
                        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#666" }}>
                            Índice de Masa Corporal (IMC)
                        </p>
                    </div>
                )}

                <button
                    style={{ ...btn, opacity: isLoading ? 0.7 : 1 }}
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? "⏳ Guardando..." : "💾 Guardar Peso"}
                </button>
            </div>

            {/* HISTORY */}
            <div style={{ marginTop: "30px" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "15px", color: "#374151" }}>
                    📊 Historial de Peso
                </h3>

                {history.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#9CA3AF", padding: "30px" }}>
                        <p style={{ fontSize: "40px", margin: 0 }}>📋</p>
                        <p>No tienes registros aún. ¡Registra tu primer peso!</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {history.slice(0, 10).map((entry, index) => (
                            <div key={entry.id} style={historyCard}>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <div style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "12px",
                                        background: index === 0 ? "#ECFDF5" : "#F3F4F6",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "bold",
                                        color: index === 0 ? "#059669" : "#6B7280"
                                    }}>
                                        {entry.weight}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "bold", color: "#374151" }}>
                                            {entry.weight} kg
                                            {index === 0 && (
                                                <span style={{
                                                    marginLeft: "8px",
                                                    padding: "2px 8px",
                                                    background: "#ECFDF5",
                                                    color: "#059669",
                                                    borderRadius: "10px",
                                                    fontSize: "11px"
                                                }}>
                                                    Último
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
                                            {formatDate(entry.date)} • IMC: {entry.bmi.toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(entry.id)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        opacity: 0.5
                                    }}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* TIPS */}
            <div style={{ marginTop: "30px", background: "#F3F4F6", padding: "20px", borderRadius: "16px" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "10px", color: "#374151" }}>💡 Consejos SaniBot</h3>
                <ul style={{ paddingLeft: "20px", color: "#4B5563", lineHeight: "1.6", margin: 0 }}>
                    <li>Un peso saludable ayuda a que la insulina funcione mejor.</li>
                    <li>Si tienes sobrepeso, perder solo el 5-10% puede hacer una gran diferencia.</li>
                    <li>Mide tu peso siempre a la misma hora, preferiblemente en la mañana.</li>
                </ul>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}

// Styles
const card: React.CSSProperties = {
    background: "white",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
};

const label: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#6B7280",
};

const input: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    fontSize: "16px",
    background: "#F9FAFB",
};

const btn: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    background: "#8B5CF6",
    color: "white",
    border: "none",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)"
};

const historyCard: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "white",
    padding: "12px 15px",
    borderRadius: "12px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.03)"
};

const successOverlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "fadeIn 0.3s ease-out"
};

const successCard: React.CSSProperties = {
    background: "white",
    padding: "40px 50px",
    borderRadius: "24px",
    textAlign: "center",
    boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
    animation: "fadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
};
