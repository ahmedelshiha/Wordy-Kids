import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getWords,
  createWord,
  updateWord,
  getAnalytics,
  bulkImportWords,
  getSupportTickets,
  getSystemHealth,
} from "./routes/admin";
import {
  startLearningSession,
  recordWordProgress,
  endLearningSession,
  getChildStats,
  getAllChildrenProgress,
} from "./routes/word-progress";

export function createServer() {
  const app = express();

  // PHASE 1: UTF-8 Charset Headers - Ensure proper emoji encoding
  app.use((req, res, next) => {
    res.charset = "utf-8";
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    next();
  });

  // Middleware
  app.use(cors());
  app.use(express.json({ charset: "utf-8" }));
  app.use(express.urlencoded({ extended: true, charset: "utf-8" }));

  // PHASE 2: Ensure JSON responses preserve emoji encoding
  app.use("/api", (req, res, next) => {
    res.setHeader("Content-Type", "application/json; charset=UTF-8");
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({
      message: ping,
      emoji: "🎯",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/demo", handleDemo);

  // Admin API routes
  app.get("/api/admin/users", getUsers);
  app.post("/api/admin/users", createUser);
  app.put("/api/admin/users/:id", updateUser);
  app.delete("/api/admin/users/:id", deleteUser);

  app.get("/api/admin/words", getWords);
  app.post("/api/admin/words", createWord);
  app.put("/api/admin/words/:id", updateWord);
  app.post("/api/admin/words/bulk-import", bulkImportWords);

  app.get("/api/admin/analytics", getAnalytics);
  app.get("/api/admin/support/tickets", getSupportTickets);
  app.get("/api/admin/system/health", getSystemHealth);

  // Word Progress API routes
  app.post("/api/learning/session/start", startLearningSession);
  app.post("/api/learning/word/progress", recordWordProgress);
  app.post("/api/learning/session/end", endLearningSession);
  app.get("/api/learning/child/:childId/stats", getChildStats);
  app.get("/api/learning/children/progress", getAllChildrenProgress);

  return app;
}
