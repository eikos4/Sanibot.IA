import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

const getOpenAiKey = (): string | null => {
  // Recommended: firebase functions:config:set openai.key="..."
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const functions = require("firebase-functions");
    const key = functions.config?.()?.openai?.key;
    if (typeof key === "string" && key.trim()) return key.trim();
  } catch {
    // ignore
  }

  const envKey = process.env.OPENAI_API_KEY;
  if (typeof envKey === "string" && envKey.trim()) return envKey.trim();

  return null;
};

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

const looksLikeCrisis = (text: string) => {
  const t = (text || "").toLowerCase();
  return crisisKeywords.some((k) => t.includes(k));
};

const cors = (req: any, res: any): boolean => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }

  return false;
};

export const wellbeingChat = onRequest(
  {
    cors: false,
    region: "southamerica-west1",
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req, res) => {
    if (cors(req, res)) return;

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const apiKey = getOpenAiKey();
    if (!apiKey) {
      res.status(500).json({ error: "Missing OpenAI API key" });
      return;
    }

    const body = req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const lastUser = [...messages].reverse().find((m: any) => m?.role === "user")?.content;
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
        logger.error("OpenAI error", { status: resp.status, body: txt });
        res.status(500).json({ error: "OpenAI request failed" });
        return;
      }

      const data: any = await resp.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (typeof reply !== "string" || !reply.trim()) {
        res.status(200).json({ reply: "Lo siento, no pude generar una respuesta en este momento.", crisis: false });
        return;
      }

      res.status(200).json({ reply: reply.trim(), crisis: false });
    } catch (e) {
      logger.error("wellbeingChat failure", e as any);
      res.status(500).json({ error: "Internal error" });
    }
  }
);
