import { useNavigate } from "react-router-dom";
import NeuralBackground from "../components/NeuralBackground";
import SimulatedCall from "../components/SimulatedCall";
import { useState, useEffect } from "react";

export default function RegisterComplete() {
  const navigate = useNavigate();
  const [showCall, setShowCall] = useState(false);
  const [userName, setUserName] = useState("Paciente");

  useEffect(() => {
    // Recuperar nombre del usuario (si existe)
    const user = JSON.parse(localStorage.getItem("glucobot_current_user") || "{}");
    if (user.name) setUserName(user.name);

    // Activar llamada después de 1 segundo
    const timer = setTimeout(() => {
      setShowCall(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "20px",
        background: "#F0F4FF",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <NeuralBackground opacity={0.5} />

      {showCall && (
        <SimulatedCall
          userName={userName}
          onEndCall={() => setShowCall(false)}
        />
      )}

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
          src="/robot.png"
          alt="GlucoBot"
          style={{
            width: "150px",
            marginBottom: "20px",
            animation: "float 3s ease-in-out infinite",
          }}
        />

        <h2 style={{ fontSize: "28px", marginBottom: "10px", color: "#1F2937" }}>
          ¡Registro Completado!
        </h2>

        <p
          style={{
            maxWidth: "300px",
            fontSize: "16px",
            color: "#6B7280",
            marginBottom: "30px",
            margin: "0 auto 30px"
          }}
        >
          Tu ficha clínica está lista.
          A partir de ahora  SanniBot.IA te acompañará todos los días.
        </p>

        <button
          style={{
            padding: "15px 40px",
            fontSize: "18px",
            background: "#1F4FFF",
            borderRadius: "12px",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            width: "100%",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(31, 79, 255, 0.3)"
          }}
          onClick={() => navigate("/home")}
        >
          Ir al Inicio
        </button>
      </div>

      <style>
        {`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        `}
      </style>
    </div>
  );
}
