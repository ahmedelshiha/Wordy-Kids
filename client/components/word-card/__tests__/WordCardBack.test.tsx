import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import WordCardBack from "../WordCardBack";

describe("WordCardBack", () => {
  const props = {
    word: "star",
    definition: "A bright point in the night sky.",
    example: "The star shines.",
    funFact: "The sun is a star!",
    onSayIt: vi.fn(),
    onNeedPractice: vi.fn(),
    onMasterIt: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders content and triggers callbacks", () => {
    const { getByRole, getByText } = render(<WordCardBack {...props} />);

    expect(getByText(/A bright point/)).toBeTruthy();

    fireEvent.click(getByRole("button", { name: /Pronounce star again/i }));
    expect(props.onSayIt).toHaveBeenCalledTimes(1);

    const practiceBtn = getByRole("button", {
      name: /Need more practice on star/i,
    });
    expect(practiceBtn).toBeTruthy();
    // touch target size
    expect(practiceBtn.className.includes("min-h-[48px]")).toBe(true);

    fireEvent.click(practiceBtn);
    expect(props.onNeedPractice).toHaveBeenCalledTimes(1);

    const masterBtn = getByRole("button", { name: /Mark star as mastered/i });
    fireEvent.click(masterBtn);
    expect(props.onMasterIt).toHaveBeenCalledTimes(1);
  });
});
