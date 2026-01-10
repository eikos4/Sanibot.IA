import { useState } from "react";

export default function AddAppointment() {
  const [form, setForm] = useState({
    doctor: "",
    fecha: "",
    motivo: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Agregar Cita</h2>

      <input
        style={input}
        name="doctor"
        placeholder="Nombre del doctor"
        onChange={handleChange}
      />

      <input
        style={input}
        type="date"
        name="fecha"
        onChange={handleChange}
      />

      <textarea
        style={{
          ...input,
          height: "120px",
        }}
        name="motivo"
        placeholder="Motivo de la consulta"
        onChange={handleChange}
      />

      <button style={btn}>Guardar</button>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  marginTop: "10px",
};

const btn = {
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  background: "#1F4FFF",
  color: "white",
  border: "none",
  marginTop: "20px",
  fontSize: "18px",
};
