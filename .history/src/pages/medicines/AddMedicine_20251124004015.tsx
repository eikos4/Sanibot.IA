import { useState } from "react";
import { saveMedicine } from "../../services/medicineStorage";

export default function AddMedicine() {
  const [form, setForm] = useState({
    nombre: "",
    dosis: "",
    horario: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!form.nombre || !form.dosis || !form.horario) {
      alert("Completa todos los campos antes de guardar.");
      return;
    }

    if (typeof saveMedicine !== "function") {
      console.error("❌ saveMedicine no está definida en medicineStorage.js");
      alert("Error interno: función saveMedicine no encontrada.");
      return;
    }

    saveMedicine(form);
    alert("Medicamento guardado correctamente ✔");
    window.location.href = "/medicines";
  };

  return (
    <div style={container}>

      {/* SaniBot con fallback */}
      <div style={saniWrap}>
        <img
          src="/sanibot.png"
          alt="SaniBot"
          onError={(e) => {
            e.target.src = "/robot.png";   // fallback seguro ✔
          }}
          style={saniBot}
        />

        <div style={saniBubble}>
          ¡Hola! Soy SaniBot 💊<br />
          Registrar tus medicamentos te ayudará a recibir recordatorios y mantener tu tratamiento bajo control.
          <br /><br />
          👉 Ingresa el nombre, dosis y la hora.  
          <br />
          ¡Yo me encargo del resto!
        </div>
      </div>

      <h2 style={title}>Agregar Medicamento</h2>
      <p style={subtitle}>Completa esta información</p>

      {/* FORM */}
      <div style={card}>
        <label style={label}>Nombre del medicamento</label>
        <input
          style={input}
          name="nombre"
          placeholder="Ej: Metformina"
          onChange={handleChange}
        />

        <label style={label}>Dosis</label>
        <input
          style={input}
          name="dosis"
          placeholder="Ej: 500 mg"
          onChange={handleChange}
        />

        <label style={label}>Horario</label>
        <input
          type="time"
          style={input}
          name="horario"
          onChange={handleChange}
        />
      </div>

      <button style={btnSave} onClick={handleSave}>
        Guardar Medicamento
      </button>

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </div>
  );
}

/* ================= ESTILOS ================= */

const container = {
  padding: "20px",
  maxWidth: "480px",
  margin: "0 auto",
  textAlign: "center",
};

const saniWrap = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
};

const saniBot = {
  width: "75px",
  animation: "float 3s ease-in-out infinite",
};

const saniBubble = {
  background: "#E8F0FF",
  padding: "12px 15px",
  borderRadius: "14px",
  fontSize: "14px",
  border: "1px solid #C6D8FF",
  maxWidth: "280px",
  textAlign: "left",
};

const title = { fontSize: "26px", margin: "0 0 6px" };
const subtitle = { color: "#666", marginBottom: "20px" };

const card = {
  background: "#fff",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  marginBottom: "20px",
  textAlign: "left",
};

const label = {
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "4px",
  display: "block",
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  marginBottom: "12px",
  fontSize: "16px",
};

const btnSave = {
  width: "100%",
  padding: "15px",
  backgroundColor: "#1F4FFF",
  color: "white",
  fontSize: "18px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
};
