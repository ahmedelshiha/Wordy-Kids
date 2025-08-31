import { Button } from "@/components/ui/button";
import { EnhancedWordCard } from "./EnhancedWordCard";
import { wordsDatabase } from "@/data/wordsDatabase";
import { ArrowLeft, ArrowRight, Shuffle } from "lucide-react";

export function EnhancedWordCardDemo() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter words by category
  const filteredWords =
    selectedCategory === "all"
      ? wordsDatabase
      : wordsDatabase.filter((word) => word.category === selectedCategory);

  const currentWord = filteredWords[currentWordIndex];

  // Get unique categories
  const categories = [
    "all",
    ...new Set(wordsDatabase.map((word) => word.category)),
  ];

  const nextWord = () => {
    setCurrentWordIndex((prev) => (prev + 1) % filteredWords.length);
  };

  const prevWord = () => {
    setCurrentWordIndex(
      (prev) => (prev - 1 + filteredWords.length) % filteredWords.length,
    );
  };

  const randomWord = () => {
    setCurrentWordIndex(Math.floor(Math.random() * filteredWords.length));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentWordIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            🎯 Enhanced Word Card Demo
          </h1>
          <p className="text-slate-600 text-lg">
            Experience the new kid-friendly word card with mini-games, voice
            options, and interactive learning!
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">
            Choose Category:
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => handleCategoryChange(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`capitalize ${
                  selectedCategory === category
                    ? "bg-educational-blue text-white"
                    : ""
                }`}
              >
                {category === "all" ? "All Categories" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Word Card */}
        {currentWord && (
          <div className="mb-8">
            <EnhancedWordCard
              word={currentWord}
              onPronounce={(word) => console.log("Pronounced:", word.word)}
              onFavorite={(word) => console.log("Favorited:", word.word)}
              onWordMastered={(wordId, rating) =>
                console.log(`Word ${wordId} mastered with rating:`, rating)
              }
              showVocabularyBuilder={true}
              enableSwipeGestures={true}
              showAccessibilityFeatures={true}
            />
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            onClick={prevWord}
            className="h-12 px-6"
            disabled={filteredWords.length <= 1}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              {currentWordIndex + 1} of {filteredWords.length}
            </p>
            <p className="text-xs text-slate-500">
              Category: {selectedCategory === "all" ? "All" : selectedCategory}
            </p>
          </div>

          <Button onClick={randomWord} className="h-12 px-6" variant="outline">
            <Shuffle className="w-5 h-5 mr-2" />
            Random
          </Button>

          <Button
            onClick={nextWord}
            className="h-12 px-6"
            disabled={filteredWords.length <= 1}
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Features List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">
            ✨ New Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700">
                🎮 Interactive Features:
              </h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Smooth 3D flip animation</li>
                <li>• Star progress meter (hear, flip, play)</li>
                <li>• Normal & funny voice options</li>
                <li>• Enhanced swipe gestures</li>
                <li>• Sparkles celebration effects</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700">🎯 Mini-Games:</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• 🎧 Sound Match - listen & match</li>
                <li>• 🧩 Emoji Builder - build emoji pieces</li>
                <li>• 🔤 Letter Hunt - spell the word</li>
                <li>• Knowledge rating system</li>
                <li>• Achievement tracking</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50/50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">💡 How to Use:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                ��� <strong>Tap</strong> the card to flip and see definition
              </li>
              <li>
                • <strong>Swipe up</strong> to hear pronunciation
              </li>
              <li>
                • <strong>Swipe left</strong> to favorite the word
              </li>
              <li>
                • <strong>Try different voices</strong> - normal and funny!
              </li>
              <li>
                • <strong>Play mini-games</strong> on the back to earn stars
              </li>
              <li>
                • <strong>Rate your knowledge</strong> to track progress
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
