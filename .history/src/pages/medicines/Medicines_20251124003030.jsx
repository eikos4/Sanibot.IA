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
    <div
      style={{
        padding: "20px",
        width: "100%",
        maxWidth: "450px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* 🩺 SaniBot Asistente */}
      <div style={saniBotContainer}>
        <img src="/robot.png" alt="SaniBot" style={saniBotImg} />
        <div style={saniBotBubble}>
          Aquí puedes agregar, editar o eliminar tus medicamentos 💊  
          ¡Yo te ayudaré a estar al día!
        </div>
      </div>

      <h2 style={{ textAlign: "center", marginTop: "120px" }}>
        💊 Mis Medicinas
      </h2>

      <button
        style={btnAdd}
        onClick={() => (window.location.href = "/medicines/add")}
      >
        ➕ Agregar Medicina
      </button>

      {meds.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
          Aún no tienes medicamentos registrados.
        </p>
      )}

      {meds.map((m) => (
        <div key={m.id} style={card}>
          <h3 style={{ margin: 0, color: "#1F1F1F" }}>{m.nombre}</h3>
          <p style={info}>Dosis: {m.dosis}</p>
          <p style={info}>Horario: {m.horario}</p>

          <div style={btnRow}>
            <button
              style={btnEdit}
              onClick={() =>
                (window.location.href = `/medicines/edit/${m.id}`)
              }
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

/* ---------------- ESTILOS ---------------- */

const saniBotContainer = {
  position: "absolute",
  top: "10px",
  left: "-10px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const saniBotImg = {
  width: "75px",
  animation: "float 3s infinite ease-in-out",
};

const saniBotBubble = {
  background: "#E8F0FF",
  padding: "12px 15px",
  borderRadius: "12px",
  fontSize: "14px",
  maxWidth: "240px",
  border: "1px solid #C6D8FF",
};

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
  padding: "18px",
  borderRadius: "14px",
  marginBottom: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const info = {
  color: "#555",
  fontSize: "14px",
  margin: "5px 0",
};

const btnRow = {
  display: "flex",
  gap: "12px",
  marginTop: "12px",
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

/* Animación flotante del robot */
const style = document.createElement("style");
style.innerHTML = `
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}`;
document.head.appendChild(style);
