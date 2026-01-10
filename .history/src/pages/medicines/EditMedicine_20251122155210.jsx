import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMedicines, updateMedicine } from "../../services/medicineStorage";

export default function EditMedicine() {
  const { id } = useParams();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const meds = getMedicines();
    const med = meds.find((m) => m.id === Number(id));
    setForm(med);
  }, [id]);

  if (!form) return <p>Cargando...</p>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateMedicine(form.id, form);
    window.location.href = "/medicines";
  };

  return (
    <div style={{ maxWidth: "450px", margin: "0 auto", padding: "20px" }}>
      <h2>Editar Medicina</h2>

      <input style={input} name="nombre" value={form.nombre} onChange={handleChange} />
      <input style={input} name="dosis" value={form.dosis} onChange={handleChange} />
      <input style={input} name="horario" value={form.horario} onChange={handleChange} />

      <button style={btn} onClick={handleSave}>Guardar Cambios</button>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  marginTop: "10px",
  fontSize: "16px",
};

const btn = {
  width: "100%",
  padding: "15px",
  background: "#1F4FFF",
  color: "white",
  border: "none",
  borderRadius: "12px",
  marginTop: "20px",
  fontSize: "18px",
};
