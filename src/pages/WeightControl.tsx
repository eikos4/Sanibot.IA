import BMICalculator from "../components/BMICalculator";

export default function WeightControl() {
    return (
        <div style={{ padding: "20px", paddingBottom: "100px", maxWidth: "800px", margin: "0 auto" }}>
            <header style={{ marginBottom: "30px", textAlign: "center" }}>
                <h2 style={{ fontSize: "24px", color: "#1F2937", margin: "0 0 10px" }}>Control de Peso Corporal</h2>
                <p style={{ color: "#6B7280" }}>
                    Monitorea tu peso para mantener tu diabetes bajo control.
                </p>
            </header>

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
