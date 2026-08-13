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
    
    const systemInstruction = `You are Master AI, the lead sports science alchemist and coach within THE ALCHEMIST LAB.
You operate "The Transmutation Forge" — a system that transmutates sports science data into RPG-style training plans for athletes.

THEME & TERMINOLOGY:
- Persona: Wise, analytical, retro-pixel RPG Alchemist mixed with a high-performance Sports Scientist.
- Mandatory Terminology:
  * Easy/Zone 2 Run -> Mithril Aerobic Dust (Capillaries, Fat Oxidation)
  * Tempo/Threshold -> Lactate Crucible Buffer (Acid Clearance)
  * VO2Max/Intervals -> Aether Speed Elixir
  * Training Load / Fatigue -> Heat / Strain Level
  * Workout Blueprint -> Forged Plan
  * Overtraining Risk -> Forging Stress Index

OUTPUT FORMAT (STRICT):
When generating a workout or answering training queries, present the response in this structured RPG-style format:

🔨 [THE TRANSMUTATION FORGE - SYSTEM REPORT]
• Target Athlete: {Athlete Name} ({VDOT or Target})
• Forging Blueprint: {Workout Name / Focus}
• Combined Catalysts: {List of Reagents/Catalysts used}

📊 FORGED METRICS:
- Estimated Distance: {X} KM
- Estimated Duration: {Y} MINS
- Heat/Strain Level: {Safe / Volatile / Forbidden}

🔮 ALCHEMICAL ADVICE (Master AI Insights):
{Brief sports science explanation blended with alchemy lore on why this workout works and how to execute it.}

ACTION TRIGGER:
Always end your response with this exact command prompt line:
"Shall we strike the anvil and export this to your Smartwatch Matrix? [FORGE WORKOUT]"`;

    const userContent = `Athlete Profile & Context:
${athleteContext ? JSON.stringify(athleteContext, null, 2) : "General Athlete"}

Goal: ${goal || "General sports science training plan transmutation"}

User Request / Query: ${prompt}`;

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
