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
  Shield,
  RotateCcw,
  Lightbulb
} from 'lucide-react';

interface Word {
  id: number;
  word: string;
  definition: string;
  emoji?: string;
  hint?: string;
}

interface LetterBuilderProps {
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

interface LetterTile {
  letter: string;
  id: string;
  isPlaced: boolean;
  position?: number;
}

export const LetterBuilder: React.FC<LetterBuilderProps> = ({
  word,
  onGameComplete,
  onClose
}) => {
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  
  const [letterTiles, setLetterTiles] = useState<LetterTile[]>([]);
  const [placedLetters, setPlacedLetters] = useState<(LetterTile | null)[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Initialize letter tiles
  useEffect(() => {
    if (word.word) {
      const wordLetters = word.word.toLowerCase().split('');
      
      // Add some extra random letters to make it challenging
      const extraLetters = ['a', 'e', 'i', 'o', 'u', 'r', 's', 't', 'n'].filter(
        letter => !wordLetters.includes(letter)
      ).slice(0, Math.min(4, Math.max(2, 8 - wordLetters.length)));
      
      const allLetters = [...wordLetters, ...extraLetters].map((letter, index) => ({
        letter: letter.toUpperCase(),
        id: `${letter}-${index}`,
        isPlaced: false
      }));
      
      // Shuffle the tiles
      const shuffledTiles = allLetters.sort(() => Math.random() - 0.5);
      setLetterTiles(shuffledTiles);
      setPlacedLetters(new Array(word.word.length).fill(null));
    }
  }, [word]);

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
    setFeedbackMessage('⏰ Time\'s up! The word was: ' + word.word);
    setTimeout(() => {
      completeGame(false);
    }, 3000);
  };

  const handleLetterSelect = (tile: LetterTile) => {
    if (tile.isPlaced || gameEnded) return;

    // Find first empty position
    const emptyIndex = placedLetters.findIndex(pos => pos === null);
    if (emptyIndex === -1) return;

    // Place the letter
    const newPlacedLetters = [...placedLetters];
    newPlacedLetters[emptyIndex] = { ...tile, position: emptyIndex, isPlaced: true };
    setPlacedLetters(newPlacedLetters);

    // Mark tile as placed
    setLetterTiles(prev => prev.map(t => 
      t.id === tile.id ? { ...t, isPlaced: true } : t
    ));

    // Check if word is complete
    if (emptyIndex === word.word.length - 1) {
      checkWord(newPlacedLetters);
    }
  };

  const handleLetterRemove = (position: number) => {
    if (gameEnded) return;

    const removedTile = placedLetters[position];
    if (!removedTile) return;

    // Remove from placed letters
    const newPlacedLetters = [...placedLetters];
    newPlacedLetters[position] = null;
    setPlacedLetters(newPlacedLetters);

    // Mark tile as available again
    setLetterTiles(prev => prev.map(t => 
      t.id === removedTile.id ? { ...t, isPlaced: false } : t
    ));
  };

  const checkWord = (currentPlacedLetters: (LetterTile | null)[]) => {
    const builtWord = currentPlacedLetters
      .map(tile => tile?.letter || '')
      .join('')
      .toLowerCase();
    
    if (builtWord === word.word.toLowerCase()) {
      // Success!
      setGameEnded(true);
      
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      let gameScore = 1000;
      
      // Deduct points for hints and wrong attempts
      gameScore -= hintsUsed * 100;
      gameScore -= wrongAttempts * 50;
      
      // Time bonus
      const timeBonus = Math.max(0, (90 - timeTaken) * 5);
      gameScore += timeBonus;
      
      setScore(Math.max(100, gameScore));
      setFeedbackMessage(`🎉 Perfect! You rebuilt "${word.word}"!`);
      
      setTimeout(() => {
        completeGame(true);
      }, 2000);
    } else {
      // Wrong word
      setWrongAttempts(prev => prev + 1);
      setFeedbackMessage(`❌ Not quite right. Keep trying!`);
      
      // Clear the word after a delay
      setTimeout(() => {
        // Return all placed letters to available pool
        setLetterTiles(prev => prev.map(t => ({ ...t, isPlaced: false })));
        setPlacedLetters(new Array(word.word.length).fill(null));
        setFeedbackMessage('');
      }, 2000);
    }
  };

  const useHint = () => {
    if (hintsUsed >= 2 || gameEnded) return;
    
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
    
    setTimeout(() => {
      setShowHint(false);
    }, 5000);
  };

  const resetWord = () => {
    if (gameEnded) return;
    
    // Return all placed letters to available pool
    setLetterTiles(prev => prev.map(t => ({ ...t, isPlaced: false })));
    setPlacedLetters(new Array(word.word.length).fill(null));
    setFeedbackMessage('');
  };

  const completeGame = (success: boolean) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const perfectScore = success && hintsUsed === 0 && wrongAttempts === 0 && timeTaken <= 60;
    
    const result = {
      success,
      score: success ? score : Math.floor(score * 0.2),
      time_taken: timeTaken,
      perfect_score: perfectScore,
      xp_earned: success ? (perfectScore ? 90 : 60) : 20,
      coins_earned: success ? (perfectScore ? 18 : 12) : 3,
      health_restored: success ? (perfectScore ? 55 : 35) : 8
    };

    setShowResult(true);
    setTimeout(() => {
      onGameComplete(result);
    }, 3000);
  };

