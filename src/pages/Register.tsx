import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/Toast";
import NeuralBackground from "../components/NeuralBackground";

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

const saveLocalUser = (user: LocalUser): boolean => {
  const users = getLocalUsers();
  if (users.find(u => u.email === user.email)) {
    return false; // Already exists
  }
  users.push(user);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  return true;
};

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient" as "patient" | "caretaker"
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    // Validation
    if (!form.name.trim()) return toast("El nombre es obligatorio", "error");
    if (!form.email.trim()) return toast("El correo es obligatorio", "error");
    if (form.password.length < 4) return toast("La contraseña debe tener al menos 4 caracteres", "error");
    if (form.password !== form.confirmPassword) return toast("Las contraseñas no coinciden", "error");

    setIsLoading(true);
    // Simular delay
    await new Promise(r => setTimeout(r, 800));

    // Create user
    const newUser: LocalUser = {
      id: Date.now().toString(),
      name: form.name,
      email: form.email.toLowerCase(),
      password: form.password,
      role: form.role
    };

    const success = saveLocalUser(newUser);

    if (!success) {
      toast("Este correo ya está registrado", "error");
      setIsLoading(false);
      return;
    }

    // Auto-login
    localStorage.setItem("glucobot_current_user", JSON.stringify(newUser));

    toast("¡Cuenta creada con éxito!", "success");

    // Redirect
    setTimeout(() => {
      if (form.role === "patient") {
        navigate("/welcome-call");
      } else {
        navigate("/caretaker");
      }
    }, 500);
  };

  return (
    <div style={containerStyle}>
      {/* BACKGROUND LAYERS */}
      <div style={bgGradientStyle} />
      <NeuralBackground opacity={0.3} />

      <div style={{
        ...cardStyle,
        transform: mounted ? "translateY(0)" : "translateY(30px)",
        opacity: mounted ? 1 : 0
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={titleStyle}>Crear Cuenta</h1>
          <p style={subtitleStyle}>Únete a <span style={{ color: "#1F4FFF", fontWeight: "bold" }}>SanniBot</span></p>
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Soy...</label>
          <div style={selectWrapperStyle}>
            <select style={selectStyle} name="role" value={form.role} onChange={handleChange}>
              <option value="patient">Paciente</option>
              <option value="caretaker">Cuidador</option>
            </select>
            <span style={selectArrowStyle}>▼</span>
          </div>
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Nombre Completo</label>
          <input
            style={inputStyle}
            name="name"
            placeholder="Juan Pérez"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Correo Electrónico</label>
          <input
            style={inputStyle}
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div style={row}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Contraseña</label>
            <input
              style={inputStyle}
              name="password"
              type="password"
              placeholder="••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Confirmar</label>
            <input
              style={inputStyle}
              name="confirmPassword"
              type="password"
              placeholder="••••••"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          style={{ ...btnStyle, opacity: isLoading ? 0.7 : 1 }}
          onClick={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? "Creando..." : "Crear Cuenta"}
        </button>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={() => navigate("/login")} style={linkBtnStyle}>
            ¿Ya tienes cuenta? <span style={{ color: "#1F4FFF", fontWeight: "bold" }}>Inicia sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Styles
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
  background: "radial-gradient(circle at 50% -20%, #eff6ff 0%, #f0f9ff 40%, #ffffff 100%)",
  zIndex: -1
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 10,
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  borderRadius: "24px",
  padding: "40px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 20px 60px -10px rgba(0, 0, 0, 0.08)",
  transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)"
};

const titleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#1F2937",
  margin: "0 0 5px",
  letterSpacing: "-0.5px"
};

const subtitleStyle: React.CSSProperties = {
  color: "#6B7280",
  fontSize: "15px"
};

const fieldGroup: React.CSSProperties = {
  marginBottom: "16px"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: "700",
  color: "#374151",
  marginBottom: "6px",
  textTransform: "uppercase"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "2px solid #E5E7EB",
  fontSize: "16px",
  backgroundColor: "rgba(255,255,255,0.6)",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.2s"
};

const selectWrapperStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center"
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none"
};

const selectArrowStyle: React.CSSProperties = {
  position: "absolute",
  right: "15px",
  pointerEvents: "none",
  color: "#6B7280",
  fontSize: "12px"
};

const row: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  marginBottom: "20px"
};

const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #1F4FFF 0%, #06B6D4 100%)",
  color: "white",
  border: "none",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
  marginTop: "10px",
  boxShadow: "0 8px 20px -5px rgba(31, 79, 255, 0.3)",
  transition: "transform 0.1s"
};

const linkBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#6B7280",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500"
};
