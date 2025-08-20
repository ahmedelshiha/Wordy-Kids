import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Star,
  Trophy,
  Crown,
  Gift,
  TreePine,
  Flower,
  Bird,
  Compass,
  MapPin,
  Target,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MapMarker {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  type: "milestone" | "achievement" | "treasure" | "animal" | "path";
  title: string;
  description: string;
  completed: boolean;
  locked: boolean;
  category: string;
  progress: number; // 0-100
  emoji: string;
  date?: Date;
  analytics?: {
    timeSpent: number; // minutes
    accuracyScore: number; // percentage
    streak: number; // consecutive days
    lastActive?: Date;
    attempts: number;
    hintsUsed: number;
  };
}

interface InteractiveJungleMapProps {
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}

// Sample data - in real app this would come from child progress
const sampleMarkers: MapMarker[] = [
  {
    id: "start",
    x: 10,
    y: 80,
    type: "milestone",
    title: "Adventure Begins",
    description: "First steps into the jungle",
    completed: true,
    locked: false,
    category: "Getting Started",
    progress: 100,
    emoji: "🌟",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    analytics: {
      timeSpent: 15,
      accuracyScore: 95,
      streak: 7,
      lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      attempts: 1,
      hintsUsed: 0,
    },
  },
  {
    id: "word-builder",
    x: 25,
    y: 65,
    type: "achievement",
    title: "Word Builder",
    description: "Built 10 new words",
    completed: true,
    locked: false,
    category: "Vocabulary",
    progress: 100,
    emoji: "🔤",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    analytics: {
      timeSpent: 32,
      accuracyScore: 88,
      streak: 5,
      lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      attempts: 3,
      hintsUsed: 2,
    },
  },
  {
    id: "parrot-friend",
    x: 40,
    y: 50,
    type: "animal",
    title: "Chatty Parrot",
    description: "Met the jungle parrot guide",
    completed: true,
    locked: false,
    category: "Friends",
    progress: 100,
    emoji: "🦜",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    analytics: {
      timeSpent: 8,
      accuracyScore: 100,
      streak: 3,
      lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      attempts: 1,
      hintsUsed: 0,
    },
  },
  {
    id: "reading-tree",
    x: 60,
    y: 35,
    type: "milestone",
    title: "Reading Tree",
    description: "Climbed the great reading tree",
    completed: false,
    locked: false,
    category: "Reading",
    progress: 65,
    emoji: "🌳",
    analytics: {
      timeSpent: 18,
      accuracyScore: 78,
      streak: 2,
      lastActive: new Date(),
      attempts: 5,
      hintsUsed: 3,
    },
  },
  {
    id: "treasure-chest",
    x: 75,
    y: 25,
    type: "treasure",
    title: "Golden Treasure",
    description: "Hidden treasure awaits",
    completed: false,
    locked: true,
    category: "Rewards",
    progress: 0,
    emoji: "🏆",
  },
  {
    id: "wise-owl",
    x: 85,
    y: 15,
    type: "animal",
    title: "Wise Owl",
    description: "The keeper of knowledge",
    completed: false,
    locked: true,
    category: "Wisdom",
    progress: 0,
    emoji: "🦉",
  },
];

