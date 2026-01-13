import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { getInsulinPlan, addInsulinDose, deleteInsulinDose, toggleInsulinDose, type InsulinDose } from "../../services/insulinStorage";

export default function InsulinControl() {
    const [plan, setPlan] = useState<InsulinDose[]>([]);

    // Form state
    const [description, setDescription] = useState("");
    const [units, setUnits] = useState("");
    const [time, setTime] = useState("");
    const [type, setType] = useState<'Basal' | 'Rapid'>("Basal");

    useEffect(() => {
        loadPlan();
    }, []);

    const loadPlan = async () => {
        const data = await getInsulinPlan();
        setPlan(data);
    };

    const handleAdd = async () => {
        if (!description || !units || !time) {
            alert("Completa todos los campos");
            return;
        }

        const newDose: Omit<InsulinDose, "id"> = {
            description,
            units,
            time,
            type,
            enabled: true
        };

        await addInsulinDose(newDose);
        await loadPlan();

        // Reset form
        setDescription("");
        setUnits("");
        setTime("");
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Borrar este esquema?")) {
            await deleteInsulinDose(id);
            loadPlan();
        }
    };

    const handleToggle = async (id: string) => {
        // Find existing to know status
        const current = plan.find(d => d.id === id);
        if (current) {
            await toggleInsulinDose(id, current.enabled);
            loadPlan();
        }
    };

    return (
        <div style={{ padding: "20px", paddingBottom: "100px", maxWidth: "800px", margin: "0 auto" }}>
            <header style={{ marginBottom: "30px", textAlign: "center" }}>
                <h2 style={{ fontSize: "24px", color: "#1F2937", margin: "0 0 10px" }}>Esquema de Insulina 💉</h2>
                <p style={{ color: "#6B7280" }}>
                    Gestiona tus dosis y horarios. Te llamaremos para recordarte.
                </p>
            </header>

            {/* Formulario */}
            <Card style={{ padding: "20px", marginBottom: "30px" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "15px", color: "#374151" }}>Nuevo Esquema</h3>

                <div style={{ display: "grid", gap: "15px" }}>
                    <div>
                        <label style={label}>Tipo de Insulina</label>
                        <select
                            style={input}
                            value={type}
                            onChange={(e) => setType(e.target.value as 'Basal' | 'Rapid')}
                        >
                            <option value="Basal">Basal (Lenta / Noche)</option>
                            <option value="Rapid">Bolos (Rápida / Comidas)</option>
                        </select>
                    </div>

                    <div>
                        <label style={label}>Nombre / Descripción</label>
                        <input
                            style={input}
                            placeholder="Ej: Lantus Noche"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div>
                            <label style={label}>Dosis (Unidades)</label>
                            <input
                                style={input}
                                type="number"
                                placeholder="Ej: 20"
                                value={units}
                                onChange={(e) => setUnits(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={label}>Hora</label>
                            <input
                                style={input}
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <button style={btn} onClick={handleAdd}>Agregar Recordatorio</button>
                </div>
            </Card>

            {/* Listado */}
            <h3 style={{ fontSize: "18px", marginBottom: "15px", color: "#374151", paddingLeft: "5px" }}>Tus Dosis Programadas</h3>

            {plan.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                    No tienes esquemas configurados.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {plan.map(dose => (
                        <Card key={dose.id} style={{ padding: "15px", display: "flex", alignItems: "center", borderLeft: dose.enabled ? `4px solid ${dose.type === 'Basal' ? '#8B5CF6' : '#EF4444'}` : '4px solid #D1D5DB' }}>
                            <input
                                type="checkbox"
                                checked={dose.enabled}
                                onChange={() => handleToggle(dose.id)}
                                style={{ width: "20px", height: "20px", marginRight: "15px", accentColor: "#10B981" }}
                            />

                            <div style={{ flex: 1, opacity: dose.enabled ? 1 : 0.5 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
                                    <span style={{ fontWeight: "bold", fontSize: "16px", color: "#1F2937" }}>{dose.description}</span>
                                    <span style={{
                                        fontSize: "11px",
                                        padding: "2px 8px",
                                        borderRadius: "10px",
                                        background: dose.type === 'Basal' ? '#F3E8FF' : '#FEF2F2',
                                        color: dose.type === 'Basal' ? '#7C3AED' : '#EF4444',
                                        fontWeight: "bold"
                                    }}>
                                        {dose.type === 'Basal' ? 'BASAL' : 'BOLO'}
                                    </span>
                                </div>
                                <div style={{ fontSize: "14px", color: "#6B7280" }}>
                                    ⏰ {dose.time} hrs — <span style={{ fontWeight: "bold", color: "#374151" }}>{dose.units} Unidades</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(dose.id)}
                                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", opacity: 0.6 }}
                            >
                                🗑️
                            </button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

const label: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#6B7280",
};

const input: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    fontSize: "16px",
    background: "#F9FAFB",
};

const btn: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "#4F46E5",
    color: "white",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "16px"
};
