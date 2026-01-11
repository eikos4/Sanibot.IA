import { useState, useRef, useEffect } from "react";
// @ts-ignore
import SimulatedCall from "../components/SimulatedCall";
import NeuralBackground from "../components/NeuralBackground";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
}

export default function Robot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "¡Hola! Soy SanniBot.IA 🤖. ¿En qué puedo ayudarte hoy?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 1;
      // Try to find a Spanish voice
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.includes("es"));
      if (spanishVoice) utterance.voice = spanishVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  const triggerCall = () => {
    setCallActive(true);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input;
    const userMsg: Message = { id: Date.now(), text: userText, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Lógica de respuesta simulada
    // Random delay between 1.5s and 3s for realism
    const delay = Math.random() * 1500 + 1500;

    setTimeout(() => {
      setIsTyping(false);
      let botResponse = "Entiendo. Guardaré esa información en tu bitácora.";

      // Comandos simples
      if (userText.toLowerCase().includes("hola")) botResponse = "¡Hola! Espero que estés teniendo un excelente día. ¿Cómo te sientes?";
      else if (userText.toLowerCase().includes("ayuda")) botResponse = "Puedo ayudarte a registrar tus medicamentos, glucosa o simplemente charlar. También puedes pedirme que te llame.";
      else if (userText.toLowerCase().includes("glucosa")) botResponse = "Para registrar tu glucosa, ve a la sección de Glicemia en el menú principal.";
      else if (userText.toLowerCase().includes("gracias")) botResponse = "¡De nada! Estoy aquí para acompañarte siempre.";
      else if (userText.toLowerCase().includes("llámame") || userText.toLowerCase().includes("llamada")) {
        botResponse = "¡Claro! Iniciando llamada de soporte ahora mismo...";
        setTimeout(triggerCall, 2000);
      }

      const botMsg: Message = { id: Date.now() + 1, text: botResponse, sender: "bot" };
      setMessages(prev => [...prev, botMsg]);
      speak(botResponse);
    }, delay);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={containerStyle}>
      <NeuralBackground opacity={0.15} />

      {callActive && (
        <SimulatedCall
          userName="Paciente"
          title="Soport SanniBot"
          message="Hola, veo que solicitaste ayuda. Estoy aquí para escucharte. Cuéntame, ¿has tenido algún síntoma inusual o necesitas ayuda con tu tratamiento?"
          onEndCall={() => setCallActive(false)}
        />
      )}

      {/* HEADER */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={avatarContainer}>
            <img src="/robot.png" style={{ width: "40px", height: "auto" }} alt="Bot" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>SanniBot.IA</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ADE80" }}></span>
              <span style={{ fontSize: "12px", opacity: 0.9 }}>En línea</span>
            </div>
          </div>
        </div>

        <button onClick={triggerCall} style={callButtonStyle} title="Solicitar Llamada">
          📞
        </button>
      </header>

      {/* CHAT AREA */}
      <div style={chatContainerStyle}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...messageStyle,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background: msg.sender === "user" ? "linear-gradient(135deg, #1F4FFF 0%, #3B82F6 100%)" : "white",
              color: msg.sender === "user" ? "white" : "#1F2937",
              border: msg.sender === "user" ? "none" : "1px solid rgba(0,0,0,0.05)",
              borderBottomRightRadius: msg.sender === "user" ? "4px" : "16px",
              borderBottomLeftRadius: msg.sender === "bot" ? "4px" : "16px",
            }}
          >
            {msg.text}
          </div>
        ))}

        {isTyping && (
          <div style={{ ...messageStyle, alignSelf: "flex-start", background: "white", color: "#6B7280", fontStyle: "italic" }}>
            SanniBot escribiendo...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
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

// STYLES
const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  maxWidth: "100%",
  background: "#F8FAFC",
  position: "relative",
  overflow: "hidden"
};

const headerStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(12px)",
  color: "#1F2937",
  padding: "15px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  zIndex: 10,
  borderBottom: "1px solid rgba(0,0,0,0.05)"
};

const avatarContainer: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid white",
  boxShadow: "0 2px 8px rgba(31, 79, 255, 0.1)"
};

const callButtonStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#EFF6FF",
  border: "none",
  color: "#1F4FFF",
  fontSize: "18px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.2s"
};

const chatContainerStyle: React.CSSProperties = {
  flex: 1,
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  overflowY: "auto",
  zIndex: 5,
  position: "relative"
};

const messageStyle: React.CSSProperties = {
  maxWidth: "80%",
  padding: "12px 18px",
  borderRadius: "16px",
  fontSize: "15px",
  lineHeight: "1.5",
  boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
  animation: "fadeIn 0.3s ease-out"
};

const inputAreaStyle: React.CSSProperties = {
  padding: "15px",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  borderTop: "1px solid rgba(0,0,0,0.05)",
  display: "flex",
  gap: "10px",
  zIndex: 10
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "14px 20px",
  borderRadius: "25px",
  border: "1px solid #E2E8F0",
  fontSize: "16px",
  outline: "none",
  background: "white",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
};

const sendButtonStyle: React.CSSProperties = {
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  background: "#1F4FFF",
  color: "white",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(31, 79, 255, 0.3)"
};

