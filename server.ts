import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "The Alchemist Lab" });
});

// AI Alchemist Coach API route
app.post("/api/alchemist-coach", async (req, res) => {
  try {
    const { prompt, athleteContext, goal } = req.body;
    
    const ai = getGeminiClient();
    
    const systemInstruction = `You are Master Aurelius, Grand Sports Science Alchemist of 'The Alchemist Lab'.
You speak in a blend of 32-bit retro JRPG alchemist persona (wise, enthusiastic, referencing potions, transmutations, elixirs, crucibles, and mana) AND precise, world-class modern sports science (VO2 max, lactate threshold, VDOT, ACWR acute:chronic workload ratio, periodization, HRV, recovery).

Structure your response cleanly using bullet points and retro RPG-style headers (e.g. 🧪 ALCHEMICAL DIAGNOSIS, 📜 TRANSMUTATION PLAN, ⚠️ OVER-TRANSMUTATION RISKS).

Keep your response engaging, concise, and practically actionable for a runner or running coach.`;

    const userContent = `Athlete Profile & Request:
${athleteContext ? JSON.stringify(athleteContext, null, 2) : "General Athlete"}

Goal: ${goal || "General sports science guidance"}

Question / Query: ${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\n${userContent}` }] }
      ],
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Error in /api/alchemist-coach:", err);
    res.status(500).json({ 
      error: err.message || "The alchemical crucible encountered a disruption in the magical flow." 
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[The Alchemist Lab] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
