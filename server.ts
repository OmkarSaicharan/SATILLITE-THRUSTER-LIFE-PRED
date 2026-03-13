import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import Groq from "groq-sdk";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Lazy initialization helpers
let groqClient: Groq | null = null;
function getGroq() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

let geminiClient: GoogleGenAI | null = null;
function getGemini() {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

const db_sqlite = new Database("satellite_data.db");

// Initialize database
db_sqlite.exec(`
  CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    risk_level TEXT,
    estimated_lifespan REAL,
    failure_probability REAL,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for AI analysis (Supports Groq or Gemini)
  app.post("/api/analyze", async (req, res) => {
    try {
      const { data } = req.body;
      
      const groq = getGroq();
      const gemini = getGemini();

      if (!groq && !gemini) {
        return res.status(500).json({ 
          error: "No AI provider configured. Please set GROQ_API_KEY or GEMINI_API_KEY in your environment." 
        });
      }

      // Priority 1: Groq
      if (groq) {
        try {
          const completion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content: "You are a satellite propulsion and health analysis expert. You must return only a JSON object matching the requested schema.",
              },
              {
                role: "user",
                content: `Analyze satellite data for ${data.name}. Return JSON: estimatedLifespan, engineLifeRemaining, explosionRisk, failureProbability, riskLevel (Low/Medium/High/Critical), risks[], recommendations[], summary. Data: ${JSON.stringify(data)}`,
              },
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
          });
          return res.json(JSON.parse(completion.choices[0].message.content || "{}"));
        } catch (e) {
          console.error("Groq attempt failed:", e);
          if (!gemini) throw e;
          // Fallback to Gemini if Groq fails and Gemini is available
        }
      }

      // Priority 2: Gemini
      if (gemini) {
        const response = await gemini.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: `Analyze satellite data for ${data.name}. Return JSON: estimatedLifespan, engineLifeRemaining, explosionRisk, failureProbability, riskLevel (Low/Medium/High/Critical), risks[], recommendations[], summary. Data: ${JSON.stringify(data)}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                estimatedLifespan: { type: Type.NUMBER },
                engineLifeRemaining: { type: Type.NUMBER },
                explosionRisk: { type: Type.NUMBER },
                failureProbability: { type: Type.NUMBER },
                riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
                risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                summary: { type: Type.STRING }
              },
              required: ["estimatedLifespan", "engineLifeRemaining", "explosionRisk", "failureProbability", "riskLevel", "risks", "recommendations", "summary"]
            }
          }
        });
        return res.json(JSON.parse(response.text || "{}"));
      }

    } catch (error) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: "Failed to analyze mission risk using AI" });
    }
  });

  // API route for saving prediction history (Gemini results)
  app.post("/api/save-prediction", async (req, res) => {
    try {
      const { name, riskLevel, estimatedLifespan, failureProbability, summary } = req.body;

      const stmt = db_sqlite.prepare(`
        INSERT INTO predictions (name, risk_level, estimated_lifespan, failure_probability, summary)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(name, riskLevel, estimatedLifespan, failureProbability, summary);

      res.json({ success: true });
    } catch (error) {
      console.error("Save Prediction Error:", error);
      res.status(500).json({ error: "Failed to save prediction" });
    }
  });

  // API route for history
  app.get("/api/history", (req, res) => {
    try {
      const stmt = db_sqlite.prepare("SELECT * FROM predictions ORDER BY created_at DESC LIMIT 10");
      const history = stmt.all();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.delete("/api/history/:id", (req, res) => {
    try {
      const { id } = req.params;
      const stmt = db_sqlite.prepare("DELETE FROM predictions WHERE id = ?");
      stmt.run(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete Prediction Error:", error);
      res.status(500).json({ error: "Failed to delete prediction" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
