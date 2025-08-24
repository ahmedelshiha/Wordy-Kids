import React, { useState, useEffect } from 'react';
import { usePronunciation, PronunciationProvider } from '../lib/unifiedPronunciationService';
import { sanitizeTTSInput, logSpeechError } from '../lib/speechUtils';
import { audioService } from '../lib/pronunciationMigrationAdapter';
import { AlertTriangle, Play, Bug, CheckCircle, XCircle } from 'lucide-react';

const EmergencyTestContent: React.FC = () => {
  const { speak, quickSpeak, isSupported } = usePronunciation();
  const [testInput, setTestInput] = useState('hello world');
  const [lastError, setLastError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Test the exact scenario that's failing
  const testSpecificInput = async (input: any, label: string) => {
    setLastError(null);
    console.log(`🧪 Testing ${label}:`, input);

    try {
      // Step 1: Test sanitization
      const sanitized = sanitizeTTSInput(input);
      console.log(`🧪 Sanitized result:`, sanitized);

      // Step 2: Test direct speech synthesis
      if (sanitized) {
        await speak(sanitized, {
          onError: (error) => {
            console.error(`❌ Speech error for ${label}:`, error);
            setLastError(`${label}: ${JSON.stringify(error)}`);
          }
        });
        
        console.log(`✅ ${label} test passed`);
        setTestResults(prev => [...prev, { label, status: 'pass', input, sanitized }]);
      } else {
        console.log(`❌ ${label} test failed - empty sanitization`);
        setLastError(`${label}: Empty sanitization result`);
        setTestResults(prev => [...prev, { label, status: 'fail', input, sanitized, error: 'Empty sanitization' }]);
      }
    } catch (error) {
      console.error(`❌ ${label} test exception:`, error);
      setLastError(`${label}: ${error}`);
      setTestResults(prev => [...prev, { label, status: 'error', input, error: String(error) }]);
    }
  };

  // Test legacy audioService directly
  const testLegacyService = async (input: any) => {
    console.log('🧪 Testing legacy audioService with:', input);
    
    try {
      await audioService.pronounceWord(input, {
        onStart: () => console.log('🎵 Legacy service started'),
        onEnd: () => console.log('✅ Legacy service completed'),
        onError: (error) => {
          console.error('❌ Legacy service error:', error);
          setLastError(`Legacy: ${error}`);
        }
      });
    } catch (error) {
      console.error('❌ Legacy service exception:', error);
      setLastError(`Legacy exception: ${error}`);
    }
  };

  // Run comprehensive diagnostics
  const runDiagnostics = async () => {
    setTestResults([]);
    setLastError(null);
    
    console.log('🔍 Starting comprehensive diagnostics...');
    
    // Test cases that commonly cause issues
    const testCases = [
      { input: 'simple text', label: 'Simple String' },
      { input: { word: 'object word' }, label: 'Object with word property' },
      { input: { text: 'object text' }, label: 'Object with text property' },
      { input: { someProperty: 'value' }, label: 'Object without word/text' },
      { input: ['array', 'of', 'words'], label: 'Array of strings' },
      { input: 123, label: 'Number' },
      { input: true, label: 'Boolean' },
      { input: null, label: 'Null' },
      { input: undefined, label: 'Undefined' },
      { input: {}, label: 'Empty object' },
    ];

    for (const testCase of testCases) {
      await testSpecificInput(testCase.input, testCase.label);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('🔍 Diagnostics complete');
  };

  // Monitor for console errors
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args.some(arg => String(arg).includes('[object Object]'))) {
        setLastError(`Console error: ${args.join(' ')}`);
      }
      originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="bg-red-100 border border-red-400 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <XCircle className="h-5 w-5" />
          <span>Speech synthesis not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Error Alert */}
      {lastError && (
        <div className="bg-red-100 border border-red-400 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <div className="font-semibold text-red-800">Last Error Detected:</div>
              <div className="text-red-700 font-mono text-sm">{lastError}</div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Test Input */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bug className="h-5 w-5 text-purple-600" />
          Manual Test Input
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Input (will be JSON parsed if object):
            </label>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter text or JSON object..."
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                let input = testInput;
                try {
                  // Try to parse as JSON if it looks like an object
                  if (testInput.trim().startsWith('{') || testInput.trim().startsWith('[')) {
                    input = JSON.parse(testInput);
                  }
                } catch (e) {
                  // Keep as string if JSON parsing fails
                }
                testSpecificInput(input, 'Manual Test');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Test Input
            </button>
            
            <button
              onClick={() => testLegacyService(testInput)}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Test Legacy Service
            </button>
            
            <button
              onClick={runDiagnostics}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Run Full Diagnostics
            </button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-md border ${
                  result.status === 'pass' 
                    ? 'bg-green-50 border-green-200' 
                    : result.status === 'fail'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.status === 'pass' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">{result.label}</span>
                  <span className="text-sm text-gray-600">
                    ({typeof result.input}) {Array.isArray(result.input) ? '[Array]' : ''}
                  </span>
                </div>
                
                {result.sanitized && (
                  <div className="mt-1 text-sm text-gray-700">
                    Sanitized: "{result.sanitized}"
                  </div>
                )}
                
                {result.error && (
                  <div className="mt-1 text-sm text-red-600 font-mono">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Speech Synthesis Supported:</strong> {isSupported ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...
          </div>
          <div>
            <strong>Environment:</strong> {process.env.NODE_ENV}
          </div>
          <div>
            <strong>Window Speech Synthesis:</strong> {'speechSynthesis' in window ? 'Available' : 'Not Available'}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Open browser console to see detailed debug logs.</p>
          <p>Look for messages starting with ����, 🔍, ✅, or ❌.</p>
        </div>
      </div>
    </div>
  );
};

const PronunciationEmergencyTest: React.FC = () => {
  return (
    <PronunciationProvider
      defaultSettings={{
        voiceType: 'woman',
        rate: 0.8,
        pitch: 1.1,
        volume: 0.9
      }}
      onError={(error) => {
        console.error('🚨 Pronunciation Provider Error:', error);
      }}
    >
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🚨 Pronunciation Emergency Debugger
            </h1>
            <p className="text-gray-600">
              Comprehensive testing tool for debugging "[object Object]" and other pronunciation errors
            </p>
          </div>
          
          <EmergencyTestContent />
        </div>
      </div>
    </PronunciationProvider>
  );
};

export default PronunciationEmergencyTest;
