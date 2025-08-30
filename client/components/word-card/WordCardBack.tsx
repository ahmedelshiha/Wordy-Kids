import React from "react";
import { Volume2, Star, Leaf } from "lucide-react";

export interface WordCardBackProps {
  word: string;
  definition: string;
  example?: string;
  funFact?: string;
  onSayIt: () => void;
  onNeedPractice: () => void;
  onMasterIt: () => void;
}

const WordCardBack: React.FC<WordCardBackProps> = ({
  word,
  definition,
  example,
  funFact,
  onSayIt,
  onNeedPractice,
  onMasterIt,
}) => {
  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-green-100 via-yellow-100 to-green-200 rounded-2xl p-4 text-center overflow-hidden">
      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-2 break-words">{word}</h2>
        <p className="text-base md:text-lg text-gray-800 mb-4 break-words">{definition}</p>

        {example && (
          <p className="text-sm md:text-base italic text-gray-600 mb-4 break-words">
            Example: <span className="font-semibold">{example}</span>
          </p>
        )}

        {funFact && (
          <p className="text-sm md:text-base text-purple-700 mb-4 break-words">🌟 Fun fact: {funFact}</p>
        )}
      </div>

      <div className="flex-shrink-0 flex flex-col gap-3 w-full max-w-md mx-auto">
        <button
          onClick={onSayIt}
          className="flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-3 shadow-md hover:scale-105 active:scale-95 transition-transform min-h-[48px]"
          aria-label={`Pronounce ${word} again`}
        >
          <Volume2 size={22} /> Say It Again
        </button>

        <button
          onClick={onNeedPractice}
          className="flex items-center justify-center gap-2 bg-yellow-500 text-gray-900 rounded-xl py-3 shadow-md hover:scale-105 active:scale-95 transition-transform min-h-[48px]"
          aria-label={`Need more practice on ${word}`}
        >
          <Leaf size={22} /> Need Practice
        </button>

        <button
          onClick={onMasterIt}
          className="flex items-center justify-center gap-2 bg-pink-500 text-white rounded-xl py-3 shadow-md hover:scale-105 active:scale-95 transition-transform min-h-[48px]"
          aria-label={`Mark ${word} as mastered`}
        >
          <Star size={22} /> Master It!
        </button>
      </div>
    </div>
  );
};

export default WordCardBack;
