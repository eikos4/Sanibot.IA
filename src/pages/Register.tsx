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

  const handleRegister = () => {
    // Validation
    if (!form.name.trim()) {
      toast("El nombre es obligatorio", "error");
      return;
    }
    if (!form.email.trim()) {
      toast("El correo es obligatorio", "error");
      return;
    }
    if (form.password.length < 4) {
      toast("La contraseña debe tener al menos 4 caracteres", "error");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast("Las contraseñas no coinciden", "error");
      return;
    }

    setIsLoading(true);

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
    <div style={container}>
      <div style={card}>
        <h1 style={title}>Crear Cuenta</h1>
        <p style={subtitle}>Registro rápido para Glucobot</p>

        <div style={fieldGroup}>
          <label style={label}>Tipo de Usuario</label>
          <select style={input} name="role" value={form.role} onChange={handleChange}>
            <option value="patient">Paciente</option>
            <option value="caretaker">Cuidador</option>
          </select>
        </div>

        <div style={fieldGroup}>
          <label style={label}>Nombre Completo</label>
          <input
            style={input}
            name="name"
            placeholder="Juan Pérez"
            value={form.name}
            onChange={handleChange}
          />
        </div>

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

        <div style={row}>
          <div style={{ flex: 1 }}>
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
          <div style={{ flex: 1 }}>
            <label style={label}>Confirmar</label>
            <input
              style={input}
              name="confirmPassword"
              type="password"
              placeholder="••••••"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          style={{ ...btn, opacity: isLoading ? 0.7 : 1 }}
          onClick={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? "Creando..." : "Crear Cuenta"}
        </button>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={() => navigate("/login")} style={linkBtn}>
            ¿Ya tienes cuenta? <span style={{ color: "#2563EB" }}>Inicia sesión</span>
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

const row: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  marginBottom: "16px"
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
