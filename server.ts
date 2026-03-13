import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import Database from "better-sqlite3";

dotenv.config();

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
