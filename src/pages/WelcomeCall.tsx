import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function WelcomeCall() {
    const navigate = useNavigate();
    const [phase, setPhase] = useState<"ringing" | "answered" | "talking">("ringing");
    const [message, setMessage] = useState("");

    const persistProfileCompleted = () => {
        try {
            const rawPatient = localStorage.getItem("glucobot_patient_data");
            const patient = rawPatient ? JSON.parse(rawPatient) : {};
            localStorage.setItem("glucobot_patient_data", JSON.stringify({ ...patient, profileCompleted: true }));
        } catch {
            // ignore
        }

        try {
            const rawUser = localStorage.getItem("glucobot_current_user");
            const u = rawUser ? JSON.parse(rawUser) : {};
            localStorage.setItem("glucobot_current_user", JSON.stringify({ ...u, profileCompleted: true }));
        } catch {
            // ignore
        }
    };

    // Get user name from localStorage
    const savedUser = localStorage.getItem("glucobot_current_user");
    const userName = savedUser ? JSON.parse(savedUser).name?.split(" ")[0] : "Paciente";

    useEffect(() => {
        if (phase !== "ringing") return;

        // Phone ringing animation for 3 seconds
        const ringTimer = setTimeout(() => {
            setPhase("answered");
        }, 3000);

        return () => clearTimeout(ringTimer);
    }, [phase]);

    useEffect(() => {
        if (phase === "answered") {
            persistProfileCompleted();

            // Start the conversation - profile is now complete
            const messages = [
                `¡Felicidades ${userName}! 🎉`,
                "Has completado tu perfil de salud.",
                "Soy GlucoBot, tu asistente personal.",
                "Te ayudaré a controlar tu diabetes día a día.",
                "¡Vamos a tu panel principal!"
            ];

            let index = 0;
            setPhase("talking");
            setMessage(messages[0]);

            const interval = setInterval(() => {
                index++;
                if (index < messages.length) {
                    setMessage(messages[index]);
                } else {
                    clearInterval(interval);
                    // Navigate to home after completing setup
                    setTimeout(() => {
                        persistProfileCompleted();
                        navigate("/home");
                    }, 2000);
                }
            }, 2500);

            // Speak the welcome message
            if ("speechSynthesis" in window) {
                const fullMessage = `Felicidades ${userName}! Has completado tu perfil de salud. Soy GlucoBot, tu asistente personal. Te ayudaré a controlar tu diabetes día a día.`;
                const utterance = new SpeechSynthesisUtterance(fullMessage);
                utterance.lang = "es-ES";
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }

            return () => clearInterval(interval);
        }
    }, [phase, userName, navigate]);

    return (
        <div style={container}>
            {/* Animated Background */}
            <div style={bgCircle1}></div>
            <div style={bgCircle2}></div>

            <div style={card}>
                {/* Robot Avatar */}
                <div style={avatarContainer}>
                    <div style={{
                        ...avatarPulse,
                        animation: phase === "ringing" ? "pulse 1s infinite" : "none"
                    }}>
                        <img
                            src="/robot.png"
                            alt="GlucoBot"
                            style={{ width: "80px", height: "auto" }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/bottts/svg?seed=glucobot";
                            }}
                        />
                    </div>
                </div>

                {/* Status */}
                <h1 style={title}>
                    {phase === "ringing" ? "GlucoBot te está llamando..." : "GlucoBot"}
                </h1>

                {phase === "ringing" && (
                    <>
                        <div style={phoneIcon}>📞</div>
                        <p style={subtitle}>Llamada entrante</p>
                        <button
                            style={answerBtn}
                            onClick={() => setPhase("answered")}
                        >
                            Contestar
                        </button>
                    </>
                )}

                {phase === "talking" && (
                    <>
                        <div style={messageBubble}>
                            <p style={messageText}>{message}</p>
                        </div>
                        <button
                            style={hangUpBtn}
                            onClick={() => {
                                // Stop speech synthesis
                                if ("speechSynthesis" in window) {
                                    window.speechSynthesis.cancel();
                                }
                                persistProfileCompleted();
                                navigate("/home");
                            }}
                        >
                            📞 Colgar e ir al Dashboard
                        </button>
                    </>
                )}
            </div>

            <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(124, 58, 237, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
        </div>
    );
}

// Styles
const container: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
    padding: "20px",
    position: "relative",
    overflow: "hidden"
};

const bgCircle1: React.CSSProperties = {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(124, 58, 237, 0.2)",
    top: "-100px",
    left: "-100px",
    filter: "blur(60px)"
};

const bgCircle2: React.CSSProperties = {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.15)",
    bottom: "-150px",
    right: "-150px",
    filter: "blur(80px)"
};

const card: React.CSSProperties = {
    textAlign: "center",
    zIndex: 10
};

const avatarContainer: React.CSSProperties = {
    marginBottom: "30px"
};

const avatarPulse: React.CSSProperties = {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    boxShadow: "0 10px 40px rgba(124, 58, 237, 0.4)"
};

const title: React.CSSProperties = {
    color: "white",
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "10px"
};

const subtitle: React.CSSProperties = {
    color: "rgba(255,255,255,0.7)",
    fontSize: "16px",
    marginBottom: "30px"
};

const phoneIcon: React.CSSProperties = {
    fontSize: "40px",
    marginBottom: "10px",
    animation: "float 1s ease-in-out infinite"
};

const answerBtn: React.CSSProperties = {
    padding: "16px 50px",
    borderRadius: "30px",
    background: "#22C55E",
    color: "white",
    border: "none",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 25px rgba(34, 197, 94, 0.4)"
};

const hangUpBtn: React.CSSProperties = {
    padding: "14px 30px",
    borderRadius: "25px",
    background: "#EF4444",
    color: "white",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px",
    boxShadow: "0 6px 20px rgba(239, 68, 68, 0.4)",
    transition: "transform 0.2s, background 0.2s"
};

const messageBubble: React.CSSProperties = {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "25px 35px",
    maxWidth: "350px",
    margin: "20px auto"
};

const messageText: React.CSSProperties = {
    color: "white",
    fontSize: "18px",
    lineHeight: "1.6",
    margin: 0
};
