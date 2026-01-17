import { useEffect, useMemo, useRef, useState } from "react";

type Sender = "assistant" | "user";

type WellbeingMessage = {
  id: string;
  sender: Sender;
  text: string;
  ts: number;
};

const CHAT_KEY = "glucobot_wellbeing_chat_v1";

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

const speak = (text: string) => {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 1;
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();
  const spanishVoice = voices.find((v) => v.lang?.toLowerCase().includes("es"));
  if (spanishVoice) utterance.voice = spanishVoice;

  window.speechSynthesis.speak(utterance);
};

export default function Wellbeing() {
  const userName = useMemo(() => getFirstName(), []);

  const [messages, setMessages] = useState<WellbeingMessage[]>(() => {
    const saved = readJson<WellbeingMessage[] | null>(CHAT_KEY, null);
    if (saved && Array.isArray(saved) && saved.length) return saved;
    return [
      {
        id: String(Date.now()),
        sender: "assistant",
        text: `Hola ${userName}. Soy tu asistente de bienestar. Puedo acompañarte si te sientes con estrés, ansiedad o ánimo bajo. ¿Cómo te sientes hoy?`,
        ts: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    writeJson(CHAT_KEY, messages);
  }, [messages]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const chatUrl = (import.meta as any).env?.VITE_WELLBEING_CHAT_URL as string | undefined;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);

    const userMsg: WellbeingMessage = {
      id: String(Date.now()),
      sender: "user",
      text: trimmed,
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    if (!chatUrl) {
      setIsTyping(false);
      const fallback = "Aún no tengo conexión al motor de IA. Configura VITE_WELLBEING_CHAT_URL para habilitar el asistente.";
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "assistant",
          text: fallback,
          ts: Date.now(),
        },
      ]);
      speak(fallback);
      return;
    }

    try {
      const payload = {
        messages: [...messages, userMsg].slice(-20).map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
      };

      const res = await fetch(chatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as { reply?: string; crisis?: boolean };
      const reply = (data?.reply || "Lo siento, no pude generar una respuesta.").trim();

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 2),
          sender: "assistant",
          text: reply,
          ts: Date.now(),
        },
      ]);
      speak(reply);
    } catch (e) {
      setIsTyping(false);
      setError("No pude conectar con el asistente. Intenta nuevamente.");
    }
  };

  const initRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const r = new SpeechRecognition();
    r.lang = "es-CL";
    r.interimResults = false;
    r.continuous = false;

    r.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (typeof transcript === "string" && transcript.trim()) {
        setInput(transcript);
      }
    };

    r.onend = () => {
      setIsListening(false);
    };

    r.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = r;
    return r;
  };

  const toggleListening = () => {
    const r = initRecognition();
    if (!r) {
      setError("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    setError(null);

    if (isListening) {
      try {
        r.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      r.start();
    } catch {
      setIsListening(false);
    }
  };

  const clearChat = () => {
    const next: WellbeingMessage[] = [
      {
        id: String(Date.now()),
        sender: "assistant",
        text: `Hola ${userName}. ¿Cómo te sientes hoy?`,
        ts: Date.now(),
      },
    ];
    setMessages(next);
    writeJson(CHAT_KEY, next);
  };

  const quick = (t: string) => {
    setInput(t);
    setTimeout(() => send(t), 0);
  };

  return (
    <div style={container}>
      <header style={header}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Bienestar</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Asistente de apoyo emocional</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={clearChat} style={iconBtn} title="Borrar chat">
            🗑️
          </button>
        </div>
      </header>

      <div style={chips}>
        <button style={chip} onClick={() => quick("Me siento ansioso/a")}>Ansiedad</button>
        <button style={chip} onClick={() => quick("Me siento triste")}>Ánimo bajo</button>
        <button style={chip} onClick={() => quick("Estoy estresado/a")}>Estrés</button>
        <button style={chip} onClick={() => quick("Quiero un ejercicio de respiración")}>Respiración</button>
        <button style={chip} onClick={() => quick("Quiero un ejercicio de grounding")}>Grounding</button>
      </div>

      <main style={main}>
        <div style={chat}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                ...bubble,
                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                background: m.sender === "user" ? "linear-gradient(135deg, #1F4FFF 0%, #3B82F6 100%)" : "#FFFFFF",
                color: m.sender === "user" ? "#FFFFFF" : "#0F172A",
                border: m.sender === "user" ? "none" : "1px solid rgba(15, 23, 42, 0.08)",
              }}
            >
              {m.text}
            </div>
          ))}

          {isTyping && (
            <div style={{ ...bubble, alignSelf: "flex-start", background: "#FFFFFF", color: "#64748B", fontStyle: "italic", border: "1px solid rgba(15, 23, 42, 0.08)" }}>
              Escribiendo...
            </div>
          )}

          <div ref={listEndRef} />
        </div>

        <aside style={aside}>
          <div style={panel}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Recursos</div>
            <div style={{ display: "grid", gap: 10 }}>
              <a style={linkBtn} href="tel:131">📞 Emergencias (131)</a>
              <a style={linkBtn} href="tel:6003607777">📞 Salud Responde (600 360 7777)</a>
              <a style={linkBtn} href="https://indepsalud.cl" target="_blank" rel="noreferrer">
                👩‍⚕️ Psicólogos (Indepsalud)
              </a>
            </div>
          </div>

          <div style={panel}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Privacidad</div>
            <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.35 }}>
              Este módulo guarda la conversación en este dispositivo. No reemplaza atención profesional.
            </div>
          </div>
        </aside>
      </main>

      <div style={footer}>
        <button style={{ ...voiceBtn, background: isListening ? "#FEF3C7" : "#EFF6FF", color: "#0F172A" }} onClick={toggleListening}>
          {isListening ? "🎙️ Escuchando..." : "🎙️ Hablar"}
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
          style={textInput}
          placeholder="Escribe cómo te sientes..."
        />

        <button style={sendBtn} onClick={() => send(input)}>
          ➤
        </button>
      </div>

      {error && (
        <div style={errorBox}>
          {error}
        </div>
      )}
    </div>
  );
}

