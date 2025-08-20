import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JungleAdventureStorage } from "@/lib/jungleAdventureStorage";
import { parentDashboardAnalytics } from "@/lib/parentDashboardAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Star,
  Crown,
  Target,
  Gift,
  Calendar,
  Filter,
  Clock,
  Award,
  Zap,
  Heart,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  type: "achievement" | "milestone" | "celebration";
  title: string;
  description: string;
  date: Date;
  emoji: string;
  category: string;
  child?: string;
  points?: number;
  difficulty: "easy" | "medium" | "hard";
  analytics?: {
    timeSpent: number;
    accuracyScore: number;
    attempts: number;
  };
}

interface FamilyAchievementsTimelineProps {
  className?: string;
  events?: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

// Sample timeline data
const sampleEvents: TimelineEvent[] = [
  {
    id: "1",
    type: "celebration",
    title: "Week Learning Streak!",
    description: "Emma completed 7 days in a row!",
    date: new Date(),
    emoji: "🔥",
    category: "Consistency",
    child: "Emma",
    points: 50,
    difficulty: "medium",
    analytics: {
      timeSpent: 105,
      accuracyScore: 92,
      attempts: 12,
    },
  },
  {
    id: "2",
    type: "achievement",
    title: "Animal Expert",
    description: "Mastered all animal words",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    emoji: "🦁",
    category: "Vocabulary",
    child: "Leo",
    points: 100,
    difficulty: "hard",
    analytics: {
      timeSpent: 85,
      accuracyScore: 95,
      attempts: 8,
    },
  },
  {
    id: "3",
    type: "milestone",
    title: "First 50 Words",
    description: "Reached 50 words learned milestone",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    emoji: "🏆",
    category: "Progress",
    child: "Emma",
    points: 75,
    difficulty: "medium",
    analytics: {
      timeSpent: 120,
      accuracyScore: 88,
      attempts: 15,
    },
  },
  {
    id: "4",
    type: "achievement",
    title: "Perfect Pronunciation",
    description: "Got 100% accuracy in speech recognition",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    emoji: "🎯",
    category: "Speaking",
    child: "Leo",
    points: 25,
    difficulty: "easy",
    analytics: {
      timeSpent: 20,
      accuracyScore: 100,
      attempts: 3,
    },
  },
  {
    id: "5",
    type: "milestone",
    title: "Reading Tree Climber",
    description: "Completed the jungle reading challenge",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    emoji: "🌳",
    category: "Reading",
    child: "Emma",
    points: 150,
    difficulty: "hard",
    analytics: {
      timeSpent: 180,
      accuracyScore: 90,
      attempts: 25,
    },
  },
  {
    id: "6",
    type: "celebration",
    title: "Parrot Friend Unlocked",
    description: "Met the chatty jungle parrot guide",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    emoji: "🦜",
    category: "Adventure",
    child: "Leo",
    points: 30,
    difficulty: "easy",
    analytics: {
      timeSpent: 15,
      accuracyScore: 85,
      attempts: 2,
    },
  },
];

export const FamilyAchievementsTimeline: React.FC<
  FamilyAchievementsTimelineProps
> = ({ className, events, onEventClick }) => {
  const [filter, setFilter] = useState<"all" | "achievements" | "milestones">(
    "all",
  );
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null,
  );
  const [timelineEvents, setTimelineEvents] =
    useState<TimelineEvent[]>(sampleEvents);

  // Load events from unified storage on mount
  useEffect(() => {
    const storedEvents = JungleAdventureStorage.getTimelineEvents();
    if (storedEvents.length > 0) {
      setTimelineEvents(storedEvents);
    } else {
      // Initialize with sample data and save to storage
      JungleAdventureStorage.updateSettings({ timelineEvents: sampleEvents });
      setTimelineEvents(sampleEvents);
    }
  }, []);

  // Use provided events or loaded events
  const displayEvents = events || timelineEvents;

