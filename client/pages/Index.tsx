import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WordCard } from "@/components/WordCard";
import { LearningDashboard } from "@/components/LearningDashboard";
import { QuizGame } from "@/components/QuizGame";
import { CategorySelector } from "@/components/CategorySelector";
import { WordMatchingGame } from "@/components/WordMatchingGame";
import { VocabularyBuilder } from "@/components/VocabularyBuilder";
import { SettingsPanel } from "@/components/SettingsPanel";
import { FloatingBubbles } from "@/components/FloatingBubbles";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { DailyChallenge } from "@/components/DailyChallenge";
import { ReadingComprehension } from "@/components/ReadingComprehension";
import { ParentDashboard } from "@/components/ParentDashboard";
import { WordCreator } from "@/components/WordCreator";
import { LearningAnalytics } from "@/components/LearningAnalytics";
import {
  wordsDatabase,
  getWordsByCategory,
  getRandomWords,
} from "@/data/wordsDatabase";
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
  Plus,
  TrendingUp,
  Zap,
  ImageIcon,
  PenTool,
  Clock,
} from "lucide-react";

// Sample data for learning
const sampleWords = [
  {
    id: 1,
    word: "adventure",
    pronunciation: "/ədˈven(t)SHər/",
    definition:
      "An exciting or unusual experience, often involving exploration or discovery",
    example: "Reading books takes you on amazing adventures to new worlds",
    funFact:
      "The word 'adventure' comes from Latin 'adventurus' meaning 'about to arrive'",
    emoji: "🗺️",
    category: "general",
    difficulty: "medium" as const,
    imageUrl: undefined,
  },
  {
    id: 2,
    word: "butterfly",
    pronunciation: "/ˈbʌdərˌflaɪ/",
    definition:
      "A colorful flying insect with large, often brightly colored wings",
    example: "The butterfly landed gently on the bright yellow flower",
    funFact:
      "Butterflies taste with their feet and can see ultraviolet colors!",
    emoji: "🦋",
    category: "animals",
    difficulty: "easy" as const,
    imageUrl: undefined,
  },
  {
    id: 3,
    word: "telescope",
    pronunciation: "/ˈtelɪskoʊp/",
    definition:
      "An instrument used to see distant objects, especially stars and planets",
    example: "Through the telescope, we could see the craters on the moon",
    funFact:
      "The first telescope was invented in 1608 and made stars look 20 times closer!",
    emoji: "🔭",
    category: "science",
    difficulty: "hard" as const,
    imageUrl: undefined,
  },
  {
    id: 4,
    word: "rainbow",
    pronunciation: "/ˈreɪnboʊ/",
    definition:
      "A colorful arc in the sky formed by sunlight and water droplets",
    example: "After the rain, a beautiful rainbow appeared in the sky",
    funFact: "Rainbows always appear in the opposite direction from the sun!",
    emoji: "🌈",
    category: "nature",
    difficulty: "easy" as const,
    imageUrl: undefined,
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
    imageUrl: undefined,
  },
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
      "A musical instrument",
    ],
    correctAnswer: "An exciting or unusual experience",
    explanation:
      "Adventure means an exciting journey or experience that often involves exploration.",
    emoji: "🗺️",
  },
  {
    id: 2,
    word: "butterfly",
    question: "How do butterflies taste their food?",
    options: [
      "With their tongue",
      "With their wings",
      "With their feet",
      "With their antennae",
    ],
    correctAnswer: "With their feet",
    explanation:
      "Butterflies have taste receptors on their feet to help them find the right plants for their eggs.",
    emoji: "🦋",
  },
  {
    id: 3,
    word: "telescope",
    question: "What is a telescope used for?",
    options: [
      "Cooking food",
      "Seeing distant objects",
      "Playing music",
      "Writing stories",
    ],
    correctAnswer: "Seeing distant objects",
    explanation:
      "Telescopes help us see things that are very far away, like stars and planets.",
    emoji: "🔭",
  },
];

// Quick Quiz Questions (5 questions, easy level)
const quickQuizQuestions = [
  {
    id: 1,
    word: "cat",
    question: "What sound does a cat make?",
    options: ["Woof", "Meow", "Moo", "Chirp"],
    correctAnswer: "Meow",
    explanation: "Cats say meow to communicate with humans!",
    emoji: "🐱",
  },
  {
    id: 2,
    word: "apple",
    question: "What color is a typical apple?",
    options: ["Blue", "Purple", "Red", "Black"],
    correctAnswer: "Red",
    explanation: "Apples are commonly red, though they can also be green or yellow.",
    emoji: "🍎",
  },
  {
    id: 3,
    word: "sun",
    question: "When do we see the sun?",
    options: ["At night", "During the day", "Only in winter", "Never"],
    correctAnswer: "During the day",
    explanation: "The sun shines during the day and gives us light and warmth.",
    emoji: "☀️",
  },
  {
    id: 4,
    word: "happy",
    question: "How do you feel when you're happy?",
    options: ["Sad", "Angry", "Good", "Tired"],
    correctAnswer: "Good",
    explanation: "When we're happy, we feel good and joyful!",
    emoji: "😊",
  },
  {
    id: 5,
    word: "book",
    question: "What do you do with a book?",
    options: ["Eat it", "Read it", "Throw it", "Break it"],
    correctAnswer: "Read it",
    explanation: "Books are made for reading and learning new things.",
    emoji: "📚",
  },
];

