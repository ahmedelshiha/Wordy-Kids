import React from "react";
import { Button } from "../../ui/button";
import { DiscoveryMode } from "../types";
import { useWordCardState } from "../hooks/useWordCardState";

export function ModeSelector() {
  const { state, actions } = useWordCardState();

  const modes: { key: DiscoveryMode; label: string; icon: string }[] = [
    { key: "learn", label: "Learn", icon: "📖" },
    { key: "quiz", label: "Quiz", icon: "🎯" },
    { key: "memory", label: "Memory", icon: "🧠" },
  ];

  const handleModeChange = (mode: DiscoveryMode) => {
    actions.setMode(mode);
  };

  return (
    <div className="flex justify-center gap-2 mb-4">
      {modes.map((mode) => (
        <Button
          key={mode.key}
          onClick={() => handleModeChange(mode.key)}
          variant={state.mode === mode.key ? "default" : "outline"}
          className={`
            min-h-[44px] px-3 font-bold
            ${state.mode === mode.key
              ? "bg-jungle text-white shadow-lg scale-105"
              : "bg-white/70 text-gray-700 hover:bg-white/80"
            }
          `}
        >
          {mode.icon} {mode.label}
        </Button>
      ))}
    </div>
  );
}

