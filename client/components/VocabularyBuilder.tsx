import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  ThumbsUp, 
  ThumbsDown, 
  SkipForward,
  Trophy,
  Clock,
  Target,
  CheckCircle
} from 'lucide-react';

interface VocabularyWord {
  id: number;
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard';
  masteryLevel: number; // 0-100
  lastReviewed?: Date;
  nextReview?: Date;
}

interface VocabularyBuilderProps {
  words: VocabularyWord[];
  onWordMastered: (wordId: number, rating: 'easy' | 'medium' | 'hard') => void;
  onSessionComplete: (wordsReviewed: number, accuracy: number) => void;
}

export const VocabularyBuilder: React.FC<VocabularyBuilderProps> = ({
  words,
  onWordMastered,
  onSessionComplete
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [sessionWords, setSessionWords] = useState<VocabularyWord[]>([]);
  const [reviewedWords, setReviewedWords] = useState<number[]>([]);
  const [sessionStartTime] = useState(Date.now());
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    // Initialize session with words that need review
    const wordsToReview = words
      .filter(word => needsReview(word))
      .sort((a, b) => (a.masteryLevel || 0) - (b.masteryLevel || 0))
      .slice(0, 10); // Limit to 10 words per session

    setSessionWords(wordsToReview);
  }, [words]);

  const needsReview = (word: VocabularyWord): boolean => {
    if (!word.lastReviewed) return true;
    if (!word.nextReview) return true;
    return new Date() >= new Date(word.nextReview);
  };

  const calculateNextReview = (masteryLevel: number, rating: 'easy' | 'medium' | 'hard'): Date => {
    const now = new Date();
    let intervalDays = 1;

    // Spaced repetition algorithm
    if (rating === 'easy') {
      intervalDays = Math.max(1, Math.floor(masteryLevel / 10) * 2);
    } else if (rating === 'medium') {
      intervalDays = Math.max(1, Math.floor(masteryLevel / 20));
    } else {
      intervalDays = 1; // Review again tomorrow if hard
    }

    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + intervalDays);
    return nextReview;
  };

  const handleRating = (rating: 'easy' | 'medium' | 'hard') => {
    const currentWord = sessionWords[currentWordIndex];
    if (!currentWord) return;

    // Update mastery level
    let newMasteryLevel = currentWord.masteryLevel || 0;
    if (rating === 'easy') {
      newMasteryLevel = Math.min(100, newMasteryLevel + 15);
    } else if (rating === 'medium') {
      newMasteryLevel = Math.min(100, newMasteryLevel + 8);
    } else {
      newMasteryLevel = Math.max(0, newMasteryLevel - 5);
    }

    onWordMastered(currentWord.id, rating);
    setReviewedWords([...reviewedWords, currentWord.id]);

    // Move to next word or complete session
    if (currentWordIndex < sessionWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowDefinition(false);
    } else {
      completeSession();
    }
  };

  const handleSkip = () => {
    if (currentWordIndex < sessionWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowDefinition(false);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    setSessionComplete(true);
    const timeSpent = Math.round((Date.now() - sessionStartTime) / 1000);
    const accuracy = (reviewedWords.length / sessionWords.length) * 100;
    setTimeout(() => onSessionComplete(reviewedWords.length, accuracy), 2000);
  };

  if (sessionWords.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Great Job! 🎉
          </h2>
          <p className="text-slate-600 mb-6">
            You've reviewed all your words for today. Come back tomorrow for more practice!
          </p>
          <Badge className="bg-green-500 text-white">
            All words reviewed
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (sessionComplete) {
    const accuracy = Math.round((reviewedWords.length / sessionWords.length) * 100);
    const timeSpent = Math.round((Date.now() - sessionStartTime) / 1000);

    return (
      <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <CardContent className="p-8 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Session Complete! 🎉</h2>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-2xl font-bold">{reviewedWords.length}</div>
              <div className="text-sm opacity-90">Words Reviewed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{accuracy}%</div>
              <div className="text-sm opacity-90">Completion Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.floor(timeSpent / 60)}m</div>
              <div className="text-sm opacity-90">Time Spent</div>
            </div>
          </div>
          <p className="text-lg opacity-90">
            Keep up the great work! Your vocabulary is growing stronger every day.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentWord = sessionWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / sessionWords.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-educational-purple" />
            Vocabulary Builder Session
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Badge variant="outline">
                Word {currentWordIndex + 1} of {sessionWords.length}
              </Badge>
              <Badge variant="outline">
                Mastery: {currentWord.masteryLevel || 0}%
              </Badge>
            </div>
            <Badge className="bg-educational-purple text-white">
              <Clock className="w-4 h-4 mr-1" />
              {Math.floor((Date.now() - sessionStartTime) / 1000 / 60)}m
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Word Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink" />
        
        <CardContent className="p-8">
          {!showDefinition ? (
            /* Show Word First */
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-slate-800">
                  {currentWord.word}
                </h1>
                <p className="text-xl text-slate-600">
                  {currentWord.pronunciation}
                </p>
                <Badge className={`text-lg px-4 py-2 ${
                  currentWord.difficulty === 'easy' ? 'bg-educational-green' :
                  currentWord.difficulty === 'medium' ? 'bg-educational-orange' :
                  'bg-educational-pink'
                } text-white`}>
                  {currentWord.difficulty}
                </Badge>
              </div>

              <div className="space-y-4">
                <p className="text-lg text-slate-600">
                  Do you remember what this word means?
                </p>
                <Button 
                  size="lg"
                  onClick={() => setShowDefinition(true)}
                  className="bg-educational-blue text-white hover:bg-educational-blue/90"
                >
                  Show Definition
                </Button>
              </div>
            </div>
          ) : (
            /* Show Definition and Rating */
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-slate-800">
                  {currentWord.word}
                </h1>
                <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Definition:</h3>
                    <p className="text-xl text-slate-800">{currentWord.definition}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Example:</h3>
                    <p className="text-lg text-slate-600 italic">"{currentWord.example}"</p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-800">
                  How well did you remember this word?
                </h3>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => handleRating('hard')}
                    variant="outline"
                    className="flex-1 max-w-xs text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <ThumbsDown className="w-5 h-5 mr-2" />
                    Hard
                    <div className="text-xs mt-1">Review tomorrow</div>
                  </Button>
                  <Button
                    onClick={() => handleRating('medium')}
                    variant="outline"
                    className="flex-1 max-w-xs text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Medium
                    <div className="text-xs mt-1">Review in few days</div>
                  </Button>
                  <Button
                    onClick={() => handleRating('easy')}
                    variant="outline"
                    className="flex-1 max-w-xs text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    Easy
                    <div className="text-xs mt-1">Review next week</div>
                  </Button>
                </div>
                
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-slate-500"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip this word
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
