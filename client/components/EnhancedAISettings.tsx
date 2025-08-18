import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Brain,
  Settings,
  Zap,
  Target,
  Lightbulb,
  TrendingUp,
  Clock,
  Heart,
  Shield,
  RotateCcw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAISettings, setAISettings, AISettings } from "@/lib/aiSettings";
import { AIStatusIndicator, AIStatus } from "./AIStatusIndicator";

export interface EnhancedAISettingsProps {
  className?: string;
  showAdvanced?: boolean;
  onSettingsChange?: (settings: ExtendedAISettings) => void;
  aiStatus?: AIStatus;
  aiConfidence?: number;
  compact?: boolean;
}

export interface ExtendedAISettings extends AISettings {
  // Core Features
  aiAdaptiveDifficulty: boolean;
  aiPersonalizedHints: boolean;
  aiRealTimeAdaptation: boolean;
  aiPredictiveAnalytics: boolean;

  // Advanced Features
  aiMotivationalBoosts: boolean;
  aiSpacedRepetition: boolean;
  aiCognitiveLoadOptimization: boolean;
  aiEmotionalAwareness: boolean;

  // Personalization
  aiAggressiveness: number; // 1-10 scale
  aiUpdateFrequency: number; // seconds
  aiConfidenceThreshold: number; // 0-1

  // Privacy & Control
  aiDataSharing: boolean;
  aiAnalyticsStorage: boolean;
  aiErrorReporting: boolean;
}

const defaultSettings: ExtendedAISettings = {
  aiEnhancementEnabled: false,
  aiAdaptiveDifficulty: true,
  aiPersonalizedHints: true,
  aiRealTimeAdaptation: true,
  aiPredictiveAnalytics: true,
  aiMotivationalBoosts: true,
  aiSpacedRepetition: true,
  aiCognitiveLoadOptimization: true,
  aiEmotionalAwareness: false,
  aiAggressiveness: 5,
  aiUpdateFrequency: 10,
  aiConfidenceThreshold: 0.7,
  aiDataSharing: true,
  aiAnalyticsStorage: true,
  aiErrorReporting: true,
};

const settingCategories = {
  core: {
    title: "Core AI Features",
    description: "Essential AI-powered learning enhancements",
    icon: Brain,
    settings: [
      {
        key: "aiEnhancementEnabled" as keyof ExtendedAISettings,
        label: "AI Enhancement",
        description:
          "Enable AI-powered word recommendations and learning optimization",
        icon: Brain,
        impact: "High",
      },
      {
        key: "aiAdaptiveDifficulty" as keyof ExtendedAISettings,
        label: "Adaptive Difficulty",
        description:
          "Automatically adjust word difficulty based on performance",
        icon: Target,
        impact: "High",
      },
      {
        key: "aiPersonalizedHints" as keyof ExtendedAISettings,
        label: "Smart Hints",
        description: "AI-generated hints tailored to your learning style",
        icon: Lightbulb,
        impact: "Medium",
      },
      {
        key: "aiRealTimeAdaptation" as keyof ExtendedAISettings,
        label: "Real-time Adaptation",
        description:
          "Adjust learning experience during sessions based on performance",
        icon: Zap,
        impact: "Medium",
      },
    ],
  },
  advanced: {
    title: "Advanced Features",
    description: "Sophisticated AI capabilities for enhanced learning",
    icon: Settings,
    settings: [
      {
        key: "aiPredictiveAnalytics" as keyof ExtendedAISettings,
        label: "Predictive Analytics",
        description: "Forecast learning outcomes and optimize study plans",
        icon: TrendingUp,
        impact: "Medium",
      },
      {
        key: "aiMotivationalBoosts" as keyof ExtendedAISettings,
        label: "Motivational AI",
        description: "Personalized encouragement and celebration messages",
        icon: Heart,
        impact: "Low",
      },
      {
        key: "aiSpacedRepetition" as keyof ExtendedAISettings,
        label: "Spaced Repetition",
        description: "Optimize review timing based on forgetting curves",
        icon: Clock,
        impact: "High",
      },
      {
        key: "aiCognitiveLoadOptimization" as keyof ExtendedAISettings,
        label: "Cognitive Load Optimization",
        description:
          "Adjust session intensity based on mental fatigue detection",
        icon: Shield,
        impact: "Medium",
      },
      {
        key: "aiEmotionalAwareness" as keyof ExtendedAISettings,
        label: "Emotional Awareness (Beta)",
        description: "Detect and respond to emotional states during learning",
        icon: Heart,
        impact: "Low",
        beta: true,
      },
    ],
  },
  personalization: {
    title: "Personalization",
    description: "Fine-tune AI behavior to match your preferences",
    icon: Target,
    sliders: [
      {
        key: "aiAggressiveness" as keyof ExtendedAISettings,
        label: "AI Aggressiveness",
        description: "How quickly AI adapts and challenges you",
        min: 1,
        max: 10,
        step: 1,
        marks: {
          1: "Gentle",
          5: "Balanced",
          10: "Aggressive",
        },
      },
      {
        key: "aiUpdateFrequency" as keyof ExtendedAISettings,
        label: "Update Frequency",
        description: "How often AI recalculates recommendations (seconds)",
        min: 5,
        max: 60,
        step: 5,
        marks: {
          5: "Instant",
          30: "Balanced",
          60: "Slow",
        },
      },
      {
        key: "aiConfidenceThreshold" as keyof ExtendedAISettings,
        label: "Confidence Threshold",
        description: "Minimum AI confidence required for recommendations",
        min: 0.3,
        max: 0.9,
        step: 0.1,
        marks: {
          0.3: "Low",
          0.6: "Medium",
          0.9: "High",
        },
      },
    ],
  },
  privacy: {
    title: "Privacy & Data",
    description: "Control how AI uses and stores your learning data",
    icon: Shield,
    settings: [
      {
        key: "aiDataSharing" as keyof ExtendedAISettings,
        label: "Anonymous Data Sharing",
        description: "Help improve AI by sharing anonymized learning patterns",
        icon: TrendingUp,
        impact: "None",
      },
      {
        key: "aiAnalyticsStorage" as keyof ExtendedAISettings,
        label: "Local Analytics Storage",
        description: "Store detailed learning analytics on your device",
        icon: Shield,
        impact: "None",
      },
      {
        key: "aiErrorReporting" as keyof ExtendedAISettings,
        label: "Error Reporting",
        description: "Automatically report AI errors to help us improve",
        icon: Info,
        impact: "None",
      },
    ],
  },
};