// Challenge Quiz Questions (15 questions, harder level)
const challengeQuizQuestions = [
  {
    id: 1,
    word: "magnificent",
    question: "What does 'magnificent' mean?",
    options: ["Very small", "Extremely beautiful or impressive", "Quite ugly", "Somewhat boring"],
    correctAnswer: "Extremely beautiful or impressive",
    explanation: "Magnificent means something is extremely beautiful, impressive, or grand in scale.",
    emoji: "✨",
  },
  {
    id: 2,
    word: "constellation",
    question: "What is a constellation?",
    options: ["A type of building", "A group of stars forming a pattern", "A musical instrument", "A kind of flower"],
    correctAnswer: "A group of stars forming a pattern",
    explanation: "Constellations are groups of stars that form recognizable patterns in the night sky.",
    emoji: "⭐",
  },
  {
    id: 3,
    word: "hibernation",
    question: "During hibernation, a bear's heart rate drops from 40 beats per minute to approximately how many?",
    options: ["35 beats", "20 beats", "8 beats", "2 beats"],
    correctAnswer: "8 beats",
    explanation: "During hibernation, a bear's heart rate dramatically slows down to just 8 beats per minute!",
    emoji: "🐻",
  },
  {
    id: 4,
    word: "octopus",
    question: "How many hearts does an octopus have?",
    options: ["One", "Two", "Three", "Four"],
    correctAnswer: "Three",
    explanation: "Octopuses have three hearts and blue blood!",
    emoji: "🐙",
  },
  {
    id: 5,
    word: "chameleon",
    question: "What unique ability do chameleon eyes have?",
    options: ["See in the dark", "Change color", "Move independently", "See through walls"],
    correctAnswer: "Move independently",
    explanation: "Chameleons can move their eyes independently - one can look forward while the other looks backward!",
    emoji: "🦎",
  },
  {
    id: 6,
    word: "velocity",
    question: "Velocity is a measure of:",
    options: ["Weight and mass", "Speed and direction", "Height and width", "Temperature and pressure"],
    correctAnswer: "Speed and direction",
    explanation: "Velocity measures both how fast something is moving and in which direction.",
    emoji: "��",
  },
  {
    id: 7,
    word: "laboratory",
    question: "The word 'laboratory' comes from Latin meaning:",
    options: ["Place of learning", "House of science", "A place for work", "Room of experiments"],
    correctAnswer: "A place for work",
    explanation: "Laboratory comes from the Latin word meaning 'a place for work'.",
    emoji: "🧪",
  },
  {
    id: 8,
    word: "symphony",
    question: "A symphony is typically performed by:",
    options: ["A single musician", "A small band", "A large orchestra", "A choir only"],
    correctAnswer: "A large orchestra",
    explanation: "Symphonies are complex musical compositions performed by large orchestras.",
    emoji: "🎼",
  },
  {
    id: 9,
    word: "photosynthesis",
    question: "Photosynthesis is the process by which:",
    options: ["Animals breathe", "Plants make food using sunlight", "Water evaporates", "Rocks form crystals"],
    correctAnswer: "Plants make food using sunlight",
    explanation: "Photosynthesis is how plants convert sunlight, water, and carbon dioxide into food.",
    emoji: "🌱",
  },
  {
    id: 10,
    word: "archaeology",
    question: "Archaeology is the study of:",
    options: ["Stars and planets", "Human history through artifacts", "Animals in the wild", "Weather patterns"],
    correctAnswer: "Human history through artifacts",
    explanation: "Archaeologists study human history by examining artifacts and remains from the past.",
    emoji: "🏺",
  },
];

