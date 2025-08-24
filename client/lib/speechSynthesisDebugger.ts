/**
 * Speech Synthesis Debugging Utility
 * Provides comprehensive debugging and error reporting for speech synthesis issues
 */

export interface SpeechDebugInfo {
  browserSupport: {
    hasSpeechSynthesis: boolean;
    hasSpeechSynthesisUtterance: boolean;
    userAgent: string;
  };
  voiceInfo: {
    availableVoices: number;
    voicesLoaded: boolean;
    defaultVoice: string | null;
  };
  synthesizerState: {
    speaking: boolean;
    pending: boolean;
    paused: boolean;
  };
  lastError?: any;
}

export class SpeechSynthesisDebugger {
  private static instance: SpeechSynthesisDebugger;
  private lastError: any = null;

  public static getInstance(): SpeechSynthesisDebugger {
    if (!SpeechSynthesisDebugger.instance) {
      SpeechSynthesisDebugger.instance = new SpeechSynthesisDebugger();
    }
    return SpeechSynthesisDebugger.instance;
  }

  /**
   * Collect comprehensive debug information
   */
  public getDebugInfo(): SpeechDebugInfo {
    const synth = window.speechSynthesis;

    return {
      browserSupport: {
        hasSpeechSynthesis: "speechSynthesis" in window,
        hasSpeechSynthesisUtterance: "SpeechSynthesisUtterance" in window,
        userAgent: navigator.userAgent,
      },
      voiceInfo: {
        availableVoices: synth ? synth.getVoices().length : 0,
        voicesLoaded: synth ? synth.getVoices().length > 0 : false,
        defaultVoice: synth ? synth.getVoices()[0]?.name || null : null,
      },
      synthesizerState: synth
        ? {
            speaking: synth.speaking,
            pending: synth.pending,
            paused: synth.paused,
          }
        : {
            speaking: false,
            pending: false,
            paused: false,
          },
      lastError: this.lastError,
    };
  }

  /**
   * Log formatted debug information to console
   */
  public logDebugInfo(): void {
    const debugInfo = this.getDebugInfo();

    console.group("🎤 Speech Synthesis Debug Information");

    console.group("🌐 Browser Support");
    console.log(
      "Speech Synthesis API:",
      debugInfo.browserSupport.hasSpeechSynthesis ? "✅" : "❌",
    );
    console.log(
      "SpeechSynthesisUtterance:",
      debugInfo.browserSupport.hasSpeechSynthesisUtterance ? "✅" : "❌",
    );
    console.log("User Agent:", debugInfo.browserSupport.userAgent);
    console.groupEnd();

    console.group("🎵 Voice Information");
    console.log("Available Voices:", debugInfo.voiceInfo.availableVoices);
    console.log(
      "Voices Loaded:",
      debugInfo.voiceInfo.voicesLoaded ? "✅" : "❌",
    );
    console.log("Default Voice:", debugInfo.voiceInfo.defaultVoice || "None");
    console.groupEnd();

    console.group("🔄 Synthesizer State");
    console.log("Speaking:", debugInfo.synthesizerState.speaking ? "🗣️" : "🔇");
    console.log("Pending:", debugInfo.synthesizerState.pending ? "⏳" : "✅");
    console.log("Paused:", debugInfo.synthesizerState.paused ? "⏸️" : "▶️");
    console.groupEnd();

    if (debugInfo.lastError) {
      console.group("❌ Last Error");
      console.error(debugInfo.lastError);
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Record an error for debugging
   */
  public recordError(error: any): void {
    this.lastError = {
      ...error,
      recordedAt: new Date().toISOString(),
    };
  }

  /**
   * Test speech synthesis with detailed error reporting
   */
  public async testSpeechSynthesis(
    testWord: string = "test",
  ): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(`🧪 Testing speech synthesis with word: "${testWord}"`);

      if (!("speechSynthesis" in window)) {
        this.recordError({
          type: "browser_unsupported",
          message: "Speech synthesis not supported in this browser",
        });
        console.error("❌ Test failed: Speech synthesis not supported");
        resolve(false);
        return;
      }

      const synth = window.speechSynthesis;

      // Import sanitization helper to prevent "[object Object]" errors
      const { sanitizeTTSInput, logSpeechError } = require("./speechUtils");

      // Sanitize input to prevent errors
      const sanitizedTestWord = sanitizeTTSInput(testWord);
      if (!sanitizedTestWord) {
        logSpeechError(
          "speechSynthesisDebugger.testSpeechSynthesis",
          testWord,
          "Empty testWord after sanitization",
        );
        console.error("❌ Test failed: Invalid test word");
        resolved = true;
        resolve(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sanitizedTestWord);

      // Use very quiet volume for testing
      utterance.volume = 0.01;
      utterance.rate = 2; // Fast speech for quick testing

      let resolved = false;

      utterance.onstart = () => {
        if (!resolved) {
          console.log("✅ Test passed: Speech synthesis is working");
          resolved = true;
          resolve(true);
        }
      };

      utterance.onend = () => {
        if (!resolved) {
          console.log("✅ Test passed: Speech synthesis completed");
          resolved = true;
          resolve(true);
        }
      };

      utterance.onerror = (event) => {
        this.recordError({
          type: "synthesis_error",
          error: event.error,
          message: event.message,
          testWord: testWord,
        });
        if (!resolved) {
          console.error("❌ Test failed: Speech synthesis error", event);
          resolved = true;
          resolve(false);
        }
      };

      // Timeout after 3 seconds
      setTimeout(() => {
        if (!resolved) {
          this.recordError({
            type: "test_timeout",
            testWord: testWord,
            duration: 3000,
          });
          console.error("❌ Test failed: Speech synthesis timeout");
          synth.cancel();
          resolved = true;
          resolve(false);
        }
      }, 3000);

      try {
        synth.speak(utterance);
      } catch (error) {
        this.recordError({
          type: "speak_call_failed",
          error: error,
          testWord: testWord,
        });
        if (!resolved) {
          console.error("❌ Test failed: Error calling speak()", error);
          resolved = true;
          resolve(false);
        }
      }
    });
  }

