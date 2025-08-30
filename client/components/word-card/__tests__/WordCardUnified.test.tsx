import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { RewardProvider } from "@/contexts/RewardContext";
import { WordCardUnified } from "../WordCardUnified";

// Minimal speechSynthesis mock to avoid errors when Say It is used
Object.defineProperty(window, "speechSynthesis", {
  value: {
    cancel: vi.fn(),
    speak: vi.fn(),
  },
  configurable: true,
});

const word = {
  id: 1,
  word: "star",
  pronunciation: "stɑːr",
  definition: "A bright point in the night sky.",
  example: "The star shines.",
  funFact: "The sun is a star!",
  emoji: "⭐",
  category: "nature",
  difficulty: "easy" as const,
};

describe("WordCardUnified", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("supports reduced-motion flip (fade) and triggers actions", () => {
    const onSayIt = vi.fn();
    const onPronounce = vi.fn();
    const onNeedPractice = vi.fn();
    const onMasterIt = vi.fn();

    const { getByRole, getByText } = render(
      <RewardProvider>
        <WordCardUnified
          word={word}
          onSayIt={onSayIt}
          onPronounce={onPronounce}
          onNeedPractice={onNeedPractice}
          onMasterIt={onMasterIt}
          reducedMotion
          autoPronounce={false}
          accessibilitySettings={{ soundEnabled: false }}
          ageGroup="6-8"
        />
      </RewardProvider>,
    );

    // Front shows flip hint
    const flipBtn = getByRole("button", { name: /Flip to see definition/i });
    fireEvent.click(flipBtn);

    // Back shows buttons
    getByText(/Say It Again/i);

    // Say It triggers both handlers
    const sayItBtn = getByRole("button", { name: /Pronounce star/i });
    fireEvent.click(sayItBtn);
    expect(onSayIt).toHaveBeenCalledTimes(1);
    expect(onPronounce).toHaveBeenCalledTimes(1);

    // Practice / Master handlers
    const practiceBtn = getByRole("button", {
      name: /Mark star as needing practice/i,
    });
    fireEvent.click(practiceBtn);
    expect(onNeedPractice).toHaveBeenCalledTimes(1);

    const masterBtn = getByRole("button", { name: /Mark star as mastered/i });
    fireEvent.click(masterBtn);
    expect(onMasterIt).toHaveBeenCalledTimes(1);
  });
});
