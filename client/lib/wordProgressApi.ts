import {
  StartLearningSessionRequest,
  StartLearningSessionResponse,
  RecordWordProgressRequest,
  RecordWordProgressResponse,
  EndLearningSessionRequest,
  EndLearningSessionResponse,
  GetChildStatsResponse,
} from "@shared/api";

const API_BASE = "/api/learning";

export class WordProgressAPI {
  static async startSession(
    request: StartLearningSessionRequest,
  ): Promise<StartLearningSessionResponse> {
    const response = await fetch(`${API_BASE}/session/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to start session: ${response.statusText}`);
    }

    return response.json();
  }

  static async recordWordProgress(
    request: RecordWordProgressRequest,
  ): Promise<RecordWordProgressResponse> {
    const response = await fetch(`${API_BASE}/word/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to record progress: ${response.statusText}`);
    }

    return response.json();
  }

  static async endSession(
    request: EndLearningSessionRequest,
  ): Promise<EndLearningSessionResponse> {
    const response = await fetch(`${API_BASE}/session/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to end session: ${response.statusText}`);
    }

    return response.json();
  }

  static async getChildStats(childId: string): Promise<GetChildStatsResponse> {
    try {
      console.log(`Fetching child stats for ${childId} from ${API_BASE}/child/${childId}/stats`);
      const response = await fetch(`${API_BASE}/child/${childId}/stats`);

      if (!response.ok) {
        console.error(`API response not OK: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to get stats: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Child stats API response:", data);
      return data;
    } catch (error) {
      console.error("Error in getChildStats:", error);
      throw error;
    }
  }

  static async getAllChildrenProgress(): Promise<{
    success: boolean;
    childrenStats: Record<string, any>;
  }> {
    const response = await fetch(`${API_BASE}/children/progress`);

    if (!response.ok) {
      throw new Error(
        `Failed to get children progress: ${response.statusText}`,
      );
    }

    return response.json();
  }

  static async getPersonalizedRecommendations(childId: string): Promise<{
    success: boolean;
    recommendations: {
      practiceSession?: {
        words: string[];
        estimatedTime: number;
        focusArea: string;
      };
      categoryFocus?: string;
      difficultyAdjustment?: "easier" | "harder" | "maintain";
      nextMilestone?: {
        description: string;
        wordsNeeded: number;
      };
    };
  }> {
    const response = await fetch(
      `${API_BASE}/child/${childId}/recommendations`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get recommendations: ${response.statusText}`);
    }

    return response.json();
  }
}