// Picture Quiz Questions (visual/emoji based)
const pictureQuizQuestions = [
  {
    id: 1,
    emoji: "🍕",
    question: "What food does this emoji represent?",
    options: ["Hamburger", "Pizza", "Sandwich", "Pasta"],
    correctAnswer: "Pizza",
    explanation: "This emoji represents pizza - a delicious round flatbread with toppings!",
  },
  {
    id: 2,
    emoji: "🦁",
    question: "This animal is known as the:",
    options: ["Prince of the jungle", "King of the jungle", "Duke of the forest", "Lord of the savanna"],
    correctAnswer: "King of the jungle",
    explanation: "Lions are often called the 'King of the jungle' because of their majestic appearance.",
  },
  {
    id: 3,
    emoji: "🌈",
    question: "How many colors are traditionally said to be in a rainbow?",
    options: ["Five", "Six", "Seven", "Eight"],
    correctAnswer: "Seven",
    explanation: "Rainbows traditionally have seven colors: red, orange, yellow, green, blue, indigo, and violet.",
  },
  {
    id: 4,
    emoji: "🚂",
    question: "What sound does this vehicle make?",
    options: ["Beep beep", "Choo choo", "Vroom vroom", "Ring ring"],
    correctAnswer: "Choo choo",
    explanation: "Trains make a 'choo choo' sound from their steam engines and whistles.",
  },
  {
    id: 5,
    emoji: "🎂",
    question: "When do we typically see this item?",
    options: ["At breakfast", "At birthday parties", "At school", "At the doctor"],
    correctAnswer: "At birthday parties",
    explanation: "Birthday cakes are a special treat we enjoy at birthday celebrations!",
  },
  {
    id: 6,
    emoji: "🌙",
    question: "When can we see this in the sky?",
    options: ["Only at sunrise", "During the day", "At night", "Only in winter"],
    correctAnswer: "At night",
    explanation: "We can see the moon in the night sky, and sometimes during the day too!",
  },
  {
    id: 7,
    emoji: "🦋",
    question: "Before becoming this, it was a:",
    options: ["Tadpole", "Caterpillar", "Seed", "Egg"],
    correctAnswer: "Caterpillar",
    explanation: "Butterflies start life as caterpillars before transforming in a process called metamorphosis.",
  },
  {
    id: 8,
    emoji: "⚽",
    question: "In which sport is this item used?",
    options: ["Basketball", "Tennis", "Soccer", "Baseball"],
    correctAnswer: "Soccer",
    explanation: "This is a soccer ball, used in the world's most popular sport!",
  },
];

// Spelling Quiz Questions (converted to multiple choice format for compatibility)
const spellingQuizQuestions = [
  {
    id: 1,
    word: "butterfly",
    question: "How do you spell the word for a colorful insect with wings?",
    options: ["butterfly", "buterfly", "butterflie", "buttrefly"],
    correctAnswer: "butterfly",
    explanation: "Butterfly - a colorful insect that transforms from a caterpillar!",
    emoji: "🦋",
  },
  {
    id: 2,
    word: "elephant",
    question: "How do you spell the word for a large gray animal with a trunk?",
    options: ["elefant", "elephant", "elefhant", "elephent"],
    correctAnswer: "elephant",
    explanation: "Elephant - the largest land animal with an amazing memory!",
    emoji: "🐘",
  },
  {
    id: 3,
    word: "rainbow",
    question: "How do you spell the word for a colorful arc in the sky?",
    options: ["rainboe", "rainbow", "rainbo", "ranbow"],
    correctAnswer: "rainbow",
    explanation: "Rainbow - nature's beautiful display of colors after rain!",
    emoji: "🌈",
  },
  {
    id: 4,
    word: "adventure",
    question: "How do you spell the word for an exciting journey?",
    options: ["adventure", "adventur", "advencher", "adventrue"],
    correctAnswer: "adventure",
    explanation: "Adventure - an exciting journey full of discovery!",
    emoji: "🗺️",
  },
  {
    id: 5,
    word: "telescope",
    question: "How do you spell the word for a device that sees distant objects?",
    options: ["telescope", "telescop", "telascope", "telecsope"],
    correctAnswer: "telescope",
    explanation: "Telescope - helps us see stars and planets far away!",
    emoji: "🔭",
  },
  {
    id: 6,
    word: "magnificent",
    question: "How do you spell the word meaning extremely beautiful?",
    options: ["magnificant", "magnificent", "magnifisent", "magnificient"],
    correctAnswer: "magnificent",
    explanation: "Magnificent - extremely beautiful or impressive!",
    emoji: "✨",
  },
  {
    id: 7,
    word: "curiosity",
    question: "How do you spell the word for wanting to learn more?",
    options: ["curiousity", "curiosity", "curiosety", "curiousety"],
    correctAnswer: "curiosity",
    explanation: "Curiosity - the desire to learn and discover new things!",
    emoji: "🤔",
  },
  {
    id: 8,
    word: "celebration",
    question: "How do you spell the word for a joyful event?",
    options: ["celebrashion", "celebration", "celebrasion", "celebation"],
    correctAnswer: "celebration",
    explanation: "Celebration - a joyful party or special event!",
    emoji: "🎉",
  },
  {
    id: 9,
    word: "imagination",
    question: "How do you spell the word for creating ideas in your mind?",
    options: ["imagination", "imagenation", "imaginashion", "imaignation"],
    correctAnswer: "imagination",
    explanation: "Imagination - the ability to create wonderful ideas and stories!",
    emoji: "💭",
  },
  {
    id: 10,
    word: "beautiful",
    question: "How do you spell the word meaning very pretty?",
    options: ["beatiful", "beautiful", "beutiful", "beautyful"],
    correctAnswer: "beautiful",
    explanation: "Beautiful - something that looks very pretty or lovely!",
    emoji: "😍",
  },
];

