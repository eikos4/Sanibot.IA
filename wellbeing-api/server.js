const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const crisisKeywords = [
  "suicid",
  "matarme",
  "me quiero morir",
  "quitarme la vida",
  "autoles",
  "hacerme dano",
  "hacerme daño",
  "cortarme",
  "no quiero vivir",
];

const looksLikeCrisis = (text) => {
  const t = (text || "").toLowerCase();
  return crisisKeywords.some((k) => t.includes(k));
};

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/wellbeingChat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    return;
  }

  const body = req.body || {};
  const messages = Array.isArray(body.messages) ? body.messages : [];

  const lastUser = [...messages].reverse().find((m) => m && m.role === "user")?.content;
  const crisis = typeof lastUser === "string" && looksLikeCrisis(lastUser);

  if (crisis) {
    const reply =
      "Siento mucho que estés pasando por esto. No estás solo/a. " +
      "Si estás en peligro inmediato o tienes intención de hacerte daño, por favor llama al 131 ahora. " +
      "También puedes llamar a Salud Responde 600 360 7777 para orientación. " +
      "Si puedes, busca a alguien de confianza y no enfrentes esto solo/a. ¿Estás a salvo ahora mismo?";

    res.status(200).json({ reply, crisis: true });
    return;
  }

  const system = {
    role: "system",
    content:
      "Eres un asistente de apoyo emocional en español (Chile). " +
      "Tu objetivo es acompañar con empatía, hacer preguntas abiertas, ofrecer ejercicios simples (respiración, grounding, journaling), " +
      "y recomendar buscar ayuda profesional cuando corresponda. " +
      "No entregues diagnósticos, no des instrucciones médicas, no reemplaces terapia. " +
      "Si detectas riesgo de autolesión o suicidio, responde con un mensaje breve de seguridad y recomienda llamar a emergencias 131 y Salud Responde 600 360 7777.",
  };

  const openAiMessages = [system, ...messages].slice(-21);

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: openAiMessages,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      res.status(500).json({ error: "OpenAI request failed", details: txt.slice(0, 500) });
      return;
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      res.status(200).json({ reply: "Lo siento, no pude generar una respuesta en este momento.", crisis: false });
      return;
    }

    res.status(200).json({ reply: reply.trim(), crisis: false });
  } catch (e) {
    res.status(500).json({ error: "Internal error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`wellbeing-api listening on ${port}`);
});
