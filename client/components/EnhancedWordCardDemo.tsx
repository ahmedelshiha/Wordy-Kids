import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Smartphone, 
  Monitor, 
  Settings, 
  Eye, 
  Volume2, 
  Heart,
  Star,
  Zap,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { EnhancedMobileWordCard } from "./EnhancedMobileWordCard";
import { wordsDatabase } from "@/data/wordsDatabase";

export function EnhancedWordCardDemo() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [enableGestures, setEnableGestures] = useState(true);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [showVocabularyBuilder, setShowVocabularyBuilder] = useState(true);
  const [demoMode, setDemoMode] = useState<'mobile' | 'desktop'>('mobile');
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);

  // Get a few sample words from different categories
  const sampleWords = [
    wordsDatabase.find(w => w.category === 'music') || wordsDatabase[0],
    wordsDatabase.find(w => w.category === 'animals') || wordsDatabase[1],
    wordsDatabase.find(w => w.category === 'food') || wordsDatabase[2],
    wordsDatabase.find(w => w.category === 'nature') || wordsDatabase[3],
    wordsDatabase.find(w => w.category === 'colors') || wordsDatabase[4],
  ].filter(Boolean);

  const currentWord = sampleWords[currentWordIndex];

  const features = [
    {
      id: 'gestures',
      name: 'Touch Gestures',
      description: 'Swipe left (favorite), right (flip), up (pronounce), down (expand)',
      icon: '👆',
      active: enableGestures,
      toggle: () => setEnableGestures(!enableGestures)
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      description: 'Screen reader support, keyboard navigation, high contrast',
      icon: '♿',
      active: accessibilityMode,
      toggle: () => setAccessibilityMode(!accessibilityMode)
    },
    {
      id: 'vocabulary',
      name: 'Vocabulary Builder',
      description: 'Progress tracking, difficulty rating, health system',
      icon: '🧠',
      active: showVocabularyBuilder,
      toggle: () => setShowVocabularyBuilder(!showVocabularyBuilder)
    },
    {
      id: 'fullscreen',
      name: 'Fullscreen Mode',
      description: 'Immersive learning experience with larger text and images',
      icon: '📱',
      active: fullscreenMode,
      toggle: () => setFullscreenMode(!fullscreenMode)
    }
  ];

  const nextWord = () => {
    setCurrentWordIndex((prev) => (prev + 1) % sampleWords.length);
  };

  const prevWord = () => {
    setCurrentWordIndex((prev) => (prev - 1 + sampleWords.length) % sampleWords.length);
  };

  const highlightFeature = (featureId: string) => {
    setCurrentFeature(featureId);
    setTimeout(() => setCurrentFeature(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            🌟 Enhanced Mobile Word Card
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Experience the next-generation word learning interface with advanced mobile optimization, 
            accessibility features, and engaging animations.
          </p>
        </div>

        {/* Demo Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Demo Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Device Mode */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Device Mode</h3>
                <p className="text-sm text-gray-600">Switch between mobile and desktop layouts</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={demoMode === 'mobile' ? 'default' : 'outline'}
                  onClick={() => setDemoMode('mobile')}
                  className="flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </Button>
                <Button
                  size="sm"
                  variant={demoMode === 'desktop' ? 'default' : 'outline'}
                  onClick={() => setDemoMode('desktop')}
                  className="flex items-center gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  Desktop
                </Button>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h4 className="font-medium">{feature.name}</h4>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => highlightFeature(feature.id)}
                      className="text-xs"
                    >
                      Show
                    </Button>
                    <Switch
                      checked={feature.active}
                      onCheckedChange={feature.toggle}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Word Navigation */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium">Sample Words</h4>
                <p className="text-sm text-gray-600">
                  Navigate through {sampleWords.length} sample words from different categories
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={prevWord} variant="outline">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Badge variant="outline" className="px-3">
                  {currentWordIndex + 1} / {sampleWords.length}
                </Badge>
                <Button size="sm" onClick={nextWord} variant="outline">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Demo Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Word Card Demo */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Interactive Word Card</span>
                  <Badge className="bg-green-500 text-white">
                    {currentWord?.category}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[500px]">
                {currentWord && (
                  <div className={`${fullscreenMode ? 'w-full h-[600px]' : 'w-full max-w-sm'}`}>
                    <EnhancedMobileWordCard
                      word={currentWord}
                      enableGestures={enableGestures}
                      accessibilityMode={accessibilityMode}
                      fullscreenMode={fullscreenMode}
                      showVocabularyBuilder={showVocabularyBuilder}
                      onFullscreenToggle={() => setFullscreenMode(!fullscreenMode)}
                      onFavorite={(word) => console.log('Favorited:', word.word)}
                      onPronounce={(word) => console.log('Pronounced:', word.word)}
                      onWordMastered={(id, rating) => console.log('Mastered:', id, rating)}
                      className={currentFeature ? `highlight-${currentFeature}` : ''}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Feature Showcase */}
          <div className="space-y-6">
            
            {/* Current Word Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Word</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentWord && (
                  <>
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">{currentWord.emoji}</span>
                      <h3 className="text-xl font-bold">{currentWord.word}</h3>
                      <p className="text-sm text-gray-600">{currentWord.pronunciation}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-sm">Definition:</h4>
                        <p className="text-sm text-gray-600">{currentWord.definition}</p>
                      </div>
                      
                      {currentWord.example && (
                        <div>
                          <h4 className="font-medium text-sm">Example:</h4>
                          <p className="text-sm text-gray-600 italic">"{currentWord.example}"</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <Badge className={`
                          ${currentWord.difficulty === 'easy' ? 'bg-green-500' : 
                            currentWord.difficulty === 'medium' ? 'bg-orange-500' : 'bg-red-500'}
                          text-white
                        `}>
                          {currentWord.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {currentWord.category}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Gesture Guide */}
            {enableGestures && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    👆 Gesture Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <ArrowLeft className="w-4 h-4 text-red-500" />
                      <span>Favorite</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                      <span>Flip Card</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <ArrowUp className="w-4 h-4 text-green-500" />
                      <span>Pronounce</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <ArrowDown className="w-4 h-4 text-purple-500" />
                      <span>Expand</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      💡 <strong>Tip:</strong> On mobile devices, these gestures provide quick access to actions. 
                      Try swiping in different directions on the card!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accessibility Info */}
            {accessibilityMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    ♿ Accessibility Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Screen reader support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Keyboard navigation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>High contrast mode</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Focus management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>ARIA labels</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-1">Keyboard Shortcuts:</h4>
                    <div className="text-xs text-green-700 space-y-1">
                      <div><kbd className="bg-green-200 px-1 rounded">Space</kbd> - Flip card</div>
                      <div><kbd className="bg-green-200 px-1 rounded">P</kbd> - Pronounce word</div>
                      <div><kbd className="bg-green-200 px-1 rounded">F</kbd> - Toggle favorite</div>
                      <div><kbd className="bg-green-200 px-1 rounded">Enter</kbd> - Activate button</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hardware Acceleration:</span>
                    <Badge className="bg-green-500 text-white">✓ Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>60fps Animations:</span>
                    <Badge className="bg-green-500 text-white">✓ Optimized</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Touch Targets:</span>
                    <Badge className="bg-green-500 text-white">✓ 44px Min</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Reduced Motion:</span>
                    <Badge className="bg-blue-500 text-white">✓ Respected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Highlights */}
        {currentFeature && (
          <Card className="border-2 border-yellow-400 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    {features.find(f => f.id === currentFeature)?.name} Highlighted
                  </h3>
                  <p className="text-sm text-yellow-700">
                    {features.find(f => f.id === currentFeature)?.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Enhancements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  📱 Mobile Optimization
                </h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Touch gesture recognition</li>
                  <li>• Haptic feedback integration</li>
                  <li>• Hardware-accelerated animations</li>
                  <li>• Responsive breakpoints</li>
                  <li>• Touch-friendly 44px targets</li>
                  <li>• Swipe direction indicators</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  ♿ Accessibility
                </h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• WCAG 2.1 AA compliance</li>
                  <li>• Screen reader announcements</li>
                  <li>• Keyboard navigation support</li>
                  <li>• High contrast mode</li>
                  <li>• Focus management</li>
                  <li>• ARIA labels and roles</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  🎨 Visual Design
                </h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Category-specific gradients</li>
                  <li>• Smooth 3D flip animations</li>
                  <li>• Enhanced button states</li>
                  <li>• Loading and transition effects</li>
                  <li>• Difficulty-based styling</li>
                  <li>• Interactive feedback systems</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