const container: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "#F8FAFC",
};

const header: React.CSSProperties = {
  padding: "14px 16px",
  background: "rgba(255,255,255,0.92)",
  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "sticky",
  top: 0,
  zIndex: 10,
  backdropFilter: "blur(10px)",
};

const iconBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 999,
  border: "1px solid rgba(15, 23, 42, 0.10)",
  background: "#FFFFFF",
  cursor: "pointer",
};

const chips: React.CSSProperties = {
  padding: "10px 12px",
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const chip: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(15, 23, 42, 0.10)",
  background: "rgba(255,255,255,0.95)",
  fontWeight: 800,
  fontSize: 12,
  cursor: "pointer",
  color: "#0F172A",
};

const main: React.CSSProperties = {
  flex: 1,
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 12,
  padding: "0 12px 12px",
};

const chat: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  background: "transparent",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  overflowY: "auto",
  paddingBottom: 8,
};

const bubble: React.CSSProperties = {
  maxWidth: "84%",
  padding: "12px 14px",
  borderRadius: 16,
  lineHeight: 1.4,
  fontSize: 14,
  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
};

const aside: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const panel: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: 16,
  padding: 12,
};

const linkBtn: React.CSSProperties = {
  display: "block",
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(15, 23, 42, 0.10)",
  background: "#FFFFFF",
  fontWeight: 800,
  color: "#0F172A",
  textDecoration: "none",
};

const footer: React.CSSProperties = {
  padding: "12px",
  background: "rgba(255,255,255,0.92)",
  borderTop: "1px solid rgba(15, 23, 42, 0.08)",
  display: "flex",
  gap: 10,
  alignItems: "center",
  position: "sticky",
  bottom: 0,
  backdropFilter: "blur(10px)",
};

const voiceBtn: React.CSSProperties = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(15, 23, 42, 0.10)",
  fontWeight: 900,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const textInput: React.CSSProperties = {
  flex: 1,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(15, 23, 42, 0.12)",
  background: "#FFFFFF",
  outline: "none",
  fontSize: 14,
};

const sendBtn: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 999,
  border: "none",
  background: "#1F4FFF",
  color: "#FFFFFF",
  cursor: "pointer",
  fontSize: 18,
  fontWeight: 900,
};

const errorBox: React.CSSProperties = {
  position: "fixed",
  left: 12,
  right: 12,
  bottom: 86,
  background: "#FEF2F2",
  border: "1px solid rgba(239, 68, 68, 0.25)",
  color: "#991B1B",
  borderRadius: 14,
  padding: 12,
  fontWeight: 700,
  zIndex: 20,
};

const media = window.matchMedia?.("(min-width: 1024px)");
if (media?.matches) {
  (main as any).gridTemplateColumns = "1.6fr 0.9fr";
  (aside as any).position = "sticky";
  (aside as any).top = 90;
  (aside as any).alignSelf = "start";
  (chat as any).maxHeight = "calc(100vh - 210px)";
}
