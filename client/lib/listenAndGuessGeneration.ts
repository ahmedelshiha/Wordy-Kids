import {
  Word,
  wordsDatabase,
  getWordsByCategory,
  getRandomWords,
} from "@/data/wordsDatabase";

export interface ListenAndGuessWord {
  id: string | number;
  word: string;
  imageUrl: string;
  distractorImages: string[];
  audioUrl?: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
}

// High-quality image URLs for common words (using Unsplash with specific search terms)
const imageDatabase: Record<string, { correct: string; distractors: string[] }> = {
  // FOOD
  apple: {
    correct: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&auto=format", // banana
      "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=200&h=200&fit=crop&auto=format", // strawberry
    ]
  },
  banana: {
    correct: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format", // apple
      "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=200&h=200&fit=crop&auto=format", // orange
    ]
  },
  orange: {
    correct: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format", // apple
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&auto=format", // banana
    ]
  },

  // ANIMALS
  cat: {
    correct: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&auto=format", // dog
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&auto=format", // bird
    ]
  },
  dog: {
    correct: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format", // cat
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&auto=format", // bird
    ]
  },
  bird: {
    correct: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format", // cat
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&auto=format", // dog
    ]
  },
  fish: {
    correct: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&auto=format", // bird
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format", // cat
    ]
  },
  elephant: {
    correct: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&auto=format", // dog
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format", // cat
    ]
  },

  // OBJECTS & TOYS
  ball: {
    correct: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format", // apple
      "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=200&h=200&fit=crop&auto=format", // car
    ]
  },
  car: {
    correct: "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=200&h=200&fit=crop&auto=format", // ball
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&auto=format", // dog
    ]
  },
  book: {
    correct: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=200&h=200&fit=crop&auto=format", // ball
      "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=200&h=200&fit=crop&auto=format", // car
    ]
  },

  // NATURE
  sun: {
    correct: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format", // cat
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&auto=format", // banana
    ]
  },
  flower: {
    correct: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&auto=format", // sun
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format", // apple
    ]
  },
  tree: {
    correct: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=200&h=200&fit=crop&auto=format", // flower
      "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=200&h=200&fit=crop&auto=format", // ball
    ]
  },

  // BODY PARTS
  hand: {
    correct: "https://images.unsplash.com/photo-1586094819848-a9f1b3e8e3f3?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format", // cat
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format", // apple
    ]
  },
  eye: {
    correct: "https://images.unsplash.com/photo-1583821997113-0e9b4b0ec8b1?w=200&h=200&fit=crop&auto=format",
    distractors: [
      "https://images.unsplash.com/photo-1586094819848-a9f1b3e8e3f3?w=200&h=200&fit=crop&auto=format", // hand
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&auto=format", // sun
    ]
  },

  // COLORS
  red: {
    correct: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format", // red apple
    distractors: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&auto=format", // yellow banana
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=200&h=200&fit=crop&auto=format", // colorful flower
    ]
  },
  blue: {
    correct: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&auto=format", // blue sky
    distractors: [
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format", // red apple
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=200&h=200&fit=crop&auto=format", // colorful flower
    ]
  },

  // NUMBERS (using visual representations)
  one: {
    correct: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format", // one apple
    distractors: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&auto=format", // banana (different object)
      "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=200&h=200&fit=crop&auto=format", // ball (different object)
    ]
  },
};

/**
 * Generate Listen & Guess words from the words database
 */
export function generateListenAndGuessWords(
  count: number = 10,
  difficulty?: "easy" | "medium" | "hard",
  category?: string,
): ListenAndGuessWord[] {
  // Get words based on filters
  let selectedWords: Word[] = [];

  if (category && category !== "all") {
    selectedWords = getWordsByCategory(category);
  } else {
    selectedWords = [...wordsDatabase];
  }

  // Filter by difficulty if specified
  if (difficulty) {
    selectedWords = selectedWords.filter(
      (word) => word.difficulty === difficulty,
    );
  }

  // Filter words that have images available
  const wordsWithImages = selectedWords.filter((word) => {
    const wordKey = word.word.toLowerCase();
    return imageDatabase[wordKey] !== undefined;
  });

  // If not enough words with images, use fallback logic
  if (wordsWithImages.length < count) {
    console.warn(
      `Only ${wordsWithImages.length} words have images available out of ${count} requested`,
    );
  }

  // Shuffle and get required count
  const shuffledWords = shuffleArray(wordsWithImages).slice(0, Math.min(count, wordsWithImages.length));

  // Convert to ListenAndGuessWord format
  return shuffledWords.map((word) => {
    const wordKey = word.word.toLowerCase();
    const imageData = imageDatabase[wordKey];

    return {
      id: word.id,
      word: word.word,
      imageUrl: imageData.correct,
      distractorImages: imageData.distractors,
      audioUrl: undefined, // Will use Web Speech API
      category: word.category,
      difficulty: word.difficulty,
    };
  });
}

/**
 * Get progressive difficulty words for Listen & Guess
 */
export function getProgressiveListenAndGuessWords(
  playerLevel: number = 1,
  sessionNumber: number = 1,
): ListenAndGuessWord[] {
  // Determine difficulty based on player progress
  let difficulty: "easy" | "medium" | "hard";
  let count: number;

  if (playerLevel <= 2) {
    difficulty = "easy";
    count = 5; // Start with fewer questions
  } else if (playerLevel <= 5) {
    difficulty = "easy";
    count = 8;
  } else if (playerLevel <= 10) {
    // Mix of easy and medium
    const easyWords = generateListenAndGuessWords(5, "easy");
    const mediumWords = generateListenAndGuessWords(3, "medium");
    return shuffleArray([...easyWords, ...mediumWords]);
  } else {
    difficulty = "medium";
    count = 10;
  }

  return generateListenAndGuessWords(count, difficulty);
}

/**
 * Get category-specific Listen & Guess words
 */
export function getCategoryListenAndGuessWords(
  category: string,
  count: number = 8,
): ListenAndGuessWord[] {
  return generateListenAndGuessWords(count, undefined, category);
}

/**
 * Shuffle array utility
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Get daily Listen & Guess challenge
 */
export function getDailyListenAndGuessChallenge(): ListenAndGuessWord[] {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Use day of year as seed for consistent daily challenges
  const categories = ["food", "animals", "nature", "toys", "colors"];
  const selectedCategory = categories[dayOfYear % categories.length];
  
  return getCategoryListenAndGuessWords(selectedCategory, 6);
}
