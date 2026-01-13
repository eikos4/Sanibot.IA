import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAppointment } from "../../services/appointmentStorage";

export default function AddAppointment() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    doctor: "",
    fecha: "",
    hora: "",
    motivo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.doctor || !form.fecha) {
      alert("Por favor completa el doctor y la fecha");
      return;
    }
    await saveAppointment(form);
    alert("Cita agendada correctamente");
    navigate("/appointments");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", fontSize: "26px", color: "#111827", marginBottom: "5px" }}>Nueva Cita</h2>
      <p style={{ textAlign: "center", color: "#6B7280", marginBottom: "25px", fontSize: "15px" }}>
        Registra tu próxima visita médica.
      </p>

      <div style={card}>
        {/* DOCTOR */}
        <div style={inputGroup}>
          <label style={label}>👨‍⚕️ Doctor / Especialidad</label>
          <input
            style={input}
            name="doctor"
            placeholder="Ej: Cardiólogo"
            onChange={handleChange}
          />
        </div>

        <div style={{ display: "flex", gap: "15px" }}>
          {/* FECHA */}
          <div style={{ flex: 1, ...inputGroup }}>
            <label style={label}>📅 Fecha</label>
            <input
              style={input}
              type="date"
              name="fecha"
              onChange={handleChange}
            />
          </div>
          {/* HORA */}
          <div style={{ flex: 1, ...inputGroup }}>
            <label style={label}>⏰ Hora</label>
            <input
              style={input}
              type="time"
              name="hora"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* MOTIVO */}
        <div style={inputGroup}>
          <label style={label}>📝 Notas / Motivo</label>
          <textarea
            style={{ ...input, height: "100px", resize: "none", fontFamily: "inherit" }}
            name="motivo"
            placeholder="Ej: Revisión de resultados..."
            onChange={handleChange}
          />
        </div>
      </div>

      <button style={btn} onClick={handleSubmit}>Guardar Cita</button>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "white",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  animation: "fadeInUp 0.5s ease"
};

const inputGroup: React.CSSProperties = {
  marginBottom: "20px"
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: "700",
  marginBottom: "8px",
  color: "#374151"
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "2px solid #F3F4F6",
  fontSize: "16px",
  background: "#F9FAFB",
  outline: "none",
  transition: "border 0.2s, background 0.2s"
};

const btn: React.CSSProperties = {
  width: "100%",
  padding: "18px",
  borderRadius: "16px",
  background: "linear-gradient(135deg, #1F4FFF 0%, #3B82F6 100%)",
  color: "white",
  border: "none",
  marginTop: "25px",
  fontSize: "18px",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(31, 79, 255, 0.25)",
  transition: "transform 0.2s"
};
