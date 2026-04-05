import { useState, useEffect } from "react";
import { Card } from "./ui/Card";

// Obtener clave diaria: "hydration_YYYY-MM-DD"
const getTodayKey = () => `hydration_${new Date().toDateString()}`;

export default function HydrationWidget() {
    const totalGlasses = 8;
    const [count, setCount] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem(getTodayKey());
        if (saved) {
            setCount(parseInt(saved, 10));
        }
    }, []);

    const toggleGlass = (index: number) => {
        // Lógica de llenado progresivo:
        // Si clickeo el vaso 3, se llenan 1, 2 y 3.
        // Si clickeo uno lleno, se vacían desde ese hacia adelante.

        let newCount = count;
        if (index < count) {
            // Click en uno lleno -> Reducir hasta este
            newCount = index; // Si clickeo el 3ro (index 2), bajo a 2. Corrección: Si clickeo el 3ro lleno (índice 2), quiero quedarme con 2? O con 3?
            // UX Standard: Click en el último lleno -> lo vacía. Click en uno intermedio -> reduce hasta ahí.
            // Simplificación: Click en el vaso N: Si está vacío -> Set count to N+1. Si está lleno y es el último -> Set count to N.

            // Nueva lógica simple: Click en vaso I (0-7):
            // Si I+1 == count (es el último lleno), entonces restamos 1.
            // Si I+1 > count (está vacío), entonces sumamos hasta I+1.
            // Si I+1 < count (está lleno pero hay más adelante), bajamos a I+1.

            if (index + 1 === count) {
                newCount = index;
            } else {
                newCount = index + 1;
            }

        } else {
            // Click en uno vacío -> Llenar hasta este
            newCount = index + 1;
        }

        setCount(newCount);
        localStorage.setItem(getTodayKey(), newCount.toString());

        // Feedback vibración si es móvil
        if (navigator.vibrate) navigator.vibrate(50);
    };

    return (
        <Card style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }}>💧</span>
                    <h3 style={{ margin: 0, color: "#374151" }}>Hidratación</h3>
                </div>
                <div style={{ fontSize: "14px", color: count >= totalGlasses ? "#10B981" : "#6B7280", fontWeight: "bold" }}>
                    {count}/{totalGlasses} vasos
                </div>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "15px",
                justifyItems: "center"
            }}>
                {Array.from({ length: totalGlasses }).map((_, i) => {
                    const isFull = i < count;
                    return (
                        <button
                            key={i}
                            onClick={() => toggleGlass(i)}
                            style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                transform: isFull ? "scale(1.1)" : "scale(1)",
                                opacity: isFull ? 1 : 0.4,
                                padding: "5px"
                            }}
                        >
                            <svg
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill={isFull ? "#3B82F6" : "none"}
                                stroke={isFull ? "#2563EB" : "#9CA3AF"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                            </svg>
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: "15px", height: "20px", fontSize: "14px", color: "#10B981", fontWeight: "bold" }}>
                {count >= totalGlasses && "¡Objetivo cumplido! 🎉"}
                {count > 0 && count < totalGlasses && "¡Sigue así!"}
            </div>
        </Card>
    );
}
