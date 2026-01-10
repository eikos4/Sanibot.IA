import { useState } from "react";

export default function AddMedicine() {
  const [form, setForm] = useState({
    nombre: "",
    dosis: "",
    horario: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div style={container}>
      
      {/* TÍTULO */}
      <h2 style={title}>Agregar Medicamento</h2>
      <p style={desc}>
        Completa la información para añadir un nuevo medicamento a tu
        tratamiento diario.
      </p>

      {/* TARJETA DE FORMULARIO */}
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

      <button style={btnSave}>Guardar Medicamento</button>

      <style>
        {`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.015); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}

/* ================= ESTILOS ================= */

const container = {
  padding: "22px",
  maxWidth: "480px",
  margin: "0 auto",
  animation: "fadeInUp 0.6s ease",
};

const title = {
  textAlign: "center",
  fontSize: "28px",
  fontWeight: "700",
  marginBottom: "6px",
  color: "#1F1F1F",
};

const desc = {
  textAlign: "center",
  fontSize: "15px",
  color: "#555",
  marginBottom: "20px",
};

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  marginBottom: "20px",
};

const label = {
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "6px",
  display: "block",
  color: "#333",
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #cfcfcf",
  fontSize: "16px",
  marginBottom: "14px",
  transition: "all .2s ease",
  outline: "none",
};

input[":focus"] = {
  borderColor: "#1F4FFF",
  boxShadow: "0 0 0 3px rgba(31,79,255,0.15)",
};

const btnSave = {
  width: "100%",
  padding: "16px",
  backgroundColor: "#1F4FFF",
  color: "#fff",
  fontSize: "18px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  transition: "all .25s ease",
  fontWeight: "600",
  boxShadow: "0 6px 14px rgba(31,79,255,0.25)",
};

btnSave[":hover"] = {
  backgroundColor: "#1740d0",
  boxShadow: "0 8px 20px rgba(31,79,255,0.32)",
  transform: "translateY(-2px)",
};
