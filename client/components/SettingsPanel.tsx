import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Settings,
  Volume2,
  VolumeX,
  Palette,
  Clock,
  Target,
  User,
  Moon,
  Sun,
  Mic,
  Play
} from 'lucide-react';
import { setSoundEnabled, isSoundEnabled, playSoundIfEnabled } from '@/lib/soundEffects';
import { audioService, VoiceType } from '@/lib/audioService';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose
}) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [darkMode, setDarkMode] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([1]);
  const [dailyGoal, setDailyGoal] = useState([10]);
  const [difficulty, setDifficulty] = useState('medium');

  const handleSoundToggle = (checked: boolean) => {
    setSoundOn(checked);
    setSoundEnabled(checked);
    if (checked) {
      playSoundIfEnabled.click();
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    // In a real app, this would toggle the dark mode theme
    document.documentElement.classList.toggle('dark', checked);
    playSoundIfEnabled.click();
  };

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', color: 'bg-educational-green' },
    { value: 'medium', label: 'Medium', color: 'bg-educational-orange' },
    { value: 'hard', label: 'Hard', color: 'bg-educational-pink' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings & Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Sound Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              Audio Settings
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sound Effects</p>
                <p className="text-sm text-slate-600">Play sounds for interactions and feedback</p>
              </div>
              <Switch
                checked={soundOn}
                onCheckedChange={handleSoundToggle}
              />
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-slate-600">Switch to dark theme</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <Switch
                  checked={darkMode}
                  onCheckedChange={handleDarkModeToggle}
                />
                <Moon className="w-4 h-4" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Animation Speed</p>
                <Badge variant="outline">{animationSpeed[0]}x</Badge>
              </div>
              <Slider
                value={animationSpeed}
                onValueChange={setAnimationSpeed}
                max={2}
                min={0.5}
                step={0.25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>
          </div>

          {/* Learning Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Learning Preferences
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Daily Goal</p>
                <Badge variant="outline">{dailyGoal[0]} words</Badge>
              </div>
              <Slider
                value={dailyGoal}
                onValueChange={setDailyGoal}
                max={50}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>5 words</span>
                <span>50 words</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Preferred Difficulty</p>
              <div className="grid grid-cols-3 gap-2">
                {difficultyLevels.map((level) => (
                  <Button
                    key={level.value}
                    variant={difficulty === level.value ? "default" : "outline"}
                    className={difficulty === level.value ? `${level.color} text-white` : ''}
                    onClick={() => {
                      setDifficulty(level.value);
                      playSoundIfEnabled.click();
                    }}
                  >
                    {level.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <p className="font-semibold">Level 3</p>
                <p className="text-xs text-slate-600">Word Explorer</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl mb-2">🏆</div>
                <p className="font-semibold">1,250 Points</p>
                <p className="text-xs text-slate-600">Total Earned</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                // Reset to defaults
                setSoundOn(true);
                setSoundEnabled(true);
                setDarkMode(false);
                setAnimationSpeed([1]);
                setDailyGoal([10]);
                setDifficulty('medium');
                document.documentElement.classList.remove('dark');
                playSoundIfEnabled.click();
              }}
              className="flex-1"
            >
              Reset to Defaults
            </Button>
            <Button
              onClick={() => {
                playSoundIfEnabled.click();
                onClose();
              }}
              className="flex-1 bg-educational-blue text-white"
            >
              Save & Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
