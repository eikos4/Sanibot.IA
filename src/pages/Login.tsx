import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [rut, setRut] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [role, setRole] = useState<"patient" | "caretaker">("patient");

    const handleLogin = async () => {
        if (!rut || !password) {
            setError("Por favor ingresa RUT y contraseña");
            return;
        }

        setLoading(true);
        setError("");

        const success = await login(rut, password);
        setLoading(false);

        if (success) {
            // Recuperamos el usuario guardado para validar el rol
            // @ts-ignore
            const currentUser = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");

            // Validación estricta de rol
            if (currentUser.role !== role && currentUser.role !== 'admin') {
                if (currentUser.role === 'caretaker' && role === 'patient') {
                    setError("Esta cuenta es de Cuidador. Por favor cambia la selección arriba.");
                    return;
                }
                if (currentUser.role === 'patient' && role === 'caretaker') {
                    setError("Esta cuenta es de Paciente. Por favor cambia la selección arriba.");
                    return;
                }
            }

            // Redirección
            if (currentUser.role === 'admin') navigate("/admin");
            else if (currentUser.role === 'caretaker') navigate("/caretaker");
            else navigate("/home");
        } else {
            setError("Credenciales incorrectas");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #F0F4FF 0%, #E8ECFF 100%)",
            padding: "20px"
        }}>
            <div style={{
                background: "white",
                padding: "40px",
                borderRadius: "24px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                width: "100%",
                maxWidth: "400px",
                textAlign: "center"
            }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🩺</div>
                <h1 style={{ marginBottom: "8px", color: "#1F2937" }}>Bienvenido</h1>
                <p style={{ color: "#6B7280", marginBottom: "32px" }}>Ingresa a tu cuenta GlucoBot</p>

                {/* SELECTOR DE ROL */}
                <div style={{ display: "flex", background: "#F3F4F6", padding: "4px", borderRadius: "12px", marginBottom: "20px" }}>
                    <button
                        onClick={() => setRole("patient")}
                        style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            border: "none",
                            background: role === "patient" ? "white" : "transparent",
                            color: role === "patient" ? "#1F4FFF" : "#6B7280",
                            fontWeight: "bold",
                            boxShadow: role === "patient" ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        Soy Paciente
                    </button>
                    <button
                        onClick={() => setRole("caretaker")}
                        style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            border: "none",
                            background: role === "caretaker" ? "white" : "transparent",
                            color: role === "caretaker" ? "#1F4FFF" : "#6B7280",
                            fontWeight: "bold",
                            boxShadow: role === "caretaker" ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        Soy Cuidador
                    </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <input
                        type="text"
                        placeholder="RUT"
                        value={rut}
                        onChange={(e) => setRut(e.target.value)}
                        style={{
                            padding: "15px",
                            borderRadius: "12px",
                            border: "1px solid #E5E7EB",
                            fontSize: "16px"
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            padding: "15px",
                            borderRadius: "12px",
                            border: "1px solid #E5E7EB",
                            fontSize: "16px"
                        }}
                    />

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        style={{
                            padding: "15px",
                            borderRadius: "12px",
                            background: "#1F4FFF",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "bold",
                            border: "none",
                            cursor: loading ? "wait" : "pointer",
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>

                    <div style={{ marginTop: "10px", borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}>
                        <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>¿No tienes cuenta?</p>
                        <button
                            style={{
                                padding: "12px",
                                background: "white",
                                color: "#1F4FFF",
                                border: "1px solid #1F4FFF",
                                borderRadius: "12px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                width: "100%"
                            }}
                            onClick={() => navigate("/register")}
                        >
                            Crear nueva cuenta
                        </button>
                    </div>
                </div>

                {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}
            </div>
        </div>
    );
}
