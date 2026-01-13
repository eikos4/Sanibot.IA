import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeToMedicines, deleteMedicine } from "../../services/medicineStorage";
import type { Medicine } from "../../services/medicineStorage";

export default function Medicines() {
  const navigate = useNavigate();
  const [meds, setMeds] = useState<Medicine[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToMedicines((data) => {
      setMeds(data);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este medicamento?")) {
      await deleteMedicine(id);
      // No need to refresh, subscription handles it
    }
  };

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#1F1F1F", margin: 0 }}>
          💊 Mis Medicinas
        </h2>
        <button
          style={btnAddStyle}
          onClick={() => navigate("/medicines/add")}
        >
          + Nuevo
        </button>
      </div>

      {meds.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🩹</div>
          <p style={{ color: "#666", fontSize: "16px" }}>Aún no has agregado medicamentos.</p>
          <p style={{ color: "#999", fontSize: "14px" }}>Toca "+ Nuevo" para empezar.</p>
        </div>
      ) : (
        <div style={listStyle}>
          {meds.map((m) => {
            // @ts-ignore
            const horariosList = m.horarios || (m.horario ? [m.horario] : []);
            const isLate = horariosList.some((h: string) => isOverdue(h));

            return (
              <div key={m.id} style={{ ...cardStyle, borderLeft: isLate ? "4px solid #EF4444" : "4px solid #10B981" }}>

                {/* Header Card: Name & Type */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "8px" }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: "18px", fontWeight: "700", color: "#1F2937" }}>{m.nombre}</span>
                    <span style={{ fontSize: "13px", color: "#6B7280" }}>{m.dosis}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {m.duration === 'chronic' && (
                      <span style={badgeChronic}>♾️ Crónico</span>
                    )}
                    {isLate && <span style={badgeOverdue}>⚠️ Atrasado</span>}
                  </div>
                </div>

                {/* Schedule */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: "12px" }}>
                  {horariosList.map((h: string) => (
                    <div key={h} style={timePillStyle}>
                      🕒 {h}
                    </div>
                  ))}
                </div>

                {/* Footer: Date & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #F3F4F6" }}>
                  {m.duration === 'temporary' && m.endDate ? (
                    <span style={{ fontSize: "12px", color: "#F59E0B", fontWeight: "600" }}>⏳ Hasta: {m.endDate}</span>
                  ) : <span></span>}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate(`/medicines/edit/${m.id}`)} style={actionIconStyle}>
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(m.id)} style={{ ...actionIconStyle, color: "#EF4444", background: "#FEF2F2" }}>
                      🗑️
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- UTILS ---
function isOverdue(timeStr: string) {
  if (!timeStr) return false;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const medTime = new Date();
  medTime.setHours(hours, minutes, 0, 0);
  const diff = (now.getTime() - medTime.getTime()) / (1000 * 60);
  return diff > 30; // 30 mins late
}

// --- STYLES ---
const containerStyle: React.CSSProperties = {
  padding: "20px",
  maxWidth: "500px",
  margin: "0 auto",
  paddingBottom: "100px" // Space for bottom nav/fab
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px"
};

const btnAddStyle: React.CSSProperties = {
  background: "#1F4FFF",
  color: "white",
  padding: "8px 16px",
  borderRadius: "20px",
  border: "none",
  fontWeight: "600",
  fontSize: "14px",
  boxShadow: "0 4px 10px rgba(31, 79, 255, 0.3)",
  cursor: "pointer"
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "40px 20px",
  background: "#F9FAFB",
  borderRadius: "20px",
  border: "2px dashed #E5E7EB",
  marginTop: "20px"
};

const listStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: "16px",
  padding: "16px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
  transition: "transform 0.2s ease",
};

const badgeChronic: React.CSSProperties = {
  background: "#ECFDF5",
  color: "#059669",
  fontSize: "10px",
  padding: "2px 8px",
  borderRadius: "10px",
  fontWeight: "700",
  textTransform: "uppercase",
  height: "fit-content"
};

const badgeOverdue: React.CSSProperties = {
  background: "#FEF2F2",
  color: "#DC2626",
  fontSize: "10px",
  padding: "2px 8px",
  borderRadius: "10px",
  fontWeight: "700",
  textTransform: "uppercase",
  height: "fit-content"
};

const timePillStyle: React.CSSProperties = {
  background: "#EFF6FF",
  color: "#3B82F6",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "4px"
};

const actionIconStyle: React.CSSProperties = {
  background: "#F3F4F6",
  border: "none",
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  cursor: "pointer",
  transition: "background 0.2s"
};
