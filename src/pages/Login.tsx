import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/Toast";
import NeuralBackground from "../components/NeuralBackground";
import { login, loginWithGoogle } from "../services/authService";

export default function Login() {
    const navigate = useNavigate();
    const { toast } = useToast();
    // const { refreshUser } = useAuth(); // Not used directly here anymore // AuthContext should also be listening to firebase

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async () => {
        if (!form.email.trim() || !form.password) {
            toast("Ingresa correo y contraseña", "error");
            return;
        }

        setIsLoading(true);

        try {
            const user = await login(form.email, form.password);

            if (user) {
                toast(`¡Bienvenido, ${user.name || "Usuario"}!`, "success");
                navigate("/home");
            } else {
                toast("Correo o contraseña incorrectos", "error");
            }
        } catch (e) {
            console.error(e);
            toast("Error al iniciar sesión", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await loginWithGoogle();
            if (result.user) {
                toast(`¡Bienvenido, ${result.user.name}!`, "success");
                navigate("/home");
            } else {
                toast(result.error || "Error con Google", "error");
            }
        } catch (e) {
            console.error(e);
            toast("Error inesperado con Google", "error");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={containerStyle}>
            {/* BACKGROUND LAYERS */}
            <div style={bgGradientStyle} />
            <NeuralBackground opacity={0.4} />

            {/* FLOATING ROBOT (Decorative) */}
            <div style={{
                ...robotContainerStyle,
                transform: mounted ? "translateY(0) rotate(0deg)" : "translateY(50px) rotate(-5deg)",
                opacity: mounted ? 1 : 0
            }}>
                <img
                    src="/robot.png"
                    alt="SanniBot"
                    style={robotImageStyle}
                />
                {/* Glow effect behind robot */}
                <div style={robotGlowStyle} />
            </div>

            {/* LOGIN CARD */}
            <div style={{
                ...cardStyle,
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                opacity: mounted ? 1 : 0
            }}>

                {/* Card Header */}
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <h1 style={titleStyle}>
                        <span style={{ color: "#1F4FFF" }}>Sanni</span>Bot
                        <span style={{ color: "#06B6D4" }}>.AI</span>
                    </h1>
                    <p style={subtitleStyle}>Tu asistente de salud inteligente</p>
                </div>

                {/* Form Fields */}
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Correo Electrónico</label>
                    <div style={inputWrapperStyle}>
                        <span style={iconStyle}>✉️</span>
                        <input
                            style={inputStyle}
                            name="email"
                            type="email"
                            placeholder="tu@correo.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Contraseña</label>
                    <div style={inputWrapperStyle}>
                        <span style={iconStyle}>🔒</span>
                        <input
                            style={inputStyle}
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>
                </div>

                {/* Actions */}
                <button
                    style={{
                        ...buttonStyle,
                        opacity: isLoading ? 0.8 : 1,
                        transform: isLoading ? "scale(0.98)" : "scale(1)"
                    }}
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="loader">⌛</span> Entrando...
                        </span>
                    ) : (
                        "Iniciar Sesión"
                    )}
                </button>

                <button
                    onClick={handleGoogleLogin}
                    style={{
                        ...googleBtnStyle,
                        opacity: isLoading ? 0.6 : 1
                    }}
                    disabled={isLoading}
                >
                    <span style={{ marginRight: "10px", fontSize: "18px" }}>G</span> Continuar con Google
                </button>

                <div style={{ textAlign: "center", marginTop: "25px" }}>
                    <p style={{ color: "#6B7280", fontSize: "14px" }}>
                        ¿Aún no tienes cuenta?
                    </p>
                    <button onClick={() => navigate("/register")} style={linkStyle}>
                        Crear cuenta nueva
                    </button>
                </div>

            </div>

            <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.2); }
          50% { box-shadow: 0 0 50px rgba(6, 182, 212, 0.5); }
          100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.2); }
        }
      `}</style>
        </div>
    );
}

// --- STYLES ---

const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif"
};

const bgGradientStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 50% 120%, #e0f2fe 0%, #f0f9ff 40%, #ffffff 100%)",
    zIndex: -1
};

const robotContainerStyle: React.CSSProperties = {
    position: "absolute",
    top: "10%",
    right: "10%",
    width: "300px",
    height: "300px",
    zIndex: 0,
    transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
    animation: "float 6s ease-in-out infinite",
    display: "flex", // Centering for glow
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none"
};

const robotImageStyle: React.CSSProperties = {
    width: "100%",
    height: "auto",
    filter: "drop-shadow(0 20px 30px rgba(31, 79, 255, 0.3))",
    zIndex: 2,
    position: "relative"
};

const robotGlowStyle: React.CSSProperties = {
    position: "absolute",
    width: "200px",
    height: "200px",
    background: "radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(31,79,255,0) 70%)",
    borderRadius: "50%",
    zIndex: 1,
    filter: "blur(40px)",
    animation: "pulse-glow 3s infinite"
};


const cardStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 10,
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    borderRadius: "32px",
    padding: "48px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
    transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
    display: "flex",
    flexDirection: "column"
};

const titleStyle: React.CSSProperties = {
    fontSize: "36px",
    fontWeight: "800",
    margin: "0",
    letterSpacing: "-1px"
};

const subtitleStyle: React.CSSProperties = {
    fontSize: "15px",
    color: "#64748B",
    marginTop: "8px",
    fontWeight: "500"
};

const inputGroupStyle: React.CSSProperties = {
    marginBottom: "20px"
};

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
};

const inputWrapperStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center"
};

const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: "16px",
    zIndex: 10,
    fontSize: "18px",
    color: "#94A3B8"
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px 16px 16px 48px",
    borderRadius: "16px",
    border: "2px solid #E2E8F0",
    background: "rgba(255, 255, 255, 0.8)",
    fontSize: "16px",
    color: "#1E293B",
    outline: "none",
    transition: "all 0.2s",
    fontWeight: "500"
};

const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "18px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #1F4FFF 0%, #06B6D4 100%)",
    color: "white",
    border: "none",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 10px 25px -5px rgba(31, 79, 255, 0.4)",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const googleBtnStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px",
    borderRadius: "16px",
    background: "white",
    color: "#374151",
    border: "1px solid #E5E7EB",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s"
}

const linkStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#1F4FFF",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "5px",
    textDecoration: "underline",
    textUnderlineOffset: "4px"
};
