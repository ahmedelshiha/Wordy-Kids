import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Target, 
  Star, 
  Zap, 
  Trophy, 
  Heart, 
  Sparkles,
  Volume2,
  RotateCcw,
  CheckCircle,
  XCircle,
  Award,
  Gamepad2
} from 'lucide-react';

interface PracticeWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  attempts: number;
  lastAccuracy: number;
}

interface WordPracticeGameProps {
  practiceWords: PracticeWord[];
  onComplete: (results: { correctWords: string[], totalAttempts: number, accuracy: number }) => void;
  onBack: () => void;
  childName?: string;
}

export const WordPracticeGame: React.FC<WordPracticeGameProps> = ({
  practiceWords,
  onComplete,
  onBack,
  childName = "Champion"
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'result' | 'complete'>('intro');
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [incorrectWords, setIncorrectWords] = useState<string[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [points, setPoints] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentWord = practiceWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / practiceWords.length) * 100;
  const accuracy = totalAttempts > 0 ? Math.round((correctWords.length / totalAttempts) * 100) : 0;

  useEffect(() => {
    if (bestStreak < streak) {
      setBestStreak(streak);
    }
  }, [streak, bestStreak]);

  const handleRemember = () => {
    setTotalAttempts(prev => prev + 1);
    setCorrectWords(prev => [...prev, currentWord.word]);
    setStreak(prev => prev + 1);
    setPoints(prev => prev + (10 * (streak + 1))); // Bonus points for streaks
    setGamePhase('result');
    
    // Show celebration animation
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1500);
  };

  const handleForgot = () => {
    setTotalAttempts(prev => prev + 1);
    setIncorrectWords(prev => [...prev, currentWord.word]);
    setStreak(0); // Reset streak
    setGamePhase('result');
  };

  const nextWord = () => {
    setShowDefinition(false);
    setShowExample(false);
    
    if (currentWordIndex < practiceWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setGamePhase('playing');
    } else {
      setGamePhase('complete');
      onComplete({
        correctWords,
        totalAttempts,
        accuracy
      });
    }
  };

  const startGame = () => {
    setGamePhase('playing');
  };

  const playPronunciation = () => {
    // Simulate pronunciation - in real app would use speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const renderIntro = () => (
    <div className="text-center space-y-6 p-8">
      <div className="relative">
        <div className="text-8xl mb-4 animate-bounce">🎯</div>
        <div className="absolute -top-2 -right-2 text-3xl animate-spin">✨</div>
      </div>
      
      <h1 className="text-4xl font-bold text-purple-700 mb-2">
        Practice Challenge! 💪
      </h1>
      
      <p className="text-xl text-gray-600 mb-4">
        Hey {childName}! Ready to practice your tricky words?
      </p>
      
      <div className="bg-purple-50 p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-purple-700 mb-3">🎮 How to Play:</h3>
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
            <span>Look at each word carefully</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">2</div>
            <span>Use hints if you need help</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">3</div>
            <span>Choose "I Remember!" or "Still Tricky"</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">4</div>
            <span>Earn points and build streaks!</span>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-xl">
        <p className="text-lg font-semibold text-yellow-700">
          🏆 {practiceWords.length} words to practice
        </p>
      </div>
      
      <Button 
        onClick={startGame}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl py-6 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
      >
        <Gamepad2 className="w-6 h-6 mr-3" />
        Start Practice Adventure!
      </Button>
    </div>
  );

  const renderPlaying = () => (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Word {currentWordIndex + 1} of {practiceWords.length}</h2>
              <p className="text-blue-100">Category: {currentWord.category}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{points}</div>
            <div className="text-sm text-blue-100">Points</div>
          </div>
        </div>
        <Progress value={progress} className="h-3 bg-white/20" />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-600">{streak}</div>
          <div className="text-sm text-green-600">Current Streak 🔥</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-600">{bestStreak}</div>
          <div className="text-sm text-blue-600">Best Streak ⭐</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
          <div className="text-sm text-purple-600">Accuracy 🎯</div>
        </div>
      </div>

      {/* Word card */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            {/* Word display */}
            <div className="bg-white p-6 rounded-2xl shadow-inner">
              <div className="text-5xl font-bold text-gray-800 mb-4">
                {currentWord.word}
              </div>
              <Button
                onClick={playPronunciation}
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <Volume2 className="w-5 h-5 mr-2" />
                🔊 Hear it!
              </Button>
            </div>

            {/* Hint buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setShowDefinition(!showDefinition)}
                variant="outline"
                className={`p-4 h-auto ${showDefinition ? 'bg-green-50 border-green-300' : 'bg-white'}`}
              >
                <div className="text-center">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <div className="font-semibold">Definition Hint</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setShowExample(!showExample)}
                variant="outline"
                className={`p-4 h-auto ${showExample ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
              >
                <div className="text-center">
                  <Star className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="font-semibold">Example Hint</div>
                </div>
              </Button>
            </div>

            {/* Hints display */}
            {showDefinition && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-green-700">What it means:</span>
                </div>
                <p className="text-gray-700">{currentWord.definition}</p>
              </div>
            )}

            {showExample && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-blue-700">Example:</span>
                </div>
                <p className="text-gray-700 italic">"{currentWord.example}"</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Button
                onClick={handleForgot}
                variant="outline"
                className="bg-orange-50 hover:bg-orange-100 border-orange-300 text-orange-700 py-6 text-lg"
              >
                <XCircle className="w-6 h-6 mr-2" />
                Still Tricky 🤔
              </Button>
              
              <Button
                onClick={handleRemember}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 text-lg shadow-lg"
              >
                <CheckCircle className="w-6 h-6 mr-2" />
                I Remember! 🎉
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResult = () => {
    const isCorrect = correctWords.includes(currentWord.word);
    
    return (
      <div className="text-center space-y-6 p-8">
        <div className={`text-8xl mb-4 ${isCorrect ? 'animate-bounce' : 'animate-pulse'}`}>
          {isCorrect ? '🎉' : '💪'}
        </div>
        
        <h2 className={`text-3xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}>
          {isCorrect ? 'Awesome! You remembered!' : "That's okay! Keep practicing!"}
        </h2>
        
        {isCorrect && (
          <div className="bg-green-50 p-6 rounded-2xl">
            <p className="text-lg text-green-700 mb-2">
              🏆 +{10 * (streak)} points! 
            </p>
            {streak > 1 && (
              <p className="text-green-600">
                🔥 {streak} word streak bonus!
              </p>
            )}
          </div>
        )}
        
        {!isCorrect && (
          <div className="bg-orange-50 p-6 rounded-2xl">
            <p className="text-lg text-orange-700 mb-2">
              Don't worry! Every practice makes you stronger! 💪
            </p>
            <p className="text-orange-600">
              This word will come back for more practice.
            </p>
          </div>
        )}
        
        <Button
          onClick={nextWord}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl py-4 px-8 rounded-xl"
        >
          {currentWordIndex < practiceWords.length - 1 ? 'Next Word! 🚀' : 'See Results! 🏆'}
        </Button>
      </div>
    );
  };

  const renderComplete = () => (
    <div className="text-center space-y-6 p-8">
      <div className="text-8xl mb-4 animate-bounce">🏆</div>
      
      <h1 className="text-4xl font-bold text-purple-700 mb-2">
        Practice Complete!
      </h1>
      
      <p className="text-xl text-gray-600 mb-6">
        Amazing work, {childName}! You're getting stronger! 💪
      </p>
      
      {/* Results summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-6 rounded-2xl">
          <div className="text-3xl font-bold text-green-600">{correctWords.length}</div>
          <div className="text-green-600">Words Remembered ✅</div>
        </div>
        <div className="bg-orange-50 p-6 rounded-2xl">
          <div className="text-3xl font-bold text-orange-600">{incorrectWords.length}</div>
          <div className="text-orange-600">Still Practicing 🎯</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-2xl">
          <div className="text-3xl font-bold text-purple-600">{points}</div>
          <div className="text-purple-600">Total Points 🌟</div>
        </div>
      </div>
      
      {/* Achievement badges */}
      <div className="space-y-4">
        {accuracy >= 90 && (
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-lg py-2 px-4">
            🏆 Super Learner! 90%+ accuracy!
          </Badge>
        )}
        {bestStreak >= 5 && (
          <Badge className="bg-gradient-to-r from-red-400 to-orange-400 text-white text-lg py-2 px-4">
            🔥 Streak Master! {bestStreak} in a row!
          </Badge>
        )}
        {correctWords.length === practiceWords.length && (
          <Badge className="bg-gradient-to-r from-green-400 to-emerald-400 text-white text-lg py-2 px-4">
            ⭐ Perfect Practice! All words remembered!
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-8">
        {incorrectWords.length > 0 && (
          <Button
            onClick={() => window.location.reload()} // In real app, restart with missed words
            variant="outline"
            className="bg-orange-50 hover:bg-orange-100 border-orange-300 text-orange-700 py-4"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Practice Again
          </Button>
        )}
        
        <Button
          onClick={onBack}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4"
        >
          <Trophy className="w-5 h-5 mr-2" />
          Back to Learning
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-500 animate-pulse" />
          <span className="text-lg font-semibold text-gray-700">Practice Mode</span>
        </div>
      </div>

      {/* Game content */}
      <div className="max-w-4xl mx-auto">
        {gamePhase === 'intro' && renderIntro()}
        {gamePhase === 'playing' && renderPlaying()}
        {gamePhase === 'result' && renderResult()}
        {gamePhase === 'complete' && renderComplete()}
      </div>

      {/* Celebration animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl animate-ping">
            🎉
          </div>
          <div className="absolute top-1/4 left-1/4 text-4xl animate-bounce delay-300">✨</div>
          <div className="absolute top-1/3 right-1/4 text-4xl animate-bounce delay-500">⭐</div>
          <div className="absolute bottom-1/3 left-1/3 text-4xl animate-bounce delay-700">🌟</div>
          <div className="absolute bottom-1/4 right-1/3 text-4xl animate-bounce delay-900">💫</div>
        </div>
      )}
    </div>
  );
};
