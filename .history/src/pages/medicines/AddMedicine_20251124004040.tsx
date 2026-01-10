import { useState } from "react";

export default function AddMedicine() {
  const [form, setForm] = useState({
    nombre: "",
    dosis: "",
    horario: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Agregar Medicamento</h2>

      <input
        style={input}
        name="nombre"
        placeholder="Nombre del medicamento"
        onChange={handleChange}
      />

      <input
        style={input}
        name="dosis"
        placeholder="Dosis"
        onChange={handleChange}
      />

      <input
        type="time"
        style={input}
        name="horario"
        onChange={handleChange}
      />

      <button style={btnSave}>Guardar</button>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ccc",
  borderRadius: "10px",
  marginTop: "10px",
};

const btnSave = {
  width: "100%",
  padding: "15px",
  backgroundColor: "#1F4FFF",
  color: "white",
  fontSize: "18px",
  borderRadius: "12px",
  marginTop: "20px",
  border: "none",
};
