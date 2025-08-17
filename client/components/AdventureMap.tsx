import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sword,
  Shield,
  Heart,
  Zap,
  MapPin,
  Clock,
  Star,
  AlertTriangle,
  Crown,
  Trees,
  Castle,
  Home,
  Mountain,
  Flame,
} from "lucide-react";
import { WordAdventureStatus, MapZone, WordHero } from "@shared/adventure";
import { adventureService } from "@/lib/adventureService";

interface AdventureMapProps {
  wordsNeedingRescue: WordAdventureStatus[];
  wordHero: WordHero;
  onSelectWord: (word: WordAdventureStatus) => void;
  onOpenRescueGame: (wordId: string, gameType: string) => void;
}

const zoneInfo = {
  word_forest: {
    name: "Word Forest",
    icon: Trees,
    bgGradient: "from-green-400 to-emerald-600",
    description: "A mystical forest where words hide among ancient trees",
    color: "text-green-100",
  },
  memory_castle: {
    name: "Memory Castle",
    icon: Castle,
    bgGradient: "from-purple-500 to-indigo-600",
    description: "An enchanted castle where forgotten memories dwell",
    color: "text-purple-100",
  },
  vocabulary_village: {
    name: "Vocabulary Village",
    icon: Home,
    bgGradient: "from-blue-400 to-cyan-600",
    description: "A peaceful village where words live in harmony",
    color: "text-blue-100",
  },
  knowledge_kingdom: {
    name: "Knowledge Kingdom",
    icon: Mountain,
    bgGradient: "from-orange-400 to-red-600",
    description: "The majestic kingdom of ultimate word mastery",
    color: "text-orange-100",
  },
};

const getHealthIcon = (health: number) => {
  if (health >= 80)
    return { icon: Heart, color: "text-green-400", pulse: false };
  if (health >= 50)
    return { icon: Heart, color: "text-yellow-400", pulse: false };
  if (health >= 30)
    return { icon: AlertTriangle, color: "text-orange-400", pulse: true };
  return { icon: Flame, color: "text-red-400", pulse: true };
};

const getPriorityLevel = (
  health: number,
): "low" | "medium" | "high" | "critical" => {
  if (health >= 50) return "low";
  if (health >= 30) return "medium";
  if (health >= 10) return "high";
  return "critical";
};

