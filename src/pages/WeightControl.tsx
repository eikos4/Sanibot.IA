import { useState, useEffect } from "react";
import BMICalculator from "../components/BMICalculator";
import HealthTrendChart from "../components/HealthTrendChart";
import { getWeightHistory, type WeightEntry } from "../services/weightStorage";

export default function WeightControl() {
    const [history, setHistory] = useState<WeightEntry[]>([]);

    const loadHistory = async () => {
        const data = await getWeightHistory();
        setHistory(data);
    };

    useEffect(() => {
        loadHistory();

        const handleUpdate = () => loadHistory();
        window.addEventListener("weight-updated", handleUpdate);
        return () => window.removeEventListener("weight-updated", handleUpdate);
    }, []);

    return (
        <div style={{ padding: "20px", paddingBottom: "100px", maxWidth: "800px", margin: "0 auto" }}>
            <header style={{ marginBottom: "30px", textAlign: "center" }}>
                <h2 style={{ fontSize: "24px", color: "#1F2937", margin: "0 0 10px" }}>Control de Peso Corporal</h2>
                <p style={{ color: "#6B7280" }}>
                    Monitorea tu peso para mantener tu diabetes bajo control.
                </p>
            </header>

            {/* Gráfico de Evolución */}
            <div style={{ marginBottom: "20px" }}>
                <HealthTrendChart
                    title="Evolución de Peso"
                    data={history}
                    type="weight"
                    color="#8B5CF6" // Violeta
                />
            </div>

            {/* Reutilizamos el componente de calculadora */}
            <BMICalculator />

            <div style={{ marginTop: "30px", background: "#F3F4F6", padding: "20px", borderRadius: "16px" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#374151" }}>💡 Consejos SaniBot</h3>
                <ul style={{ paddingLeft: "20px", color: "#4B5563", lineHeight: "1.6" }}>
                    <li>Un peso saludable ayuda a que la insulina funcione mejor.</li>
                    <li>Si tienes sobrepeso, perder solo el 5-10% puede hacer una gran diferencia.</li>
                    <li>Mide tu peso siempre a la misma hora, preferiblemente en la mañana.</li>
                </ul>
            </div>
        </div>
    );
}
