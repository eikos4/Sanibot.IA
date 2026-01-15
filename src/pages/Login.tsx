import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/Toast";

// Simple local user storage
const LOCAL_USERS_KEY = "glucobot_users";

interface LocalUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "patient" | "caretaker";
}

const getLocalUsers = (): LocalUser[] => {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
};

export default function Login() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = () => {
        if (!form.email.trim() || !form.password) {
            toast("Ingresa correo y contraseña", "error");
            return;
        }

        setIsLoading(true);

        const users = getLocalUsers();
        const user = users.find(
            u => u.email.toLowerCase() === form.email.toLowerCase() && u.password === form.password
        );

        if (!user) {
            toast("Correo o contraseña incorrectos", "error");
            setIsLoading(false);
            return;
        }

        // Save current user
        localStorage.setItem("glucobot_current_user", JSON.stringify(user));

        toast(`¡Bienvenido, ${user.name}!`, "success");

        // Redirect based on role
        setTimeout(() => {
            if (user.role === "patient") {
                navigate("/home");
            } else if (user.role === "caretaker") {
                navigate("/caretaker");
            } else {
                navigate("/home");
            }
        }, 500);
    };

    return (
        <div style={container}>
            <div style={card}>
                <h1 style={title}>Iniciar Sesión</h1>
                <p style={subtitle}>Bienvenido de vuelta a Glucobot</p>

                <div style={fieldGroup}>
                    <label style={label}>Correo Electrónico</label>
                    <input
                        style={input}
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>

                <div style={fieldGroup}>
                    <label style={label}>Contraseña</label>
                    <input
                        style={input}
                        name="password"
                        type="password"
                        placeholder="••••••"
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>

                <button
                    style={{ ...btn, opacity: isLoading ? 0.7 : 1 }}
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? "Entrando..." : "Entrar"}
                </button>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button onClick={() => navigate("/register")} style={linkBtn}>
                        ¿No tienes cuenta? <span style={{ color: "#2563EB" }}>Regístrate</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Styles
const container: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px"
};

const card: React.CSSProperties = {
    background: "white",
    padding: "40px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
};

const title: React.CSSProperties = {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1F2937",
    margin: "0 0 5px",
    textAlign: "center"
};

const subtitle: React.CSSProperties = {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: "30px"
};

const fieldGroup: React.CSSProperties = {
    marginBottom: "16px"
};

const label: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px"
};

const input: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #D1D5DB",
    fontSize: "16px",
    backgroundColor: "#F9FAFB",
    boxSizing: "border-box"
};

const btn: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    backgroundColor: "#7C3AED",
    color: "white",
    border: "none",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px"
};

const linkBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#6B7280",
    cursor: "pointer",
    fontSize: "14px"
};
