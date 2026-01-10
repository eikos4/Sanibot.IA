import { useEffect, useState } from "react";
import { getMedicines, deleteMedicine } from "../../services/medicineStorage";

export default function Medicines() {
  const [meds, setMeds] = useState([]);

  useEffect(() => {
    setMeds(getMedicines());
  }, []);

  const handleDelete = (id) => {
    deleteMedicine(id);
    setMeds(getMedicines());
  };

  return (
    <div style={{ padding: "20px", maxWidth: "450px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>💊 Mis Medicinas</h2>

      <button
        style={btnAdd}
        onClick={() => (window.location.href = "/medicines/add")}
      >
        ➕ Agregar Medicina
      </button>

      {meds.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
          No tienes medicamentos registrados.
        </p>
      )}

      {meds.map((m) => (
        <div key={m.id} style={card}>
          <h3>{m.nombre}</h3>
          <p>Dosis: {m.dosis}</p>
          <p>Horario: {m.horario}</p>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              style={btnEdit}
              onClick={() => (window.location.href = `/medicines/edit/${m.id}`)}
            >
              Editar
            </button>

            <button style={btnDelete} onClick={() => handleDelete(m.id)}>
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const btnAdd = {
  width: "100%",
  padding: "15px",
  background: "#1F4FFF",
  color: "#fff",
  borderRadius: "12px",
  border: "none",
  fontSize: "16px",
  marginBottom: "20px",
};

const card = {
  background: "#fff",
  border: "1px solid #ddd",
  padding: "15px",
  borderRadius: "12px",
  marginBottom: "15px",
};

const btnEdit = {
  flex: 1,
  padding: "10px",
  background: "#4CAF50",
  color: "white",
  borderRadius: "8px",
  border: "none",
};

const btnDelete = {
  flex: 1,
  padding: "10px",
  background: "#FF5252",
  color: "white",
  borderRadius: "8px",
  border: "none",
};
