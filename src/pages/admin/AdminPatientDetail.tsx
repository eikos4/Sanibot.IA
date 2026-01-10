export default function AdminPatientDetail() {
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Detalles del Paciente</h2>

      <div style={box}>
        <p><strong>Nombre:</strong> María González</p>
        <p><strong>Edad:</strong> 62 años</p>
        <p><strong>Diabetes:</strong> Tipo 2</p>
        <p><strong>Citas:</strong> 4 registradas</p>
      </div>

      <button style={btn}>Editar Paciente</button>
      <button style={{ ...btn, background: "#FF4444" }}>Eliminar Paciente</button>
    </div>
  );
}

const box = {
  background: "#F5F5F5",
  padding: "20px",
  borderRadius: "10px",
  marginTop: "20px",
};

const btn = {
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  border: "none",
  background: "#1F4FFF",
  color: "white",
  marginTop: "15px",
  fontSize: "18px",
};
