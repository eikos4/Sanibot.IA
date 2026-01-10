import { useState, useEffect } from "react";

interface SimulatedCallProps {
    callerName?: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
}

export default function SimulatedCall({ callerName = "GlucoBot 🤖", message, onClose, onConfirm }: SimulatedCallProps) {
    const [status, setStatus] = useState<"incoming" | "active" | "ended">("incoming");
    const [duration, setDuration] = useState(0);

    // Efecto de sonido (Ring)
    useEffect(() => {
        // Aquí podríamos reproducir un sonido de ringtone en loop si tuviéramos el asset
        // Por ahora simulamos vibración si es posible
        if (navigator.vibrate) navigator.vibrate([1000, 500, 1000, 500]);

        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Timer de duración
    useEffect(() => {
        let interval: any;
        if (status === "active") {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const handleAnswer = () => {
        setStatus("active");
        // Hablar mensaje con instrucción clara
        const utterance = new SpeechSynthesisUtterance(message + " Presiona el botón verde si ya tomaste tu medicamento.");
        utterance.lang = "es-ES";
        utterance.rate = 0.9;
        // No colgar automático inmediatamente, esperar confirmación o cuelgue manual
        // utterance.onend = () => setTimeout(() => handleHangup(), 1000); 
        window.speechSynthesis.speak(utterance);
    };

    const handleHangup = () => {
        setStatus("ended");
        window.speechSynthesis.cancel();
        setTimeout(onClose, 500);
    };

    const handleConfirmAction = () => {
        if (onConfirm) {
            window.speechSynthesis.cancel();
            const thanks = new SpeechSynthesisUtterance("¡Excelente! Toma registrada.");
            thanks.lang = "es-ES";
            window.speechSynthesis.speak(thanks);
            onConfirm(); // Ejecutar acción padre
            handleHangup();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div style={overlayStyle}>
            <div style={backgroundBlurStyle}></div>

            <div style={contentStyle}>
                <div style={callerInfoStyle}>
                    <div style={avatarStyle}>
                        <img src="/robot.png" alt="Caller" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <h2 style={nameStyle}>{callerName}</h2>
                    <p style={statusStyle}>
                        {status === "incoming" ? "Llamada entrante..." :
                            status === "active" ? formatTime(duration) : "Llamada finalizada"}
                    </p>
                </div>

                <div style={actionsStyle}>
                    {status === "incoming" && (
                        <>
                            <button style={declineBtnStyle} onClick={handleHangup}>
                                <span style={iconStyle}>📞</span>
                            </button>
                            <button style={answerBtnStyle} onClick={handleAnswer}>
                                <span style={iconStyle}>📞</span>
                            </button>
                        </>
                    )}

                    {status === "active" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                            {/* BOTÓN GRANDE DE CONFIRMACIÓN */}
                            <button
                                onClick={handleConfirmAction}
                                style={{
                                    background: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "16px",
                                    padding: "20px 40px",
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                                    animation: "pulse-ring 2s infinite",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}
                            >
                                ✅ SÍ, YA LO TOMÉ
                            </button>

                            <button style={{ ...declineBtnStyle, width: "60px", height: "60px", marginTop: "20px" }} onClick={handleHangup}>
                                <span style={{ fontSize: "24px" }}>📞</span>
                            </button>
                        </div>
                    )}

                    {status === "ended" && (
                        <p>Llamada finalizada</p>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(76, 175, 80, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
        }
      `}</style>
        </div>
    );
}

const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
    color: "white",
};

const backgroundBlurStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "url('/robot.png')", // Usamos el robot borroso de fondo
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(20px) opacity(0.3)",
    zIndex: -1,
};

const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "80%",
    width: "100%",
    alignItems: "center",
    padding: "40px 0",
};

const callerInfoStyle: React.CSSProperties = {
    textAlign: "center",
    marginTop: "60px",
};

const avatarStyle: React.CSSProperties = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "white",
    margin: "0 auto 20px",
    padding: "10px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
};

const nameStyle: React.CSSProperties = {
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0 0 10px",
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
};

const statusStyle: React.CSSProperties = {
    fontSize: "18px",
    opacity: 0.8,
    margin: 0,
};

const actionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "60px",
    marginBottom: "40px",
};

const btnBaseStyle: React.CSSProperties = {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.2s",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
};

const declineBtnStyle: React.CSSProperties = {
    ...btnBaseStyle,
    backgroundColor: "#EF4444",
};

const answerBtnStyle: React.CSSProperties = {
    ...btnBaseStyle,
    backgroundColor: "#10B981",
    animation: "pulse-ring 2s infinite",
};

const iconStyle: React.CSSProperties = {
    fontSize: "28px",
    color: "white",
};
