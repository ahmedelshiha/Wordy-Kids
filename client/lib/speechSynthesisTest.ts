// Speech Synthesis Test and Diagnostic Utility

export interface SpeechSynthesisTestResult {
  isSupported: boolean;
  hasVoices: boolean;
  voiceCount: number;
  testPassed: boolean;
  error?: string;
  browserInfo: {
    userAgent: string;
    vendor: string;
    platform: string;
  };
}

export class SpeechSynthesisTest {
  public static async runDiagnostics(): Promise<SpeechSynthesisTestResult> {
    const result: SpeechSynthesisTestResult = {
      isSupported: false,
      hasVoices: false,
      voiceCount: 0,
      testPassed: false,
      browserInfo: {
        userAgent: navigator.userAgent,
        vendor: (navigator as any).vendor || 'unknown',
        platform: navigator.platform
      }
    };

    // Check basic support
    if (!('speechSynthesis' in window)) {
      result.error = 'SpeechSynthesis API not available';
      return result;
    }

    if (!('SpeechSynthesisUtterance' in window)) {
      result.error = 'SpeechSynthesisUtterance not available';
      return result;
    }

    result.isSupported = true;

    try {
      const synth = window.speechSynthesis;
      
      // Wait for voices to load
      await this.waitForVoices(synth);
      
      const voices = synth.getVoices();
      result.voiceCount = voices.length;
      result.hasVoices = voices.length > 0;

      if (voices.length === 0) {
        result.error = 'No voices available';
        return result;
      }

      // Test basic speech synthesis
      const testPassed = await this.testSpeechSynthesis(synth);
      result.testPassed = testPassed;

      if (!testPassed) {
        result.error = 'Speech synthesis test failed';
      }

    } catch (error) {
      result.error = `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return result;
  }

  private static waitForVoices(synth: SpeechSynthesis): Promise<void> {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 10;
      
      const checkVoices = () => {
        const voices = synth.getVoices();
        if (voices.length > 0) {
          resolve();
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkVoices, 100 * attempts);
        } else {
          resolve(); // Resolve anyway to continue the test
        }
      };

      // Check immediately
      checkVoices();

      // Also listen for voice change event
      synth.onvoiceschanged = () => {
        if (synth.getVoices().length > 0) {
          resolve();
        }
      };
    });
  }

  private static testSpeechSynthesis(synth: SpeechSynthesis): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        synth.cancel(); // Clear any previous speech
        
        const utterance = new SpeechSynthesisUtterance('test');
        utterance.volume = 0.01; // Very quiet for testing
        utterance.rate = 2; // Fast for quick test
        
        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.log('Speech test timeout');
            resolve(false);
          }
        }, 3000);

        utterance.onstart = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            synth.cancel(); // Stop the test speech
            console.log('Speech test passed');
            resolve(true);
          }
        };

        utterance.onerror = (event) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            console.error('Speech test error:', event.error);
            resolve(false);
          }
        };

        utterance.onend = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            console.log('Speech test completed');
            resolve(true);
          }
        };

        synth.speak(utterance);
        
      } catch (error) {
        console.error('Speech test exception:', error);
        resolve(false);
      }
    });
  }

  public static logDiagnostics(result: SpeechSynthesisTestResult): void {
    console.group('🎤 Speech Synthesis Diagnostics');
    console.log('🌐 Browser Support:', result.isSupported ? '✅' : '❌');
    console.log('🔊 Voices Available:', result.hasVoices ? `✅ (${result.voiceCount})` : '❌');
    console.log('🧪 Test Passed:', result.testPassed ? '✅' : '❌');
    
    if (result.error) {
      console.log('❌ Error:', result.error);
    }
    
    console.log('🖥️  Browser Info:', {
      userAgent: result.browserInfo.userAgent.substring(0, 80) + '...',
      vendor: result.browserInfo.vendor,
      platform: result.browserInfo.platform
    });
    console.groupEnd();
  }

  public static getRecommendations(result: SpeechSynthesisTestResult): string[] {
    const recommendations: string[] = [];

    if (!result.isSupported) {
      recommendations.push('Browser does not support Speech Synthesis API');
      recommendations.push('Consider using a different browser (Chrome, Firefox, Safari, Edge)');
      return recommendations;
    }

    if (!result.hasVoices) {
      recommendations.push('No voices available - voices may be loading');
      recommendations.push('Try refreshing the page');
      recommendations.push('Check browser settings for speech synthesis');
      return recommendations;
    }

    if (!result.testPassed) {
      recommendations.push('Speech synthesis test failed');
      recommendations.push('Check audio permissions in browser');
      recommendations.push('Verify speakers/headphones are working');
      recommendations.push('Try with lower speech rate and higher volume');
      
      if (result.browserInfo.userAgent.includes('Chrome')) {
        recommendations.push('In Chrome: Check chrome://settings/content/sound');
      }
    }

    return recommendations;
  }
}

// Auto-run diagnostics on import in development
if (process.env.NODE_ENV === 'development') {
  // Run diagnostics after a short delay to allow page to load
  setTimeout(async () => {
    const result = await SpeechSynthesisTest.runDiagnostics();
    SpeechSynthesisTest.logDiagnostics(result);
    
    if (!result.testPassed) {
      const recommendations = SpeechSynthesisTest.getRecommendations(result);
      console.group('💡 Recommendations');
      recommendations.forEach(rec => console.log('•', rec));
      console.groupEnd();
    }
  }, 2000);
}
