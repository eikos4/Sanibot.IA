import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { savePatientData } from "../services/patientStorage";
import NeuralBackground from "../components/NeuralBackground";

export default function Onboarding() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        edad: "",
        tipoDiabetes: "",
        tipoSangre: "",
        peso: "",
        altura: "",
        genero: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!form.edad || !form.tipoDiabetes) {
            alert("Por favor completa al menos la edad y el tipo de diabetes.");
            return;
        }

        await savePatientData(form);
        navigate("/home");
    };

    if (!user) return <div style={{ padding: 20 }}>Cargando sesión...</div>;

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
                maxWidth: "450px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                zIndex: 10
            }}>
                <h1 style={{ fontSize: "24px", marginBottom: "10px", color: "#1F2937" }}>
                    ¡Hola, {user.name}! 👋
                </h1>
                <p style={{ color: "#6B7280", marginBottom: "25px" }}>
                    Para personalizar tu experiencia, necesitamos unos pocos datos más.
                </p>

                <div style={formGroup}>
                    <label style={label}>Tu Edad</label>
                    <input style={input} type="number" name="edad" placeholder="Ej: 35" onChange={handleChange} />
                </div>

                <div style={formGroup}>
                    <label style={label}>Tipo de Diabetes</label>
                    <select style={input} name="tipoDiabetes" onChange={handleChange}>
                        <option value="">Seleccionar...</option>
                        <option value="Tipo 1">Tipo 1</option>
                        <option value="Tipo 2">Tipo 2</option>
                        <option value="Gestacional">Gestacional</option>
                        <option value="Prediabetes">Prediabetes</option>
                    </select>
                </div>

                <div style={formGroup}>
                    <label style={label}>Tipo de Sangre (Opcional)</label>
                    <select style={input} name="tipoSangre" onChange={handleChange}>
                        <option value="">Seleccionar...</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                    </select>
                </div>

                <button onClick={handleSave} style={primaryBtn}>
                    Comenzar
                </button>
            </div>
        </div>
    );
}

const formGroup: React.CSSProperties = {
    marginBottom: "15px"
};

const label: React.CSSProperties = {
    display: "block",
    marginBottom: "5px",
    fontWeight: "500",
    color: "#374151",
    fontSize: "14px"
};

const input: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    fontSize: "16px",
    background: "#F9FAFB"
};

const primaryBtn: React.CSSProperties = {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    background: "#1F4FFF",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    marginTop: "20px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(31, 79, 255, 0.3)"
};
