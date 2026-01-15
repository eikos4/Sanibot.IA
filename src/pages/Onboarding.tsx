import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { savePatientData } from "../services/patientStorage";
import type { PatientData } from "../services/patientStorage";
import NeuralBackground from "../components/NeuralBackground";
import StepIndicator from "../components/StepIndicator";

export default function Onboarding() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Initial State consistent with PatientData
    const [form, setForm] = useState<Partial<PatientData>>({
        // Step 1: Identificación
        rut: user?.email?.split("@")[0] || "",
        fechaNacimiento: "",
        genero: "",
        prevision: "",
        // Step 2: Ficha Clínica (Diabetes)
        tipoDiabetes: "",
        anioDiagnostico: "",
        // NUEVO: Tratamiento
        tratamiento: "", // insulina, pastillas, dieta
        usoSensor: false,
        // Step 3: Comorbilidades
        hipertension: false,
        hipotiroidismo: false,
        dislipidemia: false,
        renal: false,
        antecedentesFamiliares: false,
        // Step 4: Estilo de Vida
        peso: "",
        altura: "",
        fumador: false,
        alcohol: "Nunca",
        actividadFisica: "Sedentario",
        // Step 5: Contacto de Emergencia / Cuidador
        emergenciaNombre: "",
        emergenciaTelefono: "",
        emergenciaRelacion: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // @ts-ignore
        const checked = e.target.checked;

        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSave = async () => {
        // Basic Validation (Enhance as needed)
        if (!form.tipoDiabetes) {
            alert("Por favor indica tu tipo de diabetes.");
            return;
        }

        try {
            await savePatientData({
                ...form,
                nombre: user?.name || "Paciente"
            });
            navigate("/home");
        } catch (error) {
            console.error("Error saving onboarding:", error);
            alert("Error al guardar. Intenta nuevamente.");
        }
    };

    if (!user) return <div style={{ padding: 20 }}>Cargando sesión...</div>;

    const renderStep1 = () => (
        <>
            <h3 style={stepTitle}>📋 Identificación</h3>
            {!form.rut && (
                <div style={formGroup}>
                    <label style={label}>RUT</label>
                    <input style={input} name="rut" placeholder="12.345.678-9" value={form.rut} onChange={handleChange} />
                </div>
            )}
            <div style={formGroup}>
                <label style={label}>Fecha de Nacimiento</label>
                <input style={input} type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} />
            </div>
            <div style={row}>
                <div style={{ ...formGroup, width: "48%" }}>
                    <label style={label}>Género</label>
                    <select style={input} name="genero" value={form.genero} onChange={handleChange}>
                        <option value="">Sel...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
                <div style={{ ...formGroup, width: "48%" }}>
                    <label style={label}>Previsión</label>
                    <select style={input} name="prevision" value={form.prevision} onChange={handleChange}>
                        <option value="">Sel...</option>
                        <option value="Fonasa">Fonasa</option>
                        <option value="Isapre">Isapre</option>
                        <option value="Particular">Particular</option>
                    </select>
                </div>
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            <h3 style={stepTitle}>🩺 Diabetes y Tratamiento</h3>
            <div style={formGroup}>
                <label style={label}>Tipo de Diabetes</label>
                <select style={input} name="tipoDiabetes" value={form.tipoDiabetes} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    <option value="Tipo 1">Tipo 1</option>
                    <option value="Tipo 2">Tipo 2</option>
                    <option value="Gestacional">Gestacional</option>
                    <option value="Prediabetes">Prediabetes</option>
                </select>
            </div>
            <div style={row}>
                <div style={{ ...formGroup, width: "48%" }}>
                    <label style={label}>Año Diagnóstico</label>
                    <input style={input} type="number" name="anioDiagnostico" placeholder="Ej: 2015" value={form.anioDiagnostico} onChange={handleChange} />
                </div>
                <div style={{ ...formGroup, width: "48%" }}>
                    <label style={label}>Dispositivo</label>
                    <label style={{ ...checkboxLabel, marginTop: "10px" }}>
                        <input type="checkbox" name="usoSensor" checked={form.usoSensor} onChange={handleChange} /> Uso Sensor (Libre/Dexcom)
                    </label>
                </div>
            </div>

            <div style={formGroup}>
                <label style={label}>Tratamiento Principal</label>
                <select style={input} name="tratamiento" value={form.tratamiento} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    <option value="Insulina">Insulina</option>
                    <option value="Farmacos">Fármacos Orales (Metformina, etc)</option>
                    <option value="Mixto">Mixto (Insulina + Pastillas)</option>
                    <option value="Dieta">Solo Dieta y Ejercicio</option>
                </select>
            </div>
        </>
    );

    const renderStep3 = () => (
        <>
            <h3 style={stepTitle}>❤️ Salud General</h3>
            <label style={{ ...label, marginBottom: "15px" }}>¿Tienes alguna de estas condiciones?</label>
            <div style={checkboxGrid}>
                <label style={checkboxLabel}>
                    <input type="checkbox" name="hipertension" checked={form.hipertension} onChange={handleChange} /> Hipertensión
                </label>
                <label style={checkboxLabel}>
                    <input type="checkbox" name="hipotiroidismo" checked={form.hipotiroidismo} onChange={handleChange} /> Hipotiroidismo
                </label>
                <label style={checkboxLabel}>
                    <input type="checkbox" name="dislipidemia" checked={form.dislipidemia} onChange={handleChange} /> Colesterol Alto
                </label>
                <label style={checkboxLabel}>
                    <input type="checkbox" name="renal" checked={form.renal} onChange={handleChange} /> Enf. Renal
                </label>
                <label style={checkboxLabel}>
                    <input type="checkbox" name="antecedentesFamiliares" checked={form.antecedentesFamiliares} onChange={handleChange} /> Antecedentes Familiares
                </label>
            </div>
        </>
    );

    const renderStep4 = () => (
        <>
            <h3 style={stepTitle}>⚖️ Estilo de Vida</h3>
            <div style={row}>
                <div style={{ ...formGroup, width: "48%" }}>
                    <label style={label}>Peso (kg)</label>
                    <input style={input} type="number" name="peso" value={form.peso} onChange={handleChange} />
                </div>
                <div style={{ ...formGroup, width: "48%" }}>
                    <label style={label}>Altura (cm)</label>
                    <input style={input} type="number" name="altura" value={form.altura} onChange={handleChange} />
                </div>
            </div>
            <div style={formGroup}>
                <label style={label}>Actividad Física</label>
                <select style={input} name="actividadFisica" value={form.actividadFisica} onChange={handleChange}>
                    <option value="Sedentario">Sedentario (Poco o nada)</option>
                    <option value="Ligera">Ligera (1-2 veces/sem)</option>
                    <option value="Moderada">Moderada (3-5 veces/sem)</option>
                    <option value="Intensa">Intensa (Atleta)</option>
                </select>
            </div>
            <div style={row}>
                <div style={{ ...formGroup, width: "48%" }}>
                    <label style={label}>Alcohol</label>
                    <select style={input} name="alcohol" value={form.alcohol} onChange={handleChange}>
                        <option value="Nunca">Nunca</option>
                        <option value="Ocasional">Ocasional</option>
                        <option value="Frecuente">Frecuente</option>
                    </select>
                </div>
                <div style={{ ...formGroup, width: "48%", display: "flex", alignItems: "center" }}>
                    <label style={checkboxLabel}>
                        <input type="checkbox" name="fumador" checked={form.fumador} onChange={handleChange} /> ¿Fumas?
                    </label>
                </div>
            </div>
        </>
    );

    const renderStep5 = () => (
        <>
            <h3 style={stepTitle}>🆘 Cuidador / Emergencia</h3>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
                Persona a contactar si Glucobot detecta una anomalía grave.
            </p>
            <div style={formGroup}>
                <label style={label}>Nombre Completo</label>
                <input style={input} name="emergenciaNombre" value={form.emergenciaNombre} onChange={handleChange} />
            </div>
            <div style={formGroup}>
                <label style={label}>Teléfono</label>
                <input style={input} type="tel" name="emergenciaTelefono" placeholder="+56 9..." value={form.emergenciaTelefono} onChange={handleChange} />
            </div>
            <div style={formGroup}>
                <label style={label}>Relación</label>
                <input style={input} name="emergenciaRelacion" placeholder="Ej: Madre, Pareja, Amigo" value={form.emergenciaRelacion} onChange={handleChange} />
            </div>
        </>
    );

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#F0F4FF",
            padding: "20px",
            position: "relative"
        }}>
            <NeuralBackground opacity={0.3} />

            <div style={{
                background: "white",
                padding: "30px",
                borderRadius: "24px",
                width: "100%",
                maxWidth: "500px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                zIndex: 10,
                position: "relative" // For navigation buttons
            }}>
                <h1 style={{ fontSize: "24px", margin: "0 0 5px", color: "#1F2937", textAlign: "center" }}>
                    Configuración de Salud
                </h1>

                <p style={{ textAlign: "center", color: "#6B7280", fontSize: "14px", marginBottom: "20px" }}>
                    Paso {step} de 5
                </p>

                <StepIndicator currentStep={step} totalSteps={5} />

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}

                <div style={footer}>
                    {step > 1 ? (
                        <button onClick={prevStep} style={secondaryBtn}>Atrás</button>
                    ) : (
                        <div /> // Spacer
                    )}

                    {step < 5 ? (
                        <button onClick={nextStep} style={primaryBtn}>Siguiente</button>
                    ) : (
                        <button onClick={handleSave} style={primaryBtn}>Finalizar Configuración</button>
                    )}
                </div>
            </div>
        </div>
    );
}

const formGroup: React.CSSProperties = { marginBottom: "15px" };
const label: React.CSSProperties = { display: "block", marginBottom: "5px", fontWeight: "500", color: "#374151", fontSize: "14px" };
const input: React.CSSProperties = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "16px", background: "#F9FAFB", boxSizing: "border-box" };
const stepTitle: React.CSSProperties = { fontSize: "18px", color: "#1F4FFF", margin: "0 0 15px", borderBottom: "1px solid #EEE", paddingBottom: "10px" };
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between" };

const checkboxGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" };
const checkboxLabel: React.CSSProperties = { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#4B5563", cursor: "pointer" };

const footer: React.CSSProperties = { display: "flex", justifyContent: "space-between", marginTop: "30px" };

const primaryBtn: React.CSSProperties = { padding: "12px 24px", borderRadius: "12px", background: "#1F4FFF", color: "white", fontSize: "16px", fontWeight: "bold", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(31, 79, 255, 0.3)" };
const secondaryBtn: React.CSSProperties = { padding: "12px 24px", borderRadius: "12px", background: "white", color: "#6B7280", fontSize: "16px", fontWeight: "bold", border: "1px solid #E5E7EB", cursor: "pointer" };