const impactColors = {
  High: "bg-green-100 text-green-800 border-green-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-blue-100 text-blue-800 border-blue-200",
  None: "bg-gray-100 text-gray-600 border-gray-200",
};

export function EnhancedAISettings({
  className,
  showAdvanced = false,
  onSettingsChange,
  aiStatus = "active",
  aiConfidence,
  compact = false,
}: EnhancedAISettingsProps) {
  const [settings, setSettingsState] =
    useState<ExtendedAISettings>(defaultSettings);
  const [showAdvancedSettings, setShowAdvancedSettings] =
    useState(showAdvanced);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const currentSettings = getAISettings();
    const extendedSettings: ExtendedAISettings = {
      ...defaultSettings,
      ...currentSettings,
      // Load extended settings from localStorage
      aiAdaptiveDifficulty: JSON.parse(
        localStorage.getItem("aiAdaptiveDifficulty") || "true",
      ),
      aiPersonalizedHints: JSON.parse(
        localStorage.getItem("aiPersonalizedHints") || "true",
      ),
      aiRealTimeAdaptation: JSON.parse(
        localStorage.getItem("aiRealTimeAdaptation") || "true",
      ),
      aiPredictiveAnalytics: JSON.parse(
        localStorage.getItem("aiPredictiveAnalytics") || "true",
      ),
      aiMotivationalBoosts: JSON.parse(
        localStorage.getItem("aiMotivationalBoosts") || "true",
      ),
      aiSpacedRepetition: JSON.parse(
        localStorage.getItem("aiSpacedRepetition") || "true",
      ),
      aiCognitiveLoadOptimization: JSON.parse(
        localStorage.getItem("aiCognitiveLoadOptimization") || "true",
      ),
      aiEmotionalAwareness: JSON.parse(
        localStorage.getItem("aiEmotionalAwareness") || "false",
      ),
      aiAggressiveness: parseInt(
        localStorage.getItem("aiAggressiveness") || "5",
      ),
      aiUpdateFrequency: parseInt(
        localStorage.getItem("aiUpdateFrequency") || "10",
      ),
      aiConfidenceThreshold: parseFloat(
        localStorage.getItem("aiConfidenceThreshold") || "0.7",
      ),
      aiDataSharing: JSON.parse(
        localStorage.getItem("aiDataSharing") || "true",
      ),
      aiAnalyticsStorage: JSON.parse(
        localStorage.getItem("aiAnalyticsStorage") || "true",
      ),
      aiErrorReporting: JSON.parse(
        localStorage.getItem("aiErrorReporting") || "true",
      ),
    };
    setSettingsState(extendedSettings);
  }, []);

  const updateSetting = (key: keyof ExtendedAISettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettingsState(newSettings);
    setHasUnsavedChanges(true);

    // Save to localStorage immediately
    localStorage.setItem(key, JSON.stringify(value));

    // Update basic AI settings
    if (
      [
        "aiEnhancementEnabled",
        "aiAdaptiveDifficulty",
        "aiPersonalizedHints",
      ].includes(key)
    ) {
      setAISettings({ [key]: value });
    }

    onSettingsChange?.(newSettings);
  };

  const resetToDefaults = () => {
    setSettingsState(defaultSettings);
    setHasUnsavedChanges(true);

    // Clear localStorage
    Object.keys(defaultSettings).forEach((key) => {
      localStorage.setItem(
        key,
        JSON.stringify(defaultSettings[key as keyof ExtendedAISettings]),
      );
    });

    setAISettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
  };

  const saveSettings = () => {
    // All settings are already saved to localStorage on change
    setHasUnsavedChanges(false);
  };

  if (compact) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">AI Settings</CardTitle>
            </div>
            <AIStatusIndicator
              status={aiStatus}
              confidence={aiConfidence}
              size="sm"
              showText={false}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">AI Enhancement</label>
              <p className="text-xs text-gray-600">
                Enable AI-powered learning
              </p>
            </div>
            <Switch
              checked={settings.aiEnhancementEnabled}
              onCheckedChange={(checked) =>
                updateSetting("aiEnhancementEnabled", checked)
              }
            />
          </div>

          {settings.aiEnhancementEnabled && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Adaptive Difficulty</label>
                  <Switch
                    checked={settings.aiAdaptiveDifficulty}
                    onCheckedChange={(checked) =>
                      updateSetting("aiAdaptiveDifficulty", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Smart Hints</label>
                  <Switch
                    checked={settings.aiPersonalizedHints}
                    onCheckedChange={(checked) =>
                      updateSetting("aiPersonalizedHints", checked)
                    }
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            AI Settings
          </h2>
          <p className="text-gray-600">
            Customize your AI-powered learning experience
          </p>
        </div>
        <AIStatusIndicator
          status={aiStatus}
          confidence={aiConfidence}
          size="lg"
          showConfidence={true}
        />
      </div>

      {/* Master Control */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Master AI Control
              </CardTitle>
              <CardDescription>
                Enable or disable all AI features at once
              </CardDescription>
            </div>
            <Switch
              checked={settings.aiEnhancementEnabled}
              onCheckedChange={(checked) =>
                updateSetting("aiEnhancementEnabled", checked)
              }
              className="scale-125"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Settings Categories */}
      {settings.aiEnhancementEnabled && (
        <div className="space-y-6">
          {/* Core Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <settingCategories.core.icon className="w-5 h-5" />
                {settingCategories.core.title}
              </CardTitle>
              <CardDescription>
                {settingCategories.core.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settingCategories.core.settings.map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-start gap-3">
                    <setting.icon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <label className="font-medium">{setting.label}</label>
                        <Badge
                          className={impactColors[setting.impact]}
                          variant="outline"
                        >
                          {setting.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[setting.key] as boolean}
                    onCheckedChange={(checked) =>
                      updateSetting(setting.key, checked)
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <settingCategories.advanced.icon className="w-5 h-5" />
                    {settingCategories.advanced.title}
                  </CardTitle>
                  <CardDescription>
                    {settingCategories.advanced.description}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  {showAdvancedSettings ? "Hide" : "Show"} Advanced
                </Button>
              </div>
            </CardHeader>
            {showAdvancedSettings && (
              <CardContent className="space-y-4">
                {settingCategories.advanced.settings.map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-start gap-3">
                      <setting.icon className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <label className="font-medium">{setting.label}</label>
                          <Badge
                            className={impactColors[setting.impact]}
                            variant="outline"
                          >
                            {setting.impact} Impact
                          </Badge>
                          {setting.beta && (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-700"
                            >
                              Beta
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings[setting.key] as boolean}
                      onCheckedChange={(checked) =>
                        updateSetting(setting.key, checked)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Personalization Settings */}
          {showAdvancedSettings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <settingCategories.personalization.icon className="w-5 h-5" />
                  {settingCategories.personalization.title}
                </CardTitle>
                <CardDescription>
                  {settingCategories.personalization.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settingCategories.personalization.sliders.map((slider) => (
                  <div key={slider.key} className="space-y-3">
                    <div>
                      <label className="font-medium">{slider.label}</label>
                      <p className="text-sm text-gray-600">
                        {slider.description}
                      </p>
                    </div>
                    <div className="px-2">
                      <Slider
                        value={[settings[slider.key] as number]}
                        onValueChange={([value]) =>
                          updateSetting(slider.key, value)
                        }
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        {Object.entries(slider.marks).map(([value, label]) => (
                          <span key={value}>{label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline">
                        Current: {settings[slider.key]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Privacy Settings */}
          {showAdvancedSettings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <settingCategories.privacy.icon className="w-5 h-5" />
                  {settingCategories.privacy.title}
                </CardTitle>
                <CardDescription>
                  {settingCategories.privacy.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingCategories.privacy.settings.map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-start gap-3">
                      <setting.icon className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <label className="font-medium">{setting.label}</label>
                        <p className="text-sm text-gray-600 mt-1">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings[setting.key] as boolean}
                      onCheckedChange={(checked) =>
                        updateSetting(setting.key, checked)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* AI Disabled State */}
      {!settings.aiEnhancementEnabled && (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            AI features are currently disabled. Enable AI Enhancement above to
            access personalized learning features.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </Button>
        {hasUnsavedChanges && (
          <Button onClick={saveSettings} className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
}