  /**
   * Get recommendations based on current state
   */
  public getRecommendations(): string[] {
    const debugInfo = this.getDebugInfo();
    const recommendations: string[] = [];

    if (!debugInfo.browserSupport.hasSpeechSynthesis) {
      recommendations.push("Browser does not support Speech Synthesis API");
      recommendations.push(
        "Try using a modern browser (Chrome, Firefox, Safari, Edge)",
      );
      return recommendations;
    }

    if (
      !debugInfo.voiceInfo.voicesLoaded ||
      debugInfo.voiceInfo.availableVoices === 0
    ) {
      recommendations.push("No voices are available");
      recommendations.push("Try refreshing the page to reload voices");
      recommendations.push(
        "Check if your system has text-to-speech voices installed",
      );
    }

    if (debugInfo.synthesizerState.speaking) {
      recommendations.push("Speech synthesizer is currently busy");
      recommendations.push(
        "Wait for current speech to finish or call cancel()",
      );
    }

    if (this.lastError) {
      switch (this.lastError.type) {
        case "timeout":
          recommendations.push("Speech synthesis is timing out");
          recommendations.push("Try reducing speech rate or word length");
          break;
        case "synthesis_error":
          recommendations.push("Speech synthesis is failing");
          recommendations.push("Check audio permissions and device settings");
          break;
        case "browser_unsupported":
          recommendations.push("Use a browser that supports speech synthesis");
          break;
      }
    }

    if (recommendations.length === 0) {
      recommendations.push("Speech synthesis appears to be working correctly");
    }

    return recommendations;
  }
}

// Export singleton instance
export const speechSynthesisDebugger = SpeechSynthesisDebugger.getInstance();

// Auto-run diagnostics in development mode
if (import.meta.env.DEV) {
  // Wait a bit for voices to load
  setTimeout(() => {
    console.log("🎤 Running automatic speech synthesis diagnostics...");
    speechSynthesisDebugger.logDebugInfo();

    const recommendations = speechSynthesisDebugger.getRecommendations();
    if (recommendations.length > 0) {
      console.group("💡 Speech Synthesis Recommendations");
      recommendations.forEach((rec) => console.log("•", rec));
      console.groupEnd();
    }
  }, 2000);
}
