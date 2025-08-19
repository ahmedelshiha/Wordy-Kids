import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sword,
  Shield,
  Crown,
  Star,
  Heart,
  Zap,
  Trophy,
  Map,
  Target,
  Clock,
  Gift,
  AlertTriangle,
  CheckCircle,
  Flame,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";

import { AdventureMap } from "./AdventureMap";
import { FlashcardDuel } from "./games/FlashcardDuel";
import { WordMatchRace } from "./games/WordMatchRace";
import { LetterBuilder } from "./games/LetterBuilder";

import { adventureService } from "@/lib/adventureService";
import {
  WordAdventureStatus,
  WordHero,
  Mission,
  Badge as AdventureBadge,
  RescueGameResult,
} from "@shared/adventure";

interface Word {
  id: number;
  word: string;
  definition: string;
  emoji?: string;
  imageUrl?: string;
  wrongDefinitions?: string[];
  hint?: string;
}

interface AdventureDashboardProps {
  words: Word[];
  onClose?: () => void;
}

export const AdventureDashboard: React.FC<AdventureDashboardProps> = ({
  words,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [wordHero, setWordHero] = useState<WordHero>(
    adventureService.getWordHero(),
  );
  const [wordsNeedingRescue, setWordsNeedingRescue] = useState<
    WordAdventureStatus[]
  >([]);
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [currentGame, setCurrentGame] = useState<{
    type: string;
    word: Word;
    wordId: string;
  } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordAdventureStatus | null>(
    null,
  );

  useEffect(() => {
    // Initialize word adventure data for all words
    words.forEach((word) => {
      let status = adventureService.getWordAdventureStatus(word.id.toString());
      if (!status) {
        status = adventureService.initializeWordAdventure(word.id.toString());
      }
    });

    // Load rescue data
    loadRescueData();

    // Process health decay
    adventureService.processHealthDecay();

    // Update daily missions
    const missions = adventureService.updateDailyMissions();
    setDailyMissions(missions);
  }, [words]);

  const loadRescueData = () => {
    const rescueWords = adventureService.getWordsNeedingRescue();
    setWordsNeedingRescue(rescueWords);
    setWordHero(adventureService.getWordHero());
  };

  const handleOpenRescueGame = (wordId: string, gameType: string) => {
    const word = words.find((w) => w.id.toString() === wordId);
    if (word) {
      setCurrentGame({ type: gameType, word, wordId });
    }
  };

  const handleGameComplete = (result: RescueGameResult) => {
    try {
      const { updatedWord, hero, newBadges } =
        adventureService.processRescueResult(result);

      // Update state
      setWordHero(hero);
      loadRescueData();

      // Show badges if any were earned
      if (newBadges.length > 0) {
        // Could show a badge notification here
        console.log("New badges earned:", newBadges);
      }

      // Update mission progress
      updateMissionProgress(result.success ? "rescue_words" : "play_games");
    } catch (error) {
      console.error("Error processing rescue result:", error);
    }

    setCurrentGame(null);
  };

  const updateMissionProgress = (missionType: string) => {
    // Update daily mission progress
    const updatedMissions = dailyMissions.map((mission) => {
      if (mission.type === missionType && !mission.completed) {
        const newProgress = mission.current_progress + 1;
        return {
          ...mission,
          current_progress: newProgress,
          completed: newProgress >= mission.target,
        };
      }
      return mission;
    });

    setDailyMissions(updatedMissions);

    // Update hero's daily mission data
    const hero = adventureService.getWordHero();
    hero.daily_mission_progress.missions = updatedMissions;
    hero.daily_mission_progress.completed_count = updatedMissions.filter(
      (m) => m.completed,
    ).length;
    adventureService.saveWordHero(hero);
  };

  const handleWordForgotten = (wordId: string) => {
    adventureService.markWordForgotten(wordId);
    loadRescueData();
  };

  const getPriorityColor = (health: number) => {
    if (health >= 50) return "text-green-600";
    if (health >= 30) return "text-orange-600";
    return "text-red-600";
  };

  const getPriorityIcon = (health: number) => {
    if (health >= 50) return Heart;
    if (health >= 30) return AlertTriangle;
    return Flame;
  };

  // Game Components
  const renderGame = () => {
    if (!currentGame) return null;

    const gameResult = (
      result: Omit<RescueGameResult, "game_id" | "word_id">,
    ) => {
      const fullResult: RescueGameResult = {
        ...result,
        game_id: currentGame.type,
        word_id: currentGame.wordId,
      };
      handleGameComplete(fullResult);
    };

    switch (currentGame.type) {
      case "flashcard_duel":
        return (
          <FlashcardDuel
            word={currentGame.word}
            onGameComplete={gameResult}
            onClose={() => setCurrentGame(null)}
          />
        );
      case "word_match_race":
        return (
          <WordMatchRace
            words={[
              currentGame.word,
              ...words.filter((w) => w.id !== currentGame.word.id).slice(0, 5),
            ]}
            onGameComplete={gameResult}
            onClose={() => setCurrentGame(null)}
          />
        );
      case "letter_builder":
        return (
          <LetterBuilder
            word={currentGame.word}
            onGameComplete={gameResult}
            onClose={() => setCurrentGame(null)}
          />
        );
      default:
        return null;
    }
  };

  if (showMap) {
    return (
      <>
        <AdventureMap
          wordsNeedingRescue={wordsNeedingRescue}
          wordHero={wordHero}
          onSelectWord={setSelectedWord}
          onOpenRescueGame={handleOpenRescueGame}
        />
        <div className="fixed top-4 right-4 z-40">
          <Button
            onClick={() => setShowMap(false)}
            className="bg-white text-gray-800 hover:bg-gray-100 shadow-lg"
          >
            Back to Dashboard
          </Button>
        </div>
        {renderGame()}
      </>
    );
  }

  return (
    <div
      className="min-h-screen bg-responsive-dashboard"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🏰 Forgotten Words Adventure
          </h1>
          <p className="text-gray-600 text-lg">
            Become a Word Hero and rescue forgotten words from the mystical
            realms!
          </p>
        </div>

        {/* Hero Status Card */}
        <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{wordHero.name}</h2>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      <span>Level {wordHero.level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-300">🪙</span>
                      <span>{wordHero.coins}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span>{wordHero.rescued_words_count} Rescued</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90 mb-2">
                  Experience Progress
                </div>
                <div className="flex items-center gap-3">
                  <Progress
                    value={wordHero.experience % 100}
                    className="w-32 h-3 bg-white/20"
                  />
                  <span className="text-sm">{wordHero.experience} XP</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="w-6 h-6 text-red-500" />
                <span className="font-bold text-red-700">Urgent Rescues</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {wordsNeedingRescue.filter((w) => w.health < 30).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <span className="font-bold text-orange-700">
                  Need Attention
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {
                  wordsNeedingRescue.filter(
                    (w) => w.health >= 30 && w.health < 50,
                  ).length
                }
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-blue-700">Daily Missions</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {dailyMissions.filter((m) => m.completed).length}/
                {dailyMissions.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-green-500" />
                <span className="font-bold text-green-700">Badges Earned</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {wordHero.badges.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">🎯 Rescue Center</TabsTrigger>
            <TabsTrigger value="missions">📋 Daily Missions</TabsTrigger>
            <TabsTrigger value="progress">📈 Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Emergency Rescues */}
            {wordsNeedingRescue.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-6 h-6" />
                    Emergency Rescue Missions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wordsNeedingRescue.slice(0, 6).map((wordStatus) => {
                      const word = words.find(
                        (w) => w.id.toString() === wordStatus.word_id,
                      );
                      if (!word) return null;

                      const PriorityIcon = getPriorityIcon(wordStatus.health);

                      return (
                        <Card
                          key={wordStatus.word_id}
                          className="border-2 border-red-300"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <PriorityIcon
                                  className={`w-5 h-5 ${getPriorityColor(wordStatus.health)} ${wordStatus.health < 30 ? "animate-pulse" : ""}`}
                                />
                                <span className="font-bold">{word.word}</span>
                              </div>
                              <span
                                className={`text-sm font-bold ${getPriorityColor(wordStatus.health)}`}
                              >
                                {wordStatus.health}%
                              </span>
                            </div>

                            <Progress
                              value={wordStatus.health}
                              className={`h-2 mb-3 ${
                                wordStatus.health >= 50
                                  ? "bg-green-100"
                                  : wordStatus.health >= 30
                                    ? "bg-orange-100"
                                    : "bg-red-100"
                              }`}
                            />

                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  handleOpenRescueGame(
                                    wordStatus.word_id,
                                    "flashcard_duel",
                                  )
                                }
                                size="sm"
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                              >
                                <Sword className="w-4 h-4 mr-1" />
                                Duel
                              </Button>
                              <Button
                                onClick={() =>
                                  handleOpenRescueGame(
                                    wordStatus.word_id,
                                    "letter_builder",
                                  )
                                }
                                size="sm"
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                Build
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="mt-6 text-center">
                    <Button
                      onClick={() => setShowMap(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
                    >
                      <Map className="w-5 h-5 mr-2" />
                      Open Adventure Map
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Rescues Needed */}
            {wordsNeedingRescue.length === 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">
                    All Words Are Safe! 🎉
                  </h3>
                  <p className="text-green-600 mb-6">
                    Amazing work, Word Hero! All your vocabulary is healthy and
                    happy.
                  </p>
                  <Button
                    onClick={() => setShowMap(true)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Map className="w-5 h-5 mr-2" />
                    Explore Adventure Map
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="missions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-500" />
                  Today's Missions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyMissions.map((mission) => (
                  <div
                    key={mission.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">
                        {mission.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {mission.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Progress
                          value={
                            (mission.current_progress / mission.target) * 100
                          }
                          className="w-32 h-2"
                        />
                        <span className="text-sm text-gray-600">
                          {mission.current_progress}/{mission.target}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      {mission.completed ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-bold">Complete!</span>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div className="font-bold text-blue-600">
                            +{mission.reward_xp} XP
                          </div>
                          <div className="font-bold text-yellow-600">
                            +{mission.reward_coins} Coins
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hero Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                    Hero Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Level Progress</span>
                        <span>{wordHero.level}</span>
                      </div>
                      <Progress
                        value={wordHero.experience % 100}
                        className="h-3"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="font-bold text-blue-600 text-xl">
                          {wordHero.experience}
                        </div>
                        <div className="text-sm text-gray-600">Total XP</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="font-bold text-yellow-600 text-xl">
                          {wordHero.coins}
                        </div>
                        <div className="text-sm text-gray-600">Coins</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Earned Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {wordHero.badges.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {wordHero.badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="p-3 bg-gray-50 rounded-lg text-center"
                        >
                          <div className="text-2xl mb-1">{badge.icon}</div>
                          <div className="font-bold text-sm">{badge.name}</div>
                          <div className="text-xs text-gray-600">
                            {badge.tier}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No badges earned yet.</p>
                      <p className="text-sm">
                        Complete rescue missions to earn your first badge!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Close Button */}
        {onClose && (
          <div className="text-center pt-6">
            <Button onClick={onClose} variant="outline" className="px-8">
              Back to Learning
            </Button>
          </div>
        )}
      </div>

      {/* Render active game */}
      {renderGame()}
    </div>
  );
};
