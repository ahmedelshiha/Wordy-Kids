import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioLines, Volume2, VolumeX, AlertCircle, CheckCircle } from "lucide-react";
import { audioService } from "@/lib/audioService";

export default function SpeechDiagnostics() {
  const [diagnosticInfo, setDiagnosticInfo] = useState<string>("");
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = () => {
    // Capture console.log output
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(args.join(" "));
      originalLog(...args);
    };

    // Run diagnostics
    audioService.diagnostics();

    // Restore console.log
    console.log = originalLog;
    
    setDiagnosticInfo(logs.join("\n"));
  };

  const testPronunciation = async (word: string) => {
    setIsTestRunning(true);
    setTestResults([]);
    
    const results: string[] = [];
    
    try {
      await audioService.ensureVoicesLoaded();
      
      audioService.pronounceWord(word, {
        onStart: () => {
          results.push(`✅ Speech started for: ${word}`);
          setTestResults([...results]);
        },
        onEnd: () => {
          results.push(`✅ Speech completed for: ${word}`);
          setTestResults([...results]);
          setIsTestRunning(false);
        },
        onError: () => {
          results.push(`❌ Speech failed for: ${word}`);
          setTestResults([...results]);
          setIsTestRunning(false);
        }
      });
      
      // Timeout fallback
      setTimeout(() => {
        if (isTestRunning) {
          results.push(`⏰ Speech test timed out for: ${word}`);
          setTestResults([...results]);
          setIsTestRunning(false);
        }
      }, 5000);
      
    } catch (error) {
      results.push(`❌ Error testing pronunciation: ${error}`);
      setTestResults([...results]);
      setIsTestRunning(false);
    }
  };

  const toggleAudio = () => {
    audioService.setEnabled(!audioService.isAudioEnabled());
    runDiagnostics();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AudioLines className="w-5 h-5" />
            Speech Synthesis Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {audioService.isSupported() ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm font-medium">
                Browser Support: {audioService.isSupported() ? "Yes" : "No"}
              </span>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {audioService.areVoicesLoaded() ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
              <span className="text-sm font-medium">
                Voices Loaded: {audioService.areVoicesLoaded() ? "Yes" : "No"} ({audioService.getVoiceCount()})
              </span>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {audioService.isAudioEnabled() ? (
                <Volume2 className="w-5 h-5 text-green-500" />
              ) : (
                <VolumeX className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm font-medium">
                Audio: {audioService.isAudioEnabled() ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={runDiagnostics} variant="outline">
              Refresh Diagnostics
            </Button>
            <Button onClick={toggleAudio} variant="outline">
              {audioService.isAudioEnabled() ? "Disable Audio" : "Enable Audio"}
            </Button>
            <Button 
              onClick={() => testPronunciation("hello")} 
              disabled={isTestRunning}
              variant="outline"
            >
              {isTestRunning ? "Testing..." : "Test 'Hello'"}
            </Button>
            <Button 
              onClick={() => testPronunciation("test")} 
              disabled={isTestRunning}
              variant="outline"
            >
              {isTestRunning ? "Testing..." : "Test 'Test'"}
            </Button>
            <Button 
              onClick={() => testPronunciation("pronunciation")} 
              disabled={isTestRunning}
              variant="outline"
            >
              {isTestRunning ? "Testing..." : "Test 'Pronunciation'"}
            </Button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Test Results:</h3>
              <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostic Info */}
          {diagnosticInfo && (
            <div className="space-y-2">
              <h3 className="font-medium">Diagnostic Information:</h3>
              <div className="bg-gray-50 p-3 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {diagnosticInfo}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
