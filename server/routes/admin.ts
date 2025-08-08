import { RequestHandler } from "express";
import type {
  AdminUser,
  AdminWord,
  SupportTicket,
  SystemAnalytics,
  GetUsersResponse,
  CreateWordResponse,
  GetAnalyticsResponse,
} from "@shared/api";

// Sample data - in production this would come from a database
const sampleUsers: AdminUser[] = [
  {
    id: "user_1",
    name: "John Administrator",
    email: "admin@wordadventure.com",
    role: "admin",
    status: "active",
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    totalSessions: 450,
    supportTickets: 0,
    subscriptionType: "premium",
    permissions: ["system_admin"],
  },
  {
    id: "user_2",
    name: "Sarah Teacher",
    email: "sarah@school.edu",
    role: "teacher",
    status: "active",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    totalSessions: 234,
    supportTickets: 2,
    subscriptionType: "school",
    permissions: ["manage_content", "view_users", "view_analytics"],
  },
];

const sampleWords: AdminWord[] = [
  {
    id: "word_1",
    word: "adventure",
    pronunciation: "/ədˈventʃər/",
    definition: "An exciting or unusual experience",
    example: "Going on a camping trip was a great adventure",
    category: "general",
    difficulty: "medium",
    funFact:
      "The word 'adventure' comes from Latin 'adventura' meaning 'about to happen'",
    status: "approved",
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    usageCount: 1250,
    accuracy: 87.5,
    tags: ["journey", "exploration", "exciting"],
    synonyms: ["journey", "expedition", "quest"],
    antonyms: ["routine", "boring", "ordinary"],
    relatedWords: ["explore", "discover", "travel"],
  },
];

const systemAnalytics: SystemAnalytics = {
  totalUsers: 15420,
  activeUsers: 12350,
  totalWords: 2847,
  totalSessions: 89750,
  avgSessionDuration: 18.5,
  platformEngagement: 78.3,
  userGrowthRate: 12.8,
  contentApprovalRate: 94.2,
  supportResponseTime: 4.2,
  systemUptime: 99.8,
};

