import { useState, useEffect, useCallback } from "react";
import {
    getSmokingProfile,
    saveSmokingProfile,
    calculateStats,
    getAchievedMilestones,
    logCraving,
    type SmokingProfile,
    type SmokingStats,
    HEALTH_MILESTONES
} from "../../services/smokingStorage";
import SimulatedCall from "../../components/SimulatedCall";

// Craving distraction messages
const CRAVING_MESSAGES = [
    "Respira profundo 4 veces. Inhala 4 segundos, mantén 4 segundos, exhala 4 segundos.",
    "Toma un vaso de agua. La hidratación reduce la intensidad de los antojos.",
    "Camina 5 minutos. El movimiento libera endorfinas naturales.",
    "Mastica chicle o come una fruta. Ocupa tu boca de forma saludable.",
    "Llama a un ser querido. El apoyo social es clave en este proceso.",
    "El antojo pasará en 3-5 minutos. ¡Ya casi lo superas!",
];

export default function QuitSmoking() {
    const [profile, setProfile] = useState<SmokingProfile | null>(null);
    const [stats, setStats] = useState<SmokingStats | null>(null);
    const [milestones, setMilestones] = useState<typeof HEALTH_MILESTONES>([]);
    const [isSetup, setIsSetup] = useState(false);
    const [callData, setCallData] = useState<{ active: boolean; title: string; message: string } | null>(null);
    const [userName, setUserName] = useState("Paciente");
    const [isLoading, setIsLoading] = useState(true);

    // Setup form
    const [setupForm, setSetupForm] = useState({
        cigarettesPerDay: "10",
        pricePerPack: "5000",
        cigarettesPerPack: "20",
        quitDate: new Date().toISOString().split('T')[0]
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const p = await getSmokingProfile();
            if (p && p.isActive) {
                setProfile(p);
                const s = await calculateStats();
                setStats(s);
                const m = await getAchievedMilestones();
                setMilestones(m);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");
        if (user.name) setUserName(user.name.split(" ")[0]);
        loadData();

        // Update stats every minute
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, [loadData]);

    const handleStart = async () => {
        const newProfile: SmokingProfile = {
            quitDate: setupForm.quitDate,
            cigarettesPerDay: parseInt(setupForm.cigarettesPerDay) || 10,
            pricePerPack: parseInt(setupForm.pricePerPack) || 5000,
            cigarettesPerPack: parseInt(setupForm.cigarettesPerPack) || 20,
            motivations: [],
            isActive: true
        };

        await saveSmokingProfile(newProfile);
        setIsSetup(false);
        loadData();

        // Welcome call
        setCallData({
            active: true,
            title: "🚭 ¡Felicidades por dar el primer paso!",
            message: `${userName}, hoy comienzas un viaje increíble hacia una vida más saludable.

Cada hora sin fumar es una victoria. Estaré aquí para apoyarte cuando tengas antojos.

Recuerda: para las personas con diabetes, dejar de fumar mejora significativamente el control de la glucosa y reduce el riesgo de complicaciones.

¡Vamos a lograrlo juntos!`
        });
    };

    const handleCravingHelp = async () => {
        const randomMessage = CRAVING_MESSAGES[Math.floor(Math.random() * CRAVING_MESSAGES.length)];

        setCallData({
            active: true,
            title: "🆘 ¡Puedes superar este antojo!",
            message: `${userName}, sé que es difícil, pero este antojo pasará en pocos minutos.

${randomMessage}

Ya llevas ${stats?.daysSmokeFree || 0} días sin fumar y has evitado ${stats?.cigarettesAvoided || 0} cigarrillos. ¡No lo pierdas ahora!

Cada antojo que superas te hace más fuerte. Respira y cuenta hasta 10.`
        });

        // Log the craving
        await logCraving({
            intensity: 3,
            trigger: "Botón de ayuda",
            resisted: true
        });

        loadData();
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
    };

    // Show setup if no profile
    if (isLoading) {
        return (
            <div className="smoking-container">
                <div className="loading">⏳ Cargando...</div>
                <style>{styles}</style>
            </div>
        );
    }

    if (!profile || isSetup) {
        return (
            <div className="smoking-container">
                <header className="header">
                    <h2>🚭 Dejar de Fumar</h2>
                    <p>Configura tu programa personalizado</p>
                </header>

                <div className="setup-card">
                    <h3>Iniciar Programa</h3>

                    <div className="input-group">
                        <label>📅 Fecha de inicio</label>
                        <input
                            type="date"
                            value={setupForm.quitDate}
                            onChange={e => setSetupForm({ ...setupForm, quitDate: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label>🚬 ¿Cuántos cigarrillos fumabas al día?</label>
                        <input
                            type="number"
                            placeholder="Ej: 10"
                            value={setupForm.cigarettesPerDay}
                            onChange={e => setSetupForm({ ...setupForm, cigarettesPerDay: e.target.value })}
                        />
                    </div>

                    <div className="row-2">
                        <div className="input-group">
                            <label>💰 Precio por cajetilla</label>
                            <input
                                type="number"
                                placeholder="Ej: 5000"
                                value={setupForm.pricePerPack}
                                onChange={e => setSetupForm({ ...setupForm, pricePerPack: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>📦 Cigarrillos por caja</label>
                            <input
                                type="number"
                                placeholder="20"
                                value={setupForm.cigarettesPerPack}
                                onChange={e => setSetupForm({ ...setupForm, cigarettesPerPack: e.target.value })}
                            />
                        </div>
                    </div>

                    <button className="btn-start" onClick={handleStart}>
                        🚀 Comenzar Mi Viaje
                    </button>
                </div>

                <div className="info-card">
                    <h4>¿Por qué es importante para diabéticos?</h4>
                    <ul>
                        <li>Fumar aumenta la resistencia a la insulina</li>
                        <li>Eleva los niveles de glucosa en sangre</li>
                        <li>Aumenta el riesgo de complicaciones cardiovasculares</li>
                        <li>Dificulta el control de la diabetes</li>
                    </ul>
                </div>

                <style>{styles}</style>
            </div>
        );
    }

    // Main dashboard
    return (
        <div className="smoking-container">

            {/* GLUCOBOT CALL */}
            {callData?.active && (
                <SimulatedCall
                    userName={userName}
                    title={callData.title}
                    message={callData.message}
                    onEndCall={() => setCallData(null)}
                />
            )}

            <header className="header">
                <h2>🚭 Libre de Humo</h2>
                <p>Sigue así, {userName}. ¡Lo estás logrando!</p>
            </header>

            {/* MAIN STATS */}
            <div className="stats-hero">
                <div className="days-counter">
                    <span className="days-number">{stats?.daysSmokeFree || 0}</span>
                    <span className="days-label">días sin fumar</span>
                </div>
                <div className="time-detail">
                    {stats?.hoursSmokeFree}h {stats?.minutesSmokeFree}m
                </div>
            </div>

            {/* CRAVING HELP BUTTON */}
            <button className="craving-btn" onClick={handleCravingHelp}>
                🆘 Tengo un Antojo
            </button>

            {/* STATS GRID */}
            <div className="stats-grid">
                <div className="stat-card green">
                    <span className="stat-icon">🚬</span>
                    <span className="stat-value">{stats?.cigarettesAvoided || 0}</span>
                    <span className="stat-label">Cigarrillos evitados</span>
                </div>
                <div className="stat-card blue">
                    <span className="stat-icon">💰</span>
                    <span className="stat-value">{formatMoney(stats?.moneySaved || 0)}</span>
                    <span className="stat-label">Dinero ahorrado</span>
                </div>
                <div className="stat-card purple">
                    <span className="stat-icon">💪</span>
                    <span className="stat-value">{stats?.cravingsResisted || 0}</span>
                    <span className="stat-label">Antojos superados</span>
                </div>
            </div>

            {/* HEALTH MILESTONES */}
            <div className="milestones-section">
                <h3>🏆 Logros de Salud</h3>
                <div className="milestones-list">
                    {milestones.map((m, i) => (
                        <div key={i} className={`milestone ${m.achieved ? 'achieved' : ''}`}>
                            <div className="milestone-icon">{m.achieved ? m.emoji : '🔒'}</div>
                            <div className="milestone-info">
                                <span className="milestone-title">{m.title}</span>
                                <span className="milestone-desc">{m.description}</span>
                            </div>
                            {m.achieved && <span className="milestone-check">✅</span>}
                        </div>
                    ))}
                </div>
            </div>

            <style>{styles}</style>
        </div>
    );
}

const styles = `
    .smoking-container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 16px;
        padding-bottom: 100px;
        box-sizing: border-box;
    }

    .loading {
        text-align: center;
        padding: 60px 20px;
        color: #9CA3AF;
    }

    .header {
        text-align: center;
        margin-bottom: 24px;
    }

    .header h2 {
        font-size: clamp(22px, 5vw, 28px);
        color: #1F2937;
        margin: 0 0 6px;
    }

    .header p {
        color: #6B7280;
        margin: 0;
        font-size: clamp(14px, 3.5vw, 16px);
    }

    /* SETUP */
    .setup-card {
        background: white;
        padding: clamp(20px, 5vw, 28px);
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        margin-bottom: 20px;
    }

    .setup-card h3 {
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
        font-weight: 600;
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
        border-color: #10B981;
        outline: none;
    }

    .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    @media (max-width: 400px) {
        .row-2 { grid-template-columns: 1fr; }
    }

    .btn-start {
        width: 100%;
        padding: 16px;
        border-radius: 14px;
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        color: white;
        border: none;
        font-size: 17px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 10px;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }

    .info-card {
        background: #F0FDF4;
        padding: 20px;
        border-radius: 16px;
        border-left: 4px solid #10B981;
    }

    .info-card h4 {
        margin: 0 0 12px;
        color: #065F46;
        font-size: 15px;
    }

    .info-card ul {
        margin: 0;
        padding-left: 20px;
        color: #047857;
        line-height: 1.6;
    }

    /* MAIN DASHBOARD */
    .stats-hero {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        color: white;
        padding: clamp(30px, 8vw, 40px) 20px;
        border-radius: 24px;
        text-align: center;
        margin-bottom: 20px;
        box-shadow: 0 8px 30px rgba(16, 185, 129, 0.3);
    }

    .days-counter {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .days-number {
        font-size: clamp(60px, 15vw, 80px);
        font-weight: 900;
        line-height: 1;
    }

    .days-label {
        font-size: clamp(16px, 4vw, 20px);
        opacity: 0.9;
        margin-top: 4px;
    }

    .time-detail {
        margin-top: 8px;
        font-size: 14px;
        opacity: 0.8;
    }

    .craving-btn {
        width: 100%;
        padding: 18px;
        border-radius: 16px;
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        color: white;
        border: none;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 24px;
    }

    @media (max-width: 500px) {
        .stats-grid { grid-template-columns: 1fr; }
    }

    .stat-card {
        background: white;
        padding: 16px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    }

    .stat-card.green { border-top: 4px solid #10B981; }
    .stat-card.blue { border-top: 4px solid #3B82F6; }
    .stat-card.purple { border-top: 4px solid #8B5CF6; }

    .stat-icon {
        font-size: 24px;
        display: block;
        margin-bottom: 6px;
    }

    .stat-value {
        font-size: 20px;
        font-weight: 900;
        color: #1F2937;
        display: block;
    }

    .stat-label {
        font-size: 11px;
        color: #6B7280;
        display: block;
        margin-top: 4px;
    }

    /* MILESTONES */
    .milestones-section {
        background: white;
        padding: 20px;
        border-radius: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    }

    .milestones-section h3 {
        margin: 0 0 16px;
        font-size: 17px;
        color: #1F2937;
    }

    .milestones-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .milestone {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 12px;
        background: #F9FAFB;
        opacity: 0.5;
        transition: all 0.3s;
    }

    .milestone.achieved {
        opacity: 1;
        background: #ECFDF5;
    }

    .milestone-icon {
        font-size: 24px;
        width: 40px;
        text-align: center;
    }

    .milestone-info {
        flex: 1;
    }

    .milestone-title {
        font-weight: bold;
        font-size: 14px;
        color: #374151;
        display: block;
    }

    .milestone-desc {
        font-size: 12px;
        color: #6B7280;
        display: block;
        margin-top: 2px;
    }

    .milestone-check {
        font-size: 18px;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
`;
