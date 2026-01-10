export default function Medicines() {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Mis Medicamentos</h2>

      <button
        style={{
          ...btnAdd,
          marginBottom: "20px",
        }}
        onClick={() => (window.location.href = "/medicines/add")}
      >
        ➕ Agregar medicamento
      </button>

      <p style={{ color: "#666" }}>
        Aún no tienes medicamentos registrados.
      </p>
    </div>
  );
}

const btnAdd = {
  width: "100%",
  padding: "13px",
  borderRadius: "12px",
  backgroundColor: "#3B82F6",
  color: "white",
  border: "none",
  fontSize: "16px",
};
const btnMedicine = {
  width: "100%",
  padding: "15px",      