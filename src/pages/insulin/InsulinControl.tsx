import { useState, useEffect, useCallback } from "react";
import { getInsulinPlan, addInsulinDose, deleteInsulinDose, toggleInsulinDose, getInsulinReminder, type InsulinDose } from "../../services/insulinStorage";
import SimulatedCall from "../../components/SimulatedCall";

// Common insulin types
const INSULIN_TYPES = [
    { type: "Basal", emoji: "🌙", name: "Basal/Lenta", examples: "Lantus, Toujeo, Tresiba" },
    { type: "Rapid", emoji: "⚡", name: "Rápida/Bolo", examples: "Humalog, NovoRapid, Apidra" },
    { type: "Mix", emoji: "🔄", name: "Mixta", examples: "Humalog Mix, NovoMix" }
];

export default function InsulinControl() {
    const [plan, setPlan] = useState<InsulinDose[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [callData, setCallData] = useState<{ active: boolean; title: string; message: string } | null>(null);
    const [userName, setUserName] = useState("Paciente");

    // Form state
    const [form, setForm] = useState({
        description: "",
        units: "",
        time: "",
        type: "Basal" as 'Basal' | 'Rapid' | 'Mix'
    });

    const loadPlan = useCallback(async () => {
        try {
            const data = await getInsulinPlan();
            setPlan(data);
        } catch (error) {
            console.error("Error loading plan:", error);
        }
    }, []);

    useEffect(() => {
        // Get user name
        const user = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");
        if (user.name) setUserName(user.name.split(" ")[0]);

        loadPlan();

        // Check for insulin reminders every minute
        const checkReminders = async () => {
            const reminder = await getInsulinReminder();
            if (reminder) {
                const lastReminder = localStorage.getItem("glucobot_last_insulin_reminder");
                const reminderKey = `${reminder.id}_${new Date().toDateString()}_${reminder.time}`;

                if (lastReminder !== reminderKey) {
                    localStorage.setItem("glucobot_last_insulin_reminder", reminderKey);

                    setCallData({
                        active: true,
                        title: `💉 ¡Hora de tu Insulina!`,
                        message: `${userName}, es hora de aplicar tu insulina.

💊 ${reminder.description}
📊 Dosis: ${reminder.units} unidades
🕐 Hora programada: ${reminder.time}

Recuerda rotar el sitio de inyección y verificar que tu glucosa esté en rango antes de aplicar.`
                    });
                }
            }
        };

        checkReminders();
        const interval = setInterval(checkReminders, 60000);

        return () => clearInterval(interval);
    }, [loadPlan, userName]);

    const handleAdd = async () => {
        if (!form.description || !form.units || !form.time) {
            alert("Completa todos los campos");
            return;
        }

        setIsLoading(true);

        try {
            await addInsulinDose({
                ...form,
                enabled: true
            });

            // Reset form
            setForm({ description: "", units: "", time: "", type: "Basal" });
            setIsAdding(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
            await loadPlan();
        } catch (error) {
            console.error("Error adding:", error);
            alert("Error al guardar");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Borrar este esquema?")) {
            await deleteInsulinDose(id);
            loadPlan();
        }
    };

    const handleToggle = async (id: string) => {
        const current = plan.find(d => d.id === id);
        if (current) {
            await toggleInsulinDose(id, current.enabled);
            loadPlan();
        }
    };

    const getTypeColor = (type: string) => {
        const colors = {
            Basal: { bg: "#F3E8FF", text: "#7C3AED", border: "#7C3AED" },
            Rapid: { bg: "#FEF2F2", text: "#EF4444", border: "#EF4444" },
            Mix: { bg: "#FEF3C7", text: "#D97706", border: "#D97706" }
        };
        return colors[type as keyof typeof colors] || colors.Basal;
    };

    return (
        <div className="insulin-container">

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
                <div className="success-overlay">
                    <div className="success-card">
                        <div className="success-icon">💉</div>
                        <h2>¡Guardado!</h2>
                        <p>Tu dosis ha sido programada</p>
                    </div>
                </div>
            )}

            <header className="header">
                <h2>💉 Esquema de Insulina</h2>
                <p>Gestiona tus dosis y horarios. Te llamaremos para recordarte.</p>
            </header>

            {!isAdding ? (
                <>
                    {/* ADD BUTTON */}
                    <button className="add-btn" onClick={() => setIsAdding(true)}>
                        ➕ Agregar Dosis
                    </button>

                    {/* DOSES LIST */}
                    <h3 className="section-title">Tus Dosis Programadas</h3>

                    {plan.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">💉</div>
                            <p>No tienes dosis configuradas.</p>
                            <p className="empty-hint">Agrega tu esquema y te recordaremos cada día.</p>
                        </div>
                    ) : (
                        <div className="doses-list">
                            {plan.map(dose => {
                                const colors = getTypeColor(dose.type);
                                return (
                                    <div key={dose.id} className="dose-card" style={{
                                        borderLeft: `4px solid ${dose.enabled ? colors.border : '#D1D5DB'}`,
                                        opacity: dose.enabled ? 1 : 0.6
                                    }}>
                                        <div className="dose-toggle">
                                            <input
                                                type="checkbox"
                                                checked={dose.enabled}
                                                onChange={() => handleToggle(dose.id)}
                                            />
                                        </div>

                                        <div className="dose-info">
                                            <div className="dose-header">
                                                <span className="dose-name">{dose.description}</span>
                                                <span className="dose-type" style={{
                                                    background: colors.bg,
                                                    color: colors.text
                                                }}>
                                                    {dose.type === 'Basal' ? '🌙 BASAL' :
                                                        dose.type === 'Rapid' ? '⚡ BOLO' : '🔄 MIXTA'}
                                                </span>
                                            </div>
                                            <div className="dose-details">
                                                <span>⏰ {dose.time}</span>
                                                <span className="dose-units">{dose.units} U</span>
                                            </div>
                                        </div>

                                        <button className="delete-btn" onClick={() => handleDelete(dose.id)}>
                                            🗑️
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                /* ADD FORM */
                <div className="form-card">
                    <h3>Nueva Dosis</h3>

                    {/* TYPE SELECTION */}
                    <div className="input-group">
                        <label>Tipo de Insulina</label>
                        <div className="type-grid">
                            {INSULIN_TYPES.map(t => (
                                <button
                                    key={t.type}
                                    type="button"
                                    onClick={() => setForm({ ...form, type: t.type as any })}
                                    className={`type-btn ${form.type === t.type ? 'active' : ''}`}
                                    style={{
                                        borderColor: form.type === t.type ? getTypeColor(t.type).border : undefined,
                                        background: form.type === t.type ? getTypeColor(t.type).bg : undefined
                                    }}
                                >
                                    <span className="type-emoji">{t.emoji}</span>
                                    <span className="type-name">{t.name}</span>
                                    <span className="type-examples">{t.examples}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* NAME */}
                    <div className="input-group">
                        <label>Nombre / Marca</label>
                        <input
                            type="text"
                            placeholder="Ej: Lantus, Humalog..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    {/* UNITS AND TIME */}
                    <div className="row-2">
                        <div className="input-group">
                            <label>Dosis (Unidades)</label>
                            <input
                                type="number"
                                placeholder="Ej: 20"
                                value={form.units}
                                onChange={(e) => setForm({ ...form, units: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Hora</label>
                            <input
                                type="time"
                                value={form.time}
                                onChange={(e) => setForm({ ...form, time: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="button-row">
                        <button className="btn-secondary" onClick={() => setIsAdding(false)} disabled={isLoading}>
                            Cancelar
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleAdd}
                            disabled={isLoading}
                            style={{ opacity: isLoading ? 0.7 : 1 }}
                        >
                            {isLoading ? "⏳ Guardando..." : "💾 Guardar"}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .insulin-container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 16px;
                    padding-bottom: 100px;
                    box-sizing: border-box;
                }

                .header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .header h2 {
                    font-size: clamp(22px, 5vw, 26px);
                    color: #1F2937;
                    margin: 0 0 8px;
                }

                .header p {
                    color: #6B7280;
                    font-size: clamp(14px, 3.5vw, 15px);
                    margin: 0;
                }

                .add-btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
                    color: white;
                    border: none;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
                }

                .section-title {
                    font-size: 16px;
                    color: #374151;
                    margin-bottom: 12px;
                    padding-left: 4px;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: #9CA3AF;
                }

                .empty-icon {
                    font-size: 50px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                .empty-hint {
                    font-size: 13px;
                    opacity: 0.8;
                }

                .doses-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .dose-card {
                    background: white;
                    padding: 14px;
                    border-radius: 14px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: opacity 0.3s;
                }

                .dose-toggle input {
                    width: 22px;
                    height: 22px;
                    accent-color: #10B981;
                }

                .dose-info {
                    flex: 1;
                    min-width: 0;
                }

                .dose-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-bottom: 4px;
                }

                .dose-name {
                    font-weight: bold;
                    font-size: 15px;
                    color: #1F2937;
                }

                .dose-type {
                    font-size: 10px;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-weight: bold;
                }

                .dose-details {
                    font-size: 14px;
                    color: #6B7280;
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .dose-units {
                    font-weight: bold;
                    color: #374151;
                }

                .delete-btn {
                    background: #FEF2F2;
                    border: none;
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 16px;
                }

                /* FORM */
                .form-card {
                    background: white;
                    padding: clamp(16px, 4vw, 24px);
                    border-radius: 20px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                }

                .form-card h3 {
                    margin: 0 0 20px;
                    font-size: 18px;
                    color: #1F2937;
                }

                .input-group {
                    margin-bottom: 16px;
                }

                .input-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: bold;
                    color: #6B7280;
                    margin-bottom: 6px;
                }

                .input-group input {
                    width: 100%;
                    padding: 12px;
                    border-radius: 10px;
                    border: 2px solid #F3F4F6;
                    font-size: 16px;
                    background: #F9FAFB;
                    box-sizing: border-box;
                }

                .input-group input:focus {
                    border-color: #7C3AED;
                    outline: none;
                    background: white;
                }

                .type-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                }

                @media (max-width: 400px) {
                    .type-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .type-btn {
                    padding: 12px;
                    border-radius: 12px;
                    border: 2px solid #F3F4F6;
                    background: #F9FAFB;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                }

                .type-btn.active {
                    border-width: 2px;
                }

                .type-emoji {
                    font-size: 24px;
                    display: block;
                    margin-bottom: 4px;
                }

                .type-name {
                    font-size: 14px;
                    font-weight: bold;
                    color: #374151;
                    display: block;
                }

                .type-examples {
                    font-size: 11px;
                    color: #9CA3AF;
                }

                .row-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                @media (max-width: 360px) {
                    .row-2 {
                        grid-template-columns: 1fr;
                    }
                }

                .button-row {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                }

                .btn-primary, .btn-secondary {
                    flex: 1;
                    padding: 14px;
                    border-radius: 12px;
                    border: none;
                    font-size: 15px;
                    font-weight: bold;
                    cursor: pointer;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
                }

                .btn-secondary {
                    background: #F3F4F6;
                    color: #374151;
                }

                /* SUCCESS */
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
                    max-width: 280px;
                    width: 100%;
                }

                .success-icon {
                    font-size: 50px;
                    margin-bottom: 8px;
                }

                .success-card h2 {
                    margin: 8px 0 4px;
                    color: #7C3AED;
                    font-size: 20px;
                }

                .success-card p {
                    margin: 0;
                    color: #6B7280;
                    font-size: 14px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
