export default function CaretakerMessages() {
  const messages = [
    "María tuvo una glicemia alta hoy. Recomiendo revisar su alimentación.",
    "Recordatorio: María tiene consulta médica mañana a las 9:00 AM.",
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Mensajes de GlucoBot</h2>

      <div style={{ marginTop: "20px" }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              background: "#E8F0FF",
              borderLeft: "6px solid #1F4FFF",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "15px",
              textAlign: "left",
            }}
          >
            <p>{m}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