// Speed Round Questions (endless, quick questions)
const speedRoundQuestions = [
  { id: 1, word: "cat", question: "Pet that says meow", options: ["Dog", "Cat", "Bird", "Fish"], correctAnswer: "Cat", emoji: "🐱" },
  { id: 2, word: "red", question: "Color of fire", options: ["Blue", "Green", "Red", "Yellow"], correctAnswer: "Red", emoji: "🔴" },
  { id: 3, word: "sun", question: "Shines during the day", options: ["Moon", "Star", "Sun", "Cloud"], correctAnswer: "Sun", emoji: "☀️" },
  { id: 4, word: "book", question: "You read this", options: ["Phone", "Book", "TV", "Car"], correctAnswer: "Book", emoji: "📚" },
  { id: 5, word: "tree", question: "Has leaves and branches", options: ["Rock", "Tree", "House", "Car"], correctAnswer: "Tree", emoji: "🌳" },
  { id: 6, word: "happy", question: "Feeling joyful", options: ["Sad", "Angry", "Happy", "Tired"], correctAnswer: "Happy", emoji: "😊" },
  { id: 7, word: "water", question: "You drink this", options: ["Sand", "Water", "Air", "Fire"], correctAnswer: "Water", emoji: "💧" },
  { id: 8, word: "bird", question: "Animal that flies", options: ["Fish", "Dog", "Bird", "Cat"], correctAnswer: "Bird", emoji: "🐦" },
  { id: 9, word: "house", question: "Where people live", options: ["Car", "Tree", "House", "Rock"], correctAnswer: "House", emoji: "🏠" },
  { id: 10, word: "flower", question: "Colorful plant part", options: ["Root", "Flower", "Stone", "Metal"], correctAnswer: "Flower", emoji: "🌸" },
  { id: 11, word: "ball", question: "Round toy for games", options: ["Square", "Ball", "Triangle", "Line"], correctAnswer: "Ball", emoji: "⚽" },
  { id: 12, word: "ice", question: "Frozen water", options: ["Hot", "Ice", "Steam", "Warm"], correctAnswer: "Ice", emoji: "🧊" },
  { id: 13, word: "star", question: "Twinkles in the sky", options: ["Rock", "Star", "Cloud", "Tree"], correctAnswer: "Star", emoji: "⭐" },
  { id: 14, word: "fish", question: "Lives in water", options: ["Bird", "Dog", "Fish", "Cat"], correctAnswer: "Fish", emoji: "🐟" },
  { id: 15, word: "cake", question: "Sweet birthday treat", options: ["Soup", "Cake", "Salad", "Bread"], correctAnswer: "Cake", emoji: "🎂" },
];

// Function to get questions based on quiz type
const getQuizQuestions = (type: string) => {
  switch (type) {
    case 'quick':
      return quickQuizQuestions;
    case 'standard':
      return sampleQuizQuestions;
    case 'challenge':
      return challengeQuizQuestions;
    case 'picture':
      return pictureQuizQuestions;
    case 'spelling':
      return spellingQuizQuestions;
    case 'speed':
      return speedRoundQuestions;
    default:
      return sampleQuizQuestions;
  }
};

// Sample data for matching game
const matchingPairs = [
  {
    id: 1,
    word: "adventure",
    definition: "An exciting or unusual experience",
    matched: false,
  },
  {
    id: 2,
    word: "butterfly",
    definition: "A colorful flying insect with large wings",
    matched: false,
  },
  {
    id: 3,
    word: "telescope",
    definition: "An instrument used to see distant objects",
    matched: false,
  },
  {
    id: 4,
    word: "rainbow",
    definition: "A colorful arc in the sky",
    matched: false,
  },
];

// Sample vocabulary builder words
const vocabularyWords = sampleWords.map((word) => ({
  ...word,
  masteryLevel: Math.floor(Math.random() * 100),
  lastReviewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  nextReview: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000),
}));

const learningStats = {
  wordsLearned: 68,
  totalWords: wordsDatabase.length,
  currentStreak: 7,
  weeklyGoal: 20,
  weeklyProgress: 18,
  accuracyRate: 92,
  favoriteCategory: "Animals",
  totalPoints: 2850,
  level: 4,
  badges: [
    {
      id: "first-word",
      name: "First Word",
      icon: "🎯",
      earned: true,
      description: "Learned your first word",
    },
    {
      id: "streak-starter",
      name: "Streak Master",
      icon: "🔥",
      earned: true,
      description: "7-day learning streak",
    },
    {
      id: "category-explorer",
      name: "Category Explorer",
      icon: "🗺️",
      earned: true,
      description: "Explored 5+ categories",
    },
    {
      id: "science-star",
      name: "Science Star",
      icon: "🔬",
      earned: true,
      description: "Mastered 10 science words",
    },
    {
      id: "quiz-master",
      name: "Quiz Master",
      icon: "🧠",
      earned: false,
      description: "Score 100% on 5 quizzes",
    },
    {
      id: "vocabulary-champion",
      name: "Vocabulary Champion",
      icon: "🏆",
      earned: false,
      description: "Learn 100 words",
    },
  ],
};

