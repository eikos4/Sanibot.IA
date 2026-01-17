import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import SimulatedCall from "../components/SimulatedCall";
import NeuralBackground from "../components/NeuralBackground";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
}

const CHAT_KEY = "glucobot_robot_chat_v1";

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const getFirstName = (): string => {
  try {
    const u = readJson<any>("glucobot_current_user", null);
    const name = (u?.name || u?.nombre || "Paciente") as string;
    return name.split(" ")[0] || "Paciente";
  } catch {
    return "Paciente";
  }
};

const getLastGlucoseText = (): string | null => {
  try {
    const history = readJson<any[]>("glucobot_glucose", []);
    if (!Array.isArray(history) || history.length === 0) return null;
    const last = history[history.length - 1];
    const value = last?.valor;
    if (typeof value !== "number") return null;
    const when = last?.hora ? `a las ${last.hora}` : "";
    return `Tu última glicemia fue ${value} mg/dL ${when}.`;
  } catch {
    return null;
  }
};

const getNextAppointmentText = (): string | null => {
  try {
    const apps = readJson<any[]>("glucobot_appointments", []);
    if (!Array.isArray(apps) || apps.length === 0) return null;
    const now = new Date();
    const sorted = [...apps].sort((a: any, b: any) => {
      const dateA = `${a.fecha || ""}T${a.hora || "00:00"}`;
      const dateB = `${b.fecha || ""}T${b.hora || "00:00"}`;
      return dateA.localeCompare(dateB);
    });
    const next = sorted.find((a: any) => {
      if (!a?.fecha) return false;
      const d = new Date(`${a.fecha}T${a.hora || "00:00"}`);
      return d.getTime() >= now.getTime();
    });
    if (!next) return null;
    const dateLabel = next?.fecha ? new Date(next.fecha).toLocaleDateString() : "";
    const timeLabel = next?.hora ? ` a las ${next.hora}` : "";
    return `Tu próxima cita es el ${dateLabel}${timeLabel}.`;
  } catch {
    return null;
  }
};

const getMedicinesText = (): string | null => {
  try {
    const meds = readJson<any[]>("glucobot_medicines", []);
    if (!Array.isArray(meds) || meds.length === 0) return null;
    const count = meds.length;
    const first = meds[0];
    const name = first?.nombre;
    const time = first?.horario || (Array.isArray(first?.horarios) ? first.horarios[0] : "");
    if (name && time) return `Tienes ${count} medicamento(s). El primero es ${name} a las ${time}.`;
    if (name) return `Tienes ${count} medicamento(s). El primero es ${name}.`;
    return `Tienes ${count} medicamento(s) registrados.`;
  } catch {
    return null;
  }
};

type BotAction =
  | { type: "navigate"; path: string }
  | { type: "call" }
  | { type: "clear" }
  | { type: "none" };

const normalize = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

const detectAction = (text: string): BotAction => {
  const t = normalize(text);
  if (t.includes("borrar") && (t.includes("chat") || t.includes("convers"))) return { type: "clear" };
  if (t.includes("llamame") || t.includes("llamada") || t.includes("emergencia")) return { type: "call" };
  if (t.includes("historial") && t.includes("gluc")) return { type: "navigate", path: "/glucose/history" };
  if (t.includes("registrar") && t.includes("gluc")) return { type: "navigate", path: "/glucose" };
  if (t.includes("glucosa") && (t.includes("ver") || t.includes("historial"))) return { type: "navigate", path: "/glucose/history" };
  if (t.includes("glucosa") || t.includes("glicemia")) return { type: "navigate", path: "/glucose" };
  if (t.includes("medicamento") || t.includes("medicina")) return { type: "navigate", path: "/medicines" };
  if (t.includes("cita") || t.includes("turno") || t.includes("doctor")) return { type: "navigate", path: "/appointments" };
  if (t.includes("perfil") || t.includes("mis datos")) return { type: "navigate", path: "/profile" };
  if (t.includes("inicio") || t.includes("home")) return { type: "navigate", path: "/home" };
  return { type: "none" };
};

const buildContextSummary = (): string => {
  const name = getFirstName();
  const parts = [getLastGlucoseText(), getNextAppointmentText(), getMedicinesText()].filter(Boolean) as string[];
  if (!parts.length) return `Hola ${name}. Puedo ayudarte a registrar tu glicemia, ver tu historial, medicamentos o citas.`;
  return `Hola ${name}. ${parts.join(" ")}`;
};

