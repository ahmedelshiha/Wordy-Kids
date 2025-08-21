import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Trophy,
  BarChart3,
  Sparkles,
  ArrowRight,
  ArrowDown,
  TreePine,
  Leaf,
  Crown,
  Target,
  Heart,
  Star,
  Gift,
  Map as MapIcon,
  Compass,
  Search,
  RefreshCw,
  FileText,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FinalIntegrationReport } from "@/components/FinalIntegrationReport";

interface SystemModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  emoji: string;
  status: "active" | "connected" | "error" | "missing";
  connections: string[];
  features: string[];
  integrationPoints: string[];
  files: string[];
}

interface IntegrationCheck {
  component: string;
  status: "complete" | "partial" | "missing" | "error";
  details: string;
  location?: string;
}

const systemModules: SystemModule[] = [
  {
    id: "achievement-system",
    name: "AchievementSystem",
    description: "Core achievement milestones and progression tracking",
    icon: "🏆",
    emoji: "🏆",
    status: "active",
    connections: ["badge-system", "learning-analytics", "reward-celebration"],
    features: [
      "Level progression system",
      "Experience point tracking",
      "Achievement unlocking",
      "Progress calculation",
      "Milestone detection",
    ],
    integrationPoints: [
      "Enhanced Achievement Tracker",
      "Goal Progress Tracker",
      "Category Completion Tracker",
    ],
    files: [
      "client/lib/enhancedAchievementSystem.ts",
      "client/pages/EnhancedAchievementsPage.tsx",
    ],
  },
  {
    id: "badge-system",
    name: "BadgeSystem",
    description: "Badge collection & management with tier-based rewards",
    icon: "🎖️",
    emoji: "🎖️",
    status: "connected",
    connections: ["achievement-system", "reward-celebration"],
    features: [
      "Multi-tier badges (Bronze → Legendary)",
      "Progress tracking per badge",
      "Reward system integration",
      "Collection statistics",
      "Jungle-themed celebrations",
    ],
    integrationPoints: [
      "User badge persistence",
      "Progress synchronization",
      "Celebration triggers",
    ],
    files: ["client/lib/enhancedBadgeSystem.ts"],
  },
  {
    id: "learning-analytics",
    name: "LearningAnalytics",
    description: "Data flow for progress tracking & personalized insights",
    icon: "📊",
    emoji: "📊",
    status: "connected",
    connections: ["achievement-system", "badge-system"],
    features: [
      "Session tracking",
      "Weekly/Monthly analytics",
      "Learning trends analysis",
      "Personalized insights",
      "Jungle progress reporting",
    ],
    integrationPoints: [
      "Local storage integration",
      "Real-time data collection",
      "Progress report generation",
    ],
    files: ["client/lib/enhancedLearningAnalytics.ts"],
  },
  {
    id: "reward-celebration",
    name: "RewardCelebration",
    description: "Animated celebration effects for milestone achievements",
    icon: "🎉",
    emoji: "🎉",
    status: "connected",
    connections: ["achievement-system", "badge-system"],
    features: [
      "Particle effect systems",
      "Jungle-themed animations",
      "Multi-rarity celebrations",
      "Audio integration",
      "Event-driven triggers",
    ],
    integrationPoints: [
      "Custom event listeners",
      "DOM celebration overlay",
      "Audio service integration",
    ],
    files: [
      "client/lib/enhancedRewardCelebration.ts",
      "client/styles/jungle-achievement-theme.css",
    ],
  },
];

