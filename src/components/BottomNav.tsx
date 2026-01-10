import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const nav = [
    { path: "/home", label: "Inicio", icon: "🏠" },
    { path: "/medicines", label: "Medicinas", icon: "💊" },
    { path: "/glucose", label: "Glicemia", icon: "🩸" },
    { path: "/robot", label: "GlucoBot", icon: "🤖" },
    { path: "/profile", label: "Perfil", icon: "👤" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "#FFFFFF",
        borderTop: "1px solid #ddd",
        height: "70px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      {nav.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            background: "transparent",
            border: "none",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: location.pathname === item.path ? "#1F4FFF" : "#666",
            fontSize: location.pathname === item.path ? "22px" : "20px",
            fontWeight: location.pathname === item.path ? "bold" : "normal",
            cursor: "pointer",
          }}
        >
          <span>{item.icon}</span>
          <small style={{ fontSize: "12px", marginTop: "5px" }}>
            {item.label}
          </small>
        </button>
      ))}
    </div>
  );
}
