// Accessibility panel component
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Accessibility, 
  Eye, 
  Volume2, 
  Zap, 
  Type,
  Palette,
  RotateCcw,
  X
} from 'lucide-react';

export const WordLibraryAccessibilityPanel = ({ 
  isOpen,
  onClose,
  accessibilitySettings,
  onUpdateSettings,
  isMobile
}) => {
  if (!isOpen) return null;

  const handleToggleSetting = (setting) => {
    onUpdateSettings({
      [setting]: !accessibilitySettings[setting]
    });
  };

  const resetToDefaults = () => {
    onUpdateSettings({
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      autoPlay: true,
      soundEnabled: true
    });
  };

  const AccessibilityOption = ({ 
    icon: Icon, 
    title, 
    description, 
    setting, 
    color = "blue" 
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
      <div className={`p-2 rounded-full bg-${color}-100`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <Button
            size="sm"
            variant={accessibilitySettings[setting] ? "default" : "outline"}
            onClick={() => handleToggleSetting(setting)}
            className="ml-2"
          >
            {accessibilitySettings[setting] ? "On" : "Off"}
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
        accessibilitySettings.highContrast ? 'bg-black text-white border-white' : 'bg-white'
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Accessibility className="w-6 h-6 text-blue-600" />
            <CardTitle className={accessibilitySettings.largeText ? 'text-2xl' : 'text-xl'}>
              Accessibility Settings
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            aria-label="Close accessibility panel"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current settings summary */}
          <div className="flex flex-wrap gap-2">
            {accessibilitySettings.highContrast && (
              <Badge variant="secondary">High Contrast</Badge>
            )}
            {accessibilitySettings.largeText && (
              <Badge variant="secondary">Large Text</Badge>
            )}
            {accessibilitySettings.reducedMotion && (
              <Badge variant="secondary">Reduced Motion</Badge>
            )}
            {accessibilitySettings.autoPlay && (
              <Badge variant="secondary">Auto-play</Badge>
            )}
            {accessibilitySettings.soundEnabled && (
              <Badge variant="secondary">Sound Enabled</Badge>
            )}
          </div>

          {/* Visual accessibility options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visual Settings
            </h3>

            <AccessibilityOption
              icon={Palette}
              title="High Contrast Mode"
              description="Increases contrast between text and background for better readability"
              setting="highContrast"
              color="purple"
            />

            <AccessibilityOption
              icon={Type}
              title="Large Text"
              description="Makes all text larger and easier to read"
              setting="largeText"
              color="green"
            />

            <AccessibilityOption
              icon={Zap}
              title="Reduced Motion"
              description="Reduces animations and motion effects that might cause discomfort"
              setting="reducedMotion"
              color="orange"
            />
          </div>

          {/* Audio accessibility options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Audio Settings
            </h3>

            <AccessibilityOption
              icon={Volume2}
              title="Sound Effects"
              description="Enable or disable all sound effects and music"
              setting="soundEnabled"
              color="blue"
            />

            <AccessibilityOption
              icon={Volume2}
              title="Auto-pronounce Words"
              description="Automatically pronounce words when they appear"
              setting="autoPlay"
              color="indigo"
            />
          </div>

          {/* Additional information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">About Accessibility</h4>
            <p className="text-sm text-blue-800">
              These settings help make Jungle Word Adventure more comfortable and accessible for all learners. 
              Your preferences are automatically saved and will be remembered for future sessions.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
            
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Save & Continue Adventure
            </Button>
          </div>

          {/* Keyboard shortcuts info */}
          {!isMobile && (
            <div className="text-xs text-gray-500 pt-4 border-t">
              <p><strong>Keyboard shortcuts:</strong></p>
              <p>• Press 'A' to open accessibility settings</p>
              <p>• Press 'S' to toggle sound</p>
              <p>• Press 'Escape' to close panels</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

