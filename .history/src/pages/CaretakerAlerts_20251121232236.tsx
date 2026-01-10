export default function CaretakerAlerts() {
  const alerts = [
    "Glicemia alta registrada a las 8:32",
    "Medicamento no tomado a las 14:00",
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Alertas del Paciente</h2>

      {alerts.length === 0 ? (
        <p style={{ color: "#666", marginTop: "20px" }}>No hay alertas.</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {alerts.map((a, i) => (
            <div
              key={i}
              style={{
                background: "#FFE5E5",
                borderLeft: "6px solid #FF4444",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "15px",
                textAlign: "left",
              }}
            >
              <p style={{ margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
