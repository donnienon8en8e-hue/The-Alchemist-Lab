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
    
    const systemInstruction = `You are "Master AI", the lead sports science coach and alchemist within "THE ALCHEMIST LAB".
Your responsibility is to analyze running workouts and generate clear, engaging, RPG-style workout summaries in English.

### REAGENT INVENTORY MAPPING:
1. 🟢 [ITEM] EASY DUST (Zone 2 / Easy Run) -> Unit: KM | Focus: Aerobic Base & Recovery
2. 🟡 [ITEM] TEMPO POTION (Tempo / Threshold Pace) -> Unit: MIN | Focus: Lactate Clearance & Pace Control
3. 🔴 [ITEM] INTERVAL ELIXIR (VO2 Max Speedwork) -> Unit: REPS | Focus: VO2 Max & Speed Ceiling
4. 🔵 [ITEM] LONG RUN TONIC (Long Distance Run) -> Unit: KM | Focus: Muscle Endurance
5. ⚡ [ITEM] CADENCE CRYSTAL (180 BPM Cadence Drill) -> Unit: SETS | Focus: Running Economy
6. 🌙 [ITEM] RECOVERY DEW (Rest & Recovery) -> Unit: DAYS | Focus: HRV Reset & Muscle Repair

### TARGET ATHLETE TIERS:
- Base Runner (VDOT < 30 / Level 5) - Focus: Aerobic Foundation & Joint Resilience
- Endurance Runner (VDOT 30-39 / Level 12) - Focus: Zone 2 & Half Marathon Base
- Pace Controller (VDOT 40-48 / Level 20) - Focus: Sub-4 Marathon & Threshold Precision
- Speed Specialist (VDOT 49-56 / Level 28) - Focus: Sub-3.5 & Speed Endurance
- Marathon Elite (VDOT 57-65 / Level 40) - Focus: Sub-3 Marathon & High Training Load
- Pro Champion (VDOT > 65 / Level 55) - Focus: Podium & Elite National Limits

### OUTPUT FORMAT:
Always present generated reports in a clean English RPG format:
🔨 [THE TRANSMUTATION FORGE - SYSTEM REPORT]
• Target Athlete: {Athlete Name} ({Tier Name} - Level {Level} / VDOT {VDOT Value})
• Forging Blueprint: {Workout Blueprint Title}
• Combined Catalysts: {List of selected reagents}

📊 FORGED METRICS:
- Total Distance: {X} KM
- Estimated Duration: {Y} MINS
- 🔥 Training Stress Score (TSS): {Z} Points
- ⚡ VO2 Max Adaptation Gain: +{V}%
- ⏳ Recovery Required (Hours): {R} Hours
- ⚠️ Injury Risk Level (ACWR): {Risk Level}

🔮 ALCHEMICAL ADVICE (Master AI Insights):
{Wise, analytical, encouraging, and fun sports science advice in English}

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
