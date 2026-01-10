export default function AdminDashboard() {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Panel de Administración</h2>
      <p style={{ color: "#666", marginBottom: "25px" }}>
        Bienvenido, administrador.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <button style={btn} onClick={() => (window.location.href = "/admin/users")}>
          👥 Usuarios
        </button>

        <button style={btn} onClick={() => (window.location.href = "/admin/patients")}>
          🧑‍⚕️ Pacientes
        </button>

        <button style={btn} onClick={() => (window.location.href = "/admin/caregivers")}>
          👨‍👩‍👧‍👦 Cuidadores
        </button>

        <button style={btn} onClick={() => (window.location.href = "/admin/analytics")}>
          📊 Analítica
        </button>

        <button style={btn} onClick={() => (window.location.href = "/admin/logs")}>
          📝 Logs
        </button>

        <button style={btn} onClick={() => (window.location.href = "/admin/config")}>
          ⚙️ Configuración
        </button>
      </div>
    </div>
  );
}

const btn = {
  width: "100%",
  padding: "15px",
  background: "#1F4FFF",
  borderRadius: "12px",
  border: "none",
  color: "white",
  fontSize: "18px",
  cursor: "pointer",
};
