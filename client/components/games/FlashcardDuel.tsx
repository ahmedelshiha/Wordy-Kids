import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Sword,
  Shield,
  Clock,
  Star,
  Zap,
  Heart,
  Trophy,
  X,
  CheckCircle
} from 'lucide-react';

interface Word {
  id: number;
  word: string;
  definition: string;
  emoji?: string;
  wrongDefinitions?: string[];
}

interface FlashcardDuelProps {
  word: Word;
  onGameComplete: (result: {
    success: boolean;
    score: number;
    time_taken: number;
    perfect_score: boolean;
    xp_earned: number;
    coins_earned: number;
    health_restored: number;
  }) => void;
  onClose: () => void;
}

export const FlashcardDuel: React.FC<FlashcardDuelProps> = ({
  word,
  onGameComplete,
  onClose
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);

  // Generate wrong answers for multiple choice
  const wrongDefinitions = word.wrongDefinitions || [
    "A type of ancient tool used by early humans",
    "A scientific term for weather patterns",
    "A mathematical concept related to geometry",
    "A historical event from the medieval period"
  ];

  const allOptions = [word.definition, ...wrongDefinitions.slice(0, 3)];
  const [shuffledOptions] = useState(() => 
    allOptions.sort(() => Math.random() - 0.5)
  );

  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameEnded) {
      handleTimeUp();
    }
  }, [timeLeft, gameStarted, gameEnded]);

  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const handleTimeUp = () => {
    setGameEnded(true);
    setIsCorrect(false);
    setTimeout(() => {
      completeGame(false);
    }, 2000);
  };

  const handleAnswerSelect = (answer: string) => {
    if (gameEnded || selectedAnswer) return;
    
    setSelectedAnswer(answer);
    const correct = answer === word.definition;
    setIsCorrect(correct);
    setGameEnded(true);

    if (correct) {
      const timeTaken = 30 - timeLeft;
      let gameScore = 100;
      
      // Bonus points for speed
      if (timeTaken <= 10) gameScore += 50; // Speed bonus
      if (timeTaken <= 5) gameScore += 25; // Super speed bonus
      
      setScore(gameScore);
    }

    setTimeout(() => {
      completeGame(correct);
    }, 2000);
  };

  const completeGame = (success: boolean) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const perfectScore = success && timeTaken <= 10;
    
    const result = {
      success,
      score: success ? score : 0,
      time_taken: timeTaken,
      perfect_score: perfectScore,
      xp_earned: success ? (perfectScore ? 75 : 50) : 10,
      coins_earned: success ? (perfectScore ? 15 : 10) : 2,
      health_restored: success ? (perfectScore ? 50 : 30) : 5
    };

    setShowResult(true);
    setTimeout(() => {
      onGameComplete(result);
    }, 3000);
  };

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isCorrect ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isCorrect ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : (
                <X className="w-10 h-10 text-red-600" />
              )}
            </div>
            
            <h2 className={`text-3xl font-bold mb-4 ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCorrect ? '🎉 Victory!' : '💔 Better Luck Next Time!'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {isCorrect 
                ? `You rescued "${word.word}" with ${score} points!`
                : `The word "${word.word}" escaped this time...`
              }
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>XP Earned:</span>
                <span className="font-bold text-blue-600">
                  +{isCorrect ? (score >= 150 ? 75 : 50) : 10}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Coins Earned:</span>
                <span className="font-bold text-yellow-600">
                  +{isCorrect ? (score >= 150 ? 15 : 10) : 2}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Health Restored:</span>
                <span className="font-bold text-green-600">
                  +{isCorrect ? (score >= 150 ? 50 : 30) : 5}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sword className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold">Flashcard Duel</h1>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className={`text-lg font-bold ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
                    {timeLeft}s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>Score: {score}</span>
                </div>
              </div>
              <Progress 
                value={(timeLeft / 30) * 100} 
                className="w-32 h-2 bg-white/20"
              />
            </div>
          </div>

          {/* Game Content */}
          <div className="p-8">
            {!gameStarted ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sword className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Ready for Battle?
                </h2>
                <p className="text-gray-600 mb-8">
                  You have 30 seconds to select the correct definition for the word.
                  Choose wisely, Word Hero!
                </p>
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Duel!
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Word Display */}
                <div className="text-center">
                  <div className="text-6xl mb-4">{word.emoji || '📚'}</div>
                  <h2 className="text-4xl font-bold text-gray-800 mb-2">
                    {word.word}
                  </h2>
                  <p className="text-gray-600">
                    What does this word mean?
                  </p>
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shuffledOptions.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectAnswer = option === word.definition;
                    
                    let buttonClass = "w-full p-4 text-left border-2 rounded-xl transition-all duration-300 ";
                    
                    if (gameEnded) {
                      if (isCorrectAnswer) {
                        buttonClass += "border-green-500 bg-green-50 text-green-800";
                      } else if (isSelected && !isCorrectAnswer) {
                        buttonClass += "border-red-500 bg-red-50 text-red-800";
                      } else {
                        buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
                      }
                    } else {
                      buttonClass += "border-purple-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={gameEnded}
                        className={buttonClass}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm leading-relaxed">{option}</span>
                          {gameEnded && (
                            <div className="flex-shrink-0 ml-3">
                              {isCorrectAnswer ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : isSelected ? (
                                <X className="w-6 h-6 text-red-600" />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Result Display */}
                {gameEnded && (
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${
                      isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isCorrect ? '⚔️ Victory!' : '💔 Defeat!'}
                    </div>
                    <p className="text-gray-600">
                      {isCorrect 
                        ? `Great job! You rescued "${word.word}" successfully!`
                        : `The word "${word.word}" means: "${word.definition}"`
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
