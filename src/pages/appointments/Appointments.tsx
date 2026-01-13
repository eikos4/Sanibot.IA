import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAppointments, deleteAppointment } from "../../services/appointmentStorage";
import type { Appointment } from "../../services/appointmentStorage";

export default function Appointments() {
  const navigate = useNavigate();
  const [list, setList] = useState<Appointment[]>([]);

  const load = async () => {
    const data = await getAppointments();
    setList(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar esta cita?")) {
      await deleteAppointment(id);
      load();
    }
  };

  return (
    <div style={{ textAlign: "center", paddingBottom: "100px", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#1F1F1F", margin: 0 }}>
          📅 Agenda
        </h2>
        <button
          onClick={() => navigate("/appointments/add")}
          style={{
            background: "#1F4FFF",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "10px 16px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 10px rgba(31, 79, 255, 0.2)"
          }}
        >
          ➕ Nueva
        </button>
      </div>

      {list.length === 0 ? (
        <div style={{ marginTop: "60px", color: "#666", animation: "fadeInUp 0.5s ease" }}>
          <div style={{ fontSize: "60px", marginBottom: "15px", opacity: 0.5 }}>📭</div>
          <p style={{ fontSize: "18px" }}>No tienes citas próximas.</p>
          <p style={{ fontSize: "14px", opacity: 0.7 }}>¡Tómate un descanso!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px", marginTop: "10px" }}>
          {list.map(app => {
            const dateObj = new Date(app.fecha);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString('es-ES', { month: 'short' }).toUpperCase();

            return (
              <div key={app.id} style={card}>
                {/* FECHA LATERAL */}
                <div style={dateBox}>
                  <span style={{ fontSize: "14px", fontWeight: "bold", opacity: 0.8 }}>{month}</span>
                  <span style={{ fontSize: "24px", fontWeight: "900", color: "#1F4FFF" }}>{day}</span>
                </div>

                {/* INFO CENTRAL */}
                <div style={{ flex: 1, paddingLeft: "15px", textAlign: "left", borderLeft: "2px solid #F3F4F6" }}>
                  <h4 style={{ margin: "0 0 4px", fontSize: "17px", color: "#111827", fontWeight: "700" }}>{app.doctor}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4B5563", fontSize: "14px" }}>
                    <span>⏰ {app.hora}</span>
                  </div>
                  {app.motivo && <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#6B7280", fontStyle: "italic" }}>"{app.motivo}"</p>}
                </div>

                {/* ACCIONES */}
                <button style={deleteBtn} onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }}>
                  🗑️
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}

const card: React.CSSProperties = {
  background: "white",
  padding: "16px",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  display: "flex",
  alignItems: "center",
  position: "relative",
  transition: "transform 0.2s ease",
  animation: "fadeInUp 0.4s ease-out"
};

const dateBox: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  paddingRight: "15px",
  minWidth: "50px"
};

const deleteBtn: React.CSSProperties = {
  background: "#FEF2F2",
  border: "none",
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: "10px",
  transition: "background 0.2s"
};

// Agregar estilos globales de animación si no existen
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleSheet);
