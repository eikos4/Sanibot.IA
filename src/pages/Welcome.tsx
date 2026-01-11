import { useNavigate } from "react-router-dom";
import NeuralBackground from "../components/NeuralBackground";

export default function Welcome() {
  const navigate = useNavigate();
  /* Animation logic moved to NeuralBackground */

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        textAlign: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🔵 FONDO RED NEURONAL */}
      <NeuralBackground />

      {/* CONTENIDO */}
      <div style={{ zIndex: 2 }}>
        <img
          src="/robot.png"
          alt="GlucoBot"
          style={{
            width: "200px",
            marginBottom: "20px",
            animation: "float 3s ease-in-out infinite",
          }}
        />

        <h1
          style={{
            fontSize: "32px",
            marginBottom: "10px",
            color: "#1F1F1F",
          }}
        >
          ¡Hola! Soy SaniBot.IA 🤖
        </h1>

        <p
          style={{
            maxWidth: "300px",
            color: "#444",
            margin: "0 auto",
            fontSize: "16px",
          }}
        >
          Te acompañaré día a día para ayudarte a controlar tu diabetes con
          recordatorios inteligentes y orientación personalizada.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%", maxWidth: "280px", margin: "30px auto 0" }}>
          <button
            style={{
              padding: "15px",
              background: "#1F4FFF",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(31, 79, 255, 0.3)"
            }}
            onClick={() => navigate("/register")}
          >
            Crear Cuenta
          </button>

          <button
            style={{
              padding: "15px",
              background: "white",
              color: "#1F4FFF",
              border: "2px solid #1F4FFF",
              borderRadius: "12px",
              fontSize: "18px",
              cursor: "pointer",
              fontWeight: "600"
            }}
            onClick={() => navigate("/login")}
          >
            Ya tengo cuenta
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer
        style={{
          zIndex: 2,
          marginTop: "40px",
          paddingBottom: "10px",
          color: "#777",
          fontSize: "12px",
        }}
      >
        <p style={{ marginBottom: "4px" }}>
          © {new Date().getFullYear()} Leucode.IA — Todos los derechos reservados
        </p>
        <div>
          <a href="https://indepsalud.cl" target="_blank" style={footerLink}>
            indepsalud.cl
          </a>{" "}
          |{" "}
          <a href="https://leucode.cl" target="_blank" style={footerLink}>
            leucode.cl
          </a>
        </div>
      </footer>

      {/* Animaciones CSS */}
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

const footerLink = {
  color: "#1F4FFF",
  textDecoration: "none",
};
