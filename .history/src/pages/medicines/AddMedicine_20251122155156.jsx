import { useState } from "react";
import { addMedicine } from "../../services/medicineStorage";

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
    addMedicine({
      id: Date.now(),
      ...form,
    });

    window.location.href = "/medicines";
  };

  return (
    <div style={container}>
      <h2>Agregar Medicina</h2>

      <input style={input} name="nombre" placeholder="Nombre" onChange={handleChange} />
      <input style={input} name="dosis" placeholder="Dosis (ej: 500mg)" onChange={handleChange} />
      <input style={input} name="horario" placeholder="Horario (ej: 08:00 AM)" onChange={handleChange} />

      <button style={btnSave} onClick={handleSave}>Guardar</button>
    </div>
  );
}

const container = { maxWidth: "450px", margin: "0 auto", padding: "20px" };
const input = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  marginTop: "10px",
  fontSize: "16px",
};
const btnSave = {
  width: "100%",
  padding: "15px",
  background: "#1F4FFF",
  color: "#fff",
  borderRadius: "12px",
  border: "none",
  fontSize: "18px",
  marginTop: "20px",
};
