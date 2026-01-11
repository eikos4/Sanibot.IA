import { Card } from "./ui/Card";



interface HealthTrendChartProps {
    title: string;
    data: any[]; // Raw data from storage
    type: 'glucose' | 'pressure' | 'weight';
    color?: string;
}

export default function HealthTrendChart({ title, data, type, color = "#10B981" }: HealthTrendChartProps) {
    if (!data || data.length < 2) {
        return (
            <Card style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "180px" }}>
                <h3 style={{ margin: "0 0 10px", fontSize: "16px", color: "#6B7280" }}>{title}</h3>
                <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Necesitas más datos para ver la tendencia.</p>
            </Card>
        );
    }

    // Configuración SVG
    const width = 300;
    const height = 120;
    const padding = 15;

    // Procesar datos (últimos 7)
    // Para weight, si no hay 'date', usamos orden de llegada
    const recentData = data.slice(-7);

    // Calcular rangos Y dinámicos
    let allValues: number[] = [];
    if (type === 'glucose') {
        allValues = recentData.map(d => Number(d.valor));
    } else if (type === 'pressure') {
        allValues = recentData.flatMap(d => [Number(d.sistolica), Number(d.diastolica)]);
    } else if (type === 'weight') {
        allValues = recentData.map(d => Number(d.weight));
    }

    const minVal = Math.min(...allValues) * 0.9;
    const maxVal = Math.max(...allValues) * 1.1;
    const range = maxVal - minVal || 1;

    // Función auxiliar de coordenadas
    const getCoord = (val: number, index: number) => {
        const x = padding + (index / (recentData.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
        return { x, y };
    };

    // Generar paths
    let path1 = ""; // Glucosa o Sistólica o Peso
    let path2 = ""; // Diastólica

    if (type === 'glucose') {
        path1 = recentData.map((d, i) => {
            const { x, y } = getCoord(Number(d.valor), i);
            return `${x},${y}`;
        }).join(" ");
    } else if (type === 'weight') {
        path1 = recentData.map((d, i) => {
            const { x, y } = getCoord(Number(d.weight), i);
            return `${x},${y}`;
        }).join(" ");
    } else {
        path1 = recentData.map((d, i) => {
            const { x, y } = getCoord(Number(d.sistolica), i);
            return `${x},${y}`;
        }).join(" ");

        path2 = recentData.map((d, i) => {
            const { x, y } = getCoord(Number(d.diastolica), i);
            return `${x},${y}`;
        }).join(" ");
    }

    // Ultimo valor para destacar
    const lastItem = recentData[recentData.length - 1];

    let displayValue = "";
    let isAlert = false;

    if (type === 'glucose') {
        displayValue = `${lastItem.valor} mg/dL`;
        isAlert = (Number(lastItem.valor) > 180 || Number(lastItem.valor) < 70);
    } else if (type === 'pressure') {
        displayValue = `${lastItem.sistolica}/${lastItem.diastolica}`;
        isAlert = (Number(lastItem.sistolica) > 140 || Number(lastItem.diastolica) > 90);
    } else if (type === 'weight') {
        displayValue = `${lastItem.weight} kg`;
        // Alerta simple si BMI > 30 o < 18.5 (si tuvieramos BMI aqui). 
        // Como solo pasamos weight, no alertamos o usamos logica simple.
        // Asumamos que no hay alerta roja por ahora en el grafico mini.
        isAlert = false;
    }

    const mainColor = isAlert ? "#EF4444" : color;

    return (
        <Card style={{ padding: "20px", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", color: "#6B7280", fontWeight: "600" }}>{title}</h3>
                <span style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: mainColor,
                    background: isAlert ? "#FEF2F2" : "#ECFDF5",
                    padding: "4px 10px",
                    borderRadius: "12px"
                }}>
                    {displayValue}
                </span>
            </div>

            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
                {/* Grid Lines */}
                <line x1="0" y1={padding} x2={width} y2={padding} stroke="#F3F4F6" strokeWidth="1" />
                <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#F3F4F6" strokeWidth="1" />
                <line x1="0" y1={height - padding} x2={width} y2={height - padding} stroke="#F3F4F6" strokeWidth="1" />

                {/* Path 1 (Glucose or Systolic) */}
                <polyline
                    points={path1}
                    fill="none"
                    stroke={mainColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Path 2 (Diastolic only) */}
                {type === 'pressure' && (
                    <polyline
                        points={path2}
                        fill="none"
                        stroke="#60A5FA" // Azul para diastólica
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="4,4"
                    />
                )}

                {/* Dots Logic - Solo puntos finales para limpieza visual */}
                {recentData.map((d, i) => {
                    // Solo dibujar glucosa o sistólica dots
                    let val = 0;
                    if (type === 'glucose') val = Number(d.valor);
                    else if (type === 'weight') val = Number(d.weight);
                    else val = Number(d.sistolica);

                    const { x, y } = getCoord(val, i);
                    return <circle key={'p1' + i} cx={x} cy={y} r="3" fill="white" stroke={mainColor} strokeWidth="2" />
                })}

                {type === 'pressure' && recentData.map((d, i) => {
                    const val = Number(d.diastolica);
                    const { x, y } = getCoord(val, i);
                    return <circle key={'p2' + i} cx={x} cy={y} r="3" fill="white" stroke="#60A5FA" strokeWidth="2" />
                })}

            </svg>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px", fontSize: "10px", color: "#9CA3AF" }}>
                <span>Hace 7 registros</span>
                <span>Hoy</span>
            </div>
        </Card>
    );
}
