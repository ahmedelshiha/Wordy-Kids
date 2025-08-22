/**
 * React hook for integrating with the session manager
 * Provides session state, progress tracking, and time limit functionality
 */

import { useState, useEffect, useCallback } from "react";
import { sessionManager, SessionState } from "@/lib/sessionManager";

export interface UseSessionManagerReturn {
  sessionState: SessionState | null;
  isSessionActive: boolean;
  isDailyGoalReached: boolean;
  isTimeApproaching: boolean;
  isTimeUp: boolean;
  dailyProgress: number;
  startSession: () => void;
  endSession: () => void;
  recordCardCompleted: () => void;
}

export function useSessionManager(): UseSessionManagerReturn {
  const [sessionState, setSessionState] = useState<SessionState | null>(
    sessionManager.getSessionState(),
  );
  const [, forceUpdate] = useState({});

  // Force component re-render
  const triggerUpdate = useCallback(() => {
    setSessionState(sessionManager.getSessionState());
    forceUpdate({});
  }, []);

  useEffect(() => {
    // Set up callbacks for session events
    const handleGoalReached = (state: SessionState) => {
      console.log("🎯 Daily goal reached!", state);
      triggerUpdate();

      // You can add celebration effects here
      if (
        typeof window !== "undefined" &&
        (window as any).showAchievementToast
      ) {
        (window as any).showAchievementToast(
          "🎯 Daily Goal Reached!",
          "Congratulations! You've completed your daily learning goal!",
        );
      }
    };

    const handleTimeWarning = (state: SessionState) => {
      console.log("⏰ Time warning!", state);
      triggerUpdate();

      // Show time warning notification
      if (typeof window !== "undefined" && (window as any).showTimeWarning) {
        (window as any).showTimeWarning(
          "⏰ Time Running Out!",
          "You have 2 minutes left in your session!",
        );
      }
    };

    sessionManager.onGoalReached(handleGoalReached);
    sessionManager.onTimeWarning(handleTimeWarning);

    // Update session state periodically
    const interval = setInterval(triggerUpdate, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [triggerUpdate]);

  const startSession = useCallback(() => {
    const newState = sessionManager.startSession();
    setSessionState(newState);
    console.log("🚀 Session started from hook");
  }, []);

  const endSession = useCallback(() => {
    sessionManager.endSession();
    setSessionState(null);
    console.log("🛑 Session ended from hook");
  }, []);

  const recordCardCompleted = useCallback(() => {
    sessionManager.recordCardCompleted();
    triggerUpdate();
  }, [triggerUpdate]);

  return {
    sessionState,
    isSessionActive: sessionState?.sessionActive ?? false,
    isDailyGoalReached: sessionManager.isDailyGoalReached(),
    isTimeApproaching: sessionManager.isTimeApproaching(),
    isTimeUp: sessionManager.isTimeUp(),
    dailyProgress: sessionManager.getDailyProgress(),
    startSession,
    endSession,
    recordCardCompleted,
  };
}

/**
 * Hook for components that just need to display progress without managing sessions
 */
export function useSessionProgress() {
  const [progress, setProgress] = useState(sessionManager.getDailyProgress());
  const [goalReached, setGoalReached] = useState(
    sessionManager.isDailyGoalReached(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(sessionManager.getDailyProgress());
      setGoalReached(sessionManager.isDailyGoalReached());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    dailyProgress: progress,
    isDailyGoalReached: goalReached,
  };
}
