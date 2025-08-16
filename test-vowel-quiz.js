// Quick test to verify VowelQuizGenerator creates proper questions
import { VowelQuizGenerator } from './client/lib/vowelQuizGeneration.ts';

console.log('Testing VowelQuizGenerator...');

try {
  const questions = VowelQuizGenerator.getSystematicVowelQuestions({
    category: 'all',
    count: 1,
    difficulty: 'easy',
    maxMissingVowels: 1
  });

  console.log('Generated question:', questions[0]);
  
  const question = questions[0];
  console.log('Has displayWord:', !!question.displayWord);
  console.log('Has missingVowelIndices:', !!question.missingVowelIndices);
  console.log('Has correctVowels:', !!question.correctVowels);
  console.log('Has definition:', !!question.definition);
  
} catch (error) {
  console.error('Error generating questions:', error);
}
