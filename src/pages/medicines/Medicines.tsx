import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMedicines, deleteMedicine } from "../../services/medicineStorage";
import type { Medicine } from "../../services/medicineStorage";

export default function Medicines() {
  const navigate = useNavigate();
  const [meds, setMeds] = useState<Medicine[]>([]);

  useEffect(() => {
    setMeds(getMedicines());
  }, []);

  const handleDelete = (id: number) => {
    deleteMedicine(id);
    setMeds(getMedicines());
  };

  return (
    <div
      style={{
        padding: "20px",
        width: "100%",
        maxWidth: "450px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <h2 style={{ textAlign: "center", marginTop: "20px" }}>
        💊 Mis Medicinas
      </h2>

      <button
        style={btnAdd}
        onClick={() => navigate("/medicines/add")}
      >
        ➕ Agregar Medicina
      </button>

      {meds.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
          Aún no tienes medicamentos registrados.
        </p>
      )}

      {meds.map((m) => {
        // @ts-ignore (Soporte legado)
        const horariosList = m.horarios || (m.horario ? [m.horario] : []);
        const isLate = horariosList.some((h: string) => isOverdue(h));

        return (
          <div key={m.id} style={{ ...card, borderLeft: isLate ? "5px solid #FF5252" : "5px solid #4CAF50" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h3 style={{ margin: 0, color: "#1F1F1F" }}>{m.nombre}</h3>
              {isLate && <span style={badgeOverdue}>⚠ Atrasado</span>}
            </div>
            <p style={info}>Dosis: {m.dosis}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', margin: '5px 0' }}>
              {/* Retrocompatibilidad: si existe 'horario' antiguo mostrarlo, si no usar 'horarios' */}
              {/* @ts-ignore */}
              {m.horario ? <span style={timeBadge}>⏰ {m.horario}</span> :
                m.horarios && m.horarios.map(h => (
                  <span key={h} style={timeBadge}>⏰ {h}</span>
                ))
              }
            </div>
            {m.duration === 'temporary' && m.endDate && (
              <p style={{ ...info, color: "#F59E0B", fontWeight: "bold" }}>
                ⏳ Termina: {m.endDate}
              </p>
            )}
            {m.duration === 'chronic' && (
              <p style={{ ...info, color: "#10B981" }}>
                ♾️ Tratamiento Permanente
              </p>
            )}

            <div style={btnRow}>
              <button
                style={btnEdit}
                onClick={() => navigate(`/medicines/edit/${m.id}`)}
              >
                Editar
              </button>

              <button style={btnDelete} onClick={() => handleDelete(m.id)}>
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- ESTILOS ---------------- */



const btnAdd = {
  width: "100%",
  padding: "15px",
  background: "#1F4FFF",
  color: "#fff",
  borderRadius: "12px",
  border: "none",
  fontSize: "16px",
  marginBottom: "20px",
};

const card = {
  background: "#fff",
  padding: "18px",
  borderRadius: "14px",
  marginBottom: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const info = {
  color: "#555",
  fontSize: "14px",
  margin: "5px 0",
};

const btnRow = {
  display: "flex",
  gap: "12px",
  marginTop: "12px",
};

const btnEdit = {
  flex: 1,
  padding: "10px",
  background: "#4CAF50",
  color: "white",
  borderRadius: "8px",
  border: "none",
};

const btnDelete = {
  flex: 1,
  padding: "10px",
  background: "#FF5252",
  color: "white",
  borderRadius: "8px",
  border: "none",
};

/* Helper para verificar atraso (> 30 mins) */
/* Helper para verificar atraso (> 30 mins) */
function isOverdue(timeStr: string) {
  if (!timeStr) return false;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const medTime = new Date();
  medTime.setHours(hours, minutes, 0, 0);

  // Diferencia en minutos
  const diff = (now.getTime() - medTime.getTime()) / (1000 * 60);
  // Si ya pasó la hora y hay más de 30 mins de diferencia
  return diff > 30;
}

const badgeOverdue = {
  background: "#FFEBEE",
  color: "#D32F2F",
  fontSize: "12px",
  padding: "4px 8px",
  borderRadius: "12px",
  fontWeight: "bold",
  border: "1px solid #FFCDD2"
};

const timeBadge = {
  background: "#EDF2F7",
  color: "#2D3748",
  padding: "2px 8px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "600",
  border: "1px solid #E2E8F0"
};
