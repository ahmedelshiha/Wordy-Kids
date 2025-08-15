import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Trophy, Sparkles } from "lucide-react";

const avatars = [
  {
    id: "cat",
    emoji: "🐱",
    name: "Whiskers",
    color: "from-orange-400 to-orange-600",
  },
  {
    id: "dog",
    emoji: "🐶",
    name: "Buddy",
    color: "from-brown-400 to-brown-600",
  },
  {
    id: "lion",
    emoji: "🦁",
    name: "Leo",
    color: "from-yellow-400 to-yellow-600",
  },
  {
    id: "unicorn",
    emoji: "🦄",
    name: "Sparkle",
    color: "from-pink-400 to-purple-600",
  },
  {
    id: "dragon",
    emoji: "🐉",
    name: "Flame",
    color: "from-green-400 to-green-600",
  },
  {
    id: "bear",
    emoji: "🐻",
    name: "Honey",
    color: "from-amber-400 to-amber-600",
  },
  {
    id: "rabbit",
    emoji: "🐰",
    name: "Hoppy",
    color: "from-gray-400 to-gray-600",
  },
  { id: "panda", emoji: "🐼", name: "Bamboo", color: "from-black to-gray-600" },
];

const savedProfiles = [
  {
    id: "alex",
    avatar: avatars[3],
    level: 5,
    points: 1250,
    streak: 7,
    wordsLearned: 42,
  },
  {
    id: "sam",
    avatar: avatars[0],
    level: 3,
    points: 850,
    streak: 4,
    wordsLearned: 28,
  },
  {
    id: "taylor",
    avatar: avatars[4],
    level: 7,
    points: 2100,
    streak: 12,
    wordsLearned: 67,
  },
];

interface ChildLoginProps {
  onLogin: (profile: any) => void;
  onCreateProfile: () => void;
}

export function ChildLogin({ onLogin, onCreateProfile }: ChildLoginProps) {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const handleProfileSelect = (profile: any) => {
    setSelectedProfile(profile.id);
    // Add a small delay for visual feedback
    setTimeout(() => {
      onLogin(profile);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-educational-blue to-educational-purple p-6 rounded-full">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome to Wordy Kids! 🌟
          </h1>
          <p className="text-lg text-gray-600">
            Choose your learning buddy to start your vocabulary journey!
          </p>
        </div>

        {/* Profile Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {savedProfiles.map((profile) => (
            <Card
              key={profile.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                selectedProfile === profile.id
                  ? "ring-4 ring-educational-blue bg-gradient-to-br from-blue-50 to-purple-50"
                  : "hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50"
              }`}
              onClick={() => handleProfileSelect(profile)}
            >
              <CardHeader className="text-center pb-2">
                <div
                  className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${profile.avatar.color} flex items-center justify-center text-4xl mb-3 shadow-lg`}
                >
                  {profile.avatar.emoji}
                </div>
                <CardTitle className="text-xl text-gray-800 capitalize">
                  {profile.id}
                </CardTitle>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-gray-600">
                    Level {profile.level}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Progress Stats */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-educational-blue/10 rounded-lg p-2">
                    <div className="text-lg font-bold text-educational-blue">
                      {profile.wordsLearned}
                    </div>
                    <div className="text-xs text-gray-600">Words</div>
                  </div>
                  <div className="bg-educational-orange/10 rounded-lg p-2">
                    <div className="text-lg font-bold text-educational-orange">
                      {profile.streak}
                    </div>
                    <div className="text-xs text-gray-600">Day Streak</div>
                  </div>
                </div>

                {/* Points */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-yellow-600">
                      {profile.points.toLocaleString()} Points
                    </span>
                  </div>
                </div>

                {/* Learning Buddy */}
                <div className="text-center">
                  <Badge
                    variant="secondary"
                    className="bg-educational-purple/20 text-educational-purple"
                  >
                    🎯 Learning with {profile.avatar.name}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create New Profile */}
        <div className="text-center">
          <Card className="inline-block cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-educational-green/10 to-educational-blue/10 border-2 border-dashed border-educational-green/30">
            <CardContent className="p-6 text-center" onClick={onCreateProfile}>
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-educational-green to-educational-blue flex items-center justify-center text-3xl mb-3">
                ➕
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Create New Adventure
              </h3>
              <p className="text-sm text-gray-600">
                Start your vocabulary journey with a new learning buddy!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Fun Elements */}
        <div className="fixed top-10 left-10 text-4xl animate-bounce">🌟</div>
        <div className="fixed top-20 right-20 text-3xl animate-pulse">📚</div>
        <div className="fixed bottom-10 left-20 text-4xl animate-bounce delay-1000">
          🎯
        </div>
        <div className="fixed bottom-20 right-10 text-3xl animate-pulse delay-500">
          🚀
        </div>
      </div>
    </div>
  );
}
