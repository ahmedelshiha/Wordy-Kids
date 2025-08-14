import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { enhancedAudioService, VoiceType } from "@/lib/enhancedAudioService";
import { useVoiceSettings } from "@/hooks/use-voice-settings";

export const VoiceIntegrationTest: React.FC = () => {
  const voiceSettings = useVoiceSettings();

  const testPronunciation = () => {
    enhancedAudioService.pronounceWord("Hello! Voice integration is working perfectly.", {
      onStart: () => console.log("Test pronunciation started"),
      onEnd: () => console.log("Test pronunciation ended"),
    });
  };

  const changeVoice = (voiceType: VoiceType) => {
    enhancedAudioService.setVoiceType(voiceType);
    console.log(`Voice changed to: ${voiceType}`);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">🎤 Voice Integration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Current Voice:</p>
          <Badge variant="outline" className="text-base px-3 py-1">
            {voiceSettings.voiceType}
          </Badge>
          {voiceSettings.voiceInfo && (
            <p className="text-xs text-gray-500 mt-1">
              {voiceSettings.voiceInfo.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-center">Change Voice:</p>
          <div className="flex gap-2">
            {(["woman", "man", "kid"] as VoiceType[]).map((voiceType) => (
              <Button
                key={voiceType}
                size="sm"
                variant={voiceSettings.voiceType === voiceType ? "default" : "outline"}
                onClick={() => changeVoice(voiceType)}
                className="flex-1 capitalize"
              >
                {voiceType}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={testPronunciation} className="w-full">
          🔊 Test Pronunciation
        </Button>

        <div className="text-xs text-gray-500 text-center">
          <p>✅ Voice settings sync across all components</p>
          <p>✅ Enhanced audio service integration</p>
          <p>✅ Real-time voice updates</p>
        </div>
      </CardContent>
    </Card>
  );
};
