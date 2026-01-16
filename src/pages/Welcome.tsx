import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NeuralBackground from "../components/NeuralBackground";

export default function Welcome() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || isMobile) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    // Touch parallax for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return;
      const touch = e.touches[0];
      const { innerWidth, innerHeight } = window;
      const x = (touch.clientX / innerWidth) * 2 - 1;
      const y = (touch.clientY / innerHeight) * 2 - 1;
      setMousePos({ x: x * 0.3, y: y * 0.3 }); // Reduced effect on mobile
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMobile]);

  return (
    <div
      ref={containerRef}
      className="welcome-container"
    >
      {/* 🌌 Dynamic Background */}
      <div className="bg-gradient" />
      <NeuralBackground opacity={0.3} />

      {/* ✨ Floating Elements (Parallax) */}
      <div
        className="orb orb-1"
        style={{
          transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`
        }}
      />
      <div
        className="orb orb-2"
        style={{
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`
        }}
      />

      {/* 🤖 Hero Content */}
      <div
        className="content-wrapper"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(50px)"
        }}
      >

        {/* Animated Robot */}
        <div
          className="robot-container"
          style={{
            transform: isMobile
              ? `translate(${mousePos.x * -5}px, ${mousePos.y * -5}px)`
              : `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px) rotate(${mousePos.x * 5}deg)`
          }}
        >
          <div className="robot-glow" />
          <img
            src="/robot.png"
            alt="SanniBot"
            className="robot-image"
          />
        </div>

        <h1 className="title">
          Hola, soy <br />
          <span className="gradient-text">SanniBot.IA</span>
        </h1>

        <p className="subtitle">
          Tu asistente de salud personal más avanzado.
          <br />
          Inteligencia artificial para cuidar de ti cada día.
        </p>

        {/* 🚀 Glassmorphism Card Actions */}
        <div className="actions-card">
          <button
            onClick={() => navigate("/register")}
            className="primary-btn"
          >
            Comenzar Ahora
            <span className="arrow">→</span>
          </button>

          <button
            onClick={() => navigate("/login")}
            className="secondary-btn"
          >
            Ya tengo cuenta
          </button>
        </div>

      </div>

      <footer className="footer">
        <div className="footer-blur" />
        <p>© {new Date().getFullYear()} Leucode.IA — Todos los derechos reservados</p>
        <div className="footer-links">
          <a href="https://indepsalud.cl" target="_blank" rel="noopener noreferrer">indepsalud.cl</a>
          <span>|</span>
          <a href="https://leucode.cl" target="_blank" rel="noopener noreferrer">leucode.cl</a>
        </div>
      </footer>

      <style>{`
        /* ===== BASE STYLES ===== */
        .welcome-container {
          min-height: 100vh;
          min-height: 100dvh; /* Dynamic viewport height for mobile */
          width: 100%;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #F8FAFC;
          font-family: 'Inter', sans-serif;
          padding: 20px;
          box-sizing: border-box;
        }

        .bg-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 120%, #e0f2fe 0%, #f0f9ff 50%, #ffffff 100%);
          z-index: 0;
        }

        /* ===== ORBS ===== */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 1;
          transition: transform 0.1s ease-out;
        }

        .orb-1 {
          top: 20%;
          left: 20%;
          width: 300px;
          height: 300px;
          background: rgba(31, 79, 255, 0.2);
        }

        .orb-2 {
          bottom: 10%;
          right: 10%;
          width: 300px;
          height: 300px;
          background: rgba(6, 182, 212, 0.2);
        }

        /* ===== CONTENT WRAPPER ===== */
        .content-wrapper {
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          padding: 20px;
          width: 100%;
          max-width: 500px;
        }

        /* ===== ROBOT ===== */
        .robot-container {
          position: relative;
          width: 220px;
          margin-bottom: 30px;
          transition: transform 0.2s cubic-bezier(0.2, 0, 0.2, 1);
          animation: float-hero 6s ease-in-out infinite;
        }

        .robot-image {
          width: 100%;
          height: auto;
          filter: drop-shadow(0 20px 40px rgba(31, 79, 255, 0.25));
          position: relative;
          z-index: 2;
        }

        .robot-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(6,182,212,0.5) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          z-index: 1;
          filter: blur(30px);
        }

        /* ===== TYPOGRAPHY ===== */
        .title {
          font-size: 48px;
          font-weight: 900;
          line-height: 1.1;
          margin: 0 0 16px;
          color: #1E293B;
          letter-spacing: -1.5px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #1F4FFF 0%, #06B6D4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
        }

        .subtitle {
          font-size: 18px;
          color: #64748B;
          max-width: 400px;
          line-height: 1.6;
          margin: 0 0 40px;
        }

        /* ===== ACTIONS CARD ===== */
        .actions-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 20px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 320px;
          box-shadow: 0 20px 40px rgba(31, 79, 255, 0.1);
        }

        .primary-btn {
          background: linear-gradient(135deg, #1F4FFF 0%, #06B6D4 100%);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 10px 20px rgba(31, 79, 255, 0.25);
          transition: transform 0.2s, box-shadow 0.2s;
          -webkit-tap-highlight-color: transparent;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(31, 79, 255, 0.3);
        }

        .primary-btn:active {
          transform: translateY(0);
          box-shadow: 0 6px 12px rgba(31, 79, 255, 0.2);
        }

        .secondary-btn {
          background: white;
          color: #1F4FFF;
          border: 2px solid rgba(31, 79, 255, 0.1);
          padding: 15px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          -webkit-tap-highlight-color: transparent;
        }

        .secondary-btn:hover {
          background: #f0f4ff;
          border-color: rgba(31, 79, 255, 0.3);
        }

        .secondary-btn:active {
          background: #e0e8ff;
        }

        .arrow {
          font-size: 18px;
          font-weight: 400;
        }

        /* ===== FOOTER ===== */
        .footer {
          position: absolute;
          bottom: 20px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: #94A3B8;
          z-index: 10;
          padding: 0 20px;
          box-sizing: border-box;
        }

        .footer p {
          margin: 0 0 5px 0;
          text-align: center;
        }

        .footer-blur {
          position: absolute;
          inset: -10px;
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          z-index: -1;
          border-radius: 20px;
        }

        .footer-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-links a {
          color: #1F4FFF;
          text-decoration: none;
          font-weight: bold;
          font-size: 13px;
        }

        .footer-links span {
          color: #94A3B8;
        }

        /* ===== ANIMATIONS ===== */
        @keyframes border-pulse {
          0% { border-color: rgba(31, 79, 255, 0.3); }
          50% { border-color: rgba(6, 182, 212, 0.6); }
          100% { border-color: rgba(31, 79, 255, 0.3); }
        }

        @keyframes float-hero {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        /* ===== TABLET BREAKPOINT (768px) ===== */
        @media (max-width: 768px) {
          .welcome-container {
            padding: 16px;
            padding-bottom: 100px;
          }

          .robot-container {
            width: 180px;
            margin-bottom: 24px;
          }

          .robot-glow {
            width: 140px;
            height: 140px;
          }

          .title {
            font-size: 36px;
            letter-spacing: -1px;
          }

          .subtitle {
            font-size: 16px;
            margin: 0 0 32px;
            padding: 0 10px;
          }

          .orb-1, .orb-2 {
            width: 200px;
            height: 200px;
            filter: blur(60px);
          }

          .actions-card {
            max-width: 100%;
            padding: 16px;
            border-radius: 20px;
          }

          .footer {
            bottom: 16px;
            font-size: 12px;
          }

          .footer-links a {
            font-size: 12px;
          }
        }

        /* ===== MOBILE BREAKPOINT (480px) ===== */
        @media (max-width: 480px) {
          .welcome-container {
            padding: 12px;
            padding-bottom: 90px;
            justify-content: flex-start;
            padding-top: 10vh;
          }

          .robot-container {
            width: 140px;
            margin-bottom: 20px;
            animation: float-hero 8s ease-in-out infinite; /* Slower on mobile */
          }

          .robot-glow {
            width: 100px;
            height: 100px;
            filter: blur(20px);
          }

          .robot-image {
            filter: drop-shadow(0 10px 20px rgba(31, 79, 255, 0.2));
          }

          .title {
            font-size: 28px;
            letter-spacing: -0.5px;
            margin-bottom: 12px;
          }

          .subtitle {
            font-size: 14px;
            margin: 0 0 24px;
            line-height: 1.5;
            max-width: 280px;
          }

          .orb-1, .orb-2 {
            width: 150px;
            height: 150px;
            filter: blur(50px);
          }

          .orb-1 {
            top: 10%;
            left: 10%;
          }

          .orb-2 {
            bottom: 5%;
            right: 5%;
          }

          .content-wrapper {
            padding: 10px;
          }

          .actions-card {
            padding: 14px;
            border-radius: 18px;
            gap: 10px;
          }

          .primary-btn {
            padding: 14px;
            font-size: 15px;
            border-radius: 14px;
          }

          .secondary-btn {
            padding: 13px;
            font-size: 15px;
            border-radius: 14px;
          }

          .arrow {
            font-size: 16px;
          }

          .footer {
            bottom: 12px;
            font-size: 11px;
          }

          .footer p {
            font-size: 10px;
          }

          .footer-links a {
            font-size: 11px;
          }

          .footer-blur {
            inset: -8px;
            border-radius: 16px;
          }
        }

        /* ===== VERY SMALL SCREENS (360px and below) ===== */
        @media (max-width: 360px) {
          .welcome-container {
            padding-top: 8vh;
          }

          .robot-container {
            width: 120px;
            margin-bottom: 16px;
          }

          .robot-glow {
            width: 80px;
            height: 80px;
          }

          .title {
            font-size: 24px;
          }

          .subtitle {
            font-size: 13px;
            max-width: 240px;
          }

          .actions-card {
            padding: 12px;
          }

          .primary-btn, .secondary-btn {
            padding: 12px;
            font-size: 14px;
            border-radius: 12px;
          }
        }

        /* ===== LANDSCAPE MOBILE ===== */
        @media (max-height: 500px) and (orientation: landscape) {
          .welcome-container {
            padding-top: 10px;
            padding-bottom: 60px;
            justify-content: center;
          }

          .robot-container {
            width: 100px;
            margin-bottom: 12px;
          }

          .robot-glow {
            width: 70px;
            height: 70px;
          }

          .title {
            font-size: 24px;
            margin-bottom: 8px;
          }

          .subtitle {
            font-size: 13px;
            margin-bottom: 16px;
          }

          .actions-card {
            flex-direction: row;
            max-width: 400px;
            padding: 12px;
          }

          .primary-btn, .secondary-btn {
            flex: 1;
            padding: 12px;
            font-size: 14px;
          }

          .footer {
            bottom: 8px;
            font-size: 10px;
          }
        }

        /* ===== SAFE AREA INSETS (for notched phones) ===== */
        @supports (padding: max(0px)) {
          .welcome-container {
            padding-left: max(12px, env(safe-area-inset-left));
            padding-right: max(12px, env(safe-area-inset-right));
            padding-bottom: max(80px, env(safe-area-inset-bottom));
          }

          .footer {
            bottom: max(12px, env(safe-area-inset-bottom));
          }
        }

        /* ===== REDUCED MOTION ===== */
        @media (prefers-reduced-motion: reduce) {
          .robot-container {
            animation: none;
          }

          .primary-btn, .secondary-btn {
            transition: none;
          }

          .content-wrapper {
            transition: opacity 0.3s ease;
          }
        }
      `}</style>
    </div>
  );
}
