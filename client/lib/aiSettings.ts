// AI Settings utility for managing AI preferences across the app

export interface AISettings {
  aiEnhancementEnabled: boolean;
  aiAdaptiveDifficulty: boolean;
  aiPersonalizedHints: boolean;
}

export const getAISettings = (): AISettings => {
  return {
    aiEnhancementEnabled: JSON.parse(
      localStorage.getItem("aiEnhancementEnabled") || "true",
    ),
    aiAdaptiveDifficulty: JSON.parse(
      localStorage.getItem("aiAdaptiveDifficulty") || "true",
    ),
    aiPersonalizedHints: JSON.parse(
      localStorage.getItem("aiPersonalizedHints") || "true",
    ),
  };
};

export const setAISettings = (settings: Partial<AISettings>): void => {
  if (settings.aiEnhancementEnabled !== undefined) {
    localStorage.setItem(
      "aiEnhancementEnabled",
      JSON.stringify(settings.aiEnhancementEnabled),
    );
  }
  if (settings.aiAdaptiveDifficulty !== undefined) {
    localStorage.setItem(
      "aiAdaptiveDifficulty",
      JSON.stringify(settings.aiAdaptiveDifficulty),
    );
  }
  if (settings.aiPersonalizedHints !== undefined) {
    localStorage.setItem(
      "aiPersonalizedHints",
      JSON.stringify(settings.aiPersonalizedHints),
    );
  }
};

export const isAIEnabled = (): boolean => {
  return getAISettings().aiEnhancementEnabled;
};
