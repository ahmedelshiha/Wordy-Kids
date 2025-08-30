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
    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-green-100 via-yellow-100 to-green-200 rounded-2xl p-4 text-center">
      <h2 className="text-3xl font-bold text-green-800 mb-2">{word}</h2>
      <p className="text-lg text-gray-800 mb-4">{definition}</p>

      {example && (
        <p className="text-md italic text-gray-600 mb-4">
          Example: <span className="font-semibold">{example}</span>
        </p>
      )}

      {funFact && (
        <p className="text-md text-purple-700 mb-6">🌟 Fun fact: {funFact}</p>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onSayIt}
          className="flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-3 shadow-md hover:scale-105 active:scale-95 transition-transform"
        >
          <Volume2 size={22} /> Say It Again
        </button>

        <button
          onClick={onNeedPractice}
          className="flex items-center justify-center gap-2 bg-yellow-400 text-white rounded-xl py-3 shadow-md hover:scale-105 active:scale-95 transition-transform"
        >
          <Leaf size={22} /> Need Practice
        </button>

        <button
          onClick={onMasterIt}
          className="flex items-center justify-center gap-2 bg-pink-500 text-white rounded-xl py-3 shadow-md hover:scale-105 active:scale-95 transition-transform"
        >
          <Star size={22} /> Master It!
        </button>
      </div>
    </div>
  );
};

export default WordCardBack;
