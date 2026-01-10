import { useState, useRef, useEffect } from "react";
// @ts-ignore
import SimulatedCall from "../components/SimulatedCall";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
}

export default function Robot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "¡Hola! Soy GlucoBot 🤖. ¿En qué puedo ayudarte hoy?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [callActive, setCallActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const triggerCall = () => {
    setCallActive(true);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Comando secreto para probar llamada
    if (input.toLowerCase().includes("llámame") || input.toLowerCase().includes("llamada")) {
      const userMsg: Message = { id: Date.now(), text: input, sender: "user" };
      setMessages(prev => [...prev, userMsg]);
      setInput("");

      setTimeout(() => {
        const botMsg: Message = { id: Date.now() + 1, text: "Recibido. Iniciando llamada de prueba en 3 segundos...", sender: "bot" };
        setMessages(prev => [...prev, botMsg]);
        speak(botMsg.text);

        setTimeout(() => {
          triggerCall();
        }, 3000);
      }, 500);
      return;
    }

    const userMsg: Message = { id: Date.now(), text: input, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Respuesta simulada del bot
    setTimeout(() => {
      let botResponse = "Entiendo. Guardaré esa información en tu bitácora.";

      if (input.toLowerCase().includes("hola")) botResponse = "¡Hola! Espero que estés teniendo un excelente día.";
      else if (input.toLowerCase().includes("ayuda")) botResponse = "Puedo ayudarte a registrar tus medicamentos, glucosa o simplemente charlar.";
      else if (input.toLowerCase().includes("glucosa")) botResponse = "Para registrar tu glucosa, ve a la sección de Glicemia en el menú principal.";
      else if (input.toLowerCase().includes("gracias")) botResponse = "¡De nada! Estoy aquí para acompañarte.";

      const botMsg: Message = { id: Date.now() + 1, text: botResponse, sender: "bot" };
      setMessages(prev => [...prev, botMsg]);
      speak(botResponse);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={containerStyle}>
      {callActive && (
        <SimulatedCall
          callerName="GlucoBot 🤖"
          message="Hola. Este es un recordatorio importante. Recuerda tomar tu Metformina de las 2 de la tarde. ¡Que tengas un buen día!"
          onClose={() => setCallActive(false)}
        />
      )}

      <header style={headerStyle}>
        <img src="/robot.png" style={{ width: "50px", height: "auto" }} alt="Bot" />
        <div>
          <h2 style={{ margin: 0, fontSize: "18px" }}>GlucoBot IA</h2>
          <span style={{ fontSize: "12px", color: "#E0E7FF" }}>Siempre disponible</span>
        </div>
      </header>

      <div style={chatContainerStyle}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...messageStyle,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background: msg.sender === "user" ? "#1F4FFF" : "#fff",
              color: msg.sender === "user" ? "#fff" : "#333",
              border: msg.sender === "user" ? "none" : "1px solid #eee",
            }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={inputAreaStyle}>
        <input
          style={inputStyle}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Escribe un mensaje..."
        />
        <button style={sendButtonStyle} onClick={handleSend}>
          ➤
        </button>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "calc(100vh - 80px)", // Ajuste para navbar si existe
  maxWidth: "600px",
  margin: "0 auto",
  background: "#F8FAFC",
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
};

const headerStyle: React.CSSProperties = {
  background: "#1F4FFF",
  color: "white",
  padding: "15px 20px",
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const chatContainerStyle: React.CSSProperties = {
  flex: 1,
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  overflowY: "auto",
};

const messageStyle: React.CSSProperties = {
  maxWidth: "80%",
  padding: "12px 16px",
  borderRadius: "16px",
  fontSize: "15px",
  lineHeight: "1.4",
  boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
};

const inputAreaStyle: React.CSSProperties = {
  padding: "15px",
  background: "white",
  borderTop: "1px solid #eee",
  display: "flex",
  gap: "10px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "12px 15px",
  borderRadius: "25px",
  border: "1px solid #ddd",
  fontSize: "15px",
  outline: "none",
  background: "#F1F5F9",
};

const sendButtonStyle: React.CSSProperties = {
  width: "45px",
  height: "45px",
  borderRadius: "50%",
  background: "#1F4FFF",
  color: "white",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  cursor: "pointer",
};
