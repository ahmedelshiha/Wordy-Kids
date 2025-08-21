/**
 * Twemoji Service for initializing and managing Twemoji across the app
 */

let twemojiInitialized = false;

/**
 * Configuration for Twemoji parsing
 */
const TWEMOJI_CONFIG = {
  folder: "svg",
  ext: ".svg",
  base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
  size: "72x72", // High resolution for crisp display
};

/**
 * Local Twemoji configuration for offline support
 */
const LOCAL_TWEMOJI_CONFIG = {
  ...TWEMOJI_CONFIG,
  base: "/emoji/",
};

/**
 * Initialize Twemoji parsing on the document
 * This replaces text emojis with SVG images for consistent rendering
 */
export async function initializeTwemoji(): Promise<void> {
  if (twemojiInitialized) return;

  try {
    // Dynamic import to avoid SSR issues
    const twemoji = await import("twemoji");

    // Parse the entire document body
    twemoji.default.parse(document.body, TWEMOJI_CONFIG);

    // Set up a mutation observer to parse new content
    setupTwemojiMutationObserver(twemoji.default);

    twemojiInitialized = true;
    console.log("Twemoji initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize Twemoji:", error);
    // Fallback to basic emoji rendering
  }
}

/**
 * Set up mutation observer to automatically parse new emoji content
 */
function setupTwemojiMutationObserver(twemoji: any): void {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;

          // Parse emoji in the new element
          twemoji.parse(element, TWEMOJI_CONFIG);

          // Parse emoji in child elements
          const childElements = element.querySelectorAll("*");
          childElements.forEach((child) => {
            twemoji.parse(child, TWEMOJI_CONFIG);
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Parse a specific element with Twemoji
 */
export async function parseTwemoji(element: Element): Promise<void> {
  try {
    const twemoji = await import("twemoji");
    twemoji.default.parse(element, TWEMOJI_CONFIG);
  } catch (error) {
    console.warn("Failed to parse Twemoji for element:", error);
  }
}

/**
 * Parse emoji text and return Twemoji HTML
 */
export async function parseEmojiText(text: string): Promise<string> {
  try {
    const twemoji = await import("twemoji");
    return twemoji.default.parse(text, TWEMOJI_CONFIG);
  } catch (error) {
    console.warn("Failed to parse emoji text:", error);
    return text; // Return original text as fallback
  }
}

/**
 * Get Twemoji URL for a specific emoji
 */
export function getTwemojiUrl(emoji: string): string {
  const codePoint = Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16).toLowerCase())
    .filter(Boolean)
    .join("-");

  return `${TWEMOJI_CONFIG.base}${TWEMOJI_CONFIG.folder}/${codePoint}${TWEMOJI_CONFIG.ext}`;
}

/**
 * Get local Twemoji URL for offline support
 */
export function getLocalTwemojiUrl(emoji: string): string {
  const codePoint = Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16).toLowerCase())
    .filter(Boolean)
    .join("-");

  return `${LOCAL_TWEMOJI_CONFIG.base}${codePoint}${LOCAL_TWEMOJI_CONFIG.ext}`;
}

/**
 * Preload critical Twemoji assets for navigation
 */
export function preloadNavigationTwemojis(): void {
  const navigationEmojis = ["🦉", "🦜", "🐵", "🐘"]; // Owl, Parrot, Monkey, Elephant

  navigationEmojis.forEach((emoji) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = getTwemojiUrl(emoji);
    document.head.appendChild(link);
  });
}

/**
 * Download and cache Twemoji assets locally
 */
export async function cacheNavigationTwemojis(): Promise<void> {
  const navigationEmojis = ["🦉", "🦜", "🐵", "🐘"];

  try {
    // Check if we're in a service worker context
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      // Send message to service worker to cache the emojis
      navigator.serviceWorker.controller.postMessage({
        type: "CACHE_TWEMOJIS",
        emojis: navigationEmojis.map((emoji) => ({
          emoji,
          url: getTwemojiUrl(emoji),
        })),
      });
    }
  } catch (error) {
    console.warn("Failed to cache Twemoji assets:", error);
  }
}

/**
 * Utility to check if Twemoji is supported
 */
export function isTwemojiSupported(): boolean {
  // Check if we can load external resources
  return (
    typeof window !== "undefined" &&
    !window.location.protocol.startsWith("file:") &&
    navigator.onLine !== false
  );
}

/**
 * Initialize Twemoji with error handling and fallbacks
 */
export async function initializeTwemojiSafe(): Promise<void> {
  if (!isTwemojiSupported()) {
    console.log("Twemoji not supported in current environment, using fallback");
    return;
  }

  try {
    await initializeTwemoji();
    preloadNavigationTwemojis();
    await cacheNavigationTwemojis();
  } catch (error) {
    console.warn(
      "Twemoji initialization failed, using emoji fallbacks:",
      error,
    );
  }
}

/**
 * Cleanup Twemoji resources
 */
export function cleanupTwemoji(): void {
  // Remove any cached resources or event listeners if needed
  twemojiInitialized = false;
}
