import { useState, useEffect, useRef } from "react";

interface SimulatedCallProps {
    userName: string;
    onEndCall: () => void;
    message?: string;
    title?: string;
}

export default function SimulatedCall({ userName, onEndCall, message, title }: SimulatedCallProps) {
    const [callState, setCallState] = useState<"incoming" | "active" | "ended">("incoming");
    const [timer, setTimer] = useState(0);

    // Audio context for "beep" if needed, but we'll focus on visual + TTS
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        let interval: any;
        if (callState === "active") {
            interval = setInterval(() => {
                setTimer((t) => t + 1);
            }, 1000);

            // Iniciar TTS
            startSpeaking();
        }
        return () => clearInterval(interval);
    }, [callState]);

    const startSpeaking = () => {
        const defaultText = `¡Hola ${userName}! Soy SanniBot, tu nuevo aliado de salud. Prepárate para tomar el control total. Me encargaré de los recordatorios y los datos pesados para que tú solo te preocupes de vivir bien. Medicamentos, glucosa, alimentación... ¡lo tengo cubierto! Vamos a lograr grandes cosas juntos.`;

        const text = message || defaultText;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "es-ES";
        utterance.rate = 1.0;
        utterance.pitch = 1.1;

        // Try to find a Spanish voice
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(v => v.lang.includes("es"));
        if (spanishVoice) utterance.voice = spanishVoice;

        utterance.onend = () => {
            setTimeout(() => {
                handleEndCall();
            }, 1000);
        };

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const handleAcceptCall = () => {
        setCallState("active");
    };

    const handleEndCall = () => {
        window.speechSynthesis.cancel();
        setCallState("ended");
        onEndCall();
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (callState === "ended") return null;

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(10px)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "40px 20px 60px",
            color: "white"
        }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginTop: "40px" }}>
                <div style={{
                    width: "120px",
                    height: "120px",
                    background: "#fff",
                    borderRadius: "50%",
                    margin: "0 auto 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 30px rgba(31, 79, 255, 0.5)",
                    animation: callState === "incoming" ? "pulse 1.5s infinite" : "none"
                }}>
                    <img src="/robot.png" alt="SaniBot" style={{ width: "80px" }} />
                </div>
                <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>{title || "SaniBot.IA"}</h2>
                <p style={{ fontSize: "16px", opacity: 0.8 }}>
                    {callState === "incoming" ? "Llamada entrante..." : formatTime(timer)}
                </p>
            </div>

            {/* Actions */}
            <div style={{ width: "100%", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                {callState === "incoming" ? (
                    <>
                        <button onClick={handleEndCall} style={declineButtonStyle}>
                            Colgar
                        </button>
                        <button onClick={handleAcceptCall} style={acceptButtonStyle}>
                            Contestar
                        </button>
                    </>
                ) : (
                    <button onClick={handleEndCall} style={endCallButtonStyle}>
                        <div style={{ fontSize: "24px" }}>📞</div>
                    </button>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                }
            `}</style>
        </div>
    );
}

const acceptButtonStyle: React.CSSProperties = {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#22C55E",
    border: "none",
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const declineButtonStyle: React.CSSProperties = {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#EF4444",
    border: "none",
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const endCallButtonStyle: React.CSSProperties = {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#EF4444",
    border: "none",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(239, 68, 68, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};
