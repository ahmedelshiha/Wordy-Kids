import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WordCard } from '@/components/WordCard';
import { LearningDashboard } from '@/components/LearningDashboard';
import { QuizGame } from '@/components/QuizGame';
import { CategorySelector } from '@/components/CategorySelector';
import { WordMatchingGame } from '@/components/WordMatchingGame';
import { VocabularyBuilder } from '@/components/VocabularyBuilder';
import { SettingsPanel } from '@/components/SettingsPanel';
import { FloatingBubbles } from '@/components/FloatingBubbles';
import { CelebrationEffect } from '@/components/CelebrationEffect';
import { DailyChallenge } from '@/components/DailyChallenge';
import { ReadingComprehension } from '@/components/ReadingComprehension';
import { ParentDashboard } from '@/components/ParentDashboard';
import { 
  BookOpen, 
  Play, 
  Trophy, 
  Users, 
  Sparkles,
  ArrowRight,
  Star,
  Target,
  Heart,
  Gamepad2,
  Brain,
  Shuffle,
  Settings,
  Calendar,
  FileText,
  Users
} from 'lucide-react';

// Sample data for learning
const sampleWords = [
  {
    id: 1,
    word: "adventure",
    pronunciation: "/ədˈven(t)SHər/",
    definition: "An exciting or unusual experience, often involving exploration or discovery",
    example: "Reading books takes you on amazing adventures to new worlds",
    funFact: "The word 'adventure' comes from Latin 'adventurus' meaning 'about to arrive'",
    emoji: "🗺️",
    category: "general",
    difficulty: "medium" as const,
    imageUrl: undefined
  },
  {
    id: 2,
    word: "butterfly",
    pronunciation: "/ˈbʌdərˌflaɪ/",
    definition: "A colorful flying insect with large, often brightly colored wings",
    example: "The butterfly landed gently on the bright yellow flower",
    funFact: "Butterflies taste with their feet and can see ultraviolet colors!",
    emoji: "🦋",
    category: "animals",
    difficulty: "easy" as const,
    imageUrl: undefined
  },
  {
    id: 3,
    word: "telescope",
    pronunciation: "/ˈtelɪ��skoʊp/",
    definition: "An instrument used to see distant objects, especially stars and planets",
    example: "Through the telescope, we could see the craters on the moon",
    funFact: "The first telescope was invented in 1608 and made stars look 20 times closer!",
    emoji: "🔭",
    category: "science",
    difficulty: "hard" as const,
    imageUrl: undefined
  },
  {
    id: 4,
    word: "rainbow",
    pronunciation: "/ˈreɪnboʊ/",
    definition: "A colorful arc in the sky formed by sunlight and water droplets",
    example: "After the rain, a beautiful rainbow appeared in the sky",
    funFact: "Rainbows always appear in the opposite direction from the sun!",
    emoji: "🌈",
    category: "nature",
    difficulty: "easy" as const,
    imageUrl: undefined
  },
  {
    id: 5,
    word: "magnificent",
    pronunciation: "/mæɡˈnɪfɪsənt/",
    definition: "Extremely beautiful, impressive, or grand in scale",
    example: "The magnificent castle stood tall against the mountain backdrop",
    funFact: "The word comes from Latin 'magnificus' meaning 'great in deed'",
    emoji: "✨",
    category: "general",
    difficulty: "hard" as const,
    imageUrl: undefined
  }
];

