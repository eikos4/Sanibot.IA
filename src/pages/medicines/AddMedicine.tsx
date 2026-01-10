import { useState } from "react";
import { addMedicine } from "../../services/medicineStorage";
import type { Medicine } from "../../services/medicineStorage";

export default function AddMedicine() {
  const [form, setForm] = useState({
    nombre: "",
    dosis: "",
    duration: "chronic",
    endDate: ""
  });

  const [horarios, setHorarios] = useState<string[]>([]);
  const [tempTime, setTempTime] = useState("");

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

  const handleSave = () => {
    if (!form.nombre || !form.dosis || horarios.length === 0) {
      alert("Por favor completa nombre, dosis y agrega al menos un horario.");
      return;
    }

    // @ts-ignore
    const newMed: Medicine = {
      id: Date.now(),
      nombre: form.nombre,
      dosis: form.dosis,
      horarios: horarios,
      // @ts-ignore
      duration: form.duration,
      endDate: form.endDate
    };

    // @ts-ignore
    addMedicine(newMed); // Asumiendo que addMedicine ya se importa o se corregirá el import
    // Nota: Necesitamos importar addMedicine y Medicine correctamente o usar props si fuera el caso, 
    // pero aquí parece que falta el import en el archivo original o se usa globalmente.
    // Revisando el archivo original, no veo imports de servicio. Agregaré imports si faltan.

    alert("Medicamento guardado");
    window.location.href = "/medicines"; // Simple redirect
  };

  return (
    <div style={container}>

      {/* TÍTULO */}
      <h2 style={title}>Agregar Medicamento</h2>
      <p style={desc}>
        Configura las dosis y horarios de tu tratamiento.
      </p>

      {/* TARJETA DE FORMULARIO */}
      <div style={card}>
        <label style={label}>Nombre del medicamento</label>
        <input
          className="custom-input"
          name="nombre"
          placeholder="Ej: Metformina"
          onChange={handleChange}
        />

        <label style={label}>Dosis</label>
        <input
          className="custom-input"
          name="dosis"
          placeholder="Ej: 500 mg"
          onChange={handleChange}
        />

        <label style={label}>Horarios de Toma</label>
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
              background: "#4CAF50", color: "white", border: "none",
              borderRadius: "10px", padding: "0 20px", cursor: "pointer", fontWeight: "bold"
            }}
          >
            +
          </button>
        </div>

        {/* Lista de horarios agregados */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
          {horarios.map(h => (
            <div key={h} style={{ background: "#E3F2FD", color: "#1565C0", padding: "5px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "14px" }}>
              ⏰ {h}
              <span onClick={() => removeTime(h)} style={{ cursor: "pointer", color: "#Red" }}>×</span>
            </div>
          ))}
          {horarios.length === 0 && <span style={{ fontSize: "13px", color: "#999" }}>No has agregado horarios aún.</span>}
        </div>


        <div style={{ marginTop: "15px", marginBottom: "15px" }}>
          <label style={label}>Duración del Tratamiento</label>
          <div style={{ display: "flex", gap: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input
                type="radio"
                name="duration"
                value="chronic"
                defaultChecked
                onChange={handleChange}
              />
              Permanente (Crónico)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input
                type="radio"
                name="duration"
                value="temporary"
                onChange={handleChange}
              />
              Temporal
            </label>
          </div>
        </div>

        {/* @ts-ignore */}
        {form.duration === 'temporary' && (
          <div style={{ animation: "fadeInUp 0.3s ease" }}>
            <label style={label}>Fecha de Término</label>
            <input
              type="date"
              className="custom-input"
              name="endDate"
              onChange={handleChange}
            />
          </div>
        )}
      </div>

      <button className="btn-save" onClick={handleSave}>Guardar Medicamento</button>

      <style>
        {`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          
          .custom-input {
            width: 100%;
            padding: 14px;
            border-radius: 10px;
            border: 1px solid #cfcfcf;
            font-size: 16px;
            margin-bottom: 14px;
            transition: all .2s ease;
            outline: none;
          }

          .custom-input:focus {
            border-color: #1F4FFF;
            box-shadow: 0 0 0 3px rgba(31,79,255,0.15);
          }

          .btn-save {
            width: 100%;
            padding: 16px;
            background-color: #1F4FFF;
            color: #fff;
            font-size: 18px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            transition: all .25s ease;
            font-weight: 600;
            box-shadow: 0 6px 14px rgba(31,79,255,0.25);
          }

          .btn-save:hover {
            background-color: #1740d0;
            box-shadow: 0 8px 20px rgba(31,79,255,0.32);
            transform: translateY(-2px);
          }
        `}
      </style>
    </div>
  );
}

/* ================= ESTILOS ================= */

const container: React.CSSProperties = {
  padding: "22px",
  maxWidth: "480px",
  margin: "0 auto",
  animation: "fadeInUp 0.6s ease",
};

const title: React.CSSProperties = {
  textAlign: "center",
  fontSize: "28px",
  fontWeight: "700",
  marginBottom: "6px",
  color: "#1F1F1F",
};

const desc: React.CSSProperties = {
  textAlign: "center",
  fontSize: "15px",
  color: "#555",
  marginBottom: "20px",
};

const card: React.CSSProperties = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  marginBottom: "20px",
};

const label: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "6px",
  display: "block",
  color: "#333",
};

