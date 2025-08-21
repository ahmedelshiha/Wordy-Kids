/**
 * 🧪 Jungle Animation Testing Harness
 * Development-only tool for QA testing animations
 */

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  developmentAnimationTriggers,
  JungleAnimationManager,
  createAnimationConfig,
  type JungleAnimationConfig,
} from "@/lib/theme/animation";
import { cn } from "@/lib/utils";

interface JungleAnimationTestHarnessProps {
  className?: string;
}

export const JungleAnimationTestHarness: React.FC<
  JungleAnimationTestHarnessProps
> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<JungleAnimationConfig>(
    createAnimationConfig(),
  );
  const [testResults, setTestResults] = useState<string[]>([]);
  const [animationsPaused, setAnimationsPaused] = useState(false);
  const [stressTestRunning, setStressTestRunning] = useState(false);
  const [fpsCounter, setFpsCounter] = useState(0);
  const testLogRef = useRef<HTMLDivElement>(null);
  const fpsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameCountRef = useRef(0);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults((prev) => [
      `[${timestamp}] ${message}`,
      ...prev.slice(0, 9),
    ]);
  };

  const triggerAnimalAnimation = (
    animal: "owl" | "parrot" | "monkey" | "elephant",
  ) => {
    const elements = document.querySelectorAll(
      `.jungle-animal-icon.idle-${animal}`,
    );

    if (elements.length === 0) {
      addTestResult(`❌ No ${animal} elements found`);
      return;
    }

    elements.forEach((element) => {
      developmentAnimationTriggers.triggerCelebration(element as HTMLElement);
    });

    addTestResult(
      `✅ Triggered ${animal} celebration (${elements.length} elements)`,
    );
  };

  const triggerHoverEffect = (
    animal: "owl" | "parrot" | "monkey" | "elephant",
  ) => {
    const elements = document.querySelectorAll(
      `.jungle-animal-icon.idle-${animal}`,
    );

    elements.forEach((element) => {
      developmentAnimationTriggers.triggerHover(element as HTMLElement);
    });

    addTestResult(`🎯 Triggered ${animal} hover effect`);
  };

  const triggerRareEffect = (type: "sparkle" | "firefly" | "magicalGlow") => {
    developmentAnimationTriggers.triggerRareEffect(type);
    addTestResult(`✨ Triggered ${type} rare effect`);
  };

  const testAnimationConfig = (config: Partial<JungleAnimationConfig>) => {
    const newConfig = { ...currentConfig, ...config };
    setCurrentConfig(newConfig);

    const manager = new JungleAnimationManager(newConfig);
    const cssProperties = manager.getCSSProperties();

    // Apply to document
    const root = document.documentElement;
    Object.entries(cssProperties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    addTestResult(`🔧 Applied ${Object.keys(config).join(", ")} configuration`);
  };

  const runFullAnimationTest = () => {
    addTestResult("🚀 Starting full animation test suite...");

    // Test each animal in sequence
    const animals: Array<"owl" | "parrot" | "monkey" | "elephant"> = [
      "owl",
      "parrot",
      "monkey",
      "elephant",
    ];

    animals.forEach((animal, index) => {
      setTimeout(() => {
        triggerHoverEffect(animal);

        setTimeout(() => {
          triggerAnimalAnimation(animal);
        }, 300);
      }, index * 1000);
    });

    // Test rare effects
    setTimeout(() => {
      triggerRareEffect("sparkle");
    }, 5000);

    setTimeout(() => {
      triggerRareEffect("firefly");
    }, 6000);

    setTimeout(() => {
      addTestResult("✅ Full animation test suite completed");
    }, 7000);
  };

  const clearTestLog = () => {
    setTestResults([]);
    addTestResult("🧹 Test log cleared");
  };

  const performanceTest = () => {
    const startTime = performance.now();

    // Trigger multiple animations simultaneously
    ["owl", "parrot", "monkey", "elephant"].forEach((animal) => {
      triggerAnimalAnimation(animal as any);
    });

    setTimeout(() => {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      addTestResult(
        `⚡ Performance test: ${duration}ms for simultaneous animations`,
      );
    }, 1000);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white z-50 shadow-lg"
        size="sm"
      >
        🧪 Animation QA
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 w-96 max-h-[600px] bg-white rounded-lg shadow-2xl z-50 border border-gray-200",
        className,
      )}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-purple-700">
              🧪 Animation Test Harness
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">Development Only</Badge>
            <Badge
              variant={currentConfig.reducedMotion ? "destructive" : "default"}
            >
              {currentConfig.reducedMotion ? "Reduced Motion" : "Full Motion"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {/* Animal Animation Tests */}
          <div>
            <h4 className="font-semibold mb-2 text-sm">🦔 Animal Animations</h4>
            <div className="grid grid-cols-2 gap-2">
              {["owl", "parrot", "monkey", "elephant"].map((animal) => (
                <div key={animal} className="space-y-1">
                  <Button
                    onClick={() => triggerAnimalAnimation(animal as any)}
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                  >
                    {animal === "owl" && "🦉"}
                    {animal === "parrot" && "🦜"}
                    {animal === "monkey" && "🐵"}
                    {animal === "elephant" && "🐘"} {animal}
                  </Button>
                  <Button
                    onClick={() => triggerHoverEffect(animal as any)}
                    size="sm"
                    variant="ghost"
                    className="w-full text-xs"
                  >
                    Hover
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Rare Effects Tests */}
          <div>
            <h4 className="font-semibold mb-2 text-sm">✨ Rare Effects</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => triggerRareEffect("sparkle")}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                ✨ Sparkle
              </Button>
              <Button
                onClick={() => triggerRareEffect("firefly")}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                🌟 Firefly
              </Button>
              <Button
                onClick={() => triggerRareEffect("magicalGlow")}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                🔮 Glow
              </Button>
            </div>
          </div>

          {/* Configuration Tests */}
          <div>
            <h4 className="font-semibold mb-2 text-sm">⚙️ Configuration</h4>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1">
                <Button
                  onClick={() => testAnimationConfig({ idleSpeed: "slow" })}
                  size="sm"
                  variant={
                    currentConfig.idleSpeed === "slow" ? "default" : "outline"
                  }
                  className="text-xs"
                >
                  Slow
                </Button>
                <Button
                  onClick={() => testAnimationConfig({ idleSpeed: "medium" })}
                  size="sm"
                  variant={
                    currentConfig.idleSpeed === "medium" ? "default" : "outline"
                  }
                  className="text-xs"
                >
                  Medium
                </Button>
                <Button
                  onClick={() => testAnimationConfig({ idleSpeed: "fast" })}
                  size="sm"
                  variant={
                    currentConfig.idleSpeed === "fast" ? "default" : "outline"
                  }
                  className="text-xs"
                >
                  Fast
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Button
                  onClick={() => testAnimationConfig({ intensity: "subtle" })}
                  size="sm"
                  variant={
                    currentConfig.intensity === "subtle" ? "default" : "outline"
                  }
                  className="text-xs"
                >
                  Subtle
                </Button>
                <Button
                  onClick={() => testAnimationConfig({ intensity: "normal" })}
                  size="sm"
                  variant={
                    currentConfig.intensity === "normal" ? "default" : "outline"
                  }
                  className="text-xs"
                >
                  Normal
                </Button>
                <Button
                  onClick={() => testAnimationConfig({ intensity: "playful" })}
                  size="sm"
                  variant={
                    currentConfig.intensity === "playful"
                      ? "default"
                      : "outline"
                  }
                  className="text-xs"
                >
                  Playful
                </Button>
              </div>
              <Button
                onClick={() =>
                  testAnimationConfig({
                    reducedMotion: !currentConfig.reducedMotion,
                  })
                }
                size="sm"
                variant={
                  currentConfig.reducedMotion ? "destructive" : "outline"
                }
                className="w-full text-xs"
              >
                Toggle Reduced Motion
              </Button>
            </div>
          </div>

          {/* Test Suites */}
          <div>
            <h4 className="font-semibold mb-2 text-sm">🧪 Test Suites</h4>
            <div className="space-y-2">
              <Button
                onClick={runFullAnimationTest}
                size="sm"
                className="w-full text-xs bg-green-600 hover:bg-green-700"
              >
                🚀 Full Animation Test
              </Button>
              <Button
                onClick={performanceTest}
                size="sm"
                variant="outline"
                className="w-full text-xs"
              >
                ⚡ Performance Test
              </Button>
            </div>
          </div>

          {/* Test Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">📋 Test Log</h4>
              <Button
                onClick={clearTestLog}
                size="sm"
                variant="ghost"
                className="text-xs h-6"
              >
                Clear
              </Button>
            </div>
            <div
              ref={testLogRef}
              className="bg-gray-50 rounded p-2 text-xs space-y-1 max-h-32 overflow-y-auto"
            >
              {testResults.length === 0 ? (
                <p className="text-gray-500">No test results yet...</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-gray-700 font-mono">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JungleAnimationTestHarness;
