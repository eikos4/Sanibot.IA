export default function GlucoseHistory() {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Historial de Glicemia</h2>
      <p style={{ color: "#666" }}>Aquí verás tus registros diarios.</p>

      <div
        style={{
          background: "#F5F5F5",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "20px",
        }}
      >
        <p>No hay registros aún.</p>
      </div>
    </div>
  );
}
