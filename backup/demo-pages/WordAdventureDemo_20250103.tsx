import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Shuffle, Grid3X3 } from "lucide-react";
import { EnhancedWordAdventureCard } from "@/components/EnhancedWordAdventureCard";
import {
  wordsDatabase,
  getWordsByCategory,
  getAllCategories,
} from "@/data/wordsDatabase";

export function WordAdventureDemo() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favoriteWords, setFavoriteWords] = useState<Set<number>>(new Set());

  // Get words based on selected category
  const getFilteredWords = () => {
    if (selectedCategory === "all") {
      return wordsDatabase;
    }
    return getWordsByCategory(selectedCategory);
  };

  const filteredWords = getFilteredWords();
  const currentWord = filteredWords[currentWordIndex];
  const categories = getAllCategories();

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentWordIndex(0);
  };

  const handleNextWord = () => {
    if (currentWordIndex < filteredWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setCurrentWordIndex(0); // Loop back to start
    }
  };

  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    } else {
      setCurrentWordIndex(filteredWords.length - 1); // Loop to end
    }
  };

  const handleRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    setCurrentWordIndex(randomIndex);
  };

  const handleWordFavorite = (word: any) => {
    const newFavorites = new Set(favoriteWords);
    if (favoriteWords.has(word.id)) {
      newFavorites.delete(word.id);
    } else {
      newFavorites.add(word.id);
    }
    setFavoriteWords(newFavorites);
  };

  const handleWordMastered = (
    wordId: number,
    rating: "easy" | "medium" | "hard",
  ) => {
    console.log(`Word ${wordId} mastered with rating: ${rating}`);
    // In a real app, this would update the user's progress
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-slate-800">
              Word Adventure Card Demo
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {currentWordIndex + 1} of {filteredWords.length}
            </Badge>
          </div>
        </div>

        {/* Category Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              Select Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => handleCategoryChange("all")}
                className="capitalize"
              >
                All Words ({wordsDatabase.length})
              </Button>
              {categories.map((category) => {
                const categoryWords = getWordsByCategory(category);
                return (
                  <Button
                    key={category}
                    size="sm"
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    onClick={() => handleCategoryChange(category)}
                    className="capitalize"
                  >
                    {category} ({categoryWords.length})
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handlePrevWord}
            disabled={filteredWords.length <= 1}
            className="flex items-center gap-2"
          >
            ← Previous
          </Button>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleRandomWord}
              disabled={filteredWords.length <= 1}
              className="flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Random
            </Button>

            <Button
              variant="outline"
              onClick={() => setCurrentWordIndex(0)}
              disabled={currentWordIndex === 0}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          <Button
            onClick={handleNextWord}
            disabled={filteredWords.length <= 1}
            className="flex items-center gap-2"
          >
            Next →
          </Button>
        </div>

        {/* Word Card Display */}
        {currentWord ? (
          <div className="flex justify-center">
            <EnhancedWordAdventureCard
              word={currentWord}
              onFavorite={handleWordFavorite}
              onWordMastered={handleWordMastered}
              showVocabularyBuilder={true}
              enableMiniGames={true}
              autoPlay={false}
              className="animate-fade-in"
            />
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-2">No Words Found</h3>
              <p className="text-gray-600 mb-4">
                No words available in the selected category.
              </p>
              <Button onClick={() => handleCategoryChange("all")}>
                Show All Words
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>How to Use the Word Adventure Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-educational-blue mb-2">
                  Front Card Features:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Large Word Display:</strong> Kid-friendly large
                    text with pronunciation
                  </li>
                  <li>
                    • <strong>Animated Emoji Buddy:</strong> Floating emoji that
                    represents the word
                  </li>
                  <li>
                    • <strong>Star Progress Meter:</strong> Earn stars by
                    interacting with the card
                  </li>
                  <li>
                    • <strong>Voice Buttons:</strong> Normal voice + unlock
                    funny voice by earning stars
                  </li>
                  <li>
                    • <strong>Touch Gestures:</strong> Swipe left (❤️), up (🔊),
                    right (🎮)
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-educational-green mb-2">
                  Back Card Features:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Simple Definition:</strong> Kid-friendly
                    explanations
                  </li>
                  <li>
                    • <strong>Example Sentence:</strong> Shows word usage in
                    context
                  </li>
                  <li>
                    • <strong>Fun Fact:</strong> Interesting trivia about the
                    word
                  </li>
                  <li>
                    • <strong>Mini-Games:</strong> Sound Match, Emoji Builder,
                    Letter Hunt
                  </li>
                  <li>
                    • <strong>Progress Tracking:</strong> See your adventure
                    progress
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-educational-blue mb-2">
                🌟 Star System:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span>Listen to pronunciation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐⭐</span>
                  <span>Flip and explore back</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐⭐⭐</span>
                  <span>Complete a mini-game</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Get all 3 stars to unlock the funny voice and trigger
                celebrations! 🎉
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-educational-green mb-2">
                🎮 Mini-Games:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>🎧 Sound Match:</strong> Listen and pick the correct
                  picture
                </div>
                <div>
                  <strong>🧩 Emoji Builder:</strong> Place the missing emoji
                  piece
                </div>
                <div>
                  <strong>🔤 Letter Hunt:</strong> Tap letters in correct order
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="mt-6 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Demo Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-educational-blue">
                  {filteredWords.length}
                </div>
                <div className="text-sm text-gray-600">Total Words</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-educational-green">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-educational-orange">
                  {favoriteWords.size}
                </div>
                <div className="text-sm text-gray-600">Favorites</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-educational-purple">
                  {selectedCategory === "all" ? "All" : selectedCategory}
                </div>
                <div className="text-sm text-gray-600">Current Filter</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
