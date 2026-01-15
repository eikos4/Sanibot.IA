import { useState } from "react";
import SimulatedCall from "../components/SimulatedCall";

export default function TestCalls() {
    const [callActive, setCallActive] = useState(false);
    const [callMessage, setCallMessage] = useState("");
    const [callerName, setCallerName] = useState("SaniBot");

    const triggerCall = (type: string) => {
        switch (type) {
            case "medicine":
                setCallerName("Enfermera Virtual");
                setCallMessage("Hola. Es hora de tu medicamento: Metformina 850mg. Recuerda tomar tu pastilla con un vaso de agua.");
                break;
            case "insulin":
                setCallerName("SaniBot - Insulina");
                setCallMessage("Atención. Es hora de tu insulina: Lantus. Debes administrarte 20 unidades antes de cenar.");
                break;
            case "diet":
                setCallerName("Nutricionista Virtual");
                setCallMessage("Hola. Es hora de tu almuerzo: Ensalada con proteína y carbohidratos complejos. ¡Buen provecho!");
                break;
            case "hydration":
                setCallerName("SaniBot");
                setCallMessage("¡Hola! He notado que has bebido poca agua hoy. Tu cuerpo necesita hidratarse. Por favor, ve a buscar un vaso de agua ahora.");
                break;
            case "glucose":
                setCallerName("SaniBot - Glucosa");
                setCallMessage("Hola. Recuerda medir tu glucosa ahora. Es importante mantener un registro constante para darte mejores recomendaciones.");
                break;
            case "welcome":
                setCallerName("GlucoBot");
                setCallMessage("¡Hola! Soy GlucoBot, tu asistente de salud personal. Estaré aquí para ayudarte a controlar tu diabetes. Te recordaré tus medicamentos y estaré disponible cuando me necesites.");
                break;
            default:
                setCallerName("SaniBot");
                setCallMessage("Esta es una llamada de prueba del sistema.");
        }

        setCallActive(true);
    };

    const addTestMedicine = () => {
        const meds = JSON.parse(localStorage.getItem("glucobot_medicines") || "[]");
        const now = new Date();
        const testTime = `${now.getHours().toString().padStart(2, '0')}:${(now.getMinutes() + 1).toString().padStart(2, '0')}`;

        meds.push({
            id: Date.now().toString(),
            nombre: "Metformina 850mg",
            dosis: "1 pastilla",
            horarios: [testTime],
            duration: "chronic"
        });

        localStorage.setItem("glucobot_medicines", JSON.stringify(meds));
        alert(`Medicamento agregado para las ${testTime}. En 1 minuto deberías recibir la llamada automática.`);
    };

    return (
        <div style={container}>
            {callActive && (
                <SimulatedCall
                    userName={callerName}
                    message={callMessage}
                    onEndCall={() => setCallActive(false)}
                />
            )}

            <h1 style={title}>🧪 Probar Llamadas</h1>
            <p style={subtitle}>Prueba todos los tipos de llamadas del sistema</p>

            <div style={grid}>
                <button onClick={() => triggerCall("welcome")} style={{ ...btn, background: "#7C3AED" }}>
                    👋 Bienvenida
                </button>
                <button onClick={() => triggerCall("medicine")} style={{ ...btn, background: "#3B82F6" }}>
                    💊 Medicamento
                </button>
                <button onClick={() => triggerCall("insulin")} style={{ ...btn, background: "#F59E0B" }}>
                    💉 Insulina
                </button>
                <button onClick={() => triggerCall("diet")} style={{ ...btn, background: "#10B981" }}>
                    🍽️ Dieta
                </button>
                <button onClick={() => triggerCall("hydration")} style={{ ...btn, background: "#06B6D4" }}>
                    💧 Hidratación
                </button>
                <button onClick={() => triggerCall("glucose")} style={{ ...btn, background: "#EF4444" }}>
                    🩸 Glucosa
                </button>
            </div>

            <hr style={{ margin: "30px 0", border: "none", borderTop: "1px solid #E5E7EB" }} />

            <h2 style={{ fontSize: "18px", marginBottom: "15px" }}>⏰ Probar Automatización</h2>
            <button onClick={addTestMedicine} style={{ ...btn, background: "#1F2937", width: "100%" }}>
                Agregar Medicamento de Prueba (En 1 min)
            </button>
            <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "10px", textAlign: "center" }}>
                Esto agregará un medicamento programado para dentro de 1 minuto.
                La llamada debería activarse automáticamente.
            </p>
        </div>
    );
}

const container: React.CSSProperties = {
    padding: "40px 20px",
    maxWidth: "500px",
    margin: "0 auto"
};

const title: React.CSSProperties = {
    fontSize: "28px",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "5px"
};

const subtitle: React.CSSProperties = {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: "30px"
};

const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
};

const btn: React.CSSProperties = {
    padding: "16px",
    borderRadius: "12px",
    color: "white",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
};
