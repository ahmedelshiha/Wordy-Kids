/**
 * Test suite for speech synthesis input sanitization
 * This helps verify that the sanitizeTTSInput function properly handles various input types
 */

import {
  sanitizeTTSInput,
  createSafeUtterance,
  logSpeechError,
} from "./speechUtils";

export function runSpeechSafetyTests(): void {
  console.log("🔊 Running Speech Synthesis Safety Tests...");

  // Test 1: Valid string input
  const test1 = sanitizeTTSInput("hello world");
  console.log(
    "✅ Test 1 - Valid string:",
    test1 === "hello world" ? "PASS" : "FAIL",
  );

  // Test 2: String with whitespace
  const test2 = sanitizeTTSInput("  hello world  ");
  console.log(
    "✅ Test 2 - String with whitespace:",
    test2 === "hello world" ? "PASS" : "FAIL",
  );

  // Test 3: Object with word property
  const test3 = sanitizeTTSInput({ word: "test word", other: "ignored" });
  console.log(
    "✅ Test 3 - Object with word property:",
    test3 === "test word" ? "PASS" : "FAIL",
  );

  // Test 4: Object with text property
  const test4 = sanitizeTTSInput({ text: "test text", other: "ignored" });
  console.log(
    "✅ Test 4 - Object with text property:",
    test4 === "test text" ? "PASS" : "FAIL",
  );

  // Test 5: Plain object (should be serialized)
  const test5 = sanitizeTTSInput({ name: "John", age: 25 });
  console.log(
    "✅ Test 5 - Plain object:",
    test5.includes("John") && test5.includes("25") ? "PASS" : "FAIL",
  );

  // Test 6: Number input
  const test6 = sanitizeTTSInput(42);
  console.log("✅ Test 6 - Number input:", test6 === "42" ? "PASS" : "FAIL");

  // Test 7: Null/undefined input
  const test7 = sanitizeTTSInput(null);
  const test8 = sanitizeTTSInput(undefined);
  console.log("✅ Test 7 - Null input:", test7 === "" ? "PASS" : "FAIL");
  console.log("✅ Test 8 - Undefined input:", test8 === "" ? "PASS" : "FAIL");

  // Test 9: Empty string input
  const test9 = sanitizeTTSInput("");
  console.log("✅ Test 9 - Empty string:", test9 === "" ? "PASS" : "FAIL");

  // Test 10: createSafeUtterance with valid input
  const utterance1 = createSafeUtterance("test phrase");
  console.log(
    "✅ Test 10 - Safe utterance creation:",
    utterance1 instanceof SpeechSynthesisUtterance ? "PASS" : "FAIL",
  );

  // Test 11: createSafeUtterance with invalid input
  const utterance2 = createSafeUtterance("");
  console.log(
    "✅ Test 11 - Safe utterance with empty input:",
    utterance2 === null ? "PASS" : "FAIL",
  );

  // Test 12: Object that would previously cause "[object Object]"
  const problematicObject = { toString: () => "[object Object]" };
  const test12 = sanitizeTTSInput(problematicObject);
  console.log(
    "✅ Test 12 - Problematic object:",
    test12 !== "[object Object]" ? "PASS" : "FAIL",
  );

  console.log("🔊 Speech Synthesis Safety Tests Complete!");
}

// Export for use in development/debugging
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).runSpeechSafetyTests = runSpeechSafetyTests;
  console.log(
    "💡 Run 'runSpeechSafetyTests()' in console to test speech input sanitization",
  );
}
