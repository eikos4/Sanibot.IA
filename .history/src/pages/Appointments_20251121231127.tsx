export default function Appointments() {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Citas Médicas</h2>

      <p style={{ color: "#666" }}>
        Aquí podrás registrar tus consultas y recordatorios.
      </p>

      <button
        style={{
          width: "100%",
          padding: "15px",
          backgroundColor: "#1F4FFF",
          borderRadius: "12px",
          color: "white",
          border: "none",
          fontSize: "18px",
          marginTop: "20px",
        }}
      >
        ➕ Agregar cita
      </button>
    </div>
  );
}
