import { useState, useEffect } from "react";
import { enhancedAudioService, VoiceType } from "@/lib/enhancedAudioService";

interface VoiceSettings {
  voiceType: VoiceType;
  voiceInfo: {
    name: string;
    language: string;
    isLocal: boolean;
  } | null;
}

export const useVoiceSettings = () => {
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const currentVoiceType = enhancedAudioService.getVoiceType();
    return {
      voiceType: currentVoiceType,
      voiceInfo: enhancedAudioService.getVoiceInfo(currentVoiceType),
    };
  });

  useEffect(() => {
    const handleVoiceChange = (event: CustomEvent) => {
      const { voiceType, voiceInfo } = event.detail;
      setVoiceSettings({ voiceType, voiceInfo });
      console.log(`Voice settings updated in component: ${voiceType}`);
    };

    // Listen for voice type changes
    window.addEventListener("voiceTypeChanged", handleVoiceChange as EventListener);

    // Cleanup listener
    return () => {
      window.removeEventListener("voiceTypeChanged", handleVoiceChange as EventListener);
    };
  }, []);

  return voiceSettings;
};

// Helper hook for components that only need to know when voice changes (for re-rendering)
export const useVoiceChangeListener = (callback?: (voiceType: VoiceType) => void) => {
  const [voiceType, setVoiceType] = useState<VoiceType>(enhancedAudioService.getVoiceType());

  useEffect(() => {
    const handleVoiceChange = (event: CustomEvent) => {
      const { voiceType: newVoiceType } = event.detail;
      setVoiceType(newVoiceType);
      callback?.(newVoiceType);
    };

    window.addEventListener("voiceTypeChanged", handleVoiceChange as EventListener);

    return () => {
      window.removeEventListener("voiceTypeChanged", handleVoiceChange as EventListener);
    };
  }, [callback]);

  return voiceType;
};
