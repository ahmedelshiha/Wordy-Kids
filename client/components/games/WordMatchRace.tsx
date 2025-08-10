import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Star,
  Zap,
  Trophy,
  X,
  CheckCircle,
  Target,
  Timer
} from 'lucide-react';

interface Word {
  id: number;
  word: string;
  definition: string;
  emoji?: string;
  imageUrl?: string;
}

interface WordMatchRaceProps {
  words: Word[];
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

interface MatchPair {
  word: Word;
  matched: boolean;
  wrongAttempts: number;
}

export const WordMatchRace: React.FC<WordMatchRaceProps> = ({
  words,
  onGameComplete,
  onClose
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(null);
  const [matchPairs, setMatchPairs] = useState<MatchPair[]>([]);
  const [completedMatches, setCompletedMatches] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Initialize match pairs
  useEffect(() => {
    if (words.length > 0) {
      const pairs: MatchPair[] = words.slice(0, 6).map(word => ({
        word,
        matched: false,
        wrongAttempts: 0
      }));
      setMatchPairs(pairs);
    }
  }, [words]);

  // Shuffle arrays for display
  const [shuffledWords] = useState(() => 
    matchPairs.map(pair => pair.word).sort(() => Math.random() - 0.5)
  );
  const [shuffledDefinitions] = useState(() => 
    matchPairs.map(pair => pair.word.definition).sort(() => Math.random() - 0.5)
  );

  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameEnded) {
      handleTimeUp();
    }
  }, [timeLeft, gameStarted, gameEnded]);

  useEffect(() => {
    if (selectedWord && selectedDefinition) {
      checkMatch();
    }
  }, [selectedWord, selectedDefinition]);

  useEffect(() => {
    if (completedMatches === matchPairs.length && matchPairs.length > 0) {
      handleGameComplete();
    }
  }, [completedMatches, matchPairs.length]);

  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const handleTimeUp = () => {
    setGameEnded(true);
    setTimeout(() => {
      completeGame(false);
    }, 2000);
  };

  const handleGameComplete = () => {
    setGameEnded(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    let finalScore = score;
    
    // Time bonus
    const timeBonus = Math.max(0, (60 - timeTaken) * 5);
    finalScore += timeBonus;
    
    setScore(finalScore);
    setFeedbackMessage(`🎉 Perfect! All words matched! Time bonus: +${timeBonus}`);
    
    setTimeout(() => {
      completeGame(true);
    }, 2000);
  };

  const checkMatch = () => {
    if (!selectedWord || !selectedDefinition) return;

    const wordObj = matchPairs.find(pair => pair.word.word === selectedWord)?.word;
    const isCorrect = wordObj?.definition === selectedDefinition;

    if (isCorrect && wordObj) {
      // Correct match!
      setMatchPairs(prev => prev.map(pair => 
        pair.word.word === selectedWord 
          ? { ...pair, matched: true }
          : pair
      ));
      setCompletedMatches(prev => prev + 1);
      
      const basePoints = 100;
      const attemptPenalty = matchPairs.find(pair => pair.word.word === selectedWord)?.wrongAttempts || 0;
      const pairScore = Math.max(50, basePoints - (attemptPenalty * 25));
      
      setScore(prev => prev + pairScore);
      setFeedbackMessage(`✅ Correct! +${pairScore} points`);
    } else {
      // Wrong match
      setMatchPairs(prev => prev.map(pair => 
        pair.word.word === selectedWord 
          ? { ...pair, wrongAttempts: pair.wrongAttempts + 1 }
          : pair
      ));
      setFeedbackMessage(`❌ Not a match! Try again.`);
    }

    // Clear selections
    setTimeout(() => {
      setSelectedWord(null);
      setSelectedDefinition(null);
      setFeedbackMessage('');
    }, 1500);
  };

  const handleWordSelect = (word: string) => {
    const pair = matchPairs.find(p => p.word.word === word);
    if (pair?.matched) return;
    
    setSelectedWord(word);
  };

  const handleDefinitionSelect = (definition: string) => {
    const pair = matchPairs.find(p => p.word.definition === definition);
    if (pair?.matched) return;
    
    setSelectedDefinition(definition);
  };

  const completeGame = (success: boolean) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const perfectScore = success && completedMatches === matchPairs.length && timeTaken <= 45;
    
    const result = {
      success,
      score: success ? score : Math.floor(score * 0.3),
      time_taken: timeTaken,
      perfect_score: perfectScore,
      xp_earned: success ? (perfectScore ? 100 : 75) : 25,
      coins_earned: success ? (perfectScore ? 20 : 15) : 5,
      health_restored: success ? (perfectScore ? 60 : 40) : 10
    };

    setShowResult(true);
    setTimeout(() => {
      onGameComplete(result);
    }, 3000);
  };

  if (showResult) {
    const success = completedMatches === matchPairs.length;
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              success ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              {success ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : (
                <Timer className="w-10 h-10 text-orange-600" />
              )}
            </div>
            
            <h2 className={`text-3xl font-bold mb-4 ${
              success ? 'text-green-600' : 'text-orange-600'
            }`}>
              {success ? '🏁 Race Complete!' : '⏰ Time\'s Up!'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              You matched {completedMatches} out of {matchPairs.length} word pairs!
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Final Score:</span>
                <span className="font-bold text-purple-600">{score}</span>
              </div>
              <div className="flex justify-between">
                <span>XP Earned:</span>
                <span className="font-bold text-blue-600">
                  +{success ? (score >= 500 ? 100 : 75) : 25}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Coins Earned:</span>
                <span className="font-bold text-yellow-600">
                  +{success ? (score >= 500 ? 20 : 15) : 5}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full bg-white max-h-[90vh] overflow-auto">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold">Word Match Race</h1>
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
                  <span className={`text-lg font-bold ${timeLeft <= 15 ? 'animate-pulse' : ''}`}>
                    {timeLeft}s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>Score: {score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>{completedMatches}/{matchPairs.length}</span>
                </div>
              </div>
              <Progress 
                value={(timeLeft / 60) * 100} 
                className="w-32 h-2 bg-white/20"
              />
            </div>
          </div>

          {/* Game Content */}
          <div className="p-6">
            {!gameStarted ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Ready to Race?
                </h2>
                <p className="text-gray-600 mb-8">
                  Match words with their definitions as fast as you can!
                  You have 60 seconds to match all {matchPairs.length} pairs.
                </p>
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Race!
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Feedback Message */}
                {feedbackMessage && (
                  <div className="text-center">
                    <div className={`text-lg font-bold p-3 rounded-lg inline-block ${
                      feedbackMessage.includes('✅') ? 'bg-green-100 text-green-800' :
                      feedbackMessage.includes('❌') ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {feedbackMessage}
                    </div>
                  </div>
                )}

                {/* Game Board */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Words Column */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                      📝 Words
                    </h3>
                    <div className="space-y-3">
                      {shuffledWords.map((word) => {
                        const pair = matchPairs.find(p => p.word.word === word.word);
                        const isMatched = pair?.matched || false;
                        const isSelected = selectedWord === word.word;
                        
                        return (
                          <button
                            key={word.word}
                            onClick={() => handleWordSelect(word.word)}
                            disabled={isMatched}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                              isMatched 
                                ? 'border-green-300 bg-green-50 text-green-800 opacity-50' :
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md' :
                                'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{word.emoji || '📚'}</span>
                                <span className="font-bold text-lg">{word.word}</span>
                              </div>
                              {isMatched && <CheckCircle className="w-6 h-6 text-green-600" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Definitions Column */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                      💭 Definitions
                    </h3>
                    <div className="space-y-3">
                      {shuffledDefinitions.map((definition) => {
                        const pair = matchPairs.find(p => p.word.definition === definition);
                        const isMatched = pair?.matched || false;
                        const isSelected = selectedDefinition === definition;
                        
                        return (
                          <button
                            key={definition}
                            onClick={() => handleDefinitionSelect(definition)}
                            disabled={isMatched}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                              isMatched 
                                ? 'border-green-300 bg-green-50 text-green-800 opacity-50' :
                              isSelected 
                                ? 'border-purple-500 bg-purple-50 text-purple-800 shadow-md' :
                                'border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm leading-relaxed">{definition}</span>
                              {isMatched && <CheckCircle className="w-6 h-6 text-green-600" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress: {completedMatches}/{matchPairs.length} matches
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {Math.round((completedMatches / matchPairs.length) * 100)}% Complete
                    </span>
                  </div>
                  <Progress 
                    value={(completedMatches / matchPairs.length) * 100} 
                    className="h-3"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
