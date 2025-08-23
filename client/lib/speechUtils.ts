/**
 * Speech synthesis utility functions for safe text-to-speech input handling
 */

/**
 * Sanitizes input for text-to-speech to ensure we always get a valid string.
 * Prevents "[object Object]" errors by properly handling various input types.
 *
 * @param input - Any input that should be converted to speech text
 * @returns A safe string for text-to-speech synthesis
 */
export function sanitizeTTSInput(input: any): string {
  // Handle null/undefined/empty values
  if (!input && input !== 0) {
    return "";
  }

  // Already a string - just trim it
  if (typeof input === "string") {
    return input.trim();
  }

  // Numbers are fine to speak
  if (typeof input === "number") {
    return String(input);
  }

  // Handle objects with common word/text properties
  if (typeof input === "object" && input !== null) {
    // Check for common word object shapes
    if (typeof input.word === "string" && input.word.trim()) {
      return input.word.trim();
    }

    if (typeof input.text === "string" && input.text.trim()) {
      return input.text.trim();
    }

    // Check for custom toString method (not the default Object.prototype.toString)
    if (
      typeof input.toString === "function" &&
      input.toString !== Object.prototype.toString
    ) {
      try {
        const result = input.toString();
        if (typeof result === "string" && result !== "[object Object]") {
          return result.trim();
        }
      } catch (error) {
        console.warn("Error calling toString on TTS input:", error);
      }
    }

    // Try to serialize the object nicely
    try {
      return JSON.stringify(input);
    } catch (error) {
      console.warn("Error serializing TTS input object:", error);
      return "[object Object]";
    }
  }

  // Fallback: convert to string
  return String(input);
}

/**
 * Creates a safe SpeechSynthesisUtterance with sanitized text input
 *
 * @param input - Text or object to convert to speech
 * @returns SpeechSynthesisUtterance with sanitized text, or null if input is empty
 */
export function createSafeUtterance(
  input: any,
): SpeechSynthesisUtterance | null {
  const text = sanitizeTTSInput(input);

  if (!text || text.length === 0) {
    console.warn("Cannot create utterance: empty text after sanitization", {
      originalInput: input,
    });
    return null;
  }

  return new SpeechSynthesisUtterance(text);
}

/**
 * Logs speech synthesis errors in a standardized way
 *
 * @param context - Context where the error occurred
 * @param originalInput - The original input that caused the error
 * @param error - The error that occurred
 */
export function logSpeechError(
  context: string,
  originalInput: any,
  error: any,
): void {
  const errorInfo = {
    context,
    originalInput:
      typeof originalInput === "object"
        ? JSON.stringify(originalInput)
        : originalInput,
    inputType: typeof originalInput,
    timestamp: new Date().toISOString(),
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : String(error),
  };

  console.error(`Speech synthesis error in ${context}:`, errorInfo);
}