// GET /api/admin/users - Get all users with filtering
export const getUsers: RequestHandler = (req, res) => {
  try {
    const { page = 1, limit = 50, role, status, search } = req.query;

    let filteredUsers = [...sampleUsers];

    // Apply filters
    if (role && role !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    if (status && status !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.status === status);
    }

    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm),
      );
    }

    // Pagination
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const response: GetUsersResponse = {
      users: paginatedUsers,
      total: filteredUsers.length,
      page: pageNum,
      limit: limitNum,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// POST /api/admin/users - Create new user
export const createUser: RequestHandler = (req, res) => {
  try {
    const userData = req.body;

    const newUser: AdminUser = {
      id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date(),
      lastActive: new Date(),
      totalSessions: 0,
      supportTickets: 0,
    };

    sampleUsers.push(newUser);

    res.status(201).json({
      success: true,
      user: newUser,
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

// PUT /api/admin/users/:id - Update user
export const updateUser: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const userIndex = sampleUsers.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    sampleUsers[userIndex] = { ...sampleUsers[userIndex], ...updates };

    res.json({
      success: true,
      user: sampleUsers[userIndex],
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// DELETE /api/admin/users/:id - Delete user
export const deleteUser: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const userIndex = sampleUsers.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    sampleUsers.splice(userIndex, 1);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// GET /api/admin/words - Get all words with filtering
export const getWords: RequestHandler = (req, res) => {
  try {
    const { status, category, difficulty, search } = req.query;

    let filteredWords = [...sampleWords];

    // Apply filters
    if (status && status !== "all") {
      filteredWords = filteredWords.filter((word) => word.status === status);
    }

    if (category && category !== "all") {
      filteredWords = filteredWords.filter(
        (word) => word.category === category,
      );
    }

    if (difficulty && difficulty !== "all") {
      filteredWords = filteredWords.filter(
        (word) => word.difficulty === difficulty,
      );
    }

    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredWords = filteredWords.filter(
        (word) =>
          word.word.toLowerCase().includes(searchTerm) ||
          word.definition.toLowerCase().includes(searchTerm),
      );
    }

    res.json({
      words: filteredWords,
      total: filteredWords.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch words" });
  }
};

// POST /api/admin/words - Create new word
export const createWord: RequestHandler = (req, res) => {
  try {
    const wordData = req.body;

    const newWord: AdminWord = {
      id: `word_${Date.now()}`,
      ...wordData,
      submittedAt: new Date(),
      usageCount: 0,
      accuracy: 0,
      status: "pending" as const,
    };

    sampleWords.push(newWord);

    const response: CreateWordResponse = {
      success: true,
      wordId: newWord.id,
      message: "Word created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: "Failed to create word" });
  }
};

// PUT /api/admin/words/:id - Update word
export const updateWord: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const wordIndex = sampleWords.findIndex((word) => word.id === id);

    if (wordIndex === -1) {
      return res.status(404).json({ error: "Word not found" });
    }

    sampleWords[wordIndex] = { ...sampleWords[wordIndex], ...updates };

    res.json({
      success: true,
      word: sampleWords[wordIndex],
      message: "Word updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update word" });
  }
};

// GET /api/admin/analytics - Get system analytics
export const getAnalytics: RequestHandler = (req, res) => {
  try {
    const { timeRange = "30d", metrics } = req.query;

    // In production, this would calculate analytics based on timeRange and requested metrics
    const response: GetAnalyticsResponse = {
      analytics: systemAnalytics,
      timeSeriesData: {
        userGrowth: [
          { date: "2024-01-01", value: 1200 },
          { date: "2024-01-07", value: 1350 },
          { date: "2024-01-14", value: 1480 },
          { date: "2024-01-21", value: 1620 },
          { date: "2024-01-28", value: 1750 },
        ],
        sessionActivity: [
          { date: "2024-01-01", value: 450 },
          { date: "2024-01-07", value: 520 },
          { date: "2024-01-14", value: 680 },
          { date: "2024-01-21", value: 720 },
          { date: "2024-01-28", value: 850 },
        ],
      },
      success: true,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// POST /api/admin/words/bulk-import - Bulk import words
export const bulkImportWords: RequestHandler = (req, res) => {
  try {
    const { words } = req.body;

    if (!Array.isArray(words)) {
      return res.status(400).json({ error: "Words must be an array" });
    }

    const importedWords: AdminWord[] = [];

    words.forEach((wordData, index) => {
      const newWord: AdminWord = {
        id: `word_${Date.now()}_${index}`,
        ...wordData,
        submittedAt: new Date(),
        usageCount: 0,
        accuracy: 0,
        status: "pending" as const,
      };

      sampleWords.push(newWord);
      importedWords.push(newWord);
    });

    res.status(201).json({
      success: true,
      importedCount: importedWords.length,
      words: importedWords,
      message: `Successfully imported ${importedWords.length} words`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to import words" });
  }
};

// GET /api/admin/support/tickets - Get support tickets
export const getSupportTickets: RequestHandler = (req, res) => {
  try {
    // Sample support tickets
    const tickets: SupportTicket[] = [
      {
        id: "ticket_1",
        userId: "user_2",
        userName: "Sarah Teacher",
        userEmail: "sarah@school.edu",
        subject: "Unable to bulk upload words",
        description:
          "I'm trying to upload a CSV file with 200 words but getting an error.",
        priority: "medium",
        status: "open",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        responses: [],
        category: "technical",
      },
    ];

    res.json({
      tickets,
      total: tickets.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch support tickets" });
  }
};

// GET /api/admin/system/health - Get system health status
export const getSystemHealth: RequestHandler = (req, res) => {
  try {
    const health = {
      status: "healthy",
      uptime: systemAnalytics.systemUptime,
      lastCheck: new Date(),
      services: {
        database: { status: "healthy", responseTime: "12ms" },
        api: { status: "healthy", responseTime: "45ms" },
        storage: { status: "healthy", responseTime: "8ms" },
        cache: { status: "healthy", responseTime: "2ms" },
      },
      metrics: {
        memoryUsage: "156MB",
        cpuUsage: "23%",
        diskUsage: "45%",
        activeConnections: 127,
      },
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch system health" });
  }
};
