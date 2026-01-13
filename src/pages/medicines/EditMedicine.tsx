import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { subscribeToMedicines, updateMedicine } from "../../services/medicineStorage";
import type { Medicine } from "../../services/medicineStorage";

export default function EditMedicine() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estado local similar a AddMedicine
  const [form, setForm] = useState<{
    nombre: string;
    dosis: string;
    duration: 'chronic' | 'temporary';
    endDate: string;
  } | null>(null);

  const [horarios, setHorarios] = useState<string[]>([]);
  const [tempTime, setTempTime] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    // Subscribe to find the medicine
    // Note: In a larger app, we would fetch a single doc.
    const unsubscribe = subscribeToMedicines((meds) => {
      const med = meds.find((m) => m.id === id); // id is string now
      if (med) {
        setForm({
          nombre: med.nombre,
          dosis: med.dosis,
          duration: med.duration || 'chronic',
          endDate: med.endDate || ''
        });
        setHorarios(med.horarios || []);
        setLoading(false);
      } else if (!loading) { // Only redirect if we finished loading and didn't find it
        // Wait a bit or handle not found
      }
    });
    return () => unsubscribe();
  }, [id]);

  if (loading || !form) return <div style={{ padding: "20px", textAlign: "center" }}>Cargando...</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTime = () => {
    if (tempTime && !horarios.includes(tempTime)) {
      setHorarios([...horarios, tempTime].sort());
      setTempTime("");
    }
  };

  const removeTime = (timeToRemove: string) => {
    setHorarios(horarios.filter(h => h !== timeToRemove));
  };

  // --- LOGICA DE PRESETS (Igual que AddMedicine) ---
  const applyPreset = (times: string[]) => {
    setHorarios(times.sort());
  };

  const handleSave = async () => {
    if (!form!.nombre || !form!.dosis || horarios.length === 0) {
      alert("Por favor completa nombre, dosis y agrega al menos un horario.");
      return;
    }

    const updatedMed: Partial<Medicine> = {
      nombre: form!.nombre,
      dosis: form!.dosis,
      horarios: horarios,
      duration: form!.duration,
      endDate: form!.endDate
    };

    if (id) {
      await updateMedicine(id, updatedMed);
      navigate("/medicines");
    }
  };

  return (
    <div style={container}>
      <h2 style={title}>Editar Medicamento</h2>

      <div style={card}>
        <label style={label}>Nombre</label>
        <input
          className="custom-input"
          name="nombre"
          value={form.nombre}
          placeholder="Ej: Metformina"
          onChange={handleChange}
        />

        <label style={label}>Dosis</label>
        <input
          className="custom-input"
          name="dosis"
          value={form.dosis}
          placeholder="Ej: 500 mg"
          onChange={handleChange}
        />
        {/* Helper Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
          {[
            "1 Pastilla", "1/2 Pastilla", "2 Pastillas", "10 ml", "1 Inyección"
          ].map(dose => (
            <button
              key={dose}
              style={{
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: "20px",
                padding: "4px 10px",
                fontSize: "12px",
                color: "#4B5563",
                cursor: "pointer",
                fontWeight: "600"
              }}
              onClick={() => setForm({ ...form, dosis: dose })}
            >
              {dose}
            </button>
          ))}
        </div>

        {/* --- FRECUENCIA INTELIGENTE --- */}
        <label style={label}>Frecuencia (Presets)</label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "15px" }}>
          <button style={presetBtn} onClick={() => applyPreset(["08:00"])}>1 vez al día</button>
          <button style={presetBtn} onClick={() => applyPreset(["08:00", "20:00"])}>2 veces</button>
          <button style={presetBtn} onClick={() => applyPreset(["08:00", "14:00", "20:00"])}>3 veces</button>
          <button style={presetBtn} onClick={() => applyPreset(["08:00", "16:00", "00:00"])}>Cada 8h</button>
        </div>

        <label style={label}>Horarios Específicos</label>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="time"
            className="custom-input"
            style={{ marginBottom: 0 }}
            value={tempTime}
            onChange={(e) => setTempTime(e.target.value)}
          />
          <button
            onClick={addTime}
            style={{
              background: "#1F4FFF", color: "white", border: "none",
              borderRadius: "10px", padding: "0 20px", cursor: "pointer", fontWeight: "bold", fontSize: "20px"
            }}
          >
            +
          </button>
        </div>

        {/* LISTA DE HORARIOS */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px", minHeight: "30px" }}>
          {horarios.map(h => (
            <div key={h} style={pillStyle}>
              ⏰ {h}
              <span onClick={() => removeTime(h)} style={{ cursor: "pointer", color: "#EF4444", marginLeft: "6px", fontWeight: "bold" }}>×</span>
            </div>
          ))}
          {horarios.length === 0 && <span style={{ fontSize: "13px", color: "#999", fontStyle: "italic" }}>Selecciona una frecuencia o agrega hora manual.</span>}
        </div>


        <div style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
          <label style={label}>Duración</label>
          <div style={{ display: "flex", gap: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "14px" }}>
              <input
                type="radio"
                name="duration"
                value="chronic"
                checked={form.duration === 'chronic'}
                onChange={handleChange}
              />
              Permanente
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "14px" }}>
              <input
                type="radio"
                name="duration"
                value="temporary"
                checked={form.duration === 'temporary'}
                onChange={handleChange}
              />
              Temporal
            </label>
          </div>
        </div>

        {form.duration === 'temporary' && (
          <div style={{ marginTop: "15px", animation: "fadeIn 0.3s ease" }}>
            <label style={label}>Fecha de Término</label>
            <input
              type="date"
              className="custom-input"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
            />
          </div>
        )}
      </div>

      <button className="btn-save" onClick={handleSave}>Guardar Cambios</button>

      <style>
        {`
          .custom-input {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #E5E7EB;
            font-size: 16px;
            margin-bottom: 14px;
            outline: none;
            transition: border 0.2s;
          }
          .custom-input:focus {
            border-color: #1F4FFF;
            box-shadow: 0 0 0 3px rgba(31, 79, 255, 0.1);
          }
          .btn-save {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #1F4FFF 0%, #1740D0 100%);
            color: #fff;
            font-size: 16px;
            border-radius: 14px;
            border: none;
            cursor: pointer;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(31, 79, 255, 0.3);
            transition: transform 0.1s;
          }
          .btn-save:active {
            transform: scale(0.98);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

const container: React.CSSProperties = {
  padding: "20px",
  maxWidth: "480px",
  margin: "0 auto",
  paddingBottom: "80px"
};

const title: React.CSSProperties = {
  textAlign: "center",
  fontSize: "22px",
  fontWeight: "800",
  marginBottom: "20px",
  color: "#1F2937",
};

const card: React.CSSProperties = {
  background: "white",
  padding: "24px",
  borderRadius: "20px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
  marginBottom: "20px",
};

const label: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "700",
  marginBottom: "6px",
  display: "block",
  color: "#4B5563",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const presetBtn: React.CSSProperties = {
  background: "#EFF6FF",
  color: "#1D4ED8",
  border: "1px solid #BFDBFE",
  borderRadius: "8px",
  padding: "6px 12px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  flex: "1 0 auto" // Grow to fill
};

const pillStyle: React.CSSProperties = {
  background: "#F3F4F6",
  color: "#374151",
  padding: "6px 12px",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  fontWeight: "600",
  fontSize: "14px",
  border: "1px solid #E5E7EB"
};
