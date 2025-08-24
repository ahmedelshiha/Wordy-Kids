import React from "react";
import WordGarden from "@/components/games/WordGarden";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WordGardenDemo() {
  const navigate = useNavigate();

  const handleFinish = (stats: any) => {
    console.log("WordGarden finished:", stats);
    alert(
      `Game Complete!\nCorrect: ${stats.correct}/${stats.totalRounds}\nBest Streak: ${stats.bestStreak}`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            🌱 Word Garden Demo
          </h1>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-2">How to Play:</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Listen to the word pronunciation</li>
            <li>• Pick the correct picture from the options</li>
            <li>• Watch your garden grow with each correct answer!</li>
            <li>• Perfect for ages 3-5</li>
          </ul>
        </div>

        <WordGarden
          rounds={10}
          optionsPerRound={3}
          difficulty="easy"
          onFinish={handleFinish}
        />
      </div>
    </div>
  );
}