  const filteredEvents = displayEvents.filter((event) => {
    if (filter === "all") return true;
    if (filter === "achievements") return event.type === "achievement";
    if (filter === "milestones") return event.type === "milestone";
    return true;
  });

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case "achievement":
        return <Trophy className="w-4 h-4" />;
      case "milestone":
        return <Star className="w-4 h-4" />;
      case "celebration":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const getEventColor = (event: TimelineEvent) => {
    switch (event.type) {
      case "achievement":
        return "bg-yellow-500";
      case "milestone":
        return "bg-purple-500";
      case "celebration":
        return "bg-pink-500";
      default:
        return "bg-blue-500";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-jungle-dark">
            <Calendar className="w-5 h-5 text-profile-purple" />
            🌟 Family Achievements Timeline
          </CardTitle>

          {/* Filter Tabs */}
          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as any)}
            className="w-auto"
          >
            <TabsList className="bg-white/50 backdrop-blur-sm border border-jungle/20">
              <TabsTrigger value="all" className="text-xs">
                <Filter className="w-3 h-3 mr-1" />
                All Events
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="milestones" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Milestones
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="text-sm text-jungle-dark/70">
          Celebrate your family's learning journey through the magical jungle!
          🌿
        </p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Timeline Container */}
        <div className="relative">
          {/* Jungle Vine Timeline */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 via-green-500 to-green-600 rounded-full shadow-lg">
            {/* Animated leaves on the vine */}
            <div className="absolute -left-1 top-4 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div className="absolute -left-1 top-16 w-2 h-2 bg-green-300 rounded-full animate-pulse delay-100"></div>
            <div className="absolute -left-1 top-28 w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
          </div>

          {/* Timeline Events */}
          <div className="space-y-6">
            <AnimatePresence>
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  className="relative flex items-start gap-4 cursor-pointer group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedEvent(event);
                    onEventClick?.(event);
                  }}
                >
                  {/* Event Marker */}
                  <div className="relative z-10">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 group-hover:scale-110",
                        getEventColor(event),
                      )}
                    >
                      {getEventIcon(event)}
                    </div>

                    {/* Footprint */}
                    <div className="absolute -bottom-2 -right-1 text-xs opacity-70">
                      🐾
                    </div>
                  </div>

                  {/* Event Content */}
                  <motion.div
                    className="flex-1 bg-white/80 backdrop-blur-sm rounded-lg border border-jungle/10 p-4 shadow-sm hover:shadow-md transition-all duration-200 group-hover:bg-white/90"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{event.emoji}</span>
                          <h3 className="font-semibold text-jungle-dark">
                            {event.title}
                          </h3>
                          {event.child && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-jungle/10"
                            >
                              {event.child}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-jungle-dark/70 mb-2">
                          {event.description}
                        </p>

                        {/* Event metadata */}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-jungle-dark/60 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(event.date)}
                          </span>

                          <Badge variant="outline" className="text-xs">
                            {event.category}
                          </Badge>

                          <Badge
                            className={cn(
                              "text-xs",
                              getDifficultyColor(event.difficulty),
                            )}
                          >
                            {event.difficulty}
                          </Badge>

                          {event.points && (
                            <span className="text-jungle-dark/60 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {event.points} pts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Analytics Preview */}
                    {event.analytics && (
                      <div className="flex gap-4 text-xs text-jungle-dark/60 border-t pt-2 mt-2">
                        <span className="flex items-center gap-1">
                          ⏱️ {event.analytics.timeSpent}m
                        </span>
                        <span className="flex items-center gap-1">
                          ⭐ {event.analytics.accuracyScore}%
                        </span>
                        <span className="flex items-center gap-1">
                          🔄 {event.analytics.attempts} tries
                        </span>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Timeline End Marker */}
          <div className="relative flex items-start gap-4 mt-6">
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-jungle to-sunshine flex items-center justify-center text-white shadow-lg">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="flex-1 bg-gradient-to-r from-jungle/5 to-sunshine/5 rounded-lg border border-jungle/10 p-4">
              <p className="text-sm text-jungle-dark/70 text-center">
                🌟 The adventure continues... More amazing achievements await!
                🌟
              </p>
            </div>
          </div>
        </div>

        {/* Selected Event Details Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{selectedEvent.emoji}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-jungle-dark">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-sm text-jungle-dark/70">
                      {selectedEvent.child} •{" "}
                      {formatTimeAgo(selectedEvent.date)}
                    </p>
                  </div>
                </div>

                <p className="text-jungle-dark/80 mb-4">
                  {selectedEvent.description}
                </p>

                {selectedEvent.analytics && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600">Time Spent</p>
                      <p className="font-semibold">
                        ⏱️ {selectedEvent.analytics.timeSpent}m
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600">Accuracy</p>
                      <p className="font-semibold">
                        ⭐ {selectedEvent.analytics.accuracyScore}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-600">Attempts</p>
                      <p className="font-semibold">
                        🔄 {selectedEvent.analytics.attempts}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge
                      className={cn(
                        "text-xs",
                        getDifficultyColor(selectedEvent.difficulty),
                      )}
                    >
                      {selectedEvent.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedEvent.category}
                    </Badge>
                  </div>
                  {selectedEvent.points && (
                    <div className="flex items-center gap-1 text-jungle-dark/70">
                      <Zap className="w-4 h-4" />
                      <span className="font-semibold">
                        {selectedEvent.points} points
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default FamilyAchievementsTimeline;