  if (showResult) {
    const builtWord = placedLetters.map(tile => tile?.letter || '').join('').toLowerCase();
    const success = builtWord === word.word.toLowerCase();
    
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {success ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : (
                <X className="w-10 h-10 text-red-600" />
              )}
            </div>
            
            <h2 className={`text-3xl font-bold mb-4 ${
              success ? 'text-green-600' : 'text-red-600'
            }`}>
              {success ? '🔨 Word Rebuilt!' : '💔 Building Failed!'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {success 
                ? `You successfully rebuilt "${word.word}"!`
                : `The word was "${word.word}". Better luck next time!`
              }
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Final Score:</span>
                <span className="font-bold text-purple-600">{score}</span>
              </div>
              <div className="flex justify-between">
                <span>XP Earned:</span>
                <span className="font-bold text-blue-600">
                  +{success ? (hintsUsed === 0 && wrongAttempts === 0 ? 90 : 60) : 20}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Coins Earned:</span>
                <span className="font-bold text-yellow-600">
                  +{success ? (hintsUsed === 0 && wrongAttempts === 0 ? 18 : 12) : 3}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full bg-white max-h-[90vh] overflow-auto">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold">Letter Builder</h1>
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
                  <span className={`text-lg font-bold ${timeLeft <= 20 ? 'animate-pulse' : ''}`}>
                    {timeLeft}s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>Score: {score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Hints: {2 - hintsUsed}</span>
                </div>
              </div>
              <Progress 
                value={(timeLeft / 90) * 100} 
                className="w-32 h-2 bg-white/20"
              />
            </div>
          </div>

          {/* Game Content */}
          <div className="p-6">
            {!gameStarted ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Ready to Build?
                </h2>
                <p className="text-gray-600 mb-8">
                  Rebuild the forgotten word by selecting the correct letters in order.
                  You have 90 seconds and 2 hints to help you!
                </p>
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Building!
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Word Definition and Hint */}
                <div className="text-center">
                  <div className="text-4xl mb-4">{word.emoji || '🔨'}</div>
                  <div className="bg-blue-50 p-4 rounded-xl mb-4">
                    <h3 className="font-bold text-gray-800 mb-2">Definition:</h3>
                    <p className="text-gray-700">{word.definition}</p>
                  </div>
                  
                  {showHint && (
                    <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-300">
                      <h3 className="font-bold text-yellow-800 mb-2">💡 Hint:</h3>
                      <p className="text-yellow-700">
                        {word.hint || `The word starts with "${word.word.charAt(0).toUpperCase()}" and has ${word.word.length} letters.`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Feedback Message */}
                {feedbackMessage && (
                  <div className="text-center">
                    <div className={`text-lg font-bold p-3 rounded-lg inline-block ${
                      feedbackMessage.includes('🎉') ? 'bg-green-100 text-green-800' :
                      feedbackMessage.includes('❌') ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {feedbackMessage}
                    </div>
                  </div>
                )}

                {/* Word Building Area */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                    Build the Word ({word.word.length} letters)
                  </h3>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {placedLetters.map((tile, index) => (
                      <button
                        key={index}
                        onClick={() => handleLetterRemove(index)}
                        className={`w-14 h-14 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xl font-bold transition-all hover:bg-gray-100 ${
                          tile ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white'
                        }`}
                      >
                        {tile?.letter || ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Available Letters */}
                <div>
                  <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                    Available Letters
                  </h3>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {letterTiles.map((tile) => (
                      <button
                        key={tile.id}
                        onClick={() => handleLetterSelect(tile)}
                        disabled={tile.isPlaced}
                        className={`w-12 h-12 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ${
                          tile.isPlaced 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 cursor-pointer shadow-md'
                        }`}
                      >
                        {tile.letter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Game Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={useHint}
                    disabled={hintsUsed >= 2}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Use Hint ({2 - hintsUsed} left)
                  </Button>
                  
                  <Button
                    onClick={resetWord}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Word
                  </Button>
                </div>

                {/* Progress Indicator */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Letters Placed: {placedLetters.filter(l => l !== null).length}/{word.word.length}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {Math.round((placedLetters.filter(l => l !== null).length / word.word.length) * 100)}% Complete
                    </span>
                  </div>
                  <Progress 
                    value={(placedLetters.filter(l => l !== null).length / word.word.length) * 100} 
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
