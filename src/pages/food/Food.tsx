import { useState, useEffect, useCallback } from "react";
import { type MealPlan, getDietPlan, saveMeal, deleteMeal, toggleMealStatus, getMealReminder } from "../../services/dietStorage";
import SimulatedCall from "../../components/SimulatedCall";

export default function Food() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [callData, setCallData] = useState<{ active: boolean; title: string; message: string } | null>(null);
  const [userName, setUserName] = useState("Paciente");

  // Form State
  const [form, setForm] = useState<MealPlan>({
    id: "",
    type: "Colación",
    time: "",
    description: "",
    enabled: true
  });

  const load = useCallback(async () => {
    try {
      const data = await getDietPlan();
      // Ordenar por hora
      data.sort((a, b) => a.time.localeCompare(b.time));
      setPlans(data);
    } catch (error) {
      console.error("Error loading meals:", error);
    }
  }, []);

  useEffect(() => {
    // Get user name
    const user = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");
    if (user.name) setUserName(user.name.split(" ")[0]);

    load();

    // Check for meal reminders every minute
    const checkReminders = async () => {
      const reminder = await getMealReminder();
      if (reminder) {
        // Check if we haven't already shown this reminder
        const lastReminder = localStorage.getItem("glucobot_last_meal_reminder");
        const reminderKey = `${reminder.id}_${new Date().toDateString()}`;

        if (lastReminder !== reminderKey) {
          localStorage.setItem("glucobot_last_meal_reminder", reminderKey);

          // Show GlucoBot call
          setCallData({
            active: true,
            title: `🍽️ ¡Hora de ${reminder.type}!`,
            message: `${userName}, es hora de tu ${reminder.type.toLowerCase()}. 
            
Tienes programado: ${reminder.description}

Recuerda comer despacio y disfrutar tu comida. Si eres diabético, espera 15 minutos después de comer para medir tu glucosa.`
          });
        }
      }
    };

    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [load, userName]);

  const handleSave = async () => {
    if (!form.time || !form.description) return alert("Completa la hora y descripción");

    setIsLoading(true);

    try {
      // Remove id from form if it exists
      const { id, ...rest } = form;
      await saveMeal(rest);

      // Reset form
      setForm({ id: "", type: "Colación", time: "", description: "", enabled: true });
      setIsAdding(false);

      // Show success overlay
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Reload list
      await load();
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Error al guardar. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Borrar esta comida?")) {
      await deleteMeal(id);
      load();
    }
  };

  const handleToggle = async (id: string) => {
    const meal = plans.find(p => p.id === id);
    if (meal) {
      await toggleMealStatus(id, meal.enabled);
      load();
    }
  };

  // Manual test reminder
  const testReminder = () => {
    if (plans.length > 0) {
      const meal = plans[0];
      setCallData({
        active: true,
        title: `🍽️ ¡Hora de ${meal.type}!`,
        message: `${userName}, es hora de tu ${meal.type.toLowerCase()}. 
        
Tienes programado: ${meal.description}

Recuerda comer despacio y disfrutar tu comida. Si eres diabético, espera 15 minutos después de comer para medir tu glucosa.`
      });
    }
  };

  return (
    <div style={{ padding: "20px", paddingBottom: "100px", maxWidth: "600px", margin: "0 auto" }}>

      {/* GLUCOBOT CALL */}
      {callData?.active && (
        <SimulatedCall
          userName={userName}
          title={callData.title}
          message={callData.message}
          onEndCall={() => setCallData(null)}
        />
      )}

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div style={successOverlay}>
          <div style={successCard}>
            <div style={successIcon}>✅</div>
            <h2 style={{ margin: "10px 0 5px", color: "#059669" }}>¡Guardado!</h2>
            <p style={{ margin: 0, color: "#6B7280" }}>Tu comida ha sido agregada</p>
          </div>
        </div>
      )}

      <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#1F2937" }}>🍽️ Plan de Alimentación</h2>

      {/* Test reminder button (only in dev) */}
      {plans.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={testReminder}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1px solid #E5E7EB",
              background: "white",
              color: "#6B7280",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            🔔 Probar Recordatorio
          </button>
        </div>
      )}

      {!isAdding ? (
        <>
          {/* LISTA DE COMIDAS */}
          {plans.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9CA3AF", marginTop: "40px" }}>
              <p style={{ fontSize: "50px", margin: 0 }}>📋</p>
              <p>No tienes comidas programadas.</p>
              <p style={{ fontSize: "13px" }}>Agrega tus comidas y GlucoBot te recordará cuando sea hora de comer.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {plans.map(meal => (
                <div key={meal.id} style={{ ...cardStyle, opacity: meal.enabled ? 1 : 0.6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                      <div style={{
                        background: meal.enabled ? "#ECFDF5" : "#F3F4F6",
                        color: meal.enabled ? "#059669" : "#9CA3AF",
                        padding: "10px", borderRadius: "12px", fontWeight: "bold",
                        minWidth: "60px", textAlign: "center"
                      }}>
                        {meal.time}
                      </div>
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "16px", color: "#374151" }}>
                          {getMealEmoji(meal.type)} {meal.type}
                        </div>
                        <div style={{ fontSize: "14px", color: "#6B7280" }}>{meal.description}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => handleToggle(meal.id)} style={iconBtn}>
                        {meal.enabled ? "🔔" : "🔕"}
                      </button>
                      <button onClick={() => handleDelete(meal.id)} style={{ ...iconBtn, color: "#EF4444" }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button style={fab} onClick={() => setIsAdding(true)}>
            ➕ Agregar Comida
          </button>
        </>
      ) : (
        /* FORMULARIO */
        <div style={formCard}>
          <h3 style={{ margin: "0 0 20px" }}>Programar Comida</h3>

          <label style={label}>Tipo de Comida</label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
            {(["Desayuno", "Almuerzo", "Once", "Cena", "Colación"] as const).map(t => (
              <button
                key={t}
                onClick={() => setForm({ ...form, type: t })}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "none",
                  background: form.type === t ? "#1F4FFF" : "#F3F4F6",
                  color: form.type === t ? "white" : "#4B5563",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                {getMealEmoji(t)} {t}
              </button>
            ))}
          </div>

          <label style={label}>Hora</label>
          <input
            type="time"
            style={input}
            value={form.time}
            onChange={e => setForm({ ...form, time: e.target.value })}
          />

          <label style={label}>¿Qué vas a comer?</label>
          <input
            placeholder="Ej: Avena con frutas"
            style={input}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
            <button
              style={{ ...actionBtn, background: "#F3F4F6", color: "#374151" }}
              onClick={() => setIsAdding(false)}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              style={{ ...actionBtn, opacity: isLoading ? 0.7 : 1 }}
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "⏳ Guardando..." : "💾 Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// Helper function for meal emojis
const getMealEmoji = (type: string): string => {
  const emojis: Record<string, string> = {
    "Desayuno": "🌅",
    "Almuerzo": "☀️",
    "Once": "🫖",
    "Cena": "🌙",
    "Colación": "🍎"
  };
  return emojis[type] || "🍽️";
};

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: "15px",
  borderRadius: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  transition: "all 0.3s"
};

const formCard: React.CSSProperties = {
  background: "white",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
};

const iconBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: "18px",
  cursor: "pointer",
  padding: "5px"
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: "bold",
  marginBottom: "8px",
  color: "#374151"
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #E5E7EB",
  marginBottom: "20px",
  fontSize: "16px",
  background: "#F9FAFB"
};

const actionBtn: React.CSSProperties = {
  flex: 1,
  padding: "15px",
  borderRadius: "12px",
  background: "#1F4FFF",
  color: "white",
  border: "none",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer"
};

const fab: React.CSSProperties = {
  position: "fixed",
  bottom: "90px",
  right: "20px",
  background: "#10B981",
  color: "white",
  padding: "15px 25px",
  borderRadius: "30px",
  border: "none",
  fontSize: "16px",
  fontWeight: "bold",
  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
  cursor: "pointer",
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const successOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  animation: "fadeIn 0.3s ease-out"
};

const successCard: React.CSSProperties = {
  background: "white",
  padding: "40px 50px",
  borderRadius: "24px",
  textAlign: "center",
  boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
  animation: "fadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
};

const successIcon: React.CSSProperties = {
  fontSize: "60px",
  marginBottom: "10px"
};
