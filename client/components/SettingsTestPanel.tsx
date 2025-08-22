/**
 * Test Panel for validating settings functionality
 * This component demonstrates that all settings are working correctly
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSessionManager } from "@/hooks/use-session-manager";
import {
  getCurrentAudioSettings,
  pronounceWordWithSettings,
} from "./JungleAdventureSettingsPanelV2";

export function SettingsTestPanel() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const {
    sessionState,
    isSessionActive,
    isDailyGoalReached,
    isTimeApproaching,
    isTimeUp,
    dailyProgress,
    startSession,
    endSession,
    recordCardCompleted,
  } = useSessionManager();

  const runAudioTest = async () => {
    try {
      const audioSettings = getCurrentAudioSettings();
      console.log("🔊 Current audio settings:", audioSettings);

      // Test speech rate
      await pronounceWordWithSettings("Testing speech rate setting", {
        onStart: () => console.log("✅ Speech started with current settings"),
        onEnd: () => console.log("✅ Speech completed"),
      });

      setTestResults((prev) => ({ ...prev, audio: true }));
    } catch (error) {
      console.error("❌ Audio test failed:", error);
      setTestResults((prev) => ({ ...prev, audio: false }));
    }
  };

  const runSessionTest = () => {
    try {
      if (!isSessionActive) {
        startSession();
        console.log("✅ Session started successfully");
      } else {
        endSession();
        console.log("✅ Session ended successfully");
      }
      setTestResults((prev) => ({ ...prev, session: true }));
    } catch (error) {
      console.error("❌ Session test failed:", error);
      setTestResults((prev) => ({ ...prev, session: false }));
    }
  };

  const runDailyGoalTest = () => {
    try {
      if (isSessionActive) {
        recordCardCompleted();
        console.log("✅ Card completion recorded");
        setTestResults((prev) => ({ ...prev, dailyGoal: true }));
      } else {
        console.log("⚠️ Start a session first to test daily goal");
        setTestResults((prev) => ({ ...prev, dailyGoal: false }));
      }
    } catch (error) {
      console.error("❌ Daily goal test failed:", error);
      setTestResults((prev) => ({ ...prev, dailyGoal: false }));
    }
  };

  const testAmbientVolume = () => {
    try {
      const audioSettings = getCurrentAudioSettings();
      const ambientElement = document.querySelector(
        "audio",
      ) as HTMLAudioElement;

      if (ambientElement) {
        ambientElement.volume = audioSettings.ambientVolume;
        console.log(
          `✅ Ambient volume set to ${Math.round(audioSettings.ambientVolume * 100)}%`,
        );
        setTestResults((prev) => ({ ...prev, ambient: true }));
      } else {
        console.log("⚠️ No ambient audio element found");
        setTestResults((prev) => ({ ...prev, ambient: false }));
      }
    } catch (error) {
      console.error("❌ Ambient volume test failed:", error);
      setTestResults((prev) => ({ ...prev, ambient: false }));
    }
  };

  const getTestStatus = (test: string) => {
    if (!(test in testResults)) return "⏳";
    return testResults[test] ? "✅" : "❌";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Settings Functionality Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Settings Display */}
        <div className="space-y-2">
          <h3 className="font-semibold">Current Settings:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(() => {
              const settings = getCurrentAudioSettings();
              return (
                <>
                  <div>Speech Rate: {settings.speechRate}x</div>
                  <div>Voice: {settings.voice}</div>
                  <div>
                    Ambient Vol: {Math.round(settings.ambientVolume * 100)}%
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Session Status */}
        <div className="space-y-2">
          <h3 className="font-semibold">Session Status:</h3>
          <div className="flex items-center gap-2">
            <Badge variant={isSessionActive ? "default" : "secondary"}>
              {isSessionActive ? "Active" : "Inactive"}
            </Badge>
            {sessionState && (
              <>
                <Badge variant="outline">
                  Cards: {sessionState.currentSessionCards}
                </Badge>
                <Badge variant="outline">
                  Daily: {sessionState.dailyCards}/{sessionState.dailyTarget}
                </Badge>
                {sessionState.timeRemaining > 0 && (
                  <Badge variant="outline">
                    Time: {Math.ceil(sessionState.timeRemaining)}m
                  </Badge>
                )}
              </>
            )}
          </div>

          {sessionState && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Daily Progress</span>
                <span>{Math.round(dailyProgress * 100)}%</span>
              </div>
              <Progress value={dailyProgress * 100} className="h-2" />
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="space-y-3">
          <h3 className="font-semibold">Functionality Tests:</h3>

          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={runAudioTest}
              variant="outline"
              className="justify-between"
            >
              <span>Test Speech Rate & Voice</span>
              <span>{getTestStatus("audio")}</span>
            </Button>

            <Button
              onClick={testAmbientVolume}
              variant="outline"
              className="justify-between"
            >
              <span>Test Ambient Volume</span>
              <span>{getTestStatus("ambient")}</span>
            </Button>

            <Button
              onClick={runSessionTest}
              variant="outline"
              className="justify-between"
            >
              <span>{isSessionActive ? "End Session" : "Start Session"}</span>
              <span>{getTestStatus("session")}</span>
            </Button>

            <Button
              onClick={runDailyGoalTest}
              variant="outline"
              className="justify-between"
              disabled={!isSessionActive}
            >
              <span>Test Daily Goal (Add Card)</span>
              <span>{getTestStatus("dailyGoal")}</span>
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-2">
          <h3 className="font-semibold">Live Status:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div
              className={`p-2 rounded ${isDailyGoalReached ? "bg-green-100" : "bg-gray-100"}`}
            >
              Daily Goal: {isDailyGoalReached ? "✅ Reached" : "🎯 In Progress"}
            </div>
            <div
              className={`p-2 rounded ${isTimeApproaching ? "bg-yellow-100" : "bg-gray-100"}`}
            >
              Time Status:{" "}
              {isTimeUp
                ? "⏰ Time Up"
                : isTimeApproaching
                  ? "⚠️ Running Low"
                  : "✅ OK"}
            </div>
          </div>
        </div>

        {/* Test Results Summary */}
        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <div className="text-sm space-y-1">
            <div>Audio Settings: {getTestStatus("audio")}</div>
            <div>Ambient Volume: {getTestStatus("ambient")}</div>
            <div>Session Management: {getTestStatus("session")}</div>
            <div>Daily Goal Tracking: {getTestStatus("dailyGoal")}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
