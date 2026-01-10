export default function Appointments() {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Citas Médicas</h2>

      <button
        style={{
          width: "100%",
          padding: "15px",
          borderRadius: "12px",
          background: "#1F4FFF",
          color: "white",
          border: "none",
          marginTop: "20px",
          fontSize: "18px",
        }}
        onClick={() => (window.location.href = "/appointments/add")}
      >
        ➕ Agregar Cita
      </button>

      <p style={{ marginTop: "20px", color: "#666" }}>
        Aún no tienes citas registradas.
      </p>
    </div>
  );
}
