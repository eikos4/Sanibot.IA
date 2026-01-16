import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAppointment } from "../../services/appointmentStorage";

// Common specialty types
const SPECIALTIES = [
  { emoji: "🩺", name: "Médico General" },
  { emoji: "💉", name: "Diabetólogo" },
  { emoji: "❤️", name: "Cardiólogo" },
  { emoji: "🦶", name: "Podólogo" },
  { emoji: "👁️", name: "Oftalmólogo" },
  { emoji: "🦷", name: "Dentista" },
  { emoji: "🧠", name: "Neurólogo" },
  { emoji: "🔬", name: "Laboratorio" },
  { emoji: "📋", name: "Otro" }
];

export default function AddAppointment() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    doctor: "",
    especialidad: "",
    lugar: "",
    fecha: "",
    hora: "",
    motivo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectSpecialty = (name: string) => {
    setForm({ ...form, especialidad: name, doctor: name });
  };

  const handleSubmit = async () => {
    if (!form.doctor || !form.fecha) {
      alert("Por favor completa el doctor/especialidad y la fecha");
      return;
    }

    setIsLoading(true);

    try {
      await saveAppointment(form);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/appointments");
      }, 2000);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error al guardar. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="add-appointment-container">

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="success-icon">📅</div>
            <h2>¡Cita Agendada!</h2>
            <p>Te recordaremos antes de tu cita</p>
          </div>
        </div>
      )}

      <h2 className="page-title">📅 Nueva Cita</h2>
      <p className="page-subtitle">Registra tu próxima visita médica.</p>

      <div className="form-card">
        {/* SPECIALTY QUICK SELECT */}
        <div className="input-group">
          <label className="label">🏥 Tipo de Cita</label>
          <div className="specialty-grid">
            {SPECIALTIES.map(spec => (
              <button
                key={spec.name}
                type="button"
                onClick={() => selectSpecialty(spec.name)}
                className={`specialty-btn ${form.especialidad === spec.name ? 'active' : ''}`}
              >
                <span className="specialty-emoji">{spec.emoji}</span>
                <span className="specialty-name">{spec.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DOCTOR NAME */}
        <div className="input-group">
          <label className="label">👨‍⚕️ Nombre del Doctor (opcional)</label>
          <input
            className="input"
            name="doctor"
            placeholder="Ej: Dr. García"
            value={form.doctor}
            onChange={handleChange}
          />
        </div>

        {/* LUGAR */}
        <div className="input-group">
          <label className="label">📍 Lugar / Clínica</label>
          <input
            className="input"
            name="lugar"
            placeholder="Ej: Hospital San José"
            value={form.lugar}
            onChange={handleChange}
          />
        </div>

        {/* FECHA Y HORA */}
        <div className="date-time-row">
          <div className="input-group">
            <label className="label">📅 Fecha</label>
            <input
              className="input"
              type="date"
              name="fecha"
              min={today}
              value={form.fecha}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label className="label">⏰ Hora</label>
            <input
              className="input"
              type="time"
              name="hora"
              value={form.hora}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* MOTIVO */}
        <div className="input-group">
          <label className="label">📝 Notas / Motivo</label>
          <textarea
            className="input textarea"
            name="motivo"
            placeholder="Ej: Revisión de resultados, control mensual..."
            value={form.motivo}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="button-row">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/appointments")}
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? "⏳ Guardando..." : "💾 Guardar Cita"}
        </button>
      </div>

      <style>{`
                .add-appointment-container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 16px;
                    padding-bottom: 100px;
                    box-sizing: border-box;
                }

                .page-title {
                    text-align: center;
                    font-size: clamp(22px, 5vw, 28px);
                    color: #111827;
                    margin-bottom: 5px;
                }

                .page-subtitle {
                    text-align: center;
                    color: #6B7280;
                    margin-bottom: 20px;
                    font-size: clamp(14px, 3.5vw, 16px);
                }

                .form-card {
                    background: white;
                    padding: clamp(16px, 4vw, 25px);
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.04);
                }

                .input-group {
                    margin-bottom: 18px;
                }

                .label {
                    display: block;
                    font-size: 14px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: #374151;
                }

                .input {
                    width: 100%;
                    padding: clamp(12px, 3vw, 14px);
                    border-radius: 12px;
                    border: 2px solid #F3F4F6;
                    font-size: 16px;
                    background: #F9FAFB;
                    outline: none;
                    transition: border 0.2s, background 0.2s;
                    box-sizing: border-box;
                }

                .input:focus {
                    border-color: #1F4FFF;
                    background: white;
                }

                .textarea {
                    height: 80px;
                    resize: none;
                    font-family: inherit;
                }

                .specialty-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 8px;
                }

                @media (max-width: 400px) {
                    .specialty-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                .specialty-btn {
                    padding: 10px 8px;
                    border-radius: 12px;
                    border: 2px solid #F3F4F6;
                    background: #F9FAFB;
                    color: #4B5563;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s;
                }

                .specialty-btn.active {
                    background: #1F4FFF;
                    color: white;
                    border-color: #1F4FFF;
                }

                .specialty-emoji {
                    font-size: 20px;
                }

                .specialty-name {
                    font-size: 11px;
                    text-align: center;
                    line-height: 1.2;
                }

                .date-time-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                @media (max-width: 360px) {
                    .date-time-row {
                        grid-template-columns: 1fr;
                    }
                }

                .button-row {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                }

                @media (max-width: 400px) {
                    .button-row {
                        flex-direction: column-reverse;
                    }
                }

                .btn {
                    flex: 1;
                    padding: clamp(14px, 3.5vw, 16px);
                    border-radius: 14px;
                    border: none;
                    font-size: clamp(14px, 3.5vw, 16px);
                    font-weight: bold;
                    cursor: pointer;
                    transition: transform 0.2s, opacity 0.2s;
                }

                .btn:disabled {
                    cursor: not-allowed;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #1F4FFF 0%, #3B82F6 100%);
                    color: white;
                    box-shadow: 0 6px 15px rgba(31, 79, 255, 0.25);
                }

                .btn-secondary {
                    background: #F3F4F6;
                    color: #374151;
                }

                .success-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                    animation: fadeIn 0.3s ease-out;
                }

                .success-card {
                    background: white;
                    padding: clamp(30px, 8vw, 50px);
                    border-radius: 24px;
                    text-align: center;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.2);
                    animation: fadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    max-width: 300px;
                    width: 100%;
                }

                .success-icon {
                    font-size: clamp(50px, 12vw, 70px);
                    margin-bottom: 10px;
                }

                .success-card h2 {
                    margin: 10px 0 5px;
                    color: #1F4FFF;
                    font-size: clamp(18px, 5vw, 22px);
                }

                .success-card p {
                    margin: 0;
                    color: #6B7280;
                    font-size: clamp(13px, 3.5vw, 15px);
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
    </div>
  );
}