export const AdventureMap: React.FC<AdventureMapProps> = ({
  wordsNeedingRescue,
  wordHero,
  onSelectWord,
  onOpenRescueGame,
}) => {
  const [selectedZone, setSelectedZone] = useState<MapZone | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordAdventureStatus | null>(
    null,
  );
  const [showWordDetails, setShowWordDetails] = useState(false);

  // Group words by zone
  const wordsByZone = wordsNeedingRescue.reduce(
    (acc, word) => {
      if (!acc[word.location.zone]) {
        acc[word.location.zone] = [];
      }
      acc[word.location.zone].push(word);
      return acc;
    },
    {} as Record<MapZone, WordAdventureStatus[]>,
  );

  const handleWordClick = (word: WordAdventureStatus) => {
    setSelectedWord(word);
    setShowWordDetails(true);
    onSelectWord(word);
  };

  const handleStartRescue = (gameType: string) => {
    if (selectedWord) {
      onOpenRescueGame(selectedWord.word_id, gameType);
      setShowWordDetails(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 optimize-for-small-screen">
      {/* Map Header - Compact */}
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
          🗺️ Word Rescue Map
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Choose a zone to rescue forgotten words and restore their power!
        </p>
      </div>

      {/* Hero Status Bar - Compact */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg">{wordHero.name}</h3>
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                  <span>Level {wordHero.level}</span>
                  <span>🪙 {wordHero.coins}</span>
                  <span>🛡️ {wordHero.rescued_words_count}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs md:text-sm opacity-90">Experience</div>
              <div className="flex items-center gap-1 md:gap-2">
                <Progress
                  value={wordHero.experience % 100}
                  className="w-16 md:w-20 h-1.5 md:h-2 bg-white/20"
                />
                <span className="text-xs md:text-sm">{wordHero.experience} XP</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Selection - Compact Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        {Object.entries(zoneInfo).map(([zoneKey, zone]) => {
          const zoneWords = wordsByZone[zoneKey as MapZone] || [];
          const urgentWords = zoneWords.filter((w) => w.health < 30).length;
          const Icon = zone.icon;

          return (
            <Card
              key={zoneKey}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 transform ${
                selectedZone === zoneKey
                  ? "ring-4 ring-yellow-400 shadow-2xl"
                  : "hover:shadow-lg"
              }`}
              onClick={() =>
                setSelectedZone(
                  selectedZone === zoneKey ? null : (zoneKey as MapZone),
                )
              }
            >
              <CardContent
                className={`p-0 rounded-lg md:rounded-xl bg-gradient-to-br ${zone.bgGradient} text-white relative overflow-hidden`}
              >
                <div className="p-3 md:p-4 lg:p-6 relative z-10">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
                    {zoneWords.length > 0 && (
                      <Badge className="bg-white/20 text-white border-white/30 text-xs px-1.5 py-0.5">
                        {zoneWords.length}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-bold text-sm md:text-base lg:text-lg mb-1 md:mb-2">{zone.name}</h3>
                  <p className={`text-xs md:text-sm ${zone.color} opacity-90 hidden md:block`}>
                    {zone.description}
                  </p>

                  {urgentWords > 0 && (
                    <div className="mt-2 md:mt-3 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-red-300 animate-pulse" />
                      <span className="text-xs md:text-sm text-red-200">
                        {urgentWords} urgent!
                      </span>
                    </div>
                  )}
                </div>

                {/* Decorative elements */}
                <div className="absolute top-1 right-1 md:top-2 md:right-2 opacity-20">
                  <Icon className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Zone Detail View - Compact */}
      {selectedZone && (
        <Card className="bg-white border border-yellow-300">
          <CardContent className="p-3 md:p-4 lg:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              {React.createElement(zoneInfo[selectedZone].icon, {
                className: "w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-purple-600",
              })}
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                {zoneInfo[selectedZone].name}
              </h3>
            </div>

            {wordsByZone[selectedZone]?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {wordsByZone[selectedZone].map((word) => {
                  const healthInfo = getHealthIcon(word.health);
                  const priority = getPriorityLevel(word.health);
                  const HealthIcon = healthInfo.icon;

                  return (
                    <Card
                      key={word.word_id}
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 transform border-2 ${
                        priority === "critical"
                          ? "border-red-400 shadow-red-200"
                          : priority === "high"
                            ? "border-orange-400 shadow-orange-200"
                            : priority === "medium"
                              ? "border-yellow-400 shadow-yellow-200"
                              : "border-green-400 shadow-green-200"
                      }`}
                      onClick={() => handleWordClick(word)}
                    >
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <HealthIcon
                              className={`w-4 h-4 md:w-5 md:h-5 ${healthInfo.color} ${healthInfo.pulse ? "animate-pulse" : ""}`}
                            />
                            <span className="font-bold text-sm md:text-base lg:text-lg">
                              Word #{word.word_id}
                            </span>
                          </div>
                          <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                        </div>

                        <div className="space-y-1.5 md:space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs md:text-sm text-gray-600">
                              Health
                            </span>
                            <span
                              className={`text-xs md:text-sm font-bold ${
                                word.health >= 50
                                  ? "text-green-600"
                                  : word.health >= 30
                                    ? "text-orange-600"
                                    : "text-red-600"
                              }`}
                            >
                              {word.health}%
                            </span>
                          </div>
                          <Progress
                            value={word.health}
                            className={`h-1.5 md:h-2 ${
                              word.health >= 50
                                ? "bg-green-100"
                                : word.health >= 30
                                  ? "bg-orange-100"
                                  : "bg-red-100"
                            }`}
                          />

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Forgot {word.forget_count}x</span>
                            <span>Attempts: {word.rescue_attempts}</span>
                          </div>
                        </div>

                        {priority === "critical" && (
                          <div className="mt-2 md:mt-3 flex items-center gap-1.5 p-1.5 md:p-2 bg-red-50 rounded-lg">
                            <Flame className="w-3 h-3 md:w-4 md:h-4 text-red-500 animate-pulse" />
                            <span className="text-xs text-red-700 font-medium">
                              URGENT!
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8">
                <Star className="w-12 h-12 md:w-14 md:h-14 text-yellow-400 mx-auto mb-2 md:mb-3" />
                <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-1 md:mb-2">
                  No Words Need Rescue!
                </h3>
                <p className="text-sm md:text-base text-gray-500">
                  All words in {zoneInfo[selectedZone].name} are healthy! 🎉
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Word Detail Modal - Compact */}
      {showWordDetails && selectedWord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <Card className="max-w-sm md:max-w-md w-full bg-white">
            <CardContent className="p-4 md:p-6">
              <div className="text-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Sword className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-1 md:mb-2">
                  Rescue Mission
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Choose rescue strategy for Word #{selectedWord.word_id}
                </p>
              </div>

              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm font-medium text-gray-700">
                      Word Health
                    </span>
                    <span
                      className={`text-xs md:text-sm font-bold ${
                        selectedWord.health >= 50
                          ? "text-green-600"
                          : selectedWord.health >= 30
                            ? "text-orange-600"
                            : "text-red-600"
                      }`}
                    >
                      {selectedWord.health}%
                    </span>
                  </div>
                  <Progress value={selectedWord.health} className="h-2 md:h-3" />
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                  <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
                    <div className="font-bold text-blue-600">
                      {selectedWord.forget_count}
                    </div>
                    <div className="text-gray-600">Forgotten</div>
                  </div>
                  <div className="text-center p-2 md:p-3 bg-purple-50 rounded-lg">
                    <div className="font-bold text-purple-600">
                      {selectedWord.rescue_attempts}
                    </div>
                    <div className="text-gray-600">Attempts</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <h3 className="font-bold text-sm md:text-base text-gray-800">
                  Choose Your Rescue Game:
                </h3>

                <Button
                  onClick={() => handleStartRescue("flashcard_duel")}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Flashcard Duel
                </Button>

                <Button
                  onClick={() => handleStartRescue("word_match_race")}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Word Match Race
                </Button>

                <Button
                  onClick={() => handleStartRescue("letter_builder")}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Letter Builder
                </Button>
              </div>

              <Button
                onClick={() => setShowWordDetails(false)}
                variant="outline"
                className="w-full"
              >
                Cancel Mission
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
