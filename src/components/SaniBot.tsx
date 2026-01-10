import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

interface SaniBotProps {
    message?: string;
    initialOpen?: boolean;
}

export default function SaniBot({ message: initialMessage, initialOpen = true }: SaniBotProps) {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const location = useLocation();
    const [message, setMessage] = useState(initialMessage || "¡Hola! Soy SaniBot 🤖");
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Detección de Mobile/Desktop
    const [isDesktop, setIsDesktop] = useState(window.matchMedia("(min-width: 1024px)").matches);

    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.matchMedia("(min-width: 1024px)").matches);
        checkDesktop();
        window.addEventListener("resize", checkDesktop);
        return () => window.removeEventListener("resize", checkDesktop);
    }, []);

    // Mensajes contextuales
    useEffect(() => {
        const path = location.pathname;
        let msg = "¡Hola! Soy SaniBot 🤖 Estoy aquí para ayudarte.";

        if (path.includes("/home")) msg = "¡Hola! Aquí tienes tu resumen de hoy. 🌞";
        else if (path.includes("/medicines")) msg = "Aquí puedes gestionar tus medicamentos. 💊";
        else if (path.includes("/glucose")) msg = "Registra tu glucosa para llevar un buen control. 🩸";
        else if (path.includes("/appointments")) msg = "No olvides agendar tus próximas visitas. 📅";
        else if (path.includes("/food")) msg = "Una buena alimentación es clave. 🥗";

        setMessage(msg);
    }, [location.pathname]);

    // Función de hablar (TTS)
    const speak = useCallback((text: string) => {
        if (!("speechSynthesis" in window)) {
            console.warn("Este navegador no soporta Speech Synthesis");
            return;
        }

        // Cancelar cualquier audio previo
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "es-ES";
        utterance.rate = 1; // Velocidad normal
        utterance.pitch = 1.1; // Un poco más agudo para parecer amigable

        // Intentar buscar una voz en español
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(v => v.lang.includes("es") && !v.name.includes("Google"));
        // A veces las voces de Google suenan muy robóticas o la default es mejor.
        // Si hay una voz "natural" (como en Edge/Chrome recientes), usarla.
        if (spanishVoice) utterance.voice = spanishVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    const handleRobotClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen) {
            setIsOpen(true);
            speak(message);
        } else {
            // Si ya está abierto, repetir el mensaje o hablar
            speak(message);
        }
    };

    return (
        <div style={containerStyle}>
            {isOpen && (
                <div style={bubbleStyle()} onClick={() => setIsOpen(false)}>
                    {message}
                    <div style={arrowStyle}></div>
                </div>
            )}

            <div
                className={`sanibot-wrapper ${isSpeaking ? 'talking' : ''}`}
                onClick={handleRobotClick}
                style={{ cursor: "pointer", position: "relative" }}
            >
                <img
                    src="/robot.png"
                    alt="SaniBot"
                    style={robotStyle(isOpen, isDesktop)}
                    className="sanibot-float"
                />
                {isSpeaking && <div style={soundWaveStyle}>🔊</div>}
            </div>

            <style>{`
        @keyframes customFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        .sanibot-float {
          animation: customFloat 3s ease-in-out infinite;
          transition: all 0.3s ease;
        }
        .sanibot-wrapper:hover .sanibot-float {
          transform: scale(1.05);
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
        }
        .talking .sanibot-float {
            animation: bounce 0.5s infinite alternate;
        }
        @keyframes bounce {
            from { transform: translateY(0); }
            to { transform: translateY(-5px); }
        }
      `}</style>
        </div>
    );
}

const containerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
};

const bubbleStyle = (): React.CSSProperties => ({
    background: "#E8F0FF",
    color: "#1F2937",
    padding: "12px 16px",
    borderRadius: "16px 16px 4px 16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "10px",
    maxWidth: "250px",
    fontSize: "14px",
    lineHeight: "1.4",
    position: "relative",
    border: "1px solid #C7D2FE",
    animation: "fadeIn 0.3s ease-out",
    cursor: "pointer",
});

const arrowStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "-6px",
    right: "20px",
    width: "12px",
    height: "12px",
    background: "#E8F0FF",
    borderBottom: "1px solid #C7D2FE",
    borderRight: "1px solid #C7D2FE",
    transform: "rotate(45deg)",
};

const robotStyle = (isOpen: boolean, isDesktop: boolean): React.CSSProperties => ({
    width: isDesktop ? "120px" : "100px",
    height: "auto",
    filter: isOpen ? "none" : "grayscale(30%)", // Menos grayscale para que se vea activo
    opacity: 1,
});

const soundWaveStyle: React.CSSProperties = {
    position: "absolute",
    top: "-20px",
    right: "0",
    fontSize: "24px",
    animation: "pulse 1s infinite",
};
