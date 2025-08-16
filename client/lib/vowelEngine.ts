import { Difficulty, VowelQuestion, WordItem } from "../types/vowel-adventure";

/** Utility: pick N random unique items */
function sample<T>(arr: T[], n: number): T[] {
  if (n >= arr.length) return [...arr];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

const VOWELS = ["a", "e", "i", "o", "u"];

export interface GenerateOptions {
  difficulty: Difficulty;
  words: WordItem[];
  total: number;
  allowYAsVowel?: boolean;
}

/** Difficulty knobs (tunable) */
const curve = {
  easy: {
    choices: 3,
    hearts: 4,
    perQuestionMs: 15000,
    minLen: 3,
    maxLen: 5,
    allowY: false,
  },
  medium: {
    choices: 4,
    hearts: 3,
    perQuestionMs: 12000,
    minLen: 3,
    maxLen: 6,
    allowY: false,
  },
  hard: {
    choices: 5,
    hearts: 2,
    perQuestionMs: 9000,
    minLen: 3,
    maxLen: 8,
    allowY: true,
  },
} as const;

export type CurveKey = keyof typeof curve;

function blankRandomVowel(word: string, allowY = false) {
  const vowels = allowY ? [...VOWELS, "y"] : VOWELS;
  const indices = [...word]
    .map((ch, i) => (vowels.includes(ch.toLowerCase()) ? i : -1))
    .filter((i) => i >= 0);
  if (indices.length === 0) return null;
  const missingIndex = indices[Math.floor(Math.random() * indices.length)];
  const correct = word[missingIndex].toLowerCase();
  const prompt =
    word.slice(0, missingIndex) + "_" + word.slice(missingIndex + 1);
  return { prompt, missingIndex, correct };
}

/** Main generator. Replace or pipe your existing logic here. */
export function generateQuestions(opts: GenerateOptions): {
  questions: VowelQuestion[];
  hearts: number;
  perQuestionMs: number;
} {
  const c = curve[opts.difficulty];
  const allowY = opts.allowYAsVowel ?? c.allowY;

  const filteredWords = opts.words.filter(
    (w) =>
      w.word.length >= c.minLen &&
      w.word.length <= c.maxLen &&
      /[aeiouAEIOU]/.test(w.word), // Must contain at least one vowel
  );

  const selectedWords = sample(filteredWords, opts.total);
  const questions: VowelQuestion[] = [];

  let questionId = 0;
  for (const wordItem of selectedWords) {
    const result = blankRandomVowel(wordItem.word, allowY);
    if (!result) continue;

    const { prompt, missingIndex, correct } = result;

    // Generate choices: correct answer + random distractors
    const allVowels = allowY ? [...VOWELS, "y"] : VOWELS;
    const distractors = allVowels.filter((v) => v !== correct);
    const randomDistractors = sample(distractors, c.choices - 1);
    const choices = sample([correct, ...randomDistractors], c.choices);

    questions.push({
      id: `q${questionId++}`,
      prompt,
      answer: wordItem.word,
      missingIndex,
      choices,
      correct,
      emoji: wordItem.emoji,
      difficulty: opts.difficulty,
    });
  }

  return {
    questions: questions.slice(0, opts.total),
    hearts: c.hearts,
    perQuestionMs: c.perQuestionMs,
  };
}

// Default word set if none provided
export const defaultWords: WordItem[] = [
  { word: "cat", emoji: "🐱" },
  { word: "dog", emoji: "🐶" },
  { word: "sun", emoji: "☀️" },
  { word: "bus", emoji: "🚌" },
  { word: "fish", emoji: "🐟" },
  { word: "bird", emoji: "🐦" },
  { word: "tree", emoji: "🌳" },
  { word: "moon", emoji: "🌙" },
  { word: "star", emoji: "⭐" },
  { word: "book", emoji: "📖" },
  { word: "house", emoji: "🏠" },
  { word: "apple", emoji: "🍎" },
  { word: "cake", emoji: "🎂" },
  { word: "ball", emoji: "⚽" },
  { word: "rain", emoji: "🌧️" },
  { word: "fire", emoji: "🔥" },
  { word: "water", emoji: "💧" },
  { word: "flower", emoji: "🌸" },
  { word: "happy", emoji: "😊" },
  { word: "music", emoji: "🎵" },
  { word: "cloud", emoji: "☁️" },
  { word: "heart", emoji: "❤️" },
  { word: "smile", emoji: "😄" },
  { word: "peace", emoji: "☮️" },
  { word: "world", emoji: "🌍" },
];
