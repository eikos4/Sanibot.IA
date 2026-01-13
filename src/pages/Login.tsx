import { useState, useEffect } from "react";
import NeuralBackground from "../components/NeuralBackground";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [rut, setRut] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [role, setRole] = useState<"patient" | "caretaker">("patient");
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const savedCreds = localStorage.getItem("glucobot_saved_credentials");
        if (savedCreds) {
            const { rut, password, remember } = JSON.parse(savedCreds);
            if (remember) {
                setRut(rut);
                setPassword(password);
                setRememberMe(true);
            }
        }
    }, []);

    const handleLogin = async () => {
        if (!rut || !password) {
            setError("Por favor ingresa RUT y contraseña");
            return;
        }

        setLoading(true);
        setError("");

        const currentUser = await login(rut, password);
        setLoading(false);

        if (currentUser) {
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

            // Guardar o limpiar credenciales
            if (rememberMe) {
                localStorage.setItem("glucobot_saved_credentials", JSON.stringify({ rut, password, remember: true }));
            } else {
                localStorage.removeItem("glucobot_saved_credentials");
            }
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
            background: "#F0F4FF",
            padding: "20px",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* 🔵 Shapes Animados (Background) */}
            <NeuralBackground opacity={0.5} />

            <div style={{
                background: "white",
                padding: "40px",
                borderRadius: "24px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                width: "100%",
                maxWidth: "400px",
                textAlign: "center",
                position: "relative",
                zIndex: 10
            }}>
                <img
                    src="/logo.png"
                    alt="Leucode.IA"
                    style={{
                        height: "80px",
                        marginBottom: "16px",
                        objectFit: "contain"
                    }}
                />
                <h1 style={{ marginBottom: "8px", color: "#1F2937" }}>Bienvenido</h1>
                <p style={{ color: "#6B7280", marginBottom: "20px" }}>Ingresa a tu cuenta SanniBot.IA</p>

                {/* BOTÓN GOOGLE */}
                <button
                    onClick={async () => {
                        // Login logic
                        const user = await loginWithGoogle();
                        if (user) {
                            if (!user.profileCompleted && user.role === 'patient') {
                                navigate("/onboarding");
                                return;
                            }

                            if (user.role === 'admin') navigate("/admin");
                            else if (user.role === 'caretaker') navigate("/caretaker");
                            else navigate("/home");
                        }
                    }}
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "20px",
                        borderRadius: "12px",
                        border: "1px solid #E5E7EB",
                        background: "white",
                        color: "#374151",
                        fontSize: "15px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                    }}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google" />
                    Continuar con Google
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "#9CA3AF" }}>
                    <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }}></div>
                    <span style={{ fontSize: "14px" }}>o ingresa con</span>
                    <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }}></div>
                </div>

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
                        placeholder="RUT o Email"
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
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-start" }}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{
                                width: "18px",
                                height: "18px",
                                cursor: "pointer",
                                accentColor: "#1F4FFF"
                            }}
                        />
                        <label htmlFor="rememberMe" style={{ color: "#6B7280", fontSize: "14px", cursor: "pointer", userSelect: "none" }}>
                            Recordar contraseña
                        </label>
                    </div>
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

            <div style={{
                marginTop: "24px",
                color: "#6B7280",
                fontSize: "12px",
                fontWeight: "500",
                letterSpacing: "0.5px"
            }}>
                BY LEUCODE.IA ®
            </div>
            {/* Z-Index fix for footer */}
            <div style={{
                position: "relative",
                zIndex: 10
            }}></div>
        </div>
    );
}
