import {
  wordsDatabase,
  getWordsByCategory,
  getRandomWords,
  Word,
} from "@/data/wordsDatabase";

// Utility function to shuffle array
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Generate quiz questions from words database
export const generateQuizQuestions = (
  count: number = 10,
  difficulty?: "easy" | "medium" | "hard",
  category?: string,
  quizType:
    | "definition"
    | "spelling"
    | "picture"
    | "pronunciation"
    | "example" = "definition",
) => {
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

  // Shuffle and get required count
  selectedWords = shuffleArray(selectedWords).slice(0, count);

  // Generate questions based on type
  return selectedWords.map((word) => {
    switch (quizType) {
      case "definition":
        return generateDefinitionQuestion(word);
      case "spelling":
        return generateSpellingQuestion(word);
      case "picture":
        return generatePictureQuestion(word);
      case "pronunciation":
        return generatePronunciationQuestion(word);
      case "example":
        return generateExampleQuestion(word);
      default:
        return generateDefinitionQuestion(word);
    }
  });
};

// Generate definition-based questions
const generateDefinitionQuestion = (word: Word) => {
  const wrongAnswers = shuffleArray(
    wordsDatabase.filter(
      (w) => w.id !== word.id && w.category === word.category,
    ),
  ).slice(0, 3);

  if (wrongAnswers.length < 3) {
    const additionalWrong = shuffleArray(
      wordsDatabase.filter(
        (w) => w.id !== word.id && !wrongAnswers.includes(w),
      ),
    ).slice(0, 3 - wrongAnswers.length);
    wrongAnswers.push(...additionalWrong);
  }

  return {
    id: word.id,
    word: word.word,
    question: `What does "${word.word}" mean?`,
    options: shuffleArray([
      word.definition,
      ...wrongAnswers.map((w) => w.definition),
    ]),
    correctAnswer: word.definition,
    explanation: word.funFact,
    emoji: word.emoji,
    type: "definition" as const,
  };
};

// Generate spelling questions
const generateSpellingQuestion = (word: Word) => {
  const correctSpelling = word.word;
  const wrongSpellings = [
    // Add extra letter
    correctSpelling + (Math.random() > 0.5 ? "s" : "e"),
    // Replace vowel
    correctSpelling.replace(/[aeiou]/i, "x"),
    // Reverse last two letters
    correctSpelling.length > 2
      ? correctSpelling.slice(0, -2) +
        correctSpelling.slice(-2).split("").reverse().join("")
      : correctSpelling + "z",
  ];

  return {
    id: word.id,
    word: word.word,
    question: `How do you spell this word? ${word.pronunciation}`,
    options: shuffleArray([correctSpelling, ...wrongSpellings]),
    correctAnswer: correctSpelling,
    explanation: word.definition,
    emoji: word.emoji,
    type: "spelling" as const,
  };
};

// Generate picture/emoji questions
const generatePictureQuestion = (word: Word) => {
  const wrongWords = shuffleArray(
    wordsDatabase.filter((w) => w.id !== word.id),
  ).slice(0, 3);

  return {
    id: word.id,
    word: word.word,
    question: `Which word matches this picture?`,
    options: shuffleArray([word.word, ...wrongWords.map((w) => w.word)]),
    correctAnswer: word.word,
    explanation: word.definition,
    emoji: word.emoji,
    type: "picture" as const,
  };
};

// Generate pronunciation questions
const generatePronunciationQuestion = (word: Word) => {
  const wrongPronunciations = [
    word.pronunciation.replace(/ˈ/g, "ˌ"), // Change stress
    word.pronunciation.replace(/[aeiou]/i, "x"), // Replace vowel sound
    "/" + word.word.toLowerCase() + "/", // Simple phonetic
  ];

  return {
    id: word.id,
    word: word.word,
    question: `What is the correct pronunciation of "${word.word}"?`,
    options: shuffleArray([word.pronunciation, ...wrongPronunciations]),
    correctAnswer: word.pronunciation,
    explanation: word.definition,
    emoji: word.emoji,
    type: "pronunciation" as const,
  };
};

// Generate example questions
const generateExampleQuestion = (word: Word) => {
  const wrongExamples = shuffleArray(
    wordsDatabase.filter((w) => w.id !== word.id),
  ).slice(0, 3);

  return {
    id: word.id,
    word: word.word,
    question: `Which sentence correctly uses "${word.word}"?`,
    options: shuffleArray([
      word.example,
      ...wrongExamples.map((w) => w.example),
    ]),
    correctAnswer: word.example,
    explanation: word.definition,
    emoji: word.emoji,
    type: "example" as const,
  };
};

// Generate matching pairs for matching game
export const generateMatchingPairs = (
  count: number = 6,
  difficulty?: "easy" | "medium" | "hard",
  category?: string,
) => {
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

  // Shuffle and get required count
  selectedWords = shuffleArray(selectedWords).slice(0, count);

  return selectedWords.map((word) => ({
    id: word.id,
    word: word.word,
    definition: word.definition,
    matched: false,
    emoji: word.emoji,
    category: word.category,
    difficulty: word.difficulty,
  }));
};

// Generate word association game data
export const generateWordAssociations = (
  count: number = 8,
  category?: string,
) => {
  let selectedWords: Word[] = [];

  if (category && category !== "all") {
    selectedWords = getWordsByCategory(category);
  } else {
    selectedWords = [...wordsDatabase];
  }

  selectedWords = shuffleArray(selectedWords).slice(0, count);

  return selectedWords.map((word) => ({
    id: word.id,
    word: word.word,
    associations: [
      word.emoji,
      word.category,
      word.definition.split(" ")[0], // First word of definition
      word.example.split(" ")[1] || word.example.split(" ")[0], // Second word of example
    ],
    correctAssociation: word.definition,
    funFact: word.funFact,
  }));
};

// Generate fill-in-the-blank questions
export const generateFillInBlank = (
  count: number = 10,
  difficulty?: "easy" | "medium" | "hard",
  category?: string,
) => {
  let selectedWords: Word[] = [];

  if (category && category !== "all") {
    selectedWords = getWordsByCategory(category);
  } else {
    selectedWords = [...wordsDatabase];
  }

  if (difficulty) {
    selectedWords = selectedWords.filter(
      (word) => word.difficulty === difficulty,
    );
  }

  selectedWords = shuffleArray(selectedWords).slice(0, count);

  return selectedWords.map((word) => {
    // Create fill-in-the-blank from example sentence
    const sentence = word.example;
    const wordInSentence = sentence
      .toLowerCase()
      .includes(word.word.toLowerCase());

    if (wordInSentence) {
      const blankSentence = sentence.replace(
        new RegExp(word.word, "gi"),
        "______",
      );

      const wrongWords = shuffleArray(
        wordsDatabase.filter((w) => w.id !== word.id),
      ).slice(0, 3);

      return {
        id: word.id,
        question: `Fill in the blank: ${blankSentence}`,
        options: shuffleArray([word.word, ...wrongWords.map((w) => w.word)]),
        correctAnswer: word.word,
        explanation: word.definition,
        emoji: word.emoji,
        type: "fill-blank" as const,
      };
    }

    // Fallback to definition question
    return generateDefinitionQuestion(word);
  });
};
