import React from "react";
import { useWordCardState } from "../hooks/useWordCardState";

interface WordStatusBadgesProps {
  isMastered: boolean;
}

export function WordStatusBadges({ isMastered }: WordStatusBadgesProps) {
  const { state } = useWordCardState();

  if (!isMastered && !state.practiceNeeded) {
    return null;
  }

  return (
    <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-20">
      {isMastered && (
        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
          <span className="w-3 h-3">🏆</span>
          MASTERED
        </div>
      )}
      {state.practiceNeeded && (
        <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
          <span className="w-3 h-3">🎯</span>
          NEED PRACTICE
        </div>
      )}
    </div>
  );
}