const sampleQuizQuestions = [
  {
    id: 1,
    word: "adventure",
    question: "What does 'adventure' mean?",
    options: [
      "A boring experience",
      "An exciting or unusual experience",
      "A type of food",
      "A musical instrument"
    ],
    correctAnswer: "An exciting or unusual experience",
    explanation: "Adventure means an exciting journey or experience that often involves exploration.",
    emoji: "🗺️"
  },
  {
    id: 2,
    word: "butterfly",
    question: "How do butterflies taste their food?",
    options: [
      "With their tongue",
      "With their wings",
      "With their feet",
      "With their antennae"
    ],
    correctAnswer: "With their feet",
    explanation: "Butterflies have taste receptors on their feet to help them find the right plants for their eggs.",
    emoji: "🦋"
  },
  {
    id: 3,
    word: "telescope",
    question: "What is a telescope used for?",
    options: [
      "Cooking food",
      "Seeing distant objects",
      "Playing music",
      "Writing stories"
    ],
    correctAnswer: "Seeing distant objects",
    explanation: "Telescopes help us see things that are very far away, like stars and planets.",
    emoji: "🔭"
  }
];

// Sample data for matching game
const matchingPairs = [
  { id: 1, word: "adventure", definition: "An exciting or unusual experience", matched: false },
  { id: 2, word: "butterfly", definition: "A colorful flying insect with large wings", matched: false },
  { id: 3, word: "telescope", definition: "An instrument used to see distant objects", matched: false },
  { id: 4, word: "rainbow", definition: "A colorful arc in the sky", matched: false }
];

// Sample vocabulary builder words
const vocabularyWords = sampleWords.map(word => ({
  ...word,
  masteryLevel: Math.floor(Math.random() * 100),
  lastReviewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  nextReview: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000)
}));

const learningStats = {
  wordsLearned: 47,
  totalWords: 200,
  currentStreak: 5,
  weeklyGoal: 15,
  weeklyProgress: 12,
  accuracyRate: 87,
  favoriteCategory: "Animals",
  totalPoints: 1250,
  level: 3,
  badges: [
    {
      id: "first-word",
      name: "First Word",
      icon: "🎯",
      earned: true,
      description: "Learned your first word"
    },
    {
      id: "streak-starter",
      name: "Streak Starter",
      icon: "🔥",
      earned: true,
      description: "5-day learning streak"
    },
    {
      id: "quiz-master",
      name: "Quiz Master",
      icon: "🧠",
      earned: false,
      description: "Score 100% on 5 quizzes"
    },
    {
      id: "explorer",
      name: "Explorer",
      icon: "🚀",
      earned: false,
      description: "Try all categories"
    }
  ]
};

