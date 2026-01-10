export default function AdminAnalytics() {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Analítica General</h2>
      <p style={{ marginTop: "20px", color: "#666" }}>
        Módulo para gráficos y datos estadísticos.
      </p>

      <div style={chart}>
        <p>Usuarios: 120</p>
        <p>Pacientes activos: 35</p>
        <p>Alertas hoy: 3</p>
      </div>
    </div>
  );
}

const chart = {
  background: "#E8F0FF",
  padding: "20px",
  borderRadius: "12px",
  marginTop: "30px",
};
