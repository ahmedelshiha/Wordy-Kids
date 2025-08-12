interface VowelQuestion {
  word: string;
  missingIndex: number[];
  image?: string;
  audio?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export const vowelQuizData: VowelQuestion[] = [
  // Easy Level - Single vowel missing
  {
    word: "bag",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "hen",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "dog",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "pin",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "leg",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "rat",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "fox",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "van",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "fig",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "sun",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "vet",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "fan",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "cat",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "bed",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "big",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "cup",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "hat",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "pen",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "sit",
    missingIndex: [1],
    difficulty: "easy"
  },
  {
    word: "top",
    missingIndex: [1],
    difficulty: "easy"
  },
  
  // Medium Level - Multiple vowels or different positions
  {
    word: "apple",
    missingIndex: [0],
    difficulty: "medium"
  },
  {
    word: "eagle",
    missingIndex: [0],
    difficulty: "medium"
  },
  {
    word: "olive",
    missingIndex: [0],
    difficulty: "medium"
  },
  {
    word: "uncle",
    missingIndex: [0],
    difficulty: "medium"
  },
  {
    word: "inside",
    missingIndex: [0],
    difficulty: "medium"
  },
  {
    word: "ocean",
    missingIndex: [0],
    difficulty: "medium"
  },
  {
    word: "house",
    missingIndex: [1, 3],
    difficulty: "medium"
  },
  {
    word: "table",
    missingIndex: [1, 4],
    difficulty: "medium"
  },
  {
    word: "music",
    missingIndex: [1, 3],
    difficulty: "medium"
  },
  {
    word: "phone",
    missingIndex: [2, 4],
    difficulty: "medium"
  },
  
  // Hard Level - Multiple vowels missing
  {
    word: "banana",
    missingIndex: [1, 3, 5],
    difficulty: "hard"
  },
  {
    word: "elephant",
    missingIndex: [0, 2, 5],
    difficulty: "hard"
  },
  {
    word: "umbrella",
    missingIndex: [0, 3, 6],
    difficulty: "hard"
  },
  {
    word: "orange",
    missingIndex: [0, 2, 5],
    difficulty: "hard"
  },
  {
    word: "computer",
    missingIndex: [1, 4, 6],
    difficulty: "hard"
  },
  {
    word: "beautiful",
    missingIndex: [1, 2, 6, 8],
    difficulty: "hard"
  },
  {
    word: "education",
    missingIndex: [0, 2, 4, 6, 8],
    difficulty: "hard"
  },
  {
    word: "hospital",
    missingIndex: [1, 3, 6],
    difficulty: "hard"
  },
  {
    word: "bicycle",
    missingIndex: [1, 3, 6],
    difficulty: "hard"
  },
  {
    word: "vacation",
    missingIndex: [1, 3, 6],
    difficulty: "hard"
  }
];

// Helper functions to get questions by difficulty
export const getEasyVowelQuestions = (count: number = 10): VowelQuestion[] => {
  const easyQuestions = vowelQuizData.filter(q => q.difficulty === "easy");
  return shuffleArray(easyQuestions).slice(0, count);
};

export const getMediumVowelQuestions = (count: number = 8): VowelQuestion[] => {
  const mediumQuestions = vowelQuizData.filter(q => q.difficulty === "medium");
  return shuffleArray(mediumQuestions).slice(0, count);
};

export const getHardVowelQuestions = (count: number = 6): VowelQuestion[] => {
  const hardQuestions = vowelQuizData.filter(q => q.difficulty === "hard");
  return shuffleArray(hardQuestions).slice(0, count);
};

export const getMixedVowelQuestions = (count: number = 12): VowelQuestion[] => {
  const easy = getEasyVowelQuestions(Math.ceil(count * 0.5));
  const medium = getMediumVowelQuestions(Math.ceil(count * 0.3));
  const hard = getHardVowelQuestions(Math.ceil(count * 0.2));
  
  return shuffleArray([...easy, ...medium, ...hard]).slice(0, count);
};

export const getTimedVowelQuestions = (): VowelQuestion[] => {
  // For timed mode, use mostly easy and medium questions
  const easy = getEasyVowelQuestions(20);
  const medium = getMediumVowelQuestions(10);
  
  return shuffleArray([...easy, ...medium]);
};

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export type { VowelQuestion };
