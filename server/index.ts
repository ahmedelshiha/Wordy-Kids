import "dotenv/config";
import express from "express";
import cors from "cors";
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
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });


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
