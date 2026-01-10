import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMedicines, updateMedicine } from "../../services/medicineStorage";
import type { Medicine } from "../../services/medicineStorage";

export default function EditMedicine() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState<Medicine | null>(null);

  const [tempTime, setTempTime] = useState("");

  useEffect(() => {
    const meds = getMedicines();
    const med = meds.find((m) => m.id === Number(id));
    if (med) {
      // @ts-ignore (Soporte legado)
      if (!med.horarios && med.horario) {
        // @ts-ignore
        med.horarios = [med.horario];
      }
      setForm(med);
    }
  }, [id]);

  if (!form) return <p>Cargando...</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTime = () => {
    if (tempTime && form.horarios && !form.horarios.includes(tempTime)) {
      const newHorarios = [...form.horarios, tempTime].sort();
      setForm({ ...form, horarios: newHorarios });
      setTempTime("");
    } else if (tempTime && !form.horarios) {
      setForm({ ...form, horarios: [tempTime] });
      setTempTime("");
    }
  };

  const removeTime = (timeToRemove: string) => {
    if (form.horarios) {
      setForm({ ...form, horarios: form.horarios.filter(h => h !== timeToRemove) });
    }
  };

  const handleSave = () => {
    if (!form.horarios || form.horarios.length === 0) {
      alert("Debes tener al menos un horario");
      return;
    }
    updateMedicine(form.id, form);
    navigate("/medicines");
  };

  return (
    <div style={{ maxWidth: "450px", margin: "0 auto", padding: "20px" }}>
      <h2>Editar Medicina</h2>

      <input style={input} name="nombre" value={form.nombre} onChange={handleChange} />
      <input style={input} name="dosis" value={form.dosis} onChange={handleChange} />

      <div style={{ marginTop: "15px", marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Horarios de Toma</label>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="time"
            style={{ ...input, marginTop: 0 }}
            value={tempTime}
            onChange={(e) => setTempTime(e.target.value)}
          />
          <button
            onClick={addTime}
            style={{
              background: "#4CAF50", color: "white", border: "none",
              borderRadius: "10px", padding: "0 20px", cursor: "pointer", fontWeight: "bold"
            }}
          >
            +
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {form.horarios && form.horarios.map(h => (
            <div key={h} style={{ background: "#E3F2FD", color: "#1565C0", padding: "5px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "14px" }}>
              ⏰ {h}
              <span onClick={() => removeTime(h)} style={{ cursor: "pointer", color: "#Red" }}>×</span>
            </div>
          ))}
        </div>
      </div>

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
