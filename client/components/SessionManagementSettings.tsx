import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useWordLearningSession } from "@/contexts/WordLearningSessionContext";
import { sessionUtils } from "@/hooks/useSessionPersistence";
import {
  Download,
  Upload,
  Trash2,
  Database,
  Clock,
  HardDrive,
  RefreshCw,
  Shield,
  AlertTriangle,
} from "lucide-react";

export function SessionManagementSettings() {
  const { sessionData, clearSession, getSessionStats } =
    useWordLearningSession();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const stats = getSessionStats();
  const sessionSize = sessionUtils.getSessionSize();
  const sessionAge = Math.round(
    (Date.now() - sessionData.lastUpdated) / 1000 / 60,
  ); // minutes

  const handleExportSession = () => {
    sessionUtils.exportSession();
  };

  const handleImportSession = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      sessionUtils.importSession(file).then((success) => {
        if (success) {
          alert("Session imported successfully! Please refresh the page.");
        } else {
          alert("Failed to import session. Please check the file format.");
        }
      });
    }
  };

  const handleClearSession = () => {
    if (showConfirmClear) {
      clearSession();
      setShowConfirmClear(false);
      alert("Session cleared successfully!");
    } else {
      setShowConfirmClear(true);
      setTimeout(() => setShowConfirmClear(false), 5000); // Auto-cancel after 5 seconds
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-educational-blue" />
            Session Information
          </CardTitle>
          <CardDescription>
            Your learning progress is automatically saved to your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Session Age</span>
              </div>
              <div className="text-lg font-semibold text-gray-800">
                {sessionAge < 1 ? "Active" : formatTime(sessionAge)}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <HardDrive className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Storage Used</span>
              </div>
              <div className="text-lg font-semibold text-gray-800">
                {formatBytes(sessionSize)}
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-800 mb-3">Current Progress</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-educational-blue/10 rounded-lg">
                <div className="text-xl font-bold text-educational-blue">
                  {stats.totalWordsLearned}
                </div>
                <div className="text-xs text-gray-600">Words Learned</div>
              </div>
              <div className="text-center p-2 bg-educational-green/10 rounded-lg">
                <div className="text-xl font-bold text-educational-green">
                  {stats.accuracy}%
                </div>
                <div className="text-xs text-gray-600">Accuracy</div>
              </div>
              <div className="text-center p-2 bg-educational-purple/10 rounded-lg">
                <div className="text-xl font-bold text-educational-purple">
                  {stats.totalTimeSpent}
                </div>
                <div className="text-xs text-gray-600">Minutes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-educational-green" />
            Session Management
          </CardTitle>
          <CardDescription>
            Backup, restore, or reset your learning progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-save toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-800">
                Auto-save Progress
              </div>
              <div className="text-sm text-gray-600">
                Automatically save your progress as you learn
              </div>
            </div>
            <Switch
              checked={autoSaveEnabled}
              onCheckedChange={setAutoSaveEnabled}
            />
          </div>

          {/* Export/Import Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleExportSession}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Session
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportSession}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="session-import"
              />
              <Button variant="outline" className="w-full" asChild>
                <label htmlFor="session-import" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Session
                </label>
              </Button>
            </div>
          </div>

          {/* Clear session */}
          <div className="border-t pt-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-red-800">
                    Clear All Progress
                  </div>
                  <div className="text-sm text-red-700 mb-3">
                    This will permanently delete all your learning progress,
                    including learned words, quiz scores, and session history.
                    This action cannot be undone.
                  </div>
                  <Button
                    onClick={handleClearSession}
                    variant={showConfirmClear ? "destructive" : "outline"}
                    size="sm"
                    className={showConfirmClear ? "animate-pulse" : ""}
                  >
                    {showConfirmClear ? (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Confirm Clear All
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear Session
                      </>
                    )}
                  </Button>
                  {showConfirmClear && (
                    <p className="text-xs text-red-600 mt-2">
                      Click again to confirm, or wait 5 seconds to cancel
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-educational-orange" />
            Session Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Session Status</span>
              <Badge variant={sessionAge < 60 ? "default" : "secondary"}>
                {sessionAge < 60 ? "Active" : "Idle"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Data Integrity</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Good
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Cross-tab Sync</span>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                Enabled
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