export default function Index() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState<'quick' | 'standard' | 'challenge' | 'picture' | 'spelling' | 'speed'>('standard');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [learningMode, setLearningMode] = useState<
    "cards" | "builder" | "matching"
  >("cards");
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [userRole, setUserRole] = useState<"child" | "parent">("child");
  const [showWordCreator, setShowWordCreator] = useState(false);
  const [customWords, setCustomWords] = useState<any[]>([]);

  const handleQuizComplete = (score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);
    alert(`Quiz Complete! You scored ${score}/${total} (${percentage}%)`);
    setShowQuiz(false);
  };

  const handleQuizExit = () => {
    setShowQuiz(false);
  };

  const handleMatchingComplete = (score: number, timeSpent: number) => {
    setShowCelebration(true);
    setTimeout(() => {
      alert(
        `Matching Game Complete! You matched ${score} pairs in ${timeSpent} seconds!`,
      );
      setShowCelebration(false);
    }, 2000);
  };

  const handleVocabularySessionComplete = (
    wordsReviewed: number,
    accuracy: number,
  ) => {
    setShowCelebration(true);
    setTimeout(() => {
      alert(
        `Vocabulary Session Complete! Reviewed ${wordsReviewed} words with ${accuracy}% accuracy!`,
      );
      setShowCelebration(false);
    }, 2000);
  };

  const handleWordMastered = (
    wordId: number,
    rating: "easy" | "medium" | "hard",
  ) => {
    console.log(`Word ${wordId} rated as ${rating}`);
  };

  const handleWordCreated = (newWord: any) => {
    setCustomWords([...customWords, { ...newWord, id: Date.now() }]);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentWordIndex(0); // Reset to first word when changing category
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              ⭐ Word Adventure
            </h1>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Embark on an exciting journey to discover new words!
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 text-3xl animate-bounce">
          🌟
        </div>
        <div className="absolute top-20 right-20 text-2xl animate-pulse">
          📚
        </div>
        <div className="absolute bottom-10 left-20 text-4xl animate-bounce delay-1000">
          🎯
        </div>
        <div className="absolute bottom-20 right-10 text-3xl animate-pulse delay-500">
          🚀
        </div>
      </header>

      {/* Main Content with Sidebar Layout */}
      <main className="flex min-h-screen">
        {userRole === "parent" ? (
          <div className="w-full p-8">
            <ParentDashboard
              children={undefined} // Will use default sample data
              sessions={undefined} // Will use default sample data
              onNavigateBack={() => setUserRole("child")}
            />
          </div>
        ) : (
          <div className="flex w-full">
            {/* Left Sidebar */}
            <aside className="w-72 bg-gradient-to-b from-purple-100 to-pink-100 border-r border-purple-200 p-6 flex flex-col">
              {/* User Profile Section */}
              <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">demo</h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">Level 5</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">Progress: 0%</p>
                  <p className="text-xs text-gray-500">0 of 5 words learned</p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="flex-1 space-y-3">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === "dashboard"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${activeTab === "dashboard" ? "bg-white/20" : "bg-purple-100"}`}
                  >
                    <Target
                      className={`w-5 h-5 ${activeTab === "dashboard" ? "text-white" : "text-purple-600"}`}
                    />
                  </div>
                  <span className="font-semibold">Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab("learn")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === "learn"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${activeTab === "learn" ? "bg-white/20" : "bg-blue-100"}`}
                  >
                    <BookOpen
                      className={`w-5 h-5 ${activeTab === "learn" ? "text-white" : "text-blue-600"}`}
                    />
                  </div>
                  <span className="font-semibold">Word Library</span>
                </button>

                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === "quiz"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${activeTab === "quiz" ? "bg-white/20" : "bg-pink-100"}`}
                  >
                    <Brain
                      className={`w-5 h-5 ${activeTab === "quiz" ? "text-white" : "text-pink-600"}`}
                    />
                  </div>
                  <span className="font-semibold">Quiz Time</span>
                </button>

                <button
                  onClick={() => setActiveTab("progress")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === "progress"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${activeTab === "progress" ? "bg-white/20" : "bg-yellow-100"}`}
                  >
                    <Trophy
                      className={`w-5 h-5 ${activeTab === "progress" ? "text-white" : "text-yellow-600"}`}
                    />
                  </div>
                  <span className="font-semibold">Results</span>
                </button>

                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === "analytics"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${activeTab === "analytics" ? "bg-white/20" : "bg-green-100"}`}
                  >
                    <TrendingUp
                      className={`w-5 h-5 ${activeTab === "analytics" ? "text-white" : "text-green-600"}`}
                    />
                  </div>
                  <span className="font-semibold">Progress</span>
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white text-gray-700 hover:bg-purple-50 transition-all border border-purple-200"
                >
                  <div className="p-2 rounded-xl bg-gray-100">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-semibold">Settings</span>
                </button>
              </nav>

              {/* Bottom Actions */}
              <div className="mt-6 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWordCreator(true)}
                  className="w-full bg-educational-green text-white hover:bg-educational-green/90 border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Word
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant={userRole === "child" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUserRole("child")}
                    className="flex-1"
                  >
                    Child
                  </Button>
                  <Button
                    variant={userRole === "parent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUserRole("parent")}
                    className="flex-1"
                  >
                    Parent
                  </Button>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsContent value="dashboard">
                  <LearningDashboard stats={learningStats} userName="Alex" />
                </TabsContent>

                <TabsContent value="learn">
                  <div className="space-y-8">
                    {selectedCategory === "all" ? (
                      <CategorySelector
                        categories={[]}
                        selectedCategory={selectedCategory}
                        onSelectCategory={(category) => {
                          handleCategoryChange(category);
                          setLearningMode("cards");
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
                              onClick={() => setLearningMode("cards")}
                              variant={
                                learningMode === "cards" ? "default" : "outline"
                              }
                              className="flex items-center gap-2"
                            >
                              <BookOpen className="w-4 h-4" />
                              Word Cards
                            </Button>
                            <Button
                              onClick={() => setLearningMode("builder")}
                              variant={
                                learningMode === "builder"
                                  ? "default"
                                  : "outline"
                              }
                              className="flex items-center gap-2"
                            >
                              <Brain className="w-4 h-4" />
                              Vocabulary Builder
                            </Button>
                            <Button
                              onClick={() => setSelectedCategory("all")}
                              variant="ghost"
                            >
                              ← Back to Categories
                            </Button>
                          </div>
                        </div>

                        {learningMode === "cards" && (
                          <>
                            {(() => {
                              const categoryWords =
                                selectedCategory === "all"
                                  ? getRandomWords(20)
                                  : getWordsByCategory(selectedCategory);
                              const displayWords = categoryWords.slice(0, 20); // Limit to 20 for better performance

                              return (
                                <>
                                  <div className="flex justify-center mb-6">
                                    <div className="flex flex-wrap gap-2 max-w-lg">
                                      {displayWords.map((_, index) => (
                                        <Button
                                          key={index}
                                          size="sm"
                                          variant={
                                            currentWordIndex === index
                                              ? "default"
                                              : "outline"
                                          }
                                          onClick={() =>
                                            setCurrentWordIndex(index)
                                          }
                                          className="w-8 h-8 p-0"
                                        >
                                          {index + 1}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>

                                  {displayWords.length > 0 && (
                                    <>
                                      <div className="max-w-md mx-auto">
                                        <WordCard
                                          word={
                                            displayWords[currentWordIndex] ||
                                            displayWords[0]
                                          }
                                          onPronounce={(word) =>
                                            console.log(
                                              "Playing pronunciation for:",
                                              word.word,
                                            )
                                          }
                                          onFavorite={(word) =>
                                            console.log("Favorited:", word.word)
                                          }
                                        />
                                      </div>

                                      <div className="flex justify-center gap-4">
                                        <Button
                                          onClick={() =>
                                            setCurrentWordIndex(
                                              Math.max(0, currentWordIndex - 1),
                                            )
                                          }
                                          disabled={currentWordIndex === 0}
                                          variant="outline"
                                        >
                                          Previous
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            setCurrentWordIndex(
                                              Math.min(
                                                displayWords.length - 1,
                                                currentWordIndex + 1,
                                              ),
                                            )
                                          }
                                          disabled={
                                            currentWordIndex ===
                                            displayWords.length - 1
                                          }
                                        >
                                          Next
                                          <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                      </div>

                                      <div className="text-center mt-4">
                                        <Badge
                                          variant="outline"
                                          className="text-sm"
                                        >
                                          {selectedCategory === "all"
                                            ? "Random Selection"
                                            : `${selectedCategory} Category`}{" "}
                                          - Word {currentWordIndex + 1} of{" "}
                                          {displayWords.length}
                                        </Badge>
                                      </div>
                                    </>
                                  )}
                                </>
                              );
                            })()}
                          </>
                        )}

                        {learningMode === "builder" && (
                          <VocabularyBuilder
                            words={wordsDatabase.map((word) => ({
                              ...word,
                              masteryLevel: Math.floor(Math.random() * 100),
                              lastReviewed: new Date(
                                Date.now() -
                                  Math.random() * 7 * 24 * 60 * 60 * 1000,
                              ),
                              nextReview: new Date(
                                Date.now() +
                                  Math.random() * 3 * 24 * 60 * 60 * 1000,
                              ),
                            }))}
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
                          <h3 className="text-xl font-semibold mb-2">
                            Word Matching
                          </h3>
                          <p className="text-slate-600 mb-4">
                            Match words with their definitions in this fun
                            memory game!
                          </p>
                          <Button
                            className="bg-educational-blue text-white"
                            onClick={() => setLearningMode("matching")}
                          >
                            <Shuffle className="w-4 h-4 mr-2" />
                            Start Matching
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <CardContent className="p-8 text-center">
                          <div className="text-6xl mb-4">🧩</div>
                          <h3 className="text-xl font-semibold mb-2">
                            Word Puzzle
                          </h3>
                          <p className="text-slate-600 mb-4">
                            Solve word puzzles and unscramble letters to form
                            vocabulary words!
                          </p>
                          <Button variant="outline" disabled>
                            Coming Soon
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {learningMode === "matching" && (
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
                      <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                          <h2 className="text-3xl font-bold text-slate-800 mb-4">
                            Choose Your Quiz Adventure
                          </h2>
                          <p className="text-slate-600 mb-8">
                            Pick a quiz mode that matches your learning style and challenge level!
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Quick Quiz */}
                          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-educational-blue/10 to-educational-blue/20">
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-lg bg-educational-blue/20 flex items-center justify-center">
                                  <Zap className="w-6 h-6 text-educational-blue" />
                                </div>
                                <Badge className="bg-educational-blue text-white">QUICK</Badge>
                              </div>
                              <CardTitle className="text-educational-blue">Quick Quiz</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm text-slate-600">
                                Fast-paced multiple choice quiz to test your vocabulary knowledge
                              </p>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                  <div className="font-bold text-educational-blue">5</div>
                                  <div className="text-slate-500">Questions</div>
                                </div>
                                <div>
                                  <div className="font-bold text-educational-purple">15s</div>
                                  <div className="text-slate-500">Per Q</div>
                                </div>
                                <div>
                                  <div className="font-bold text-educational-orange">50</div>
                                  <div className="text-slate-500">Points</div>
                                </div>
                              </div>
                              <Button
                                className="w-full bg-educational-blue hover:bg-educational-blue/90"
                                onClick={() => {
                                  setSelectedQuizType('quick');
                                  setShowQuiz(true);
                                }}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start Quick Quiz
                              </Button>
                            </CardContent>
                          </Card>

                          {/* Standard Quiz */}
                          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-educational-purple/10 to-educational-purple/20">
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-lg bg-educational-purple/20 flex items-center justify-center">
                                  <Brain className="w-6 h-6 text-educational-purple" />
                                </div>
                                <Badge className="bg-educational-purple text-white">STANDARD</Badge>
                              </div>
                              <CardTitle className="text-educational-purple">Standard Quiz</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm text-slate-600">
                                Balanced quiz with multiple choice questions and explanations
                              </p>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                  <div className="font-bold text-educational-blue">10</div>
                                  <div className="text-slate-500">Questions</div>
                                </div>
                                <div>
                                  <div className="font-bold text-educational-purple">30s</div>
                                  <div className="text-slate-500">Per Q</div>
                                </div>
                                <div>
                                  <div className="font-bold text-educational-orange">100</div>
                                  <div className="text-slate-500">Points</div>
                                </div>
                              </div>
                              <Button
                                className="w-full bg-educational-purple hover:bg-educational-purple/90"
                                onClick={() => {
                                  setSelectedQuizType('standard');
                                  setShowQuiz(true);
                                }}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start Standard Quiz
                              </Button>
                            </CardContent>
                          </Card>

                          {/* Challenge Quiz */}
                          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-educational-orange/10 to-educational-orange/20">
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-lg bg-educational-orange/20 flex items-center justify-center">
                                  <Target className="w-6 h-6 text-educational-orange" />
                                </div>
                                <Badge className="bg-educational-orange text-white">CHALLENGE</Badge>
                              </div>
                              <CardTitle className="text-educational-orange">Challenge Quiz</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm text-slate-600">
                                Difficult questions with tricky options for advanced learners
                              </p>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                  <div className="font-bold text-educational-blue">15</div>
                                  <div className="text-slate-500">Questions</div>
                                </div>
                                <div>
                                  <div className="font-bold text-educational-purple">45s</div>
                                  <div className="text-slate-500">Per Q</div>
                                </div>
                                <div>
                                  <div className="font-bold text-educational-orange">200</div>
                                  <div className="text-slate-500">Points</div>
                                </div>
                              </div>
                              <Button
                                className="w-full bg-educational-orange hover:bg-educational-orange/90"
                                onClick={() => {
                                  setSelectedQuizType('challenge');
                                  setShowQuiz(true);
                                }}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start Challenge
                              </Button>
                            </CardContent>
                          </Card>

                          {/* Picture Quiz */}
                          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-educational-green/10 to-educational-green/20">
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-lg bg-educational-green/20 flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-educational-green" />
                                </div>
                                <Badge className="bg-educational-green text-white">VISUAL</Badge>
                              </div>
                              <CardTitle className="text-educational-green">Picture Quiz</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm text-slate-600">
                                Visual quiz using emojis and images to test word recognition
                              </p>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                  <div className="font-bold text-educational-blue">8</div>
                                  <div className="text-slate-500">Questions</div>
                                </div>
                                <div>
                                  <div className="font-bold text-educational-purple">20s</div>
                                  <div className="text-slate-500">Per Q</div>
                                </div>
                                <div>
                                  <div className="font-bold text-educational-orange">80</div>
                                  <div className="text-slate-500">Points</div>
                                </div>
                              </div>
                              <Button
                                className="w-full bg-educational-green hover:bg-educational-green/90"
                                onClick={() => {
                                  setSelectedQuizType('picture');
                                  setShowQuiz(true);
                                }}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start Picture Quiz
                              </Button>
                            </CardContent>
                          </Card>

                          {/* Spelling Quiz */}
                          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-educational-pink/10 to-educational-pink/20">
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-lg bg-educational-pink/20 flex items-center justify-center">
                                  <PenTool className="w-6 h-6 text-educational-pink" />
                                </div>
                                <Badge className="bg-educational-pink text-white">SPELLING</Badge>
                              </div>
                              <CardTitle className="text-educational-pink">Spelling Bee</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm text-slate-600">
                                Listen to pronunciations and type the correct spelling
                              </p>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                  <div className="font-bold text-educational-blue">10</div>
                                  <div className="text-slate-500">Words</div>
                                </div>
                                <div>
                                  <div className="font-bold text-educational-purple">60s</div>
                                  <div className="text-slate-500">Per Word</div>
                                </div>
                                <div>
                                  <div className="font-bold text-educational-orange">150</div>
                                  <div className="text-slate-500">Points</div>
                                </div>
                              </div>
                              <Button
                                className="w-full bg-educational-pink hover:bg-educational-pink/90"
                                onClick={() => {
                                  setSelectedQuizType('spelling');
                                  setShowQuiz(true);
                                }}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start Spelling Bee
                              </Button>
                            </CardContent>
                          </Card>

                          {/* Speed Round */}
                          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-red-400/10 to-red-500/20">
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-lg bg-red-400/20 flex items-center justify-center">
                                  <Clock className="w-6 h-6 text-red-500" />
                                </div>
                                <Badge className="bg-red-500 text-white">SPEED</Badge>
                              </div>
                              <CardTitle className="text-red-500">Speed Round</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm text-slate-600">
                                Lightning fast quiz - answer as many as you can in 2 minutes!
                              </p>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                  <div className="font-bold text-educational-blue">∞</div>
                                  <div className="text-slate-500">Questions</div>
                                </div>
                                <div>
                                  <div className="font-bold text-educational-purple">2min</div>
                                  <div className="text-slate-500">Total</div>
                                </div>
                                <div>
                                  <div className="font-bold text-educational-orange">5x</div>
                                  <div className="text-slate-500">Multiplier</div>
                                </div>
                              </div>
                              <Button
                                className="w-full bg-red-500 hover:bg-red-600"
                                onClick={() => {
                                  setSelectedQuizType('speed');
                                  setShowQuiz(true);
                                }}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start Speed Round
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <QuizGame
                        questions={getQuizQuestions(selectedQuizType)}
                        quizType={selectedQuizType}
                        onComplete={handleQuizComplete}
                        onExit={handleQuizExit}
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
                          <div className="text-3xl font-bold mb-2">
                            {learningStats.wordsLearned}
                          </div>
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
                          <div className="text-3xl font-bold mb-2">
                            {learningStats.currentStreak} days
                          </div>
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
                          <div className="text-3xl font-bold mb-2">
                            Level {learningStats.level}
                          </div>
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
                              ? "bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-yellow-300"
                              : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <h4 className="font-semibold mb-1">{badge.name}</h4>
                          <p className="text-xs text-slate-600">
                            {badge.description}
                          </p>
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
                        Improve your reading skills and vocabulary through
                        engaging stories!
                      </p>
                    </div>

                    <ReadingComprehension
                      passage={undefined} // Will use default sample passage
                      onComplete={(score, total) => {
                        setShowCelebration(true);
                        setTimeout(() => {
                          alert(
                            `Reading Complete! You scored ${score}/${total}!`,
                          );
                          setShowCelebration(false);
                        }, 2000);
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="analytics">
                  <LearningAnalytics />
                </TabsContent>

                <TabsContent value="challenges">
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-slate-800 mb-4">
                        Daily Challenges
                      </h2>
                      <p className="text-slate-600 mb-8">
                        Complete daily challenges to earn rewards and build
                        learning habits!
                      </p>
                    </div>

                    <DailyChallenge
                      challenges={[]}
                      onChallengeComplete={(challengeId) => {
                        console.log("Challenge completed:", challengeId);
                        setShowCelebration(true);
                        setTimeout(() => setShowCelebration(false), 3000);
                      }}
                      onStartChallenge={(challengeId) => {
                        console.log("Starting challenge:", challengeId);
                        // In a real app, this would navigate to the appropriate learning activity
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-educational-blue" />
              <span className="text-xl font-bold text-slate-800">
                Word Adventure
              </span>
            </div>
            <p className="text-slate-600 mb-4">
              Making vocabulary learning fun and engaging for children
              everywhere
            </p>
            <div className="flex justify-center gap-6 text-sm text-slate-500">
              <span>© 2024 Word Adventure</span>
              <span>•</span>
              <span>Made with ❤️ for young learners</span>
            </div>
          </div>
        </div>
      </footer>

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {showWordCreator && (
        <WordCreator
          onWordCreated={handleWordCreated}
          onClose={() => setShowWordCreator(false)}
        />
      )}

      {showCelebration && <CelebrationEffect />}
      <FloatingBubbles />
    </div>
  );
}
