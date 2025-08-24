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
  // Debug logging for troubleshooting
  if (process.env.NODE_ENV === "development") {
    console.log("sanitizeTTSInput received:", {
      input,
      type: typeof input,
      constructor: input?.constructor?.name,
      isArray: Array.isArray(input),
    });
  }

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

  // Handle boolean values
  if (typeof input === "boolean") {
    return String(input);
  }

  // Handle React elements and components
  if (input && typeof input === "object" && input.$$typeof) {
    console.warn(
      "React element passed to TTS, extracting children or text content",
    );
    // Extract text from React children
    if (input.props && input.props.children) {
      return sanitizeTTSInput(input.props.children);
    }
    return "";
  }

  // Handle arrays (like React children arrays)
  if (Array.isArray(input)) {
    const textParts = input
      .map((item) => sanitizeTTSInput(item))
      .filter((text) => text.trim());
    return textParts.join(" ");
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

    if (typeof input.content === "string" && input.content.trim()) {
      return input.content.trim();
    }

    if (typeof input.label === "string" && input.label.trim()) {
      return input.label.trim();
    }

    if (typeof input.value === "string" && input.value.trim()) {
      return input.value.trim();
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

    // Log problematic objects for debugging
    console.warn("Problematic object passed to TTS:", {
      input,
      keys: Object.keys(input),
      constructor: input.constructor?.name,
    });

    // Try to serialize the object nicely
    try {
      const jsonString = JSON.stringify(input);
      if (jsonString !== "{}" && jsonString !== "[]") {
        return jsonString;
      }
    } catch (error) {
      console.warn("Error serializing TTS input object:", error);
    }

    return "[object Object]";
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
    logSpeechError(
      "createSafeUtterance",
      input,
      "Empty text after sanitization",
    );
    return null;
  }

  try {
    return new SpeechSynthesisUtterance(text);
  } catch (error) {
    logSpeechError("createSafeUtterance", input, error);
    return null;
  }
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
    originalInput: (() => {
      try {
        if (typeof originalInput === "string") return originalInput;
        if (typeof originalInput === "number") return originalInput;
        if (typeof originalInput === "boolean") return originalInput;
        if (originalInput === null || originalInput === undefined)
          return originalInput;
        return JSON.stringify(originalInput, null, 2);
      } catch (e) {
        return `[Unserializable ${typeof originalInput}]`;
      }
    })(),
    inputType: typeof originalInput,
    inputConstructor: originalInput?.constructor?.name,
    isArray: Array.isArray(originalInput),
    sanitizedInput: sanitizeTTSInput(originalInput),
    timestamp: new Date().toISOString(),
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : typeof error === "object"
          ? JSON.stringify(error)
          : String(error),
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
    speechSynthesisSupported:
      typeof window !== "undefined" && "speechSynthesis" in window,
  };

  console.error(`🔊 Speech synthesis error in ${context}:`, errorInfo);

  // Also log a simplified version for easier debugging
  console.error(
    `🔊 Simple error: ${context} failed with input "${errorInfo.sanitizedInput}" - ${String(errorInfo.error)}`,
  );
}
