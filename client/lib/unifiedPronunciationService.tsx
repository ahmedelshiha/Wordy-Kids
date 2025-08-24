import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  Volume2,
  Play,
  Pause,
  Settings,
  User,
  Users,
  Baby,
  Star,
  Heart,
  Smile,
  AlertCircle,
  Loader,
} from "lucide-react";

// Types for better development experience
export const VOICE_TYPES = {
  WOMAN: "woman",
  MAN: "man",
  KID: "kid",
} as const;

export const SPEECH_RATES = {
  VERY_SLOW: 0.5,
  SLOW: 0.7,
  NORMAL: 0.9,
  FAST: 1.2,
} as const;

export type VoiceType = (typeof VOICE_TYPES)[keyof typeof VOICE_TYPES];
export type SpeechRate = (typeof SPEECH_RATES)[keyof typeof SPEECH_RATES];

// Error boundary for pronunciation failures
class PronunciationErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: string) => void },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Pronunciation System Error:", error, errorInfo);
    this.props.onError?.("Pronunciation system error");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>Audio system temporarily unavailable</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Pronunciation Context
const PronunciationContext = createContext<any>(null);

// Enhanced Pronunciation Provider
export const PronunciationProvider: React.FC<{
  children: React.ReactNode;
  defaultSettings?: {
    voiceType?: VoiceType;
    rate?: number;
    pitch?: number;
    volume?: number;
    language?: string;
  };
  onError?: (error: string) => void;
}> = ({ children, defaultSettings = {}, onError = null }) => {
  // State management
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isVoicesLoaded, setIsVoicesLoaded] = useState(false);
  const [voicePreference, setVoicePreference] = useState<VoiceType>(
    defaultSettings.voiceType || VOICE_TYPES.WOMAN,
  );
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(defaultSettings.rate || SPEECH_RATES.SLOW);
  const [pitch, setPitch] = useState(defaultSettings.pitch || 1.1);
  const [volume, setVolume] = useState(defaultSettings.volume || 0.9);
  const [language, setLanguage] = useState(defaultSettings.language || "en-US");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [queue, setQueue] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const maxRetries = 3;
  const voiceLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis not supported");
      setIsSupported(false);
      onError?.("Speech synthesis not supported");
      return;
    }

    synthRef.current = window.speechSynthesis;

    const loadVoices = () => {
      try {
        const availableVoices = synthRef.current?.getVoices() || [];

        if (availableVoices.length === 0 && retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1);
          voiceLoadTimeoutRef.current = setTimeout(loadVoices, 100);
          return;
        }

        setVoices(availableVoices);
        setIsVoicesLoaded(true);

        if (availableVoices.length > 0) {
          selectVoiceByPreference(availableVoices, voicePreference);
        }
      } catch (error) {
        console.error("Error loading voices:", error);
        onError?.("Error loading voices");
      }
    };

    loadVoices();
    synthRef.current?.addEventListener("voiceschanged", loadVoices);

    return () => {
      if (voiceLoadTimeoutRef.current) {
        clearTimeout(voiceLoadTimeoutRef.current);
      }
      if (synthRef.current) {
        synthRef.current.removeEventListener("voiceschanged", loadVoices);
        synthRef.current.cancel();
      }
    };
  }, [retryCount, voicePreference, onError]);

  // Voice categorization
  const categorizeVoices = useCallback((voicesList: SpeechSynthesisVoice[]) => {
    const categorized = {
      [VOICE_TYPES.WOMAN]: [] as SpeechSynthesisVoice[],
      [VOICE_TYPES.MAN]: [] as SpeechSynthesisVoice[],
      [VOICE_TYPES.KID]: [] as SpeechSynthesisVoice[],
    };

    voicesList.forEach((voice) => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();

      const supportedLangs = ["en-us", "en-gb", "en-au", "en-ca"];
      if (!supportedLangs.some((l) => lang.includes(l))) return;

      if (isKidVoice(name, voice)) {
        categorized[VOICE_TYPES.KID].push(voice);
      } else if (isFemaleVoice(name, voice)) {
        categorized[VOICE_TYPES.WOMAN].push(voice);
      } else if (isMaleVoice(name, voice)) {
        categorized[VOICE_TYPES.MAN].push(voice);
      } else {
        categorized[VOICE_TYPES.WOMAN].push(voice);
      }
    });

    return categorized;
  }, []);

  // Voice detection helpers
  const isKidVoice = (name: string, voice: SpeechSynthesisVoice): boolean => {
    const kidIndicators = [
      "child",
      "kid",
      "young",
      "junior",
      "teen",
      "boy",
      "girl",
    ];
    return kidIndicators.some((indicator) => name.includes(indicator));
  };

  const isFemaleVoice = (
    name: string,
    voice: SpeechSynthesisVoice,
  ): boolean => {
    const femaleIndicators = [
      "female",
      "woman",
      "girl",
      "karen",
      "susan",
      "samantha",
      "victoria",
      "allison",
      "anna",
      "emma",
      "jenny",
      "lisa",
      "mary",
      "sarah",
    ];
    return femaleIndicators.some((indicator) => name.includes(indicator));
  };

  const isMaleVoice = (name: string, voice: SpeechSynthesisVoice): boolean => {
    const maleIndicators = [
      "male",
      "man",
      "boy",
      "daniel",
      "alex",
      "tom",
      "fred",
      "ralph",
      "david",
      "john",
      "mike",
      "steve",
      "paul",
      "james",
    ];
    return maleIndicators.some((indicator) => name.includes(indicator));
  };

  // Voice selection with quality scoring
  const selectVoiceByPreference = useCallback(
    (voicesList: SpeechSynthesisVoice[], preference: VoiceType) => {
      const categorized = categorizeVoices(voicesList);
      let selectedVoiceFromCategory: SpeechSynthesisVoice | null = null;

      const preferredVoices = categorized[preference] || [];

      if (preferredVoices.length > 0) {
        const scoredVoices = preferredVoices.map((voice) => ({
          voice,
          score: calculateVoiceScore(voice),
        }));

        scoredVoices.sort((a, b) => b.score - a.score);
        selectedVoiceFromCategory = scoredVoices[0].voice;
      } else {
        const allVoices = [
          ...categorized[VOICE_TYPES.WOMAN],
          ...categorized[VOICE_TYPES.MAN],
          ...categorized[VOICE_TYPES.KID],
        ];
        selectedVoiceFromCategory =
          allVoices.find((v) => v.default) || allVoices[0] || null;
      }

      setSelectedVoice(selectedVoiceFromCategory);

      // Store preference in localStorage
      localStorage.setItem("unified-voice-preference", preference);
    },
    [categorizeVoices, language],
  );

  // Voice quality scoring
  const calculateVoiceScore = (voice: SpeechSynthesisVoice): number => {
    let score = 0;

    if (voice.default) score += 10;
    if (voice.localService) score += 5;

    const name = voice.name.toLowerCase();
    if (
      name.includes("enhanced") ||
      name.includes("premium") ||
      name.includes("neural")
    ) {
      score += 8;
    }

    if (voice.lang === language) score += 3;

    return score;
  };

  // Main speak function
  const speak = useCallback(
    async (
      text: any,
      options: {
        rate?: number;
        pitch?: number;
        volume?: number;
        onStart?: () => void;
        onEnd?: () => void;
        onWordHighlight?: (word: string, index: number) => void;
      } = {},
    ): Promise<void> => {
      // Import sanitization helper
      const { sanitizeTTSInput, logSpeechError } = require("./speechUtils");

      // Sanitize input to prevent "[object Object]" errors
      const sanitizedText = sanitizeTTSInput(text);
      if (!sanitizedText) {
        logSpeechError(
          "unifiedPronunciationService.speak",
          text,
          "Empty text after sanitization",
        );
        return Promise.resolve();
      }

      if (!isSupported || !synthRef.current) {
        const error = "Speech synthesis not available";
        logSpeechError("unifiedPronunciationService.speak", text, error);
        throw new Error(error);
      }

      if (!isVoicesLoaded) {
        await new Promise<void>((resolve) => {
          const checkVoices = setInterval(() => {
            if (isVoicesLoaded) {
              clearInterval(checkVoices);
              resolve();
            }
          }, 100);

          setTimeout(() => {
            clearInterval(checkVoices);
            resolve();
          }, 5000);
        });
      }

      return new Promise((resolve, reject) => {
        try {
          synthRef.current?.cancel();

          const utterance = new SpeechSynthesisUtterance(sanitizedText);

          utterance.voice = selectedVoice;
          utterance.rate = Math.max(0.1, Math.min(2.0, options.rate || rate));
          utterance.pitch = Math.max(
            0.1,
            Math.min(2.0, options.pitch || pitch),
          );
          utterance.volume = Math.max(0, Math.min(1, options.volume || volume));
          utterance.lang = language;

          let wordIndex = 0;
          const words = sanitizedText.split(/\s+/);

          utterance.onstart = () => {
            setIsPlaying(true);
            options.onStart?.();
          };

          utterance.onend = () => {
            setIsPlaying(false);
            setCurrentWord("");
            options.onEnd?.();
            resolve();
          };

          utterance.onerror = (event) => {
            setIsPlaying(false);
            const errorDetails = {
              error: event.error,
              message: event.message || "Unknown speech error",
              originalText: text,
              sanitizedText: sanitizedText,
              voiceType: voicePreference,
              selectedVoice: selectedVoice?.name,
              timestamp: new Date().toISOString(),
            };

            logSpeechError(
              "unifiedPronunciationService.speak.onerror",
              text,
              errorDetails,
            );

            if (event.error === "interrupted" && retryCount < maxRetries) {
              setTimeout(() => {
                setRetryCount((prev) => prev + 1);
                speak(text, options).then(resolve).catch(reject);
              }, 500);
            } else {
              onError?.(errorDetails);
              reject(
                new Error(
                  `Speech error: ${event.error} - ${event.message || "Unknown error"}`,
                ),
              );
            }
          };

          utterance.onboundary = (event) => {
            if (event.name === "word" && options.onWordHighlight) {
              try {
                const word = words[wordIndex] || "";
                setCurrentWord(word);
                options.onWordHighlight(word, wordIndex);
                wordIndex++;
              } catch (error) {
                console.warn("Word highlighting error:", error);
              }
            }
          };

          synthRef.current?.speak(utterance);
        } catch (error) {
          const errorDetails = {
            originalError: error,
            originalText: text,
            sanitizedText: sanitizedText,
            context: "speak function",
            timestamp: new Date().toISOString(),
          };

          logSpeechError(
            "unifiedPronunciationService.speak.catch",
            text,
            errorDetails,
          );
          reject(error);
        }
      });
    },
    [
      isSupported,
      isVoicesLoaded,
      selectedVoice,
      rate,
      pitch,
      volume,
      language,
      retryCount,
      onError,
    ],
  );

  // Stop function
  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setCurrentWord("");
    setQueue([]);
  }, []);

  // Convenience methods
  const quickSpeak = useCallback(
    (text: string) => {
      return speak(text, {
        rate: SPEECH_RATES.NORMAL,
        pitch: 1.2,
      }).catch((error) => console.warn("Quick speak failed:", error));
    },
    [speak],
  );

  const slowSpeak = useCallback(
    (text: string) => {
      return speak(text, {
        rate: SPEECH_RATES.VERY_SLOW,
        pitch: 1.0,
      }).catch((error) => console.warn("Slow speak failed:", error));
    },
    [speak],
  );

  const phoneticSpeak = useCallback(
    (text: string) => {
      return speak(text, {
        rate: SPEECH_RATES.SLOW,
        pitch: 1.1,
      }).catch((error) => console.warn("Phonetic speak failed:", error));
    },
    [speak],
  );

  // Load saved preferences
  useEffect(() => {
    const savedVoiceType = localStorage.getItem(
      "unified-voice-preference",
    ) as VoiceType;
    if (savedVoiceType && Object.values(VOICE_TYPES).includes(savedVoiceType)) {
      setVoicePreference(savedVoiceType);
    }
  }, []);

  // Context value
  const contextValue = useMemo(
    () => ({
      voices,
      isVoicesLoaded,
      voicePreference,
      selectedVoice,
      rate,
      pitch,
      volume,
      language,
      isPlaying,
      currentWord,
      isSupported,
      queue,

      setVoicePreference,
      setRate,
      setPitch,
      setVolume,
      setLanguage,
      speak,
      stop,
      quickSpeak,
      slowSpeak,
      phoneticSpeak,

      categorizeVoices: () => categorizeVoices(voices),
      VOICE_TYPES,
      SPEECH_RATES,
    }),
    [
      voices,
      isVoicesLoaded,
      voicePreference,
      selectedVoice,
      rate,
      pitch,
      volume,
      language,
      isPlaying,
      currentWord,
      isSupported,
      queue,
      speak,
      stop,
      quickSpeak,
      slowSpeak,
      phoneticSpeak,
      categorizeVoices,
    ],
  );

  return (
    <PronunciationErrorBoundary onError={onError}>
      <PronunciationContext.Provider value={contextValue}>
        {children}
      </PronunciationContext.Provider>
    </PronunciationErrorBoundary>
  );
};

