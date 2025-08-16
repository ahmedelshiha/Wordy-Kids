export type Difficulty = 'easy' | 'medium' | 'hard';

export interface VowelQuestion {
  id: string;
  /** full word (e.g., "c_t") with an underscore at the missing index */
  prompt: string;
  /** the correct full word (e.g., "cat") */
  answer: string;
  /** which character index is blanked in `prompt` */
  missingIndex: number;
  /** choices shown to the player (e.g., ['a','e','i','o','u']) */
  choices: string[];
  /** the correct vowel */
  correct: string;
  /** optional picture or emoji to show with the word */
  emoji?: string;
  /** optional hint text */
  hint?: string;
  /** difficulty baked onto the question (after generation) */
  difficulty: Difficulty;
}

export interface GameResult {
  totalQuestions: number;
  correctAnswers: number;
  mistakes: Array<{questionId: string; expected: string; got: string}>;
  timeElapsed: number;
  difficulty: Difficulty;
  starRating: number; // 1-3 stars
  bestStreak: number;
}

export interface WordItem {
  word: string;
  emoji?: string;
}
