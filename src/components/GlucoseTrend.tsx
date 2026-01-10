import { Card } from "./ui/Card";

interface GlucoseRecord {
    valor: number;
    fecha: string;
}

interface GlucoseTrendProps {
    data: GlucoseRecord[];
}

export default function GlucoseTrend({ data }: GlucoseTrendProps) {
    if (!data || data.length < 2) {
        return (
            <Card style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "150px" }}>
                <p style={{ color: "#9CA3AF" }}>Insuficientes datos para mostrar tendencia</p>
            </Card>
        );
    }

    // Configuration
    const width = 300;
    const height = 100;
    const padding = 10;

    // Normalize data for chart
    const values = data.slice(-7).map(d => Number(d.valor)); // Last 7 readings
    const max = Math.max(...values, 180); // Ensure at least 180 top range
    const min = Math.min(...values, 70);  // Ensure at least 70 bottom range
    const range = max - min || 1;

    // Calculate generic points
    const points = values.map((val, i) => {
        const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((val - min) / range) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(" ");

    const lastValue = values[values.length - 1];
    const isHigh = lastValue > 140; // Simple threshold

    return (
        <Card style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", color: "#6B7280" }}>Tendencia Reciente</h3>
                <span style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: isHigh ? "#EF4444" : "#10B981"
                }}>
                    {lastValue} <span style={{ fontSize: "14px", fontWeight: "normal" }}>mg/dL</span>
                </span>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
                <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
                    {/* Background ranges (optional visually) */}
                    <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5" />

                    {/* Trend Line */}
                    <polyline
                        points={points}
                        fill="none"
                        stroke={isHigh ? "#EF4444" : "#10B981"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Dots */}
                    {values.map((val, i) => {
                        const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
                        const y = height - padding - ((val - min) / range) * (height - 2 * padding);
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="white"
                                stroke={isHigh ? "#EF4444" : "#10B981"}
                                strokeWidth="2"
                            />
                        );
                    })}
                </svg>
            </div>

            <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#9CA3AF", textAlign: "center" }}>
                Últimos {values.length} registros
            </p>
        </Card>
    );
}
