import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWordLearningSession } from "@/contexts/WordLearningSessionContext";
import {
  Save,
  Cloud,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function SessionProgressIndicator() {
  const { sessionData, getSessionStats } = useWordLearningSession();
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSaveTime, setLastSaveTime] = useState<Date>(new Date());

  const stats = getSessionStats();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Monitor session saves
  useEffect(() => {
    const handleSessionSaved = () => {
      setSaveStatus("saved");
      setLastSaveTime(new Date());
    };

    window.addEventListener("sessionSaved", handleSessionSaved);
    return () => window.removeEventListener("sessionSaved", handleSessionSaved);
  }, []);

  // Simulate save status for demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (stats.totalWordsLearned > 0) {
        setSaveStatus("saving");
        setTimeout(() => setSaveStatus("saved"), 1000);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [stats.totalWordsLearned]);

  const formatLastSave = () => {
    const diff = Date.now() - lastSaveTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ago`;
    } else if (seconds > 10) {
      return `${seconds}s ago`;
    } else {
      return "just now";
    }
  };

  const getSaveIcon = () => {
    switch (saveStatus) {
      case "saving":
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case "saved":
        return <CheckCircle2 className="w-3 h-3" />;
      case "error":
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getSaveColor = () => {
    switch (saveStatus) {
      case "saving":
        return "bg-blue-100 text-blue-800";
      case "saved":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-xs">
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
        <CardContent className="p-3">
          <div className="space-y-2">
            {/* Session stats */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Progress:</span>
              <span className="font-medium text-gray-800">
                {stats.totalWordsLearned} words • {stats.accuracy}%
              </span>
            </div>

            {/* Save status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`text-xs ${getSaveColor()}`}
                >
                  {getSaveIcon()}
                  <span className="ml-1">
                    {saveStatus === "saving"
                      ? "Saving..."
                      : saveStatus === "saved"
                        ? "Saved"
                        : "Error"}
                  </span>
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {formatLastSave()}
              </div>
            </div>

            {/* Network status */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="w-3 h-3 text-green-600" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-600" />
                )}
                <span className={isOnline ? "text-green-600" : "text-red-600"}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Save className="w-3 h-3 text-gray-400" />
                <span className="text-gray-500">Auto-save</span>
              </div>
            </div>

            {/* Offline notice */}
            {!isOnline && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                Working offline. Progress will sync when connection returns.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Compact version for mobile
export function CompactSessionIndicator() {
  const { getSessionStats } = useWordLearningSession();
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  const stats = getSessionStats();

  useEffect(() => {
    const interval = setInterval(() => {
      if (stats.totalWordsLearned > 0) {
        setSaveStatus("saving");
        setTimeout(() => setSaveStatus("saved"), 800);
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [stats.totalWordsLearned]);

  return (
    <div className="fixed top-16 right-4 z-40 md:hidden">
      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border border-gray-200">
        <div className="flex items-center gap-2 text-xs">
          {saveStatus === "saving" ? (
            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          ) : (
            <CheckCircle2 className="w-3 h-3 text-green-600" />
          )}
          <span className="font-medium text-gray-700">
            {stats.totalWordsLearned}
          </span>
        </div>
      </div>
    </div>
  );
}

// Session warning for long inactive periods
export function SessionWarning() {
  const { sessionData } = useWordLearningSession();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkSessionAge = () => {
      const hoursSinceLastUpdate =
        (Date.now() - sessionData.lastUpdated) / (1000 * 60 * 60);

      // Show warning if session is older than 6 hours and has progress
      if (
        hoursSinceLastUpdate > 6 &&
        (sessionData.rememberedWords.length > 0 ||
          sessionData.forgottenWords.length > 0)
      ) {
        setShowWarning(true);
      }
    };

    checkSessionAge();
    const interval = setInterval(checkSessionAge, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sessionData]);

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
      <Card className="bg-amber-50 border-amber-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">
                Long Session Detected
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                You've been learning for a while! Consider taking a break or
                saving your progress.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => setShowWarning(false)}
              >
                Got it
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
