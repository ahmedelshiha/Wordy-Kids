import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWordLearningSession } from '@/contexts/WordLearningSessionContext';
import { 
  PlayCircle, 
  PauseCircle, 
  RotateCcw, 
  Trash2, 
  Clock,
  Trophy,
  BookOpen,
  Target,
  Zap,
  Save,
  CheckCircle2
} from 'lucide-react';

export function SessionPersistenceDemo() {
  const { 
    sessionData, 
    updateSession, 
    clearSession, 
    saveProgress, 
    getSessionStats 
  } = useWordLearningSession();
  
  const [demoProgress, setDemoProgress] = useState({
    rememberedWords: new Set<number>([1, 2, 3]),
    forgottenWords: new Set<number>([4, 5]),
    currentWordIndex: 3
  });
  
  const [isSimulating, setIsSimulating] = useState(false);
  const stats = getSessionStats();

  // Simulate learning progress
  const simulateLearning = () => {
    setIsSimulating(true);
    
    const simulate = () => {
      const newWordId = Math.floor(Math.random() * 1000) + 10;
      const isRemembered = Math.random() > 0.3; // 70% success rate
      
      setDemoProgress(prev => {
        const newProgress = { ...prev };
        
        if (isRemembered) {
          newProgress.rememberedWords = new Set([...prev.rememberedWords, newWordId]);
        } else {
          newProgress.forgottenWords = new Set([...prev.forgottenWords, newWordId]);
        }
        
        newProgress.currentWordIndex = prev.currentWordIndex + 1;
        
        // Save to session
        saveProgress(newProgress);
        
        return newProgress;
      });
    };
    
    // Simulate learning a new word every 2 seconds
    const interval = setInterval(simulate, 2000);
    
    // Stop after 10 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsSimulating(false);
    }, 10000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const resetDemo = () => {
    setDemoProgress({
      rememberedWords: new Set<number>(),
      forgottenWords: new Set<number>(),
      currentWordIndex: 0
    });
    
    // Clear the session as well
    clearSession();
  };

  const demoStats = {
    totalWordsLearned: demoProgress.rememberedWords.size,
    totalAttempts: demoProgress.rememberedWords.size + demoProgress.forgottenWords.size,
    accuracy: demoProgress.rememberedWords.size + demoProgress.forgottenWords.size > 0 
      ? Math.round((demoProgress.rememberedWords.size / (demoProgress.rememberedWords.size + demoProgress.forgottenWords.size)) * 100)
      : 0,
    currentWordIndex: demoProgress.currentWordIndex
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Session Persistence Demo
        </h1>
        <p className="text-gray-600">
          Experience how your learning progress is automatically saved and restored
        </p>
      </div>

      {/* Demo Controls */}
      <Card className="border-educational-blue">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-educational-blue" />
            Demo Controls
          </CardTitle>
          <CardDescription>
            Simulate learning progress and see how session persistence works
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={simulateLearning}
              disabled={isSimulating}
              className="bg-educational-blue hover:bg-educational-blue/90"
            >
              {isSimulating ? (
                <>
                  <PauseCircle className="w-4 h-4 mr-2" />
                  Simulating...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start Learning Simulation
                </>
              )}
            </Button>
            
            <Button
              onClick={stopSimulation}
              variant="outline"
              disabled={!isSimulating}
            >
              Stop
            </Button>
            
            <Button
              onClick={resetDemo}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Demo
            </Button>
          </div>
          
          {isSimulating && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Save className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">
                  Auto-saving progress... Open a new tab to see persistence in action!
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-educational-yellow" />
              Demo Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {demoStats.totalWordsLearned}
                </div>
                <div className="text-sm text-green-700">Words Learned</div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {demoStats.accuracy}%
                </div>
                <div className="text-sm text-blue-700">Accuracy</div>
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-purple-700 font-medium">Total Attempts:</span>
                <span className="text-purple-800 font-bold">{demoStats.totalAttempts}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-purple-700 font-medium">Current Word:</span>
                <span className="text-purple-800 font-bold">#{demoStats.currentWordIndex}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-educational-green" />
              Session Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Session Age:</span>
                <Badge variant="secondary">
                  {Math.round((Date.now() - sessionData.sessionStartTime) / 1000 / 60)} min
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto-save:</span>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cross-tab Sync:</span>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  Active
                </Badge>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-700 mb-2">
                <strong>Try this:</strong>
              </div>
              <ol className="text-xs text-gray-600 space-y-1">
                <li>1. Start the learning simulation</li>
                <li>2. Open this app in a new tab</li>
                <li>3. See your progress is automatically synced!</li>
                <li>4. Close and reopen the app - progress persists</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-educational-purple" />
            Session Persistence Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Auto-Save Progress</h4>
              <p className="text-sm text-blue-700">
                Your learning progress is automatically saved every few seconds and when you switch tabs.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Cross-Tab Sync</h4>
              <p className="text-sm text-green-700">
                Progress syncs across multiple tabs and windows in real-time using local storage events.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Session Restoration</h4>
              <p className="text-sm text-purple-700">
                When you return, you'll see a notification offering to continue where you left off.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Offline Support</h4>
              <p className="text-sm text-orange-700">
                Continue learning offline. Progress saves locally and syncs when online.
              </p>
            </div>
            
            <div className="p-4 bg-pink-50 rounded-lg">
              <h4 className="font-semibold text-pink-800 mb-2">Data Export/Import</h4>
              <p className="text-sm text-pink-700">
                Export your learning data for backup or import previous sessions.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Smart Recovery</h4>
              <p className="text-sm text-yellow-700">
                Handles page refreshes, crashes, and long periods of inactivity gracefully.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
