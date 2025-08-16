import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Difficulty, GameResult, VowelQuestion, WordItem } from '../../types/vowel-adventure';
import { generateQuestions, defaultWords } from '../../lib/vowelEngine';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Volume2, VolumeX, Home, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

type Props = {
  words?: WordItem[];
  totalQuestions?: number;
  onFinish?: (result: GameResult) => void;
  onHome?: () => void;
};

type Screen = 'menu' | 'play' | 'result';

export const VowelAdventure: React.FC<Props> = ({ 
  words = defaultWords, 
  totalQuestions = 10, 
  onFinish,
  onHome 
}) => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [questions, setQuestions] = useState<VowelQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [perQMs, setPerQMs] = useState(12000);
  const [timeLeft, setTimeLeft] = useState(12000);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<Array<{questionId: string; expected: string; got: string}>>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Setup prefers-reduced-motion
  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(q.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    if (q.addEventListener) q.addEventListener('change', onChange);
    return () => q.removeEventListener && q.removeEventListener('change', onChange);
  }, []);

  // Text-to-speech function
  function speak(text: string) {
    if (!ttsEnabled) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = difficulty === 'easy' ? 0.86 : difficulty === 'medium' ? 1 : 1.1;
    synth.cancel();
    synth.speak(utterance);
  }

  // Timer logic
  useEffect(() => {
    if (screen !== 'play') return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setTimeLeft(prev => prev - 100);
    }, 100);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [screen, timeLeft]);

  // Difficulty configurations
  const difficultyConfig = useMemo(() => ({
    easy: { emoji: '🐣', hearts: 4, timeMs: 15000, description: 'Perfect for beginners!' },
    medium: { emoji: '⚡', hearts: 3, timeMs: 12000, description: 'Ready for a challenge?' },
    hard: { emoji: '🚀', hearts: 2, timeMs: 9000, description: 'Expert level adventure!' },
  }), []);

  function startGame(selectedDifficulty: Difficulty) {
    const { questions: newQuestions, hearts: gameHearts, perQuestionMs } = generateQuestions({
      difficulty: selectedDifficulty,
      words,
      total: totalQuestions,
    });

    setDifficulty(selectedDifficulty);
    setQuestions(newQuestions);
    setHearts(gameHearts);
    setPerQMs(perQuestionMs);
    setTimeLeft(perQuestionMs);
    setQIndex(0);
    setCorrectCount(0);
    setMistakes([]);
    setStreak(0);
    setBestStreak(0);
    setSelectedChoice(null);
    setShowFeedback(false);
    setScreen('play');
    startedAtRef.current = Date.now();

    // Speak the first question
    setTimeout(() => {
      if (newQuestions[0]) {
        speak(newQuestions[0].answer);
      }
    }, 500);
  }

  function handleTimeout() {
    const currentQ = questions[qIndex];
    if (!currentQ) return;

    // Treat timeout as wrong answer
    setMistakes(prev => [...prev, {
      questionId: currentQ.id,
      expected: currentQ.correct,
      got: '(timeout)'
    }]);

    setHearts(prev => {
      const newHearts = prev - 1;
      if (newHearts <= 0) {
        finishGame();
      } else {
        nextQuestion();
      }
      return newHearts;
    });
  }

  function handleChoiceClick(choice: string) {
    if (selectedChoice || showFeedback) return;

    const currentQ = questions[qIndex];
    if (!currentQ) return;

    setSelectedChoice(choice);
    setShowFeedback(true);

    const isCorrect = choice === currentQ.correct;
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      speak('Correct!');
    } else {
      setMistakes(prev => [...prev, {
        questionId: currentQ.id,
        expected: currentQ.correct,
        got: choice
      }]);
      setStreak(0);
      setHearts(prev => prev - 1);
      speak('Try again!');
    }

    // Auto-advance after feedback
    setTimeout(() => {
      if (isCorrect || hearts <= 1) {
        if (hearts <= 1 && !isCorrect) {
          finishGame();
        } else {
          nextQuestion();
        }
      } else {
        // Reset for retry
        setSelectedChoice(null);
        setShowFeedback(false);
        setTimeLeft(perQMs);
      }
    }, 1500);
  }

  function nextQuestion() {
    const nextIdx = qIndex + 1;
    if (nextIdx >= questions.length) {
      finishGame();
      return;
    }

    setQIndex(nextIdx);
    setSelectedChoice(null);
    setShowFeedback(false);
    setTimeLeft(perQMs);

    // Speak the next question
    setTimeout(() => {
      speak(questions[nextIdx].answer);
    }, 200);
  }

  function finishGame() {
    const timeElapsed = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
    const accuracy = questions.length > 0 ? correctCount / questions.length : 0;
    
    // Calculate star rating
    let starRating = 1;
    if (accuracy >= 0.8) starRating = 3;
    else if (accuracy >= 0.6) starRating = 2;

    const result: GameResult = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      mistakes,
      timeElapsed,
      difficulty,
      starRating,
      bestStreak,
    };

    if (onFinish) {
      onFinish(result);
    }

    setScreen('result');
  }

  function playAgain() {
    setScreen('menu');
  }

  const currentQuestion = questions[qIndex];
  const progress = questions.length > 0 ? ((qIndex + 1) / questions.length) * 100 : 0;

  // Render mode selection screen
  if (screen === 'menu') {
    return (
      <div className="vowel-card">
        <div className="vowel-title">
          🎯 Vowel Adventure
        </div>
        <div className="vowel-sub">
          Choose your difficulty level to start the adventure!
        </div>
        
        <div className="vowel-mode-grid">
          {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => {
            const config = difficultyConfig[diff];
            return (
              <button
                key={diff}
                className={cn("mode-btn", diff)}
                onClick={() => startGame(diff)}
              >
                <div className="mode-badge">
                  {config.emoji} {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  {config.description}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                  {config.hearts} hearts • {config.timeMs / 1000}s per question
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            className="icon-btn"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            aria-label={ttsEnabled ? 'Disable voice' : 'Enable voice'}
          >
            {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          {onHome && (
            <button className="icon-btn" onClick={onHome} aria-label="Go home">
              <Home size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render game screen
  if (screen === 'play' && currentQuestion) {
    return (
      <div className="vowel-card">
        <div className="play-area">
          {/* HUD */}
          <div className="hud">
            <div className="lives">
              {Array.from({ length: hearts }, (_, i) => (
                <span key={i} className="life">❤️</span>
              ))}
            </div>
            <div className="timer">
              {Math.ceil(timeLeft / 1000)}s
            </div>
          </div>

          {/* Progress */}
          <div className="progress">
            <div style={{ width: `${progress}%`, transition: 'width 0.3s ease' }} />
          </div>

          {/* Question */}
          <div className="prompt">
            {currentQuestion.emoji && (
              <span className="emoji">{currentQuestion.emoji}</span>
            )}
            <span>{currentQuestion.prompt}</span>
          </div>

          {/* Choices */}
          <div className="choices">
            {currentQuestion.choices.map((choice) => (
              <button
                key={choice}
                className={cn(
                  "choice",
                  selectedChoice === choice && showFeedback && choice === currentQuestion.correct && "correct",
                  selectedChoice === choice && showFeedback && choice !== currentQuestion.correct && "wrong"
                )}
                onClick={() => handleChoiceClick(choice)}
                disabled={showFeedback}
              >
                {choice.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Footer controls */}
          <div className="footer">
            <button
              className="icon-btn"
              onClick={() => speak(currentQuestion.answer)}
              aria-label="Say word"
            >
              🔊
            </button>
            <button
              className="icon-btn"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              aria-label={ttsEnabled ? 'Disable voice' : 'Enable voice'}
            >
              {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              className="icon-btn"
              onClick={finishGame}
              aria-label="End game"
            >
              🏁
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render result screen
  if (screen === 'result') {
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const starRating = accuracy >= 80 ? 3 : accuracy >= 60 ? 2 : 1;

    return (
      <div className="vowel-card">
        <div className="result">
          <div className="vowel-title">
            🎉 Adventure Complete!
          </div>
          
          <div className="stars">
            {'⭐'.repeat(starRating)}{'☆'.repeat(3 - starRating)}
          </div>

          <div style={{ fontSize: '18px', marginBottom: '8px' }}>
            {correctCount} out of {questions.length} correct!
          </div>
          
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '16px' }}>
            Best streak: {bestStreak} • Accuracy: {accuracy}%
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button className="big-cta" onClick={playAgain}>
              <RotateCcw size={16} style={{ marginRight: '8px' }} />
              Play Again
            </button>
            {onHome && (
              <button className="icon-btn" onClick={onHome}>
                <Home size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
