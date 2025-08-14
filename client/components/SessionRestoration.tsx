import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RotateCcw,
  Clock,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  Database,
  CloudOff,
  RefreshCw,
  X,
  TrendingUp,
  Calendar,
  Target,
  BookOpen,
} from "lucide-react";
import {
  SessionData,
  useSessionPersistence,
} from "@/hooks/useSessionPersistence";
import { getSessionPersistenceService } from "@/lib/sessionPersistenceService";

interface SessionRestorationProps {
  onRestore: (sessionData: SessionData) => void;
  onDismiss: () => void;
  onNewSession: () => void;
  autoRestoreEnabled?: boolean;
  showDetailed?: boolean;
}

interface SessionInfo {
  age: number;
  size: number;
  progress: {
    wordsLearned: number;
    accuracy: number;
    sessionCount: number;
  };
  lastTab: string;
  categories: string[];
  timeSpent: number;
}

export const SessionRestoration: React.FC<SessionRestorationProps> = ({
  onRestore,
  onDismiss,
  onNewSession,
  autoRestoreEnabled = true,
  showDetailed = true,
}) => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  const [restorationStatus, setRestorationStatus] = useState<
    "idle" | "restoring" | "success" | "error"
  >("idle");
  const [autoRestoreCountdown, setAutoRestoreCountdown] = useState(10);
  const [showAutoRestore, setShowAutoRestore] = useState(false);

  const { loadSession, isSessionActive, sessionAge, compressedSize } =
    useSessionPersistence();
  const persistenceService = getSessionPersistenceService();

  // Format time duration
  const formatDuration = useCallback((milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ago`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s ago`;
    return `${seconds}s ago`;
  }, []);

  // Format file size
  const formatSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  // Load and analyze session data
  const loadSessionData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try multiple sources for session data
      let data = loadSession();

      if (!data) {
        // Fallback to persistence service
        data = await persistenceService.loadLatestSession();
      }

      if (data) {
        setSessionData(data);

        // Analyze session information
        const info: SessionInfo = {
          age: Date.now() - (data.lastSaved || 0),
          size: compressedSize || new Blob([JSON.stringify(data)]).size,
          progress: {
            wordsLearned: data.currentProgress?.wordsLearned || 0,
            accuracy: data.currentProgress?.accuracy || 0,
            sessionCount: data.currentProgress?.sessionCount || 0,
          },
          lastTab: data.activeTab || "dashboard",
          categories: data.selectedCategory ? [data.selectedCategory] : [],
          timeSpent: data.totalTimeSpent || 0,
        };

        setSessionInfo(info);

        // Show auto-restore if session is recent and auto-restore is enabled
        if (autoRestoreEnabled && info.age < 30 * 60 * 1000) {
          // Less than 30 minutes old
          setShowAutoRestore(true);
          setAutoRestoreCountdown(10);
        }
      }
    } catch (error) {
      console.error("Failed to load session data:", error);
      setRestorationStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [loadSession, persistenceService, compressedSize, autoRestoreEnabled]);

  // Auto-restore countdown
  useEffect(() => {
    if (!showAutoRestore || autoRestoreCountdown <= 0) return;

    const timer = setTimeout(() => {
      if (autoRestoreCountdown === 1) {
        handleRestore();
      } else {
        setAutoRestoreCountdown((prev) => prev - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [showAutoRestore, autoRestoreCountdown]);

  // Monitor network status
  useEffect(() => {
    const handleNetworkChange = () => {
      setNetworkStatus(navigator.onLine);
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, []);

  // Load session data on mount
  useEffect(() => {
    loadSessionData();
  }, [loadSessionData]);

  const handleRestore = async () => {
    if (!sessionData) return;

    setRestorationStatus("restoring");
    setShowAutoRestore(false);

    try {
      // Simulate restoration delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      onRestore(sessionData);
      setRestorationStatus("success");

      setTimeout(() => {
        onDismiss();
      }, 1000);
    } catch (error) {
      console.error("Failed to restore session:", error);
      setRestorationStatus("error");
    }
  };

  const handleNewSession = () => {
    setShowAutoRestore(false);
    onNewSession();
  };

  const handleDismiss = () => {
    setShowAutoRestore(false);
    onDismiss();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">
              Loading session data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sessionData || !sessionInfo) {
    return (
      <Card className="w-full max-w-md mx-auto border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Fresh Start!
          </h3>
          <p className="text-sm text-green-600 mb-4">
            No previous session found. You're starting with a clean slate.
          </p>
          <Button
            onClick={handleNewSession}
            className="bg-green-600 hover:bg-green-700"
          >
            Begin Learning Journey
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Welcome Back!
          </CardTitle>
          <div className="flex items-center gap-2">
            {networkStatus ? (
              <Badge
                variant="outline"
                className="text-green-600 border-green-300"
              >
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-orange-600 border-orange-300"
              >
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Auto-restore countdown */}
        {showAutoRestore && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                Auto-restoring in {autoRestoreCountdown}s
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAutoRestore(false)}
                className="h-6 px-2 text-xs"
              >
                Cancel
              </Button>
            </div>
            <Progress
              value={(10 - autoRestoreCountdown) * 10}
              className="h-2 bg-blue-200"
            />
          </div>
        )}

        {/* Session info summary */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {sessionInfo.progress.wordsLearned}
              </div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <BookOpen className="w-3 h-3" />
                Words Learned
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sessionInfo.progress.accuracy}%
              </div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <Target className="w-3 h-3" />
                Accuracy
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(sessionInfo.age)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{sessionInfo.progress.sessionCount} sessions</span>
            </div>
          </div>
        </div>

        {/* Detailed session info */}
        {showDetailed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last active tab:</span>
              <Badge variant="outline" className="text-xs">
                {sessionInfo.lastTab}
              </Badge>
            </div>

            {sessionInfo.categories.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Category:</span>
                <Badge variant="outline" className="text-xs">
                  {sessionInfo.categories[0]}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Session size:</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Database className="w-3 h-3" />
                {formatSize(sessionInfo.size)}
              </span>
            </div>

            {sessionInfo.timeSpent > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Time spent:</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {formatDuration(sessionInfo.timeSpent)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Restoration status */}
        {restorationStatus === "restoring" && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Restoring your session...
              </span>
            </div>
          </div>
        )}

        {restorationStatus === "success" && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Session restored successfully!
              </span>
            </div>
          </div>
        )}

        {restorationStatus === "error" && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Failed to restore session
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {restorationStatus === "idle" && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleRestore}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!sessionData}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Session
            </Button>
            <Button
              onClick={handleNewSession}
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Start Fresh
            </Button>
          </div>
        )}

        {/* Offline indicator */}
        {!networkStatus && (
          <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CloudOff className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                You're offline. Session data is stored locally.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionRestoration;