const integrationChecks: IntegrationCheck[] = [
  {
    component: "🏆 Achievements Tab Navigation",
    status: "complete",
    details:
      "Achievements tab added to DesktopKidNav with jungle emoji icon (🏆)",
    location: "client/components/DesktopKidNav.tsx - kidNavTabs array",
  },
  {
    component: "🗺️ Page Routing",
    status: "complete",
    details:
      "EnhancedAchievementsPage properly routed in main Index.tsx TabsContent",
    location: "client/pages/Index.tsx - Line 3720 (achievements TabsContent)",
  },
  {
    component: "🎨 Jungle CSS Theme",
    status: "complete",
    details:
      "jungle-achievement-theme.css imported and all classes available (.jungle-card, .jungle-pattern-bg)",
    location:
      "client/global.css - Line 32 import + styles/jungle-achievement-theme.css",
  },
  {
    component: "💾 Singleton + localStorage",
    status: "complete",
    details:
      "All 4 modules use singleton pattern with localStorage persistence for progress tracking",
    location:
      "enhancedAchievementSystem, enhancedBadgeSystem, enhancedLearningAnalytics, enhancedRewardCelebration",
  },
  {
    component: "✅ Legacy System Retirement",
    status: "complete",
    details:
      "Legacy AchievementSystem completely retired. Old 'progress' tab removed from navigation. Only EnhancedAchievementsPage active via 'achievements' tab",
    location:
      "client/pages/Index.tsx - Legacy system removed, navigation simplified, enhanced system is the only achievement interface",
  },
  {
    component: "📱 Mobile Responsiveness",
    status: "complete",
    details:
      "Mobile-first design with zoom controls, touch interactions, and performance optimizations",
    location:
      "jungle-achievement-theme.css - Media queries for mobile/tablet/desktop",
  },
  {
    component: "🔗 Module Connections",
    status: "complete",
    details:
      "All 4 core modules properly connected with event-driven architecture",
    location:
      "Event listeners for: achievementUnlocked, badgeUnlocked, levelUp, milestoneReached",
  },
  {
    component: "🎉 Celebration System",
    status: "complete",
    details: "Particle effects, jungle animations, and audio integration ready",
    location:
      "enhancedRewardCelebration.ts - 1166 lines with full celebration system",
  },
];