export default function Robot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = readJson<Message[] | null>(CHAT_KEY, null);
    if (saved && Array.isArray(saved) && saved.length) return saved;
    return [{ id: 1, text: buildContextSummary(), sender: "bot" }];
  });
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

  useEffect(() => {
    writeJson(CHAT_KEY, messages);
  }, [messages]);

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

  const clearChat = () => {
    const next = [{ id: Date.now(), text: buildContextSummary(), sender: "bot" as const }];
    setMessages(next);
    writeJson(CHAT_KEY, next);
  };

  const addBotMessage = (text: string) => {
    const botMsg: Message = { id: Date.now() + 1, text, sender: "bot" };
    setMessages((prev) => [...prev, botMsg]);
    speak(text);
  };

  const handleAction = (action: BotAction) => {
    if (action.type === "call") {
      addBotMessage("¡Claro! Iniciando una llamada de soporte ahora mismo...");
      setTimeout(triggerCall, 1200);
      return;
    }
    if (action.type === "clear") {
      clearChat();
      return;
    }
    if (action.type === "navigate") {
      const msg = `Listo. Te llevo a ${action.path}.`;
      addBotMessage(msg);
      setTimeout(() => navigate(action.path), 400);
      return;
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input;
    const userMsg: Message = { id: Date.now(), text: userText, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const action = detectAction(userText);

    // Lógica de respuesta simulada
    // Random delay between 1.5s and 3s for realism
    const delay = action.type === "none" ? Math.random() * 1200 + 900 : Math.random() * 600 + 500;

    setTimeout(() => {
      setIsTyping(false);
      if (action.type !== "none") {
        handleAction(action);
        return;
      }

      const t = normalize(userText);
      let botResponse = "Entiendo. ¿Quieres que te ayude con glicemia, medicamentos o citas?";

      if (t.includes("hola")) botResponse = `Hola ${getFirstName()}. ¿Cómo te sientes hoy?`;
      else if (t.includes("ayuda") || t.includes("opciones")) botResponse = "Puedo: 1) registrar glicemia, 2) ver historial de glucosa, 3) ver medicamentos, 4) ver citas, 5) iniciar una llamada.";
      else if (t.includes("ultima") && (t.includes("gluc") || t.includes("glic"))) botResponse = getLastGlucoseText() || "Aún no veo registros de glicemia.";
      else if (t.includes("cita") || t.includes("proxima")) botResponse = getNextAppointmentText() || "No veo citas registradas todavía.";
      else if (t.includes("medic")) botResponse = getMedicinesText() || "No veo medicamentos registrados todavía.";
      else if (t.includes("resumen")) botResponse = buildContextSummary();
      else if (t.includes("gracias")) botResponse = "De nada. Estoy aquí para ayudarte.";

      addBotMessage(botResponse);
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

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={clearChat} style={callButtonStyle} title="Borrar chat">
            🗑️
          </button>
          <button onClick={triggerCall} style={callButtonStyle} title="Solicitar Llamada">
            📞
          </button>
        </div>
      </header>

      <div style={{ padding: "10px 14px", display: "flex", gap: 8, flexWrap: "wrap", zIndex: 6 }}>
        <button style={chipStyle} onClick={() => { setInput("Resumen de hoy"); setTimeout(handleSend, 0); }}>Resumen</button>
        <button style={chipStyle} onClick={() => { setInput("Registrar glucosa"); setTimeout(handleSend, 0); }}>Registrar glucosa</button>
        <button style={chipStyle} onClick={() => { setInput("Ver historial de glucosa"); setTimeout(handleSend, 0); }}>Historial</button>
        <button style={chipStyle} onClick={() => { setInput("Ver mis medicamentos"); setTimeout(handleSend, 0); }}>Medicamentos</button>
        <button style={chipStyle} onClick={() => { setInput("Ver mis citas"); setTimeout(handleSend, 0); }}>Citas</button>
      </div>

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

const chipStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(15, 23, 42, 0.10)",
  background: "rgba(255,255,255,0.9)",
  fontWeight: 700,
  fontSize: "12px",
  cursor: "pointer",
  color: "#0F172A",
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

