import { useState, useEffect } from "react";
import { type MealPlan, getDietPlan, saveMeal, deleteMeal, toggleMealStatus } from "../../services/dietStorage";

export default function Food() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [form, setForm] = useState<MealPlan>({
    id: "",
    type: "Colación",
    time: "",
    description: "",
    enabled: true
  });

  const load = () => {
    const data = getDietPlan();
    // Ordenar por hora
    data.sort((a, b) => a.time.localeCompare(b.time));
    setPlans(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = () => {
    if (!form.time || !form.description) return alert("Completa la hora y descripción");

    const newMeal = { ...form, id: form.id || Date.now().toString() };
    saveMeal(newMeal);
    setIsAdding(false);
    setForm({ id: "", type: "Colación", time: "", description: "", enabled: true });
    load();
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Borrar esta comida?")) {
      deleteMeal(id);
      load();
    }
  };

  const handleToggle = (id: string) => {
    toggleMealStatus(id);
    load();
  };

  return (
    <div style={{ padding: "20px", paddingBottom: "100px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#1F2937" }}>🍽️ Plan de Alimentación</h2>

      {!isAdding ? (
        <>
          {/* LISTA DE COMIDAS */}
          {plans.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9CA3AF", marginTop: "40px" }}>
              <p style={{ fontSize: "50px", margin: 0 }}>📋</p>
              <p>No tienes comidas programadas.</p>
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
                        <div style={{ fontWeight: "bold", fontSize: "16px", color: "#374151" }}>{meal.type}</div>
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
            {["Desayuno", "Almuerzo", "Once", "Cena", "Colación"].map(t => (
              <button
                key={t}
                onClick={() => setForm({ ...form, type: t as any })}
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
                {t}
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
            <button style={{ ...actionBtn, background: "#F3F4F6", color: "#374151" }} onClick={() => setIsAdding(false)}>
              Cancelar
            </button>
            <button style={actionBtn} onClick={handleSave}>
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
  background: "#10B981", // Verde para comida
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
