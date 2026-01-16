import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getAppointments, deleteAppointment, getAppointmentReminder } from "../../services/appointmentStorage";
import type { Appointment } from "../../services/appointmentStorage";
import SimulatedCall from "../../components/SimulatedCall";

export default function Appointments() {
  const navigate = useNavigate();
  const [list, setList] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [callData, setCallData] = useState<{ active: boolean; title: string; message: string } | null>(null);
  const [userName, setUserName] = useState("Paciente");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAppointments();
      setList(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get user name
    const user = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");
    if (user.name) setUserName(user.name.split(" ")[0]);

    load();

    // Check for appointment reminders every minute
    const checkReminders = async () => {
      const reminder = await getAppointmentReminder();
      if (reminder) {
        const lastReminder = localStorage.getItem("glucobot_last_appt_reminder");
        const reminderKey = `${reminder.id}_${new Date().toDateString()}`;

        if (lastReminder !== reminderKey) {
          localStorage.setItem("glucobot_last_appt_reminder", reminderKey);

          setCallData({
            active: true,
            title: `📅 ¡Cita en breve!`,
            message: `${userName}, recuerda que tienes cita con ${reminder.doctor} a las ${reminder.hora}.
                        
${reminder.lugar ? `📍 Lugar: ${reminder.lugar}` : ""}
${reminder.motivo ? `📝 Motivo: ${reminder.motivo}` : ""}

¡Prepárate y no llegues tarde!`
          });
        }
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [load, userName]);

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar esta cita?")) {
      await deleteAppointment(id);
      load();
    }
  };

  // Format date nicely
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return {
      day: date.getDate(),
      month: date.toLocaleString('es-CL', { month: 'short' }).toUpperCase(),
      weekday: date.toLocaleString('es-CL', { weekday: 'short' })
    };
  };

  // Check if appointment is today
  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  // Check if appointment is in the past
  const isPast = (dateStr: string, timeStr: string) => {
    const now = new Date();
    const apptDate = new Date(`${dateStr}T${timeStr || '00:00'}`);
    return apptDate < now;
  };

  // Separate past and future appointments
  const futureAppointments = list.filter(a => !isPast(a.fecha, a.hora));
  const pastAppointments = list.filter(a => isPast(a.fecha, a.hora));

  return (
    <div style={{ textAlign: "center", paddingBottom: "100px", padding: "20px" }}>

      {/* GLUCOBOT CALL */}
      {callData?.active && (
        <SimulatedCall
          userName={userName}
          title={callData.title}
          message={callData.message}
          onEndCall={() => setCallData(null)}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#1F1F1F", margin: 0 }}>
          📅 Mis Citas
        </h2>
        <button
          onClick={() => navigate("/appointments/add")}
          style={addBtn}
        >
          ➕ Nueva
        </button>
      </div>

      {isLoading ? (
        <div style={{ marginTop: "60px", color: "#9CA3AF" }}>
          <p>⏳ Cargando citas...</p>
        </div>
      ) : futureAppointments.length === 0 && pastAppointments.length === 0 ? (
        <div style={{ marginTop: "60px", color: "#666" }}>
          <div style={{ fontSize: "60px", marginBottom: "15px", opacity: 0.5 }}>📭</div>
          <p style={{ fontSize: "18px" }}>No tienes citas programadas.</p>
          <p style={{ fontSize: "14px", opacity: 0.7 }}>¡Agenda tu próxima visita médica!</p>
        </div>
      ) : (
        <>
          {/* UPCOMING APPOINTMENTS */}
          {futureAppointments.length > 0 && (
            <>
              <h3 style={{ textAlign: "left", fontSize: "16px", color: "#6B7280", marginBottom: "12px" }}>
                Próximas citas
              </h3>
              <div style={{ display: "grid", gap: "16px", marginBottom: "30px" }}>
                {futureAppointments.map(app => {
                  const { day, month, weekday } = formatDate(app.fecha);
                  const today = isToday(app.fecha);

                  return (
                    <div key={app.id} style={{ ...card, borderLeft: today ? "4px solid #10B981" : "none" }}>
                      {/* DATE BOX */}
                      <div style={dateBox}>
                        <span style={{ fontSize: "11px", fontWeight: "bold", opacity: 0.6 }}>{weekday}</span>
                        <span style={{ fontSize: "24px", fontWeight: "900", color: today ? "#10B981" : "#1F4FFF" }}>{day}</span>
                        <span style={{ fontSize: "12px", fontWeight: "bold", opacity: 0.8 }}>{month}</span>
                      </div>

                      {/* INFO */}
                      <div style={{ flex: 1, paddingLeft: "15px", textAlign: "left", borderLeft: "2px solid #F3F4F6" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <h4 style={{ margin: "0 0 4px", fontSize: "17px", color: "#111827", fontWeight: "700" }}>
                            {app.doctor}
                          </h4>
                          {today && (
                            <span style={{
                              padding: "2px 8px",
                              background: "#ECFDF5",
                              color: "#059669",
                              borderRadius: "10px",
                              fontSize: "11px",
                              fontWeight: "bold"
                            }}>
                              HOY
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#4B5563", fontSize: "14px" }}>
                          <span>⏰ {app.hora}</span>
                          {app.lugar && <span>📍 {app.lugar}</span>}
                        </div>
                        {app.motivo && (
                          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#6B7280", fontStyle: "italic" }}>
                            "{app.motivo}"
                          </p>
                        )}
                      </div>

                      {/* DELETE */}
                      <button style={deleteBtn} onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }}>
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* PAST APPOINTMENTS */}
          {pastAppointments.length > 0 && (
            <>
              <h3 style={{ textAlign: "left", fontSize: "16px", color: "#9CA3AF", marginBottom: "12px" }}>
                Citas pasadas
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                {pastAppointments.slice(0, 5).map(app => {
                  const { day, month } = formatDate(app.fecha);

                  return (
                    <div key={app.id} style={{ ...card, opacity: 0.6, background: "#F9FAFB" }}>
                      <div style={{ ...dateBox, minWidth: "40px" }}>
                        <span style={{ fontSize: "18px", fontWeight: "bold", color: "#9CA3AF" }}>{day}</span>
                        <span style={{ fontSize: "10px", color: "#9CA3AF" }}>{month}</span>
                      </div>
                      <div style={{ flex: 1, paddingLeft: "12px", textAlign: "left" }}>
                        <h4 style={{ margin: 0, fontSize: "15px", color: "#6B7280" }}>{app.doctor}</h4>
                      </div>
                      <button style={{ ...deleteBtn, background: "#F3F4F6" }} onClick={() => handleDelete(app.id)}>
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Animations */}
      <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
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

const addBtn: React.CSSProperties = {
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
