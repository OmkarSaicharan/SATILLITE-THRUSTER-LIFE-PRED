import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { GoogleGenAI, Type } from "@google/genai";

let Database: any;
try {
  Database = (await import("better-sqlite3")).default;
} catch (e) {
  console.warn("better-sqlite3 could not be loaded. Database features will be disabled.");
}

dotenv.config();

// Global error handlers
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

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

let db_sqlite: any;
try {
  if (Database) {
    console.log("Initializing SQLite database...");
    // On Vercel, we can only write to /tmp
    const dbPath = process.env.VERCEL ? "/tmp/satellite_data.db" : "satellite_data.db";
    db_sqlite = new Database(dbPath);
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
    console.log(`Database initialized successfully at ${dbPath}.`);
  } else {
    console.warn("Database not initialized: better-sqlite3 not loaded.");
  }
} catch (err) {
  console.error("Failed to initialize SQLite database:", err);
}

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // Request logger
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });

    const apiRouter = express.Router();

    // Health check route
    apiRouter.get("/health", (req, res) => {
      res.json({ status: "ok", env: process.env.NODE_ENV, time: new Date().toISOString() });
    });

    // API route for AI analysis (Supports Groq or Gemini)
    apiRouter.post("/analyze", async (req, res) => {
      console.log("Received analysis request for:", req.body?.data?.name);
      try {
        const { data } = req.body;
        if (!data) {
          console.error("No data provided in request body");
          return res.status(400).json({ error: "No data provided" });
        }
        
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
            
            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error("Groq returned an empty response");
            return res.json(JSON.parse(content));
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
          
          const text = response.text;
          if (!text) throw new Error("Gemini returned an empty response");
          return res.json(JSON.parse(text));
        }

      } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: "Failed to analyze mission risk using AI" });
      }
    });

    // API route for saving prediction history (Gemini results)
    apiRouter.post("/save-prediction", async (req, res) => {
      console.log("Saving prediction for:", req.body?.name);
      try {
        const { name, riskLevel, estimatedLifespan, failureProbability, summary } = req.body;

        if (!db_sqlite) {
          console.warn("Database not available, skipping save.");
          return res.json({ success: false, message: "Database not available" });
        }

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
    apiRouter.get("/history", (req, res) => {
      try {
        if (!db_sqlite) return res.json([]);
        const stmt = db_sqlite.prepare("SELECT * FROM predictions ORDER BY created_at DESC LIMIT 10");
        const history = stmt.all();
        res.json(history);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
      }
    });

    apiRouter.delete("/history/:id", (req, res) => {
      try {
        const { id } = req.params;
        if (!db_sqlite) return res.json({ success: false });
        const stmt = db_sqlite.prepare("DELETE FROM predictions WHERE id = ?");
        stmt.run(id);
        res.json({ success: true });
      } catch (error) {
        console.error("Delete Prediction Error:", error);
        res.status(500).json({ error: "Failed to delete prediction" });
      }
    });

    app.use("/api", apiRouter);

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      console.log("Running in development mode with Vite middleware...");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      console.log("Running in production mode...");
      const distPath = path.join(process.cwd(), "dist");
      
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      } else {
        console.warn("Dist folder not found! Serving a fallback page.");
        app.get("*", (req, res) => {
          if (req.url.startsWith("/api")) return res.status(404).json({ error: "API route not found" });
          res.status(200).send(`
            <html>
              <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0a0a0a; color: white;">
                <h1>SatelliteThrive</h1>
                <p>Application is starting up or building. Please wait...</p>
                <script>setTimeout(() => window.location.reload(), 5000);</script>
              </body>
            </html>
          `);
        });
      }
    }

    // Only start the server if we're not in a serverless environment (like Vercel)
    if (!process.env.VERCEL) {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
        console.log("API routes registered: /api/health, /api/analyze, /api/save-prediction, /api/history");
      });
    }

    return app;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

export const appPromise = startServer();
export default appPromise;