export default function Index() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [learningMode, setLearningMode] = useState<'cards' | 'builder' | 'matching'>('cards');
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [userRole, setUserRole] = useState<'child' | 'parent'>('child');

  const handleQuizComplete = (score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);
    alert(`Quiz Complete! You scored ${score}/${total} (${percentage}%)`);
    setShowQuiz(false);
  };

  const handleMatchingComplete = (score: number, timeSpent: number) => {
    alert(`Matching Game Complete! You matched ${score} pairs in ${timeSpent} seconds!`);
  };

  const handleVocabularySessionComplete = (wordsReviewed: number, accuracy: number) => {
    alert(`Vocabulary Session Complete! Reviewed ${wordsReviewed} words with ${accuracy}% accuracy!`);
  };

  const handleWordMastered = (wordId: number, rating: 'easy' | 'medium' | 'hard') => {
    console.log(`Word ${wordId} rated as ${rating}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Word Adventure
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Embark on an exciting journey to discover new words and expand your vocabulary! 
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-educational-blue hover:bg-slate-100 font-semibold"
                onClick={() => setActiveTab("learn")}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setActiveTab("games")}
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Play Games
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setActiveTab("quiz")}
              >
                <Trophy className="w-5 h-5 mr-2" />
                Take Quiz
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 text-4xl animate-bounce">🌟</div>
        <div className="absolute top-20 right-20 text-3xl animate-pulse">📚</div>
        <div className="absolute bottom-10 left-20 text-5xl animate-bounce delay-1000">🎯</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-pulse delay-500">🚀</div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-flex max-w-4xl">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="learn" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Learn
              </TabsTrigger>
              <TabsTrigger value="games" className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Games
              </TabsTrigger>
              <TabsTrigger value="reading" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Reading
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Progress
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button
                variant={userRole === 'child' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUserRole('child')}
              >
                Child
              </Button>
              <Button
                variant={userRole === 'parent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUserRole('parent')}
              >
                <Users className="w-4 h-4 mr-1" />
                Parent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="lg:flex hidden items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>

          <TabsContent value="dashboard">
            <LearningDashboard stats={learningStats} userName="Alex" />
          </TabsContent>

          <TabsContent value="learn">
            <div className="space-y-8">
              {selectedCategory === 'all' ? (
                <CategorySelector 
                  categories={[]} 
                  selectedCategory={selectedCategory}
                  onSelectCategory={(category) => {
                    setSelectedCategory(category);
                    setLearningMode('cards');
                  }}
                />
              ) : (
                <>
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">
                      Learning Mode
                    </h2>
                    <p className="text-slate-600 mb-8">
                      Choose how you'd like to learn your vocabulary!
                    </p>
                    
                    <div className="flex justify-center gap-4 mb-8">
                      <Button
                        onClick={() => setLearningMode('cards')}
                        variant={learningMode === 'cards' ? 'default' : 'outline'}
                        className="flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        Word Cards
                      </Button>
                      <Button
                        onClick={() => setLearningMode('builder')}
                        variant={learningMode === 'builder' ? 'default' : 'outline'}
                        className="flex items-center gap-2"
                      >
                        <Brain className="w-4 h-4" />
                        Vocabulary Builder
                      </Button>
                      <Button
                        onClick={() => setSelectedCategory('all')}
                        variant="ghost"
                      >
                        ← Back to Categories
                      </Button>
                    </div>
                  </div>

                  {learningMode === 'cards' && (
                    <>
                      <div className="flex justify-center mb-6">
                        <div className="flex gap-2">
                          {sampleWords.map((_, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant={currentWordIndex === index ? "default" : "outline"}
                              onClick={() => setCurrentWordIndex(index)}
                              className="w-8 h-8 p-0"
                            >
                              {index + 1}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="max-w-md mx-auto">
                        <WordCard 
                          word={sampleWords[currentWordIndex]}
                          onPronounce={(word) => console.log('Playing pronunciation for:', word.word)}
                          onFavorite={(word) => console.log('Favorited:', word.word)}
                        />
                      </div>

                      <div className="flex justify-center gap-4">
                        <Button
                          onClick={() => setCurrentWordIndex(Math.max(0, currentWordIndex - 1))}
                          disabled={currentWordIndex === 0}
                          variant="outline"
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={() => setCurrentWordIndex(Math.min(sampleWords.length - 1, currentWordIndex + 1))}
                          disabled={currentWordIndex === sampleWords.length - 1}
                        >
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </>
                  )}

                  {learningMode === 'builder' && (
                    <VocabularyBuilder
                      words={vocabularyWords}
                      onWordMastered={handleWordMastered}
                      onSessionComplete={handleVocabularySessionComplete}
                    />
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="games">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">
                  Learning Games
                </h2>
                <p className="text-slate-600 mb-8">
                  Make learning fun with our interactive vocabulary games!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold mb-2">Word Matching</h3>
                    <p className="text-slate-600 mb-4">
                      Match words with their definitions in this fun memory game!
                    </p>
                    <Button 
                      className="bg-educational-blue text-white"
                      onClick={() => setLearningMode('matching')}
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Start Matching
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">🧩</div>
                    <h3 className="text-xl font-semibold mb-2">Word Puzzle</h3>
                    <p className="text-slate-600 mb-4">
                      Solve word puzzles and unscramble letters to form vocabulary words!
                    </p>
                    <Button 
                      variant="outline"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {learningMode === 'matching' && (
                <div className="mt-8">
                  <WordMatchingGame
                    pairs={matchingPairs}
                    onComplete={handleMatchingComplete}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quiz">
            <div className="space-y-6">
              {!showQuiz ? (
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">
                    Test Your Knowledge
                  </h2>
                  <p className="text-slate-600 mb-8">
                    Challenge yourself with our interactive quiz! Answer questions about 
                    the words you've learned and earn points.
                  </p>
                  
                  <Card className="p-8 bg-gradient-to-br from-educational-purple/10 to-educational-blue/10">
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-educational-blue">
                            {sampleQuizQuestions.length}
                          </div>
                          <div className="text-sm text-slate-600">Questions</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-educational-purple">30s</div>
                          <div className="text-sm text-slate-600">Per Question</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-educational-orange">
                            {sampleQuizQuestions.length * 10}
                          </div>
                          <div className="text-sm text-slate-600">Max Points</div>
                        </div>
                      </div>
                      
                      <Button 
                        size="lg" 
                        onClick={() => setShowQuiz(true)}
                        className="bg-educational-blue text-white hover:bg-educational-blue/90"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <QuizGame
                  questions={sampleQuizQuestions}
                  onComplete={handleQuizComplete}
                  onProgress={(current, total) => 
                    console.log(`Quiz progress: ${current}/${total}`)
                  }
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">
                  Your Learning Journey
                </h2>
                <p className="text-slate-600 mb-8">
                  Track your progress and celebrate your achievements!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-educational-green/10 to-educational-green/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-educational-green">
                      <Heart className="w-5 h-5" />
                      Words Mastered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{learningStats.wordsLearned}</div>
                    <p className="text-sm text-slate-600">
                      Keep going! You're doing amazing.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-educational-orange/10 to-educational-orange/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-educational-orange">
                      <Sparkles className="w-5 h-5" />
                      Current Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{learningStats.currentStreak} days</div>
                    <p className="text-sm text-slate-600">
                      You're on fire! Keep it up.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-educational-purple/10 to-educational-purple/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-educational-purple">
                      <Trophy className="w-5 h-5" />
                      Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">Level {learningStats.level}</div>
                    <p className="text-sm text-slate-600">
                      {learningStats.totalPoints} total points earned
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {learningStats.badges.map((badge) => (
                  <Card 
                    key={badge.id}
                    className={`text-center p-4 transition-all ${
                      badge.earned 
                        ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-yellow-300' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h4 className="font-semibold mb-1">{badge.name}</h4>
                    <p className="text-xs text-slate-600">{badge.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reading">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">
                  Reading Comprehension
                </h2>
                <p className="text-slate-600 mb-8">
                  Improve your reading skills and vocabulary through engaging stories!
                </p>
              </div>

              <ReadingComprehension
                passage={undefined} // Will use default sample passage
                onComplete={(score, total) => {
                  setShowCelebration(true);
                  setTimeout(() => {
                    alert(`Reading Complete! You scored ${score}/${total}!`);
                    setShowCelebration(false);
                  }, 2000);
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="challenges">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">
                  Daily Challenges
                </h2>
                <p className="text-slate-600 mb-8">
                  Complete daily challenges to earn rewards and build learning habits!
                </p>
              </div>

              <DailyChallenge
                challenges={[]}
                onChallengeComplete={(challengeId) => {
                  console.log('Challenge completed:', challengeId);
                  setShowCelebration(true);
                  setTimeout(() => setShowCelebration(false), 3000);
                }}
                onStartChallenge={(challengeId) => {
                  console.log('Starting challenge:', challengeId);
                  // In a real app, this would navigate to the appropriate learning activity
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-educational-blue" />
              <span className="text-xl font-bold text-slate-800">Word Adventure</span>
            </div>
            <p className="text-slate-600 mb-4">
              Making vocabulary learning fun and engaging for children everywhere
            </p>
            <div className="flex justify-center gap-6 text-sm text-slate-500">
              <span>© 2024 Word Adventure</span>
              <span>•</span>
              <span>Made with ❤️ for young learners</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
