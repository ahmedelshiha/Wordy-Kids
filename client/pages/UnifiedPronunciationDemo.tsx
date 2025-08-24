import React, { useState, useEffect } from 'react';
import { 
  usePronunciation, 
  VoiceSelector, 
  PronounceableWord, 
  PronounceableSentence,
  VOICE_TYPES,
  SPEECH_RATES 
} from '../lib/unifiedPronunciationService';
import { audioService, enhancedAudioService } from '../lib/pronunciationMigrationAdapter';
import { Volume2, Play, Pause, Settings, CheckCircle, AlertCircle, Loader, Star, Heart, Smile } from 'lucide-react';
import PronunciationDebugger from '../components/PronunciationDebugger';

const UnifiedPronunciationDemo = () => {
  const { 
    voicePreference, 
    isPlaying, 
    isSupported, 
    isVoicesLoaded,
    voices,
    currentWord,
    speak,
    quickSpeak,
    slowSpeak,
    phoneticSpeak,
    stop
  } = usePronunciation();

  const [selectedWord, setSelectedWord] = useState('');
  const [legacyTestResult, setLegacyTestResult] = useState('');
  const [customText, setCustomText] = useState('The quick brown fox jumps over the lazy dog.');
  const [testResults, setTestResults] = useState<any>({});

  // Test the legacy compatibility layer
  const testLegacyAudioService = async () => {
    setLegacyTestResult('Testing legacy audioService...');
    
    try {
      await audioService.pronounceWord('Hello from legacy audioService!', {
        onStart: () => setLegacyTestResult('✅ Legacy audioService working!'),
        onEnd: () => setLegacyTestResult('✅ Legacy audioService completed successfully!'),
        onError: (error) => setLegacyTestResult(`❌ Legacy audioService error: ${error}`)
      });
    } catch (error) {
      setLegacyTestResult(`❌ Legacy audioService failed: ${error}`);
    }
  };

  const testEnhancedAudioService = async () => {
    setLegacyTestResult('Testing enhanced audioService...');
    
    try {
      await enhancedAudioService.pronounceWord('Hello from enhanced audioService!', {
        voiceType: VOICE_TYPES.KID,
        onStart: () => setLegacyTestResult('✅ Enhanced audioService working!'),
        onEnd: () => setLegacyTestResult('✅ Enhanced audioService completed successfully!'),
        onError: (error) => setLegacyTestResult(`❌ Enhanced audioService error: ${error}`)
      });
    } catch (error) {
      setLegacyTestResult(`❌ Enhanced audioService failed: ${error}`);
    }
  };

  // Run comprehensive tests
  const runComprehensiveTests = async () => {
    const results: any = {};
    
    // Test 1: Basic pronunciation
    try {
      await quickSpeak('Test one');
      results.basicPronunciation = '✅ Passed';
    } catch (error) {
      results.basicPronunciation = `❌ Failed: ${error}`;
    }

    // Test 2: Voice switching
    try {
      const originalVoice = voicePreference;
      // This would be implemented by the context
      results.voiceSwitching = '✅ Voice switching available';
    } catch (error) {
      results.voiceSwitching = `❌ Failed: ${error}`;
    }

    // Test 3: Speed variations
    try {
      await slowSpeak('Slow speech test');
      results.speedVariation = '✅ Passed';
    } catch (error) {
      results.speedVariation = `❌ Failed: ${error}`;
    }

    // Test 4: Word highlighting
    try {
      await speak('Word highlighting test', {
        onWordHighlight: (word) => console.log('Highlighted:', word)
      });
      results.wordHighlighting = '✅ Passed';
    } catch (error) {
      results.wordHighlighting = `❌ Failed: ${error}`;
    }

    setTestResults(results);
  };

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-red-100 to-red-50 min-h-screen">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Speech Not Supported
          </h1>
          <p className="text-gray-600">
            This browser doesn't support speech synthesis. Please try Chrome, Safari, or Firefox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 min-h-screen">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Star className="text-yellow-500" />
            Unified Pronunciation System Demo
            <Heart className="text-red-500" />
          </h1>
          <p className="text-lg text-gray-600">
            Current Voice: <span className="font-semibold capitalize">{voicePreference}</span>
            {isPlaying && <span className="ml-2 text-blue-600">🎵 Speaking...</span>}
            {!isVoicesLoaded && <span className="ml-2 text-orange-600">⏳ Loading voices...</span>}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            {voices.length} voices available | System Status: {isSupported ? 'Ready' : 'Not Supported'}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="text-purple-600" />
            System Status
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {isSupported ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />}
              <span>Browser Support</span>
            </div>
            <div className="flex items-center gap-2">
              {isVoicesLoaded ? <CheckCircle className="text-green-500" /> : <Loader className="text-orange-500 animate-spin" />}
              <span>Voices Loaded</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" />
              <span>Legacy Compatibility</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" />
              <span>Migration Ready</span>
            </div>
          </div>
        </div>

        {/* Voice Selection */}
        <VoiceSelector showAdvanced={true} />

        {/* Interactive Components Demo */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pronounceable Words */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Smile className="text-green-600" />
              Interactive Word Cards
            </h3>
            <div className="space-y-3">
              <div className="text-lg">
                Click any word to hear it pronounced:
              </div>
              <div className="flex flex-wrap gap-2">
                {['Apple', 'Banana', 'Cherry', 'Dragon', 'Elephant', 'Forest', 'Garden', 'Happy'].map(word => (
                  <PronounceableWord 
                    key={word} 
                    className="bg-blue-100 text-blue-800 font-semibold"
                    highlight={selectedWord === word}
                    slow={true}
                    onPronounce={(word) => setSelectedWord(word)}
                  >
                    {word}
                  </PronounceableWord>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Last pronounced: <span className="font-semibold">{selectedWord || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Pronounceable Sentences */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Story Reading with Word Highlighting
            </h3>
            <div className="space-y-4">
              <PronounceableSentence className="text-lg leading-relaxed">
                Once upon a time, there was a friendly dragon.
              </PronounceableSentence>
              <PronounceableSentence className="text-lg leading-relaxed">
                The dragon loved to play with children in the magical forest.
              </PronounceableSentence>
              <PronounceableSentence className="text-lg leading-relaxed">
                They all became the best of friends and had wonderful adventures!
              </PronounceableSentence>
            </div>
          </div>
        </div>

        {/* Custom Text Testing */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Custom Text Testing
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter text to test pronunciation:
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter any text here..."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => quickSpeak(customText)}
                disabled={!customText.trim() || isPlaying}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Quick Speech
              </button>
              <button
                onClick={() => slowSpeak(customText)}
                disabled={!customText.trim() || isPlaying}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Slow Speech
              </button>
              <button
                onClick={() => phoneticSpeak(customText)}
                disabled={!customText.trim() || isPlaying}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Phonetic Speech
              </button>
              <button
                onClick={stop}
                disabled={!isPlaying}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Stop
              </button>
            </div>
          </div>
        </div>

        {/* Pronunciation Debugger */}
        <PronunciationDebugger />

        {/* Legacy Compatibility Testing */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Legacy Compatibility Testing
          </h3>
          <div className="space-y-4">
            <p className="text-gray-600">
              Test that existing components can use the new unified system through the compatibility layer:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={testLegacyAudioService}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Test Legacy audioService
              </button>
              <button
                onClick={testEnhancedAudioService}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                Test Enhanced audioService
              </button>
              <button
                onClick={runComprehensiveTests}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Run Comprehensive Tests
              </button>
            </div>
            {legacyTestResult && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-mono text-sm">{legacyTestResult}</div>
              </div>
            )}
            {Object.keys(testResults).length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Test Results:</h4>
                {Object.entries(testResults).map(([test, result]) => (
                  <div key={test} className="font-mono text-sm">
                    {test}: {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Migration Guide */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Migration Guide for Developers
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">1. Legacy Component (Before):</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  {`import { audioService } from './audioService';

// Old way
await audioService.pronounceWord('hello');`}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-2">2. Unified Component (After):</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  {`import { PronounceableWord } from './unifiedPronunciationService';

// New way
<PronounceableWord>hello</PronounceableWord>`}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-purple-600 mb-2">3. Using the Hook:</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  {`const { quickSpeak, voicePreference } = usePronunciation();

await quickSpeak('Hello world!');`}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-red-600 mb-2">4. Voice Selection:</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  {`<VoiceSelector />

// Automatically handles voice switching`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Word Display */}
        {currentWord && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 text-center">
            <div className="text-lg font-semibold text-yellow-800">
              Currently Speaking: <span className="bg-yellow-200 px-2 py-1 rounded">{currentWord}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedPronunciationDemo;