// Hook to use pronunciation
export const usePronunciation = () => {
  const context = useContext(PronunciationContext);
  if (!context) {
    throw new Error(
      "usePronunciation must be used within a PronunciationProvider",
    );
  }
  return context;
};

// Voice Selection Component
export const VoiceSelector: React.FC<{
  className?: string;
  showAdvanced?: boolean;
}> = ({ className = "", showAdvanced = false }) => {
  const {
    voicePreference,
    setVoicePreference,
    quickSpeak,
    isVoicesLoaded,
    isSupported,
    voices,
  } = usePronunciation();

  const [isTesting, setIsTesting] = useState(false);

  const voiceOptions = [
    {
      value: VOICE_TYPES.WOMAN,
      label: "Woman Voice",
      icon: User,
      color: "bg-pink-500",
      hoverColor: "hover:bg-pink-600",
      sample: "Hello! I am a friendly woman voice perfect for learning.",
    },
    {
      value: VOICE_TYPES.MAN,
      label: "Man Voice",
      icon: Users,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      sample: "Hello! I am a friendly man voice here to help you learn.",
    },
    {
      value: VOICE_TYPES.KID,
      label: "Kid Voice",
      icon: Baby,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      sample: "Hi there! I am a fun kid voice, just like you!",
    },
  ];

  const handleVoiceChange = async (preference: VoiceType) => {
    if (isTesting) return;

    setVoicePreference(preference);
    setIsTesting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const sample = voiceOptions.find((v) => v.value === preference)?.sample;
      if (sample) {
        await quickSpeak(sample);
      }
    } catch (error) {
      console.warn("Voice test failed:", error);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isSupported) {
    return (
      <div
        className={`bg-yellow-50 border border-yellow-200 rounded-xl p-4 ${className}`}
      >
        <div className="flex items-center gap-2 text-yellow-700">
          <AlertCircle className="h-5 w-5" />
          <span>Voice features are not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Volume2 className="text-purple-600" />
          Choose Your Favorite Voice!
        </h3>
        {!isVoicesLoaded && (
          <Loader className="h-5 w-5 animate-spin text-gray-400" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {voiceOptions.map(({ value, label, icon: Icon, color, hoverColor }) => (
          <button
            key={value}
            onClick={() => handleVoiceChange(value)}
            disabled={isTesting || !isVoicesLoaded}
            className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              voicePreference === value
                ? `${color} text-white border-transparent shadow-lg`
                : `bg-gray-50 border-gray-200 hover:border-gray-300 ${hoverColor}`
            }`}
          >
            <Icon
              className={`h-8 w-8 mx-auto mb-2 ${
                voicePreference === value ? "text-white" : "text-gray-600"
              }`}
            />
            <div
              className={`font-semibold ${
                voicePreference === value ? "text-white" : "text-gray-700"
              }`}
            >
              {label}
            </div>
            {isTesting && voicePreference === value && (
              <div className="mt-2 text-xs opacity-75">Testing...</div>
            )}
          </button>
        ))}
      </div>

      {showAdvanced && (
        <div className="mt-4 text-sm text-gray-600">
          Available voices: {voices.length} | Status:{" "}
          {isVoicesLoaded ? "Ready" : "Loading..."}
        </div>
      )}
    </div>
  );
};

// Pronounceable Word Component
export const PronounceableWord: React.FC<{
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
  slow?: boolean;
  disabled?: boolean;
  onPronounce?: (text: string) => void;
  showIcon?: boolean;
}> = ({
  children,
  className = "",
  highlight = false,
  slow = false,
  disabled = false,
  onPronounce = null,
  showIcon = true,
}) => {
  const { quickSpeak, slowSpeak, currentWord, isSupported } =
    usePronunciation();
  const [isLocalPlaying, setIsLocalPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text =
    typeof children === "string" ? children : children?.toString() || "";

  const handleClick = async () => {
    if (disabled || isLocalPlaying || !text.trim() || !isSupported) return;

    setIsLocalPlaying(true);
    setError(null);

    try {
      onPronounce?.(text);

      if (slow) {
        await slowSpeak(text);
      } else {
        await quickSpeak(text);
      }
    } catch (error) {
      console.warn("Pronunciation failed:", error);
      setError("Unable to pronounce");
    } finally {
      setIsLocalPlaying(false);
    }
  };

  const isCurrentWord = currentWord === text;
  const isActive = isLocalPlaying || isCurrentWord;

  if (!isSupported) {
    return <span className={className}>{children}</span>;
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLocalPlaying}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-all
        ${
          isActive
            ? "bg-yellow-200 text-yellow-800 shadow-md transform scale-105"
            : "hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-700"
        }
        ${highlight ? "bg-blue-50 border border-blue-200" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${error ? "bg-red-50 text-red-600" : ""}
        ${className}
      `}
      title={error || (slow ? "Click to hear slowly" : "Click to hear")}
    >
      {children}
      {showIcon && (
        <Volume2
          className={`h-3 w-3 ${isLocalPlaying ? "animate-pulse" : "opacity-50"}`}
        />
      )}
    </button>
  );
};

// Pronounceable Sentence Component
export const PronounceableSentence: React.FC<{
  children: React.ReactNode;
  className?: string;
  showControls?: boolean;
  autoHighlight?: boolean;
  onComplete?: () => void;
  rate?: number;
}> = ({
  children,
  className = "",
  showControls = true,
  autoHighlight = true,
  onComplete = null,
  rate = null,
}) => {
  const { speak, stop, isSupported } = usePronunciation();
  const [highlightedWord, setHighlightedWord] = useState("");
  const [isLocalPlaying, setIsLocalPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text =
    typeof children === "string" ? children : children?.toString() || "";

  const handleSpeak = async () => {
    if (!text.trim() || !isSupported) return;

    if (isLocalPlaying) {
      stop();
      setIsLocalPlaying(false);
      setHighlightedWord("");
      return;
    }

    setIsLocalPlaying(true);
    setError(null);

    try {
      await speak(text, {
        rate: rate || undefined,
        onWordHighlight: autoHighlight
          ? (word) => setHighlightedWord(word)
          : undefined,
        onEnd: () => {
          setHighlightedWord("");
          setIsLocalPlaying(false);
          onComplete?.();
        },
      });
    } catch (error) {
      console.warn("Sentence pronunciation failed:", error);
      setError("Unable to read sentence");
      setIsLocalPlaying(false);
      setHighlightedWord("");
    }
  };

  const renderText = () => {
    if (!highlightedWord || !autoHighlight) return text;

    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      const cleanWord = word.replace(/[^\w]/g, "").toLowerCase();
      const cleanHighlighted = highlightedWord
        .replace(/[^\w]/g, "")
        .toLowerCase();

      return (
        <span
          key={index}
          className={
            cleanWord === cleanHighlighted
              ? "bg-yellow-200 px-1 rounded animate-pulse"
              : ""
          }
        >
          {word}
        </span>
      );
    });
  };

  if (!isSupported) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex-1 text-lg leading-relaxed">
        {error ? (
          <div className="text-red-600 bg-red-50 p-2 rounded">{error}</div>
        ) : (
          renderText()
        )}
      </div>
      {showControls && (
        <button
          onClick={handleSpeak}
          disabled={!text.trim()}
          className={`flex-shrink-0 p-2 rounded-full transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
            isLocalPlaying
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          title={isLocalPlaying ? "Stop reading" : "Read aloud"}
        >
          {isLocalPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
};

// Legacy compatibility layer for existing components
export const createLegacyCompatibilityLayer = () => {
  return {
    // Compatibility with old audioService
    audioService: {
      pronounceWord: (word: string, options: any = {}) => {
        // This will be injected with the actual implementation
        console.warn(
          "Using legacy compatibility layer - please migrate to usePronunciation hook",
        );
      },
      setVoiceType: (type: VoiceType) => {
        localStorage.setItem("unified-voice-preference", type);
      },
      stop: () => {
        window.speechSynthesis?.cancel();
      },
    },

    // Compatibility with enhancedAudioService
    enhancedAudioService: {
      pronounceWord: (word: string, options: any = {}) => {
        console.warn(
          "Using legacy compatibility layer - please migrate to usePronunciation hook",
        );
      },
      setVoiceType: (type: VoiceType) => {
        localStorage.setItem("unified-voice-preference", type);
      },
    },
  };
};

// Export everything for easy migration
export default {
  PronunciationProvider,
  usePronunciation,
  VoiceSelector,
  PronounceableWord,
  PronounceableSentence,
  VOICE_TYPES,
  SPEECH_RATES,
  PronunciationErrorBoundary,
  createLegacyCompatibilityLayer,
};
