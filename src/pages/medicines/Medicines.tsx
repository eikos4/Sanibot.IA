import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeToMedicines, deleteMedicine } from "../../services/medicineStorage";
import type { Medicine } from "../../services/medicineStorage";

export default function Medicines() {
  const navigate = useNavigate();
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "taken">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMedicines((data) => setMeds(data));
    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMedicine(deleteId);
      setDeleteId(null);
    }
  };

  const getNextDose = (horarios: string[]) => {
    if (!horarios?.length) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    for (const h of horarios.sort()) {
      const [hours, minutes] = h.split(':').map(Number);
      const medMinutes = hours * 60 + minutes;
      if (medMinutes > currentMinutes) {
        const diff = medMinutes - currentMinutes;
        if (diff <= 60) return { time: h, label: `en ${diff} min`, soon: true };
        return { time: h, label: h, soon: false };
      }
    }
    return { time: horarios[0], label: "mañana", soon: false };
  };

  const filteredMeds = meds.filter(m => {
    if (filter === "all") return true;
    const horariosList = m.horarios || (m.horario ? [m.horario] : []);
    const isLate = horariosList.some((h: string) => isOverdue(h));
    if (filter === "pending") return isLate;
    return !isLate;
  });

  const stats = {
    total: meds.length,
    pending: meds.filter(m => {
      const horariosList = m.horarios || (m.horario ? [m.horario] : []);
      return horariosList.some((h: string) => isOverdue(h));
    }).length,
    chronic: meds.filter(m => m.duration === "chronic").length
  };

  return (
    <div className="med-container">
      {/* Background */}
      <div className="med-bg" />
      <div className="med-orb med-orb-1" />
      <div className="med-orb med-orb-2" />

      {/* Header */}
      <header className="med-header fade-in">
        <div className="med-header-content">
          <div className="med-icon-wrap">
            <span className="med-icon">💊</span>
            <div className="med-icon-pulse" />
          </div>
          <div>
            <h1 className="med-title">Mis Medicamentos</h1>
            <p className="med-subtitle">Gestiona tu tratamiento diario</p>
          </div>
        </div>
        <button className="med-add-btn" onClick={() => navigate("/medicines/add")}>
          <span>+</span>
          <span className="med-add-text">Agregar</span>
        </button>
      </header>

      {/* Stats */}
      <div className="med-stats slide-up">
        <div className="med-stat">
          <span className="med-stat-value">{stats.total}</span>
          <span className="med-stat-label">Total</span>
        </div>
        <div className="med-stat-divider" />
        <div className="med-stat">
          <span className="med-stat-value" style={{ color: stats.pending > 0 ? "#EF4444" : "#10B981" }}>{stats.pending}</span>
          <span className="med-stat-label">Pendientes</span>
        </div>
        <div className="med-stat-divider" />
        <div className="med-stat">
          <span className="med-stat-value" style={{ color: "#8B5CF6" }}>{stats.chronic}</span>
          <span className="med-stat-label">Crónicos</span>
        </div>
      </div>

      {/* Filters */}
      <div className="med-filters slide-up-delay-1">
        {(["all", "pending", "taken"] as const).map(f => (
          <button key={f} className={`med-filter ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "Todos" : f === "pending" ? "⚠️ Pendientes" : "✅ Tomados"}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredMeds.length === 0 ? (
        <div className="med-empty slide-up-delay-2">
          <div className="med-empty-icon">
            {filter === "all" ? "💊" : filter === "pending" ? "✅" : "📋"}
          </div>
          <h3>{filter === "all" ? "Sin medicamentos" : filter === "pending" ? "¡Todo al día!" : "Sin medicamentos tomados"}</h3>
          <p>{filter === "all" ? "Agrega tu primer medicamento" : "No tienes medicamentos pendientes"}</p>
          {filter === "all" && (
            <button className="med-empty-btn" onClick={() => navigate("/medicines/add")}>
              + Agregar medicamento
            </button>
          )}
        </div>
      ) : (
        <div className="med-list">
          {filteredMeds.map((m, i) => {
            const horariosList = m.horarios || (m.horario ? [m.horario] : []);
            const isLate = horariosList.some((h: string) => isOverdue(h));
            const nextDose = getNextDose(horariosList);

            return (
              <div key={m.id} className={`med-card slide-up-delay-${Math.min(i + 2, 5)}`} style={{ "--card-accent": isLate ? "#EF4444" : "#10B981" } as React.CSSProperties}>
                <div className="med-card-indicator" />
                
                <div className="med-card-header">
                  <div className="med-card-info">
                    <h3 className="med-card-name">{m.nombre}</h3>
                    <span className="med-card-dose">{m.dosis}</span>
                  </div>
                  <div className="med-card-badges">
                    {m.duration === "chronic" && <span className="med-badge chronic">♾️ Crónico</span>}
                    {isLate && <span className="med-badge late">⚠️ Atrasado</span>}
                  </div>
                </div>

                <div className="med-card-schedule">
                  {horariosList.map((h: string) => {
                    const isPast = isOverdue(h);
                    return (
                      <div key={h} className={`med-time ${isPast ? "past" : ""} ${nextDose?.time === h ? "next" : ""}`}>
                        <span className="med-time-icon">{isPast ? "⏰" : "🕐"}</span>
                        <span>{h}</span>
                        {nextDose?.time === h && nextDose.soon && (
                          <span className="med-time-soon">{nextDose.label}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="med-card-footer">
                  <div className="med-card-meta">
                    {m.duration === "temporary" && m.endDate && (
                      <span className="med-end-date">📅 Hasta {m.endDate}</span>
                    )}
                    {m.frecuencia && <span className="med-freq">{m.frecuencia}</span>}
                  </div>
                  <div className="med-card-actions">
                    <button className="med-action edit" onClick={() => navigate(`/medicines/edit/${m.id}`)}>
                      ✏️
                    </button>
                    <button className="med-action delete" onClick={() => setDeleteId(m.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="med-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="med-modal" onClick={e => e.stopPropagation()}>
            <div className="med-modal-icon">🗑️</div>
            <h3>¿Eliminar medicamento?</h3>
            <p>Esta acción no se puede deshacer</p>
            <div className="med-modal-actions">
              <button className="med-modal-btn cancel" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="med-modal-btn confirm" onClick={handleDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="med-fab" onClick={() => navigate("/medicines/add")}>
        <span>+</span>
      </button>

      <style>{`
        .med-container {
          min-height: 100vh;
          padding: 20px;
          padding-bottom: 100px;
          position: relative;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .med-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #FDF2F8 100%);
          z-index: -2;
        }

        .med-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          z-index: -1;
          animation: orbFloat 15s ease-in-out infinite;
        }

        .med-orb-1 {
          width: 250px;
          height: 250px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          top: -80px;
          right: -80px;
        }

        .med-orb-2 {
          width: 180px;
          height: 180px;
          background: linear-gradient(135deg, #EC4899, #F472B6);
          bottom: 10%;
          left: -60px;
          animation-delay: -7s;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }

        /* Header */
        .med-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 20px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        .med-header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .med-icon-wrap {
          position: relative;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(99,102,241,0.3);
        }

        .med-icon {
          font-size: 28px;
          filter: grayscale(1) brightness(10);
        }

        .med-icon-pulse {
          position: absolute;
          inset: -4px;
          border: 2px solid rgba(99,102,241,0.3);
          border-radius: 22px;
          animation: pulse 2s ease-out infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        .med-title {
          font-size: 22px;
          font-weight: 800;
          color: #1F2937;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .med-subtitle {
          font-size: 13px;
          color: #6B7280;
          margin: 4px 0 0;
        }

        .med-add-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(99,102,241,0.3);
          transition: all 0.3s ease;
        }

        .med-add-btn:active {
          transform: scale(0.95);
        }

        .med-add-btn span:first-child {
          font-size: 18px;
        }

        /* Stats */
        .med-stats {
          display: flex;
          justify-content: space-around;
          align-items: center;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .med-stat {
          text-align: center;
        }

        .med-stat-value {
          display: block;
          font-size: 28px;
          font-weight: 800;
          color: #1F2937;
        }

        .med-stat-label {
          font-size: 12px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .med-stat-divider {
          width: 1px;
          height: 40px;
          background: #E5E7EB;
        }

        /* Filters */
        .med-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .med-filter {
          flex-shrink: 0;
          padding: 10px 18px;
          border-radius: 12px;
          border: none;
          background: rgba(255,255,255,0.8);
          color: #6B7280;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .med-filter.active {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }

        /* Empty State */
        .med-empty {
          text-align: center;
          padding: 60px 30px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 2px dashed rgba(99,102,241,0.2);
        }

        .med-empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .med-empty h3 {
          font-size: 20px;
          color: #1F2937;
          margin: 0 0 8px;
        }

        .med-empty p {
          color: #6B7280;
          margin: 0 0 24px;
        }

        .med-empty-btn {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(99,102,241,0.3);
        }

        /* Cards */
        .med-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .med-card {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
        }

        .med-card:active {
          transform: scale(0.98);
        }

        .med-card-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--card-accent);
          border-radius: 4px 0 0 4px;
        }

        .med-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .med-card-name {
          font-size: 18px;
          font-weight: 700;
          color: #1F2937;
          margin: 0;
        }

        .med-card-dose {
          font-size: 13px;
          color: #6B7280;
          margin-top: 2px;
          display: block;
        }

        .med-card-badges {
          display: flex;
          gap: 6px;
        }

        .med-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .med-badge.chronic {
          background: #ECFDF5;
          color: #059669;
        }

        .med-badge.late {
          background: #FEF2F2;
          color: #DC2626;
          animation: shake 0.5s ease-in-out infinite;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }

        .med-card-schedule {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }

        .med-time {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #EFF6FF;
          color: #3B82F6;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .med-time.past {
          background: #FEF2F2;
          color: #EF4444;
        }

        .med-time.next {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }

        .med-time-icon {
          font-size: 14px;
        }

        .med-time-soon {
          font-size: 11px;
          opacity: 0.8;
          margin-left: 4px;
        }

        .med-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          border-top: 1px solid #F3F4F6;
        }

        .med-card-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .med-end-date {
          font-size: 12px;
          color: #F59E0B;
          font-weight: 600;
        }

        .med-freq {
          font-size: 11px;
          color: #9CA3AF;
        }

        .med-card-actions {
          display: flex;
          gap: 8px;
        }

        .med-action {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .med-action.edit {
          background: #F3F4F6;
        }

        .med-action.delete {
          background: #FEF2F2;
        }

        .med-action:active {
          transform: scale(0.9);
        }

        /* Modal */
        .med-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .med-modal {
          background: white;
          border-radius: 24px;
          padding: 32px;
          text-align: center;
          max-width: 320px;
          width: 100%;
          animation: modalIn 0.3s ease-out;
        }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .med-modal-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .med-modal h3 {
          font-size: 20px;
          color: #1F2937;
          margin: 0 0 8px;
        }

        .med-modal p {
          color: #6B7280;
          margin: 0 0 24px;
        }

        .med-modal-actions {
          display: flex;
          gap: 12px;
        }

        .med-modal-btn {
          flex: 1;
          padding: 14px;
          border-radius: 14px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .med-modal-btn.cancel {
          background: #F3F4F6;
          color: #374151;
        }

        .med-modal-btn.confirm {
          background: #EF4444;
          color: white;
        }

        /* FAB */
        .med-fab {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 32px;
          font-weight: 300;
          cursor: pointer;
          box-shadow: 0 8px 30px rgba(99,102,241,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 50;
        }

        .med-fab:active {
          transform: scale(0.9) rotate(90deg);
        }

        /* Animations */
        .fade-in { animation: fadeIn 0.5s ease-out; }
        .slide-up { animation: slideUp 0.5s ease-out; }
        .slide-up-delay-1 { animation: slideUp 0.5s ease-out 0.1s both; }
        .slide-up-delay-2 { animation: slideUp 0.5s ease-out 0.2s both; }
        .slide-up-delay-3 { animation: slideUp 0.5s ease-out 0.3s both; }
        .slide-up-delay-4 { animation: slideUp 0.5s ease-out 0.4s both; }
        .slide-up-delay-5 { animation: slideUp 0.5s ease-out 0.5s both; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (min-width: 600px) {
          .med-container { max-width: 500px; margin: 0 auto; }
          .med-add-text { display: inline; }
        }

        @media (max-width: 599px) {
          .med-add-text { display: none; }
          .med-add-btn { padding: 12px 14px; }
        }
      `}</style>
    </div>
  );
}

function isOverdue(timeStr: string) {
  if (!timeStr) return false;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const medTime = new Date();
  medTime.setHours(hours, minutes, 0, 0);
  const diff = (now.getTime() - medTime.getTime()) / (1000 * 60);
  return diff > 30;
}