export const InteractiveJungleMap: React.FC<InteractiveJungleMapProps> = ({
  className,
  onMarkerClick,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedMarker(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMarkerClick = (marker: MapMarker) => {
    if (!marker.locked) {
      setSelectedMarker(marker);
      onMarkerClick?.(marker);
    }
  };

  const getMarkerIcon = (marker: MapMarker) => {
    switch (marker.type) {
      case "milestone":
        return marker.completed ? (
          <Star className="w-4 h-4" />
        ) : (
          <Target className="w-4 h-4" />
        );
      case "achievement":
        return <Trophy className="w-4 h-4" />;
      case "treasure":
        return <Gift className="w-4 h-4" />;
      case "animal":
        return <Bird className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getMarkerColor = (marker: MapMarker) => {
    if (marker.locked) return "bg-gray-400";
    if (marker.completed) return "bg-green-500";
    if (marker.progress > 0) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-green-50 to-blue-50",
        className,
      )}
    >
      <CardContent className="p-0">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-sm"
            onClick={handleZoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-sm"
            onClick={handleZoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-sm"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Map Container */}
        <div
          ref={mapRef}
          className="relative w-full h-[500px] cursor-grab active:cursor-grabbing overflow-hidden"
          style={{ backgroundColor: "#f0f9ff" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Map Background */}
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.3) 20%, transparent 40%),
                radial-gradient(circle at 70% 20%, rgba(59, 130, 246, 0.2) 15%, transparent 35%),
                radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.2) 25%, transparent 45%),
                radial-gradient(circle at 30% 80%, rgba(245, 158, 11, 0.3) 30%, transparent 50%)
              `,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            {/* Jungle Path */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M 10 80 Q 25 70, 40 50 Q 55 30, 70 35 Q 80 40, 85 15"
                stroke="rgba(101, 163, 13, 0.6)"
                strokeWidth="0.8"
                fill="none"
                strokeDasharray="2,2"
                className="animate-pulse"
              />
            </svg>

            {/* Jungle Elements */}
            <div className="absolute inset-0">
              {/* Trees */}
              <TreePine
                className="absolute w-8 h-8 text-green-600 opacity-60"
                style={{ left: "15%", top: "25%" }}
              />
              <TreePine
                className="absolute w-6 h-6 text-green-500 opacity-50"
                style={{ left: "50%", top: "60%" }}
              />
              <TreePine
                className="absolute w-10 h-10 text-green-700 opacity-70"
                style={{ left: "80%", top: "40%" }}
              />

              {/* Flowers */}
              <Flower
                className="absolute w-4 h-4 text-pink-400 opacity-60"
                style={{ left: "30%", top: "70%" }}
              />
              <Flower
                className="absolute w-3 h-3 text-purple-400 opacity-50"
                style={{ left: "65%", top: "80%" }}
              />
              <Flower
                className="absolute w-5 h-5 text-yellow-400 opacity-60"
                style={{ left: "20%", top: "45%" }}
              />
            </div>

            {/* Progress Markers */}
            {sampleMarkers.map((marker) => (
              <motion.div
                key={marker.id}
                className="absolute"
                style={{
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleMarkerClick(marker)}
              >
                <div
                  className={cn(
                    "relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-white transition-all duration-200",
                    getMarkerColor(marker),
                    marker.locked && "opacity-50 cursor-not-allowed",
                    selectedMarker?.id === marker.id && "ring-4 ring-white/70",
                  )}
                >
                  {getMarkerIcon(marker)}

                  {/* Progress Ring */}
                  {marker.progress > 0 && !marker.completed && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="2"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeDasharray={`${marker.progress * 2.83} 283`}
                        className="transition-all duration-500"
                      />
                    </svg>
                  )}

                  {/* Emoji overlay */}
                  <div className="absolute -top-1 -right-1 text-xs bg-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {marker.emoji}
                  </div>
                </div>

                {/* Marker Label */}
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <Badge
                    variant={
                      marker.completed
                        ? "default"
                        : marker.locked
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs px-2 py-1 bg-white/90 backdrop-blur-sm shadow-sm"
                  >
                    {marker.title}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Selected Marker Info Panel */}
        <AnimatePresence>
          {selectedMarker && (
            <motion.div
              className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{selectedMarker.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {selectedMarker.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {selectedMarker.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {selectedMarker.description}
                  </p>

                  {/* Analytics Section */}
                  {selectedMarker.analytics && !selectedMarker.locked && (
                    <div className="space-y-3 mb-3">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Time Spent */}
                        <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                          <span className="text-base">⏱️</span>
                          <div>
                            <p className="text-xs text-gray-600">Time</p>
                            <p className="text-sm font-semibold">{selectedMarker.analytics.timeSpent}m</p>
                          </div>
                        </div>

                        {/* Accuracy Score */}
                        <div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg">
                          <span className="text-base">⭐</span>
                          <div>
                            <p className="text-xs text-gray-600">Accuracy</p>
                            <p className="text-sm font-semibold">{selectedMarker.analytics.accuracyScore}%</p>
                          </div>
                        </div>

                        {/* Streak */}
                        <div className="flex items-center gap-2 bg-orange-50 p-2 rounded-lg">
                          <span className="text-base">🎯</span>
                          <div>
                            <p className="text-xs text-gray-600">Streak</p>
                            <p className="text-sm font-semibold">{selectedMarker.analytics.streak} days</p>
                          </div>
                        </div>

                        {/* Last Active */}
                        {selectedMarker.analytics.lastActive && (
                          <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg">
                            <span className="text-base">📅</span>
                            <div>
                              <p className="text-xs text-gray-600">Last Active</p>
                              <p className="text-sm font-semibold">
                                {selectedMarker.analytics.lastActive.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Stats */}
                      {(selectedMarker.analytics.attempts > 1 || selectedMarker.analytics.hintsUsed > 0) && (
                        <div className="flex gap-4 text-xs text-gray-600 border-t pt-2">
                          {selectedMarker.analytics.attempts > 1 && (
                            <span>🔄 {selectedMarker.analytics.attempts} attempts</span>
                          )}
                          {selectedMarker.analytics.hintsUsed > 0 && (
                            <span>💡 {selectedMarker.analytics.hintsUsed} hints used</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress Bar */}
                  {selectedMarker.progress > 0 && !selectedMarker.completed && (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{selectedMarker.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${selectedMarker.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {selectedMarker.completed && selectedMarker.date && (
                    <div className="text-xs text-gray-500 bg-green-50 p-2 rounded-lg">
                      🎉 Completed {selectedMarker.date.toLocaleDateString()}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMarker(null)}
                  className="ml-2"
                >
                  ✕
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Legend */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-3 space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Legend</h4>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Locked</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveJungleMap;