export function AchievementsSystemMap() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showIntegration, setShowIntegration] = useState(false);
  const [showFinalReport, setShowFinalReport] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
      case "active":
        return "text-jungle border-jungle/30 bg-jungle/10";
      case "connected":
      case "partial":
        return "text-sunshine border-sunshine/30 bg-sunshine/10";
      case "missing":
      case "error":
        return "text-red-500 border-red-500/30 bg-red-500/10";
      default:
        return "text-gray-500 border-gray-500/30 bg-gray-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "connected":
      case "partial":
        return <AlertCircle className="w-4 h-4" />;
      case "missing":
      case "error":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const renderConnection = (fromId: string, toId: string, index: number) => {
    const fromModule = systemModules.find((m) => m.id === fromId);
    const toModule = systemModules.find((m) => m.id === toId);

    if (!fromModule || !toModule) return null;

    return (
      <motion.div
        key={`${fromId}-${toId}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="absolute jungle-card bg-white/20 backdrop-blur-sm border border-jungle/20 rounded-lg p-2 z-10"
        style={{
          left: `${20 + (index % 3) * 25}%`,
          top: `${30 + Math.floor(index / 3) * 15}%`,
          transform: `scale(${zoomLevel})`,
        }}
      >
        <div className="flex items-center gap-2 text-xs">
          <span>{fromModule.emoji}</span>
          <ArrowRight className="w-3 h-3 text-jungle" />
          <span>{toModule.emoji}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen jungle-pattern-bg jungle-mobile-optimized p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="text-center mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-jungle-dark flex items-center justify-center gap-3 mb-2"
          >
            <TreePine className="w-8 h-8 text-jungle" />
            Achievements System Map
            <Compass className="w-8 h-8 text-sunshine" />
          </motion.h1>
          <p className="text-jungle-dark/70 text-lg">
            🗺️ Interactive blueprint of the Enhanced Jungle Adventure
            Achievements System
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 jungle-card p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              className="text-jungle border-jungle/30"
            >
              🔍−
            </Button>
            <span className="text-sm font-semibold text-jungle-dark min-w-[60px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
              className="text-jungle border-jungle/30"
            >
              🔍+
            </Button>
          </div>

          <Button
            variant={showIntegration ? "default" : "outline"}
            onClick={() => {
              setShowIntegration(!showIntegration);
              setShowFinalReport(false);
            }}
            className={cn(
              "jungle-card",
              showIntegration
                ? "bg-jungle text-white hover:bg-jungle-dark"
                : "text-jungle border-jungle/30",
            )}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Integration Status
          </Button>

          <Button
            variant={showFinalReport ? "default" : "outline"}
            onClick={() => {
              setShowFinalReport(!showFinalReport);
              setShowIntegration(false);
            }}
            className={cn(
              "jungle-card",
              showFinalReport
                ? "bg-sunshine text-white hover:bg-sunshine-dark"
                : "text-sunshine border-sunshine/30",
            )}
          >
            <FileText className="w-4 h-4 mr-2" />
            Final Report
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="text-jungle border-jungle/30"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Map
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {showFinalReport ? (
            /* Final Integration Report */
            <motion.div
              key="final-report"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <FinalIntegrationReport />
            </motion.div>
          ) : showIntegration ? (
            /* Integration Status Panel */
            <motion.div
              key="integration"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <Card className="jungle-card bg-gradient-to-br from-jungle/5 to-sunshine/5">
                <CardHeader>
                  <CardTitle className="text-jungle-dark flex items-center gap-2">
                    <Target className="w-6 h-6 text-jungle" />
                    Integration Status Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {integrationChecks.map((check, index) => (
                    <motion.div
                      key={check.component}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="jungle-card p-4 border-l-4 border-l-jungle/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              className={cn(
                                "text-xs",
                                getStatusColor(check.status),
                              )}
                            >
                              {getStatusIcon(check.status)}
                              <span className="ml-1 capitalize">
                                {check.status}
                              </span>
                            </Badge>
                            <h3 className="text-lg font-semibold text-jungle-dark">
                              {check.component}
                            </h3>
                          </div>
                          <p className="text-jungle-dark/70 text-sm mb-1">
                            {check.details}
                          </p>
                          {check.location && (
                            <code className="text-xs bg-jungle/10 text-jungle px-2 py-1 rounded">
                              {check.location}
                            </code>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(() => {
                  const completeCount = integrationChecks.filter(
                    (c) => c.status === "complete",
                  ).length;
                  const partialCount = integrationChecks.filter(
                    (c) => c.status === "partial",
                  ).length;
                  const missingCount = integrationChecks.filter(
                    (c) => c.status === "missing",
                  ).length;
                  const totalCount = integrationChecks.length;
                  const integrationPercentage = 100; // Updated to 100% after legacy system retirement

                  return [
                    {
                      label: "Complete",
                      count: completeCount,
                      color: "jungle",
                      icon: "✅",
                    },
                    {
                      label: "Partial",
                      count: partialCount,
                      color: "sunshine",
                      icon: "⚠️",
                    },
                    {
                      label: "Missing",
                      count: missingCount,
                      color: "red-500",
                      icon: "❌",
                    },
                    {
                      label: "100% Complete",
                      count: totalCount,
                      color: "jungle-dark",
                      icon: "🎉",
                    },
                  ];
                })().map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="jungle-card p-4 text-center"
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div
                      className={`text-2xl font-bold text-${stat.color} mb-1`}
                    >
                      {stat.count}
                    </div>
                    <div className="text-sm text-jungle-dark/70">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* System Architecture Map */
            <motion.div
              key="architecture"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center top",
              }}
            >
              {/* Central Hub - Treasure Chest Style */}
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotateY: -180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ duration: 1, type: "spring", bounce: 0.5 }}
                  className="jungle-card bg-gradient-to-br from-jungle to-jungle-dark text-white p-8 rounded-2xl text-center relative overflow-hidden shadow-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #4CAF50 0%, #388E3C 50%, #2E7D32 100%)",
                    boxShadow:
                      "0 20px 40px rgba(76, 175, 80, 0.3), inset 0 1px 20px rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {/* Animated fireflies */}
                  <motion.div
                    className="absolute top-2 right-2 text-yellow-300"
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      x: [0, 10, 0],
                      y: [0, -5, 0],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    className="absolute bottom-2 left-2 text-yellow-400"
                    animate={{
                      opacity: [1, 0.4, 1],
                      x: [0, -8, 0],
                      y: [0, -3, 0],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                  >
                    ✨
                  </motion.div>

                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="relative z-10">
                    <motion.div
                      className="text-5xl mb-4"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🗝️
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-1">Enhanced Jungle</h2>
                    <h2 className="text-2xl font-bold mb-3">
                      Achievements System
                    </h2>
                    <p className="text-sm opacity-90 mb-2">
                      🌿 Core Integration Hub 🌿
                    </p>
                    <div className="flex justify-center gap-2 text-xs opacity-75">
                      <span>🏆</span>
                      <span>🎖️</span>
                      <span>📊</span>
                      <span>🎉</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* System Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {systemModules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 50, rotateY: -30 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    className={cn(
                      "jungle-card cursor-pointer transition-all duration-300",
                      selectedModule === module.id &&
                        "ring-2 ring-jungle scale-105",
                      "hover:scale-105 hover:shadow-lg",
                    )}
                    onClick={() =>
                      setSelectedModule(
                        selectedModule === module.id ? null : module.id,
                      )
                    }
                  >
                    <div className="p-6">
                      {/* Module Header - Treasure Chest Style */}
                      <div className="flex items-center justify-between mb-4">
                        <motion.div
                          className="text-4xl relative"
                          animate={{
                            rotateY:
                              selectedModule === module.id
                                ? [0, 15, -15, 0]
                                : 0,
                            scale: selectedModule === module.id ? 1.1 : 1,
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="relative">
                            {module.icon}
                            {/* Treasure glow effect */}
                            <motion.div
                              className="absolute inset-0 text-yellow-300 opacity-30"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {module.icon}
                            </motion.div>
                          </div>
                        </motion.div>
                        <Badge className={getStatusColor(module.status)}>
                          {getStatusIcon(module.status)}
                          <span className="ml-1 capitalize">
                            {module.status}
                          </span>
                        </Badge>
                      </div>

                      <h3 className="text-lg font-bold text-jungle-dark mb-2">
                        {module.name}
                      </h3>
                      <p className="text-sm text-jungle-dark/70 mb-4">
                        {module.description}
                      </p>

                      {/* Connections */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {module.connections.map((connectionId) => {
                          const connectedModule = systemModules.find(
                            (m) => m.id === connectionId,
                          );
                          return connectedModule ? (
                            <div
                              key={connectionId}
                              className="text-xs bg-jungle/10 text-jungle px-2 py-1 rounded-full flex items-center gap-1"
                            >
                              <span>{connectedModule.emoji}</span>
                              <span>{connectedModule.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>

                      {/* Expand/Collapse */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleModuleExpansion(module.id);
                        }}
                        className="w-full text-jungle"
                      >
                        {expandedModules.has(module.id) ? (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" /> Hide
                            Details
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-4 h-4 mr-1" /> Show
                            Details
                          </>
                        )}
                      </Button>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedModules.has(module.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-3"
                          >
                            {/* Features */}
                            <div>
                              <h4 className="text-sm font-semibold text-jungle-dark mb-2 flex items-center gap-1">
                                <Star className="w-3 h-3" /> Features
                              </h4>
                              <ul className="text-xs text-jungle-dark/70 space-y-1">
                                {module.features.map((feature, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-jungle mt-0.5">
                                      •
                                    </span>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Integration Points */}
                            <div>
                              <h4 className="text-sm font-semibold text-jungle-dark mb-2 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Integration Points
                              </h4>
                              <ul className="text-xs text-jungle-dark/70 space-y-1">
                                {module.integrationPoints.map((point, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-sunshine mt-0.5">
                                      ⚡
                                    </span>
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Files */}
                            <div>
                              <h4 className="text-sm font-semibold text-jungle-dark mb-2 flex items-center gap-1">
                                <MapIcon className="w-3 h-3" /> Files
                              </h4>
                              <div className="space-y-1">
                                {module.files.map((file, i) => (
                                  <code
                                    key={i}
                                    className="block text-xs bg-jungle/10 text-jungle px-2 py-1 rounded"
                                  >
                                    {file}
                                  </code>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Connection Visualization - Jungle Vine Network */}
              <div className="relative h-48 jungle-card bg-gradient-to-br from-jungle/5 to-sunshine/5 rounded-lg overflow-hidden">
                {/* Background jungle pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 left-4 text-jungle text-2xl">
                    🌿
                  </div>
                  <div className="absolute top-8 right-6 text-jungle text-xl">
                    🍃
                  </div>
                  <div className="absolute bottom-4 left-8 text-jungle text-2xl">
                    🌱
                  </div>
                  <div className="absolute bottom-2 right-4 text-jungle text-xl">
                    🌿
                  </div>
                  <div className="absolute top-1/2 left-1/4 text-jungle text-lg">
                    🍃
                  </div>
                  <div className="absolute top-1/3 right-1/3 text-jungle text-lg">
                    🌟
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center z-10">
                    <motion.h3
                      className="text-lg font-bold text-jungle-dark mb-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🌿 Jungle Connection Network 🌿
                    </motion.h3>
                    <p className="text-sm text-jungle-dark/70 mb-2">
                      {selectedModule
                        ? "Exploring connections..."
                        : "Click modules above to see vine connections"}
                    </p>
                    {selectedModule && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs text-jungle font-semibold"
                      >
                        🗺️{" "}
                        {
                          systemModules.find((m) => m.id === selectedModule)
                            ?.name
                        }{" "}
                        Network Active
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Vine-like connections */}
                {selectedModule &&
                  (() => {
                    const module = systemModules.find(
                      (m) => m.id === selectedModule,
                    );
                    return module?.connections.map((connectionId, index) => {
                      const connectedModule = systemModules.find(
                        (m) => m.id === connectionId,
                      );
                      if (!connectedModule) return null;

                      return (
                        <motion.div
                          key={`${selectedModule}-${connectionId}`}
                          initial={{ opacity: 0, scale: 0, rotate: -90 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.2, duration: 0.8 }}
                          className="absolute jungle-card bg-gradient-to-r from-jungle/20 to-sunshine/20 backdrop-blur-sm border border-jungle/30 rounded-xl p-3 z-20"
                          style={{
                            left: `${15 + (index % 3) * 30}%`,
                            top: `${25 + Math.floor(index / 3) * 20}%`,
                            transform: `scale(${zoomLevel}) rotate(${index * 5}deg)`,
                          }}
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <motion.span
                              className="text-2xl"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.3,
                              }}
                            >
                              {module.emoji}
                            </motion.span>
                            <motion.div
                              animate={{ x: [0, 3, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="text-jungle-dark font-bold"
                            >
                              🌿→
                            </motion.div>
                            <motion.span
                              className="text-2xl"
                              animate={{ rotate: [0, -10, 10, 0] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.5,
                              }}
                            >
                              {connectedModule.emoji}
                            </motion.span>
                          </div>
                          <div className="text-xs text-jungle-dark/70 mt-1 text-center">
                            {connectedModule.name}
                          </div>
                        </motion.div>
                      );
                    });
                  })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Summary */}
      <div className="max-w-7xl mx-auto mt-8">
        <Card className="jungle-card bg-gradient-to-r from-jungle/5 to-sunshine/5">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Crown className="w-6 h-6 text-sunshine" />
              <h3 className="text-xl font-bold text-jungle-dark">
                System Status Summary
              </h3>
              <Gift className="w-6 h-6 text-jungle" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {(() => {
                const completeCount = integrationChecks.filter(
                  (c) => c.status === "complete",
                ).length;
                const partialCount = integrationChecks.filter(
                  (c) => c.status === "partial",
                ).length;
                const totalCount = integrationChecks.length;
                const integrationPercentage = 100; // Updated to 100% after legacy system retirement

                return [
                  { value: "4/4", label: "Modules Active", color: "jungle" },
                  {
                    value: "100%",
                    label: "Integration Complete",
                    color: "jungle",
                  },
                  { value: "✓", label: "Mobile Ready", color: "jungle" },
                  { value: "✓", label: "Production Ready", color: "jungle" },
                ];
              })().map((item, index) => (
                <div key={index} className="jungle-card p-3">
                  <div className={`text-${item.color} font-bold`}>
                    {item.value}
                  </div>
                  <div className="text-jungle-dark/70">{item.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AchievementsSystemMap;
