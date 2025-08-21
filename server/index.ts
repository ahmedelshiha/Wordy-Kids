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

  // Middleware
  app.use(cors());

  // Universal UTF-8 configuration
  app.use(express.json({ limit: "10mb" })); // Increased limit for emoji content
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Set UTF-8 headers for all responses
  app.use((req, res, next) => {
    res.setHeader("Content-Type", "application/json; charset=UTF-8");
    res.setHeader("Accept-Charset", "UTF-8");
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    // Ensure UTF-8 response
    res.setHeader("Content-Type", "application/json; charset=UTF-8");
    res.json({ message: ping, emoji: "🎯" }); // Test emoji support
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
