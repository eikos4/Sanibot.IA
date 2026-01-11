import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getRandomTip } from "../data/healthTips";

interface SaniBotProps {
    message?: string;
    initialOpen?: boolean;
}

export default function SaniBot({ message: initialMessage, initialOpen = true }: SaniBotProps) {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const location = useLocation();
    const [message, setMessage] = useState(initialMessage || "¡Hola! Soy SaniBot 🤖");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.matchMedia("(min-width: 1024px)").matches);

    // Draggable State
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number, y: number } | null>(null);
    const hasDraggedRef = useRef(false);

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
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "es-ES";
        utterance.rate = 1;
        utterance.pitch = 1.1;

        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(v => v.lang.includes("es") && !v.name.includes("Google"));
        if (spanishVoice) utterance.voice = spanishVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    // --- DRAG HANDLERS ---
    const handlePointerDown = (e: React.PointerEvent | React.TouchEvent) => {
        // Obtenemos coordenadas sea mouse o touch
        const clientX = "touches" in e ? e.touches[0].clientX : (e as React.PointerEvent).clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : (e as React.PointerEvent).clientY;

        dragStartRef.current = { x: clientX - position.x, y: clientY - position.y };
        setIsDragging(true);
        hasDraggedRef.current = false;
    };

    const handlePointerMove = useCallback((e: PointerEvent | TouchEvent) => {
        if (!isDragging || !dragStartRef.current) return;

        const clientX = "touches" in e ? (e as TouchEvent).touches[0].clientX : (e as PointerEvent).clientX;
        const clientY = "touches" in e ? (e as TouchEvent).touches[0].clientY : (e as PointerEvent).clientY;

        const newX = clientX - dragStartRef.current.x;
        const newY = clientY - dragStartRef.current.y;

        // Si se mueve más de 5px, lo consideramos arrastre (para no bloquear el click)
        if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
            hasDraggedRef.current = true;
        }

        setPosition({ x: newX, y: newY });
    }, [isDragging, position]);

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
        dragStartRef.current = null;
    }, []);

    // Global listeners para que el drag no se rompa si el mouse sale del div
    useEffect(() => {
        if (isDragging) {
            window.addEventListener("pointermove", handlePointerMove as any);
            window.addEventListener("pointerup", handlePointerUp);
            window.addEventListener("touchmove", handlePointerMove as any);
            window.addEventListener("touchend", handlePointerUp);
        } else {
            window.removeEventListener("pointermove", handlePointerMove as any);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("touchmove", handlePointerMove as any);
            window.removeEventListener("touchend", handlePointerUp);
        }
        return () => {
            window.removeEventListener("pointermove", handlePointerMove as any);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("touchmove", handlePointerMove as any);
            window.removeEventListener("touchend", handlePointerUp);
        }
    }, [isDragging, handlePointerMove, handlePointerUp]);

    const handleRobotClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasDraggedRef.current) return; // Si arrastró, no hacemos click

        const newTip = getRandomTip();

        if (!isOpen) {
            setIsOpen(true);
            setMessage("💡 Consejo: " + newTip);
            speak("Aquí tienes un consejo: " + newTip);
        } else {
            setMessage("💡 Consejo: " + newTip);
            speak("Sabías que... " + newTip);
        }
    };

    return (
        <div style={{
            ...containerStyle,
            transform: `translate(${position.x}px, ${position.y}px)`,
            touchAction: "none" // Evita scroll mientras arrastras
        }}
            onPointerDown={handlePointerDown}
        >
            {isOpen && (
                <div style={bubbleStyle()} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                    {message}
                    <div style={arrowStyle}></div>
                </div>
            )}

            <div
                className={`sanibot-wrapper ${isSpeaking ? 'talking' : ''}`}
                onClick={handleRobotClick}
                style={{ cursor: isDragging ? "grabbing" : "grab", position: "relative" }}
            >
                <img
                    src="/robot.png"
                    alt="SaniBot"
                    style={{
                        ...robotStyle(isOpen, isDesktop),
                        filter: isDragging ? "brightness(1.1) drop-shadow(0 10px 20px rgba(0,0,0,0.3))" : robotStyle(isOpen, isDesktop).filter
                    }}
                    className="sanibot-float"
                    draggable={false}
                />
                {isSpeaking && <div style={soundWaveStyle}>🔊</div>}
            </div>

            <style>{`
        @keyframes customFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        .sanibot-float {
          animation: ${isDragging ? 'none' : 'customFloat 3s ease-in-out infinite'};
          transition: transform 0.1s;
        }
        .sanibot-wrapper:hover .sanibot-float {
          transform: scale(1.05);
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
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    userSelect: "none",
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
    marginRight: "20px"
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
    filter: isOpen ? "none" : "grayscale(30%)",
    opacity: 1,
});

const soundWaveStyle: React.CSSProperties = {
    position: "absolute",
    top: "-20px",
    right: "0",
    fontSize: "24px",
    animation: "pulse 1s infinite",
};
