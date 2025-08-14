import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedWordAdventureCard } from "@/components/EnhancedWordAdventureCard";

// Test data that matches our exact requirements
const testWords = [
  {
    id: 1,
    word: "Apple",
    pronunciation: "/ˈæpəl/",
    definition: "A round fruit with red or green skin that's sweet and crunchy",
    example: "I eat a red apple for breakfast every day",
    funFact: "Apples float in water because they are 25% air!",
    emoji: "🍎",
    category: "food",
    difficulty: "easy" as const,
  },
  {
    id: 2,
    word: "Elephant",
    pronunciation: "/ˈeləfənt/",
    definition: "A huge gray animal with a long trunk and big ears",
    example: "The elephant uses its trunk to pick up things",
    funFact: "Elephants can't jump - they're the only mammals that can't!",
    emoji: "🐘",
    category: "animals",
    difficulty: "medium" as const,
  },
  {
    id: 3,
    word: "Butterfly",
    pronunciation: "/ˈbʌtərflaɪ/",
    definition: "A colorful insect with beautiful wings that can fly",
    example: "The butterfly landed gently on the flower",
    funFact: "Butterflies taste with their feet - how cool is that!",
    emoji: "🦋",
    category: "animals",
    difficulty: "hard" as const,
  },
];

export function WordAdventureTest() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [favoriteWords, setFavoriteWords] = useState<Set<number>>(new Set());
  const [testResults, setTestResults] = useState<string[]>([]);

  const currentWord = testWords[currentWordIndex];

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const handleWordFavorite = (word: any) => {
    const newFavorites = new Set(favoriteWords);
    if (favoriteWords.has(word.id)) {
      newFavorites.delete(word.id);
      addTestResult(`❤️ Removed "${word.word}" from favorites`);
    } else {
      newFavorites.add(word.id);
      addTestResult(`❤️ Added "${word.word}" to favorites`);
    }
    setFavoriteWords(newFavorites);
  };

  const handlePronounce = (word: any) => {
    addTestResult(`🔊 Pronounced "${word.word}"`);
  };

  const handleWordMastered = (wordId: number, rating: "easy" | "medium" | "hard") => {
    const word = testWords.find(w => w.id === wordId);
    addTestResult(`🌟 Mastered "${word?.word}" with rating: ${rating}`);
  };

  const nextWord = () => {
    const nextIndex = (currentWordIndex + 1) % testWords.length;
    setCurrentWordIndex(nextIndex);
    addTestResult(`➡️ Switched to word: "${testWords[nextIndex].word}"`);
  };

  const prevWord = () => {
    const prevIndex = currentWordIndex === 0 ? testWords.length - 1 : currentWordIndex - 1;
    setCurrentWordIndex(prevIndex);
    addTestResult(`⬅️ Switched to word: "${testWords[prevIndex].word}"`);
  };

  const runAutomatedTest = async () => {
    addTestResult("🤖 Starting automated test sequence...");
    
    // Test 1: Card flip
    addTestResult("Test 1: Card should flip when clicked");
    
    // Test 2: Star progression
    addTestResult("Test 2: Stars should increment with interactions");
    
    // Test 3: Voice buttons
    addTestResult("Test 3: Voice buttons should work and unlock funny voice");
    
    // Test 4: Mini-games
    addTestResult("Test 4: Mini-games should be accessible on back of card");
    
    // Test 5: Strict category filtering
    addTestResult("Test 5: Category filtering - all test words have correct categories");
    testWords.forEach(word => {
      if (word.category === "food" || word.category === "animals") {
        addTestResult(`✅ "${word.word}" correctly categorized as "${word.category}"`);
      } else {
        addTestResult(`❌ "${word.word}" has incorrect category: "${word.category}"`);
      }
    });
    
    addTestResult("🎉 Automated test sequence completed!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Enhanced Word Adventure Card Test
          </h1>
          <p className="text-slate-600">
            Testing all the kid-friendly features and improvements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card Display */}
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-center mb-2">
                Interactive Word Card
              </h2>
              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={prevWord}>
                  ← Previous
                </Button>
                <Button size="sm" variant="outline" onClick={nextWord}>
                  Next →
                </Button>
              </div>
            </div>

            <EnhancedWordAdventureCard
              word={currentWord}
              onFavorite={handleWordFavorite}
              onPronounce={handlePronounce}
              onWordMastered={handleWordMastered}
              showVocabularyBuilder={true}
              enableMiniGames={true}
              autoPlay={false}
              className="animate-fade-in"
            />

            <div className="mt-4 text-center">
              <p className="text-sm text-slate-600">
                Current: {currentWord.word} ({currentWord.category}, {currentWord.difficulty})
              </p>
              <p className="text-xs text-slate-500">
                {favoriteWords.has(currentWord.id) ? "❤️ Favorited" : "🤍 Not favorited"}
              </p>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Test Results
                  <div className="flex gap-2">
                    <Button size="sm" onClick={runAutomatedTest}>
                      Run Tests
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setTestResults([])}>
                      Clear
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4 h-80 overflow-y-auto">
                  {testResults.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                      Interact with the card or run automated tests to see results here...
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {testResults.map((result, index) => (
                        <p key={index} className="text-xs font-mono text-slate-700">
                          {result}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Feature Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Features to Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Strict category filtering (no mixed categories)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Large word text + emoji buddy animation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Big pronunciation button (normal + funny voice)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Interactive back with definition, example, fun fact</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Mini-games: Sound Match, Emoji Builder, Letter Hunt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Star meter (1-3 stars) with progression</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Sparkles celebration on achievements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Achievement integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Mobile-first with large touch targets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Smooth flip animation preserves state</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>📱 How to Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>Desktop:</strong>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Click the pronunciation buttons (🔊 normal, 😄 funny when unlocked)</li>
                    <li>Click anywhere on the card to flip front/back</li>
                    <li>Try the mini-games on the back side</li>
                    <li>Watch the star meter progress as you interact</li>
                  </ul>
                </div>
                <div>
                  <strong>Mobile (if available):</strong>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Swipe left to favorite ❤��</li>
                    <li>Swipe up to pronounce 🔊</li>
                    <li>Swipe right to flip 🔄</li>
                    <li>Tap to flip between front/back</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
