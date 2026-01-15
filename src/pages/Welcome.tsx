import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NeuralBackground from "../components/NeuralBackground";

export default function Welcome() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      // Calculate normalized position -1 to 1
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      style={containerStyle}
    >
      {/* 🌌 Dynamic Background */}
      <div style={bgGradientStyle} />
      <NeuralBackground opacity={0.3} />

      {/* ✨ Floating Elements (Parallax) */}
      <div style={{
        ...orbStyle,
        top: "20%",
        left: "20%",
        background: "rgba(31, 79, 255, 0.2)",
        transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`
      }} />
      <div style={{
        ...orbStyle,
        bottom: "10%",
        right: "10%",
        background: "rgba(6, 182, 212, 0.2)",
        transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`
      }} />

      {/* 🤖 Hero Content */}
      <div style={{
        ...contentWrapperStyle,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(50px)"
      }}>

        {/* Animated Robot */}
        <div style={{
          ...robotContainerStyle,
          transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px) rotate(${mousePos.x * 5}deg)`
        }}>
          <div style={robotGlowStyle} />
          <img
            src="/robot.png"
            alt="SanniBot"
            style={robotImageStyle}
          />
        </div>

        <h1 style={titleStyle}>
          Hola, soy <br />
          <span style={gradientTextStyle}>SanniBot.IA</span>
        </h1>

        <p style={subtitleStyle}>
          Tu asistente de salud personal más avanzado.
          <br />
          Inteligencia artificial para cuidar de ti cada día.
        </p>

        {/* 🚀 Glassmorphism Card Actions */}
        <div style={actionsCardStyle}>
          <button
            onClick={() => navigate("/register")}
            style={primaryBtnStyle}
          >
            Comenzar Ahora
            <span style={arrowStyle}>→</span>
          </button>

          <button
            onClick={() => navigate("/login")}
            style={secondaryBtnStyle}
          >
            Ya tengo cuenta
          </button>
        </div>

      </div>

      <footer style={footerStyle}>
        <div style={footerBlurStyle} />
        <p style={{ margin: "0 0 5px 0" }}>© {new Date().getFullYear()} Leucode.IA — Todos los derechos reservados</p>
        <div>
          <a href="https://indepsalud.cl" target="_blank" style={linkStyle}>indepsalud.cl</a>
          <span style={{ margin: "0 8px" }}>|</span>
          <a href="https://leucode.cl" target="_blank" style={linkStyle}>leucode.cl</a>
        </div>
      </footer>

      <style>{`
        @keyframes border-pulse {
          0% { border-color: rgba(31, 79, 255, 0.3); }
          50% { border-color: rgba(6, 182, 212, 0.6); }
          100% { border-color: rgba(31, 79, 255, 0.3); }
        }
        @keyframes float-hero {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

// --- STYLES ---

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "#F8FAFC",
  fontFamily: "'Inter', sans-serif"
};

const bgGradientStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(circle at 50% 120%, #e0f2fe 0%, #f0f9ff 50%, #ffffff 100%)",
  zIndex: 0
};

const orbStyle: React.CSSProperties = {
  position: "absolute",
  width: "300px",
  height: "300px",
  borderRadius: "50%",
  filter: "blur(80px)",
  zIndex: 1,
  transition: "transform 0.1s ease-out"
};

const contentWrapperStyle: React.CSSProperties = {
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
  padding: "20px"
};

const robotContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "220px",
  marginBottom: "30px",
  transition: "transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)",
  animation: "float-hero 6s ease-in-out infinite"
};

const robotImageStyle: React.CSSProperties = {
  width: "100%",
  height: "auto",
  filter: "drop-shadow(0 20px 40px rgba(31, 79, 255, 0.25))",
  position: "relative",
  zIndex: 2
};

const robotGlowStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "180px",
  height: "180px",
  background: "radial-gradient(circle, rgba(6,182,212,0.5) 0%, rgba(255,255,255,0) 70%)",
  borderRadius: "50%",
  zIndex: 1,
  filter: "blur(30px)"
};

const titleStyle: React.CSSProperties = {
  fontSize: "48px",
  fontWeight: "900",
  lineHeight: "1.1",
  margin: "0 0 16px",
  color: "#1E293B",
  letterSpacing: "-1.5px"
};

const gradientTextStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #1F4FFF 0%, #06B6D4 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  display: "inline-block"
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "18px",
  color: "#64748B",
  maxWidth: "400px",
  lineHeight: "1.6",
  margin: "0 0 40px"
};

const actionsCardStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(20px)",
  padding: "20px",
  borderRadius: "24px",
  border: "1px solid rgba(255, 255, 255, 0.8)",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  width: "100%",
  maxWidth: "320px",
  boxShadow: "0 20px 40px rgba(31, 79, 255, 0.1)"
};

const primaryBtnStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #1F4FFF 0%, #06B6D4 100%)",
  color: "white",
  border: "none",
  padding: "16px",
  borderRadius: "16px",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxShadow: "0 10px 20px rgba(31, 79, 255, 0.25)",
  transition: "transform 0.2s"
};

const secondaryBtnStyle: React.CSSProperties = {
  background: "white",
  color: "#1F4FFF",
  border: "2px solid rgba(31, 79, 255, 0.1)",
  padding: "15px",
  borderRadius: "16px",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "background 0.2s"
};

const arrowStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "400"
};

const footerStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "20px",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
  color: "#94A3B8",
  zIndex: 10
};

const footerBlurStyle: React.CSSProperties = {
  position: "absolute",
  inset: "-10px",
  background: "rgba(255,255,255,0.5)",
  backdropFilter: "blur(5px)",
  zIndex: -1,
  borderRadius: "20px"
};

const linkStyle: React.CSSProperties = {
  color: "#1F4FFF",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "13px"
};
