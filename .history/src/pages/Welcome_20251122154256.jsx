import { useEffect, useRef } from "react";

export default function Welcome() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ajustar tamaño
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Crear nodos
    const nodes = [];
    const count = 30;

    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    // Animación
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mover nodos
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(31,79,255,0.9)";
        ctx.fill();
      });

      // Dibujar conexiones
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(31,79,255,${1 - dist / 160})`;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Limpieza
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

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
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      ></canvas>

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
          ¡Hola! Soy GlucoBot 🤖
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

        <button
          style={{
            marginTop: "30px",
            padding: "15px 40px",
            background: "#1F4FFF",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "18px",
            cursor: "pointer",
            width: "100%",
            maxWidth: "260px",
          }}
          onClick={() => (window.location.href = "/register")}
        >
          Comenzar
        </button>
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
