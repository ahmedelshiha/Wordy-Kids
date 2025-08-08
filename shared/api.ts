/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Admin Dashboard API Types
 */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "parent" | "child" | "teacher";
  status: "active" | "suspended" | "inactive" | "pending";
  createdAt: Date;
  lastActive: Date;
  childrenCount?: number;
  totalSessions: number;
  supportTickets: number;
  subscriptionType: "free" | "premium" | "family" | "school";
  permissions: string[];
  profileData?: {
    avatar?: string;
    bio?: string;
    preferences?: Record<string, any>;
  };
}

export interface AdminWord {
  id: string;
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  funFact?: string;
  imageUrl?: string;
  audioUrl?: string;
  status: "approved" | "pending" | "rejected";
  submittedBy?: string;
  submittedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  usageCount: number;
  accuracy: number;
  tags?: string[];
  synonyms?: string[];
  antonyms?: string[];
  relatedWords?: string[];
}

export interface AdminCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  wordCount: number;
  difficulty: "easy" | "medium" | "hard";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  responses: Array<{
    id: string;
    message: string;
    isAdmin: boolean;
    timestamp: Date;
    author: string;
    attachments?: string[];
  }>;
  tags?: string[];
  category?: string;
}

export interface SystemAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalWords: number;
  totalSessions: number;
  avgSessionDuration: number;
  platformEngagement: number;
  userGrowthRate: number;
  contentApprovalRate: number;
  supportResponseTime: number;
  systemUptime: number;
}

export interface ContentReport {
  id: string;
  type: "word" | "user_content" | "inappropriate_usage" | "safety_concern";
  contentId: string;
  contentTitle: string;
  reportedBy: string;
  reportedAt: Date;
  reason: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
  evidence?: {
    screenshots?: string[];
    logs?: string[];
    userReports?: number;
  };
}

/**
 * API Request/Response Types
 */
export interface CreateWordRequest {
  word: AdminWord;
}

export interface CreateWordResponse {
  success: boolean;
  wordId: string;
  message: string;
}

export interface GetUsersRequest {
  page?: number;
  limit?: number;
  filter?: {
    role?: string;
    status?: string;
    search?: string;
  };
}

export interface GetUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateUserRequest {
  userId: string;
  updates: Partial<AdminUser>;
}

export interface UpdateUserResponse {
  success: boolean;
  user: AdminUser;
  message: string;
}

export interface GetAnalyticsRequest {
  timeRange: "7d" | "30d" | "90d" | "1y";
  metrics?: string[];
}

export interface GetAnalyticsResponse {
  analytics: SystemAnalytics;
  timeSeriesData?: Record<string, any[]>;
  success: boolean;
}
