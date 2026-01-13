import { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { getWeightHistory, saveWeightEntry } from "../services/weightStorage";

export default function BMICalculator() {
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [bmi, setBmi] = useState<number | null>(null);
    const [status, setStatus] = useState({ label: "", color: "" });

    useEffect(() => {
        const loadLast = async () => {
            const history = await getWeightHistory();
            if (history.length > 0) {
                // history is stored in desc order per my query
                const last = history[0];
                setWeight(last.weight.toString());
                setHeight(last.height.toString());
                calculate(last.weight.toString(), last.height.toString());
            }
        };
        loadLast();
    }, []);

    const calculate = (wStr: string, hStr: string) => {
        const w = parseFloat(wStr);
        const h = parseFloat(hStr);

        if (w > 0 && h > 0) {
            const hMeters = h / 100;
            const value = w / (hMeters * hMeters);
            setBmi(value);

            if (value < 18.5) setStatus({ label: "Bajo Peso", color: "#FBBF24" }); // Amarillo
            else if (value < 25) setStatus({ label: "Peso Normal", color: "#10B981" }); // Verde
            else if (value < 30) setStatus({ label: "Sobrepeso", color: "#F97316" }); // Naranja
            else setStatus({ label: "Obesidad", color: "#EF4444" }); // Rojo
        } else {
            setBmi(null);
            setStatus({ label: "", color: "" });
        }
    };

    const handleSave = async () => {
        await saveWeightEntry(parseFloat(weight), parseFloat(height), bmi || 0);
        calculate(weight, height);
        if (bmi) {
            alert(`Datos guardados en historial. Tu IMC es ${bmi.toFixed(1)}`);
            window.dispatchEvent(new Event("weight-updated"));
        }
    };

    return (
        <div style={{ marginTop: "20px" }}>
            <h3 style={{ fontSize: "20px", marginBottom: "15px" }}>Control de Peso ⚖️</h3>
            <Card style={{ padding: "20px" }}>
                <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                    <div style={{ flex: 1 }}>
                        <label style={label}>Peso (kg)</label>
                        <input
                            type="number"
                            style={input}
                            placeholder="Ej: 75"
                            value={weight}
                            onChange={(e) => {
                                setWeight(e.target.value);
                                calculate(e.target.value, height);
                            }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={label}>Altura (cm)</label>
                        <input
                            type="number"
                            style={input}
                            placeholder="Ej: 175"
                            value={height}
                            onChange={(e) => {
                                setHeight(e.target.value);
                                calculate(weight, e.target.value);
                            }}
                        />
                    </div>
                </div>

                {bmi && (
                    <div style={{
                        textAlign: "center",
                        padding: "15px",
                        background: `${status.color}20`,
                        borderRadius: "12px",
                        border: `1px solid ${status.color}`
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

                <button style={btn} onClick={handleSave}>
                    Actualizar Datos
                </button>
            </Card>
        </div>
    );
}

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
    marginTop: "15px",
    padding: "12px",
    borderRadius: "10px",
    background: "#1F2937",
    color: "white",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
};
