import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWordLearningSession, useSessionRestoration } from '@/contexts/WordLearningSessionContext';
import { RotateCcw, X, Clock, Trophy, BookOpen, Target } from 'lucide-react';

interface SessionRestorationNotificationProps {
  onRestore: () => void;
  onDismiss: () => void;
}

export function SessionRestorationNotification({ 
  onRestore, 
  onDismiss 
}: SessionRestorationNotificationProps) {
  const { sessionData, getSessionStats } = useWordLearningSession();
  const { hasStoredProgress, getRestoreMessage } = useSessionRestoration();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification after a brief delay if there's stored progress
    if (hasStoredProgress) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasStoredProgress]);

  if (!isVisible || !hasStoredProgress) {
    return null;
  }

  const stats = getSessionStats();
  const timeSinceLastSession = Math.round((Date.now() - sessionData.lastUpdated) / 1000 / 60);

  const handleRestore = () => {
    setIsVisible(false);
    onRestore();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in-from-right">
      <Card className="shadow-lg border-l-4 border-l-educational-blue bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-educational-blue rounded-full">
                <RotateCcw className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-800">Welcome Back!</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Continue your learning journey
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {getRestoreMessage()}
          </p>
          
          {/* Progress summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
              <Trophy className="w-4 h-4 text-educational-yellow" />
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  {stats.totalWordsLearned}
                </div>
                <div className="text-xs text-gray-600">Words Learned</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
              <Target className="w-4 h-4 text-educational-green" />
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  {stats.accuracy}%
                </div>
                <div className="text-xs text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>
          
          {/* Session info */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span>
              Last activity: {timeSinceLastSession < 60 
                ? `${timeSinceLastSession} min ago`
                : `${Math.round(timeSinceLastSession / 60)} hrs ago`
              }
            </span>
            {sessionData.selectedCategory && (
              <>
                <span>•</span>
                <BookOpen className="w-3 h-3" />
                <Badge variant="secondary" className="text-xs py-0">
                  {sessionData.selectedCategory}
                </Badge>
              </>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleRestore}
              className="flex-1 bg-educational-blue hover:bg-educational-blue/90 text-white"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
            <Button 
              onClick={handleDismiss}
              variant="outline" 
              size="sm"
              className="px-4"
            >
              Start Fresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced version with more detailed progress information
export function DetailedSessionRestorationModal({ 
  isOpen,
  onRestore, 
  onDismiss 
}: {
  isOpen: boolean;
  onRestore: () => void;
  onDismiss: () => void;
}) {
  const { sessionData, getSessionStats } = useWordLearningSession();

  if (!isOpen) return null;

  const stats = getSessionStats();
  const progressPercentage = Math.round(
    (sessionData.rememberedWords.length / 
     Math.max(sessionData.rememberedWords.length + sessionData.forgottenWords.length, 1)) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="max-w-lg w-full mx-4 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-educational-blue rounded-full w-fit">
            <RotateCcw className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-800">
            Welcome Back to Wordy's Adventure!
          </CardTitle>
          <CardDescription>
            We found your previous learning session
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress overview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Your Progress</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-educational-blue">
                  {sessionData.rememberedWords.length}
                </div>
                <div className="text-sm text-gray-600">Words Mastered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-educational-purple">
                  {sessionData.forgottenWords.length}
                </div>
                <div className="text-sm text-gray-600">Need Practice</div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-educational-blue to-educational-purple h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">
              {progressPercentage}% Success Rate
            </div>
          </div>
          
          {/* Session details */}
          {sessionData.selectedCategory && (
            <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
              <BookOpen className="w-5 h-5 text-educational-green" />
              <div>
                <div className="font-medium text-gray-800">Last Category</div>
                <div className="text-sm text-gray-600">{sessionData.selectedCategory}</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
            <Clock className="w-5 h-5 text-educational-orange" />
            <div>
              <div className="font-medium text-gray-800">Time Spent Learning</div>
              <div className="text-sm text-gray-600">
                {stats.totalTimeSpent} minutes across {stats.sessionsCompleted} sessions
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onRestore}
              className="flex-1 bg-gradient-to-r from-educational-blue to-educational-purple hover:from-educational-blue/90 hover:to-educational-purple/90 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Continue My Journey
            </Button>
            <Button 
              onClick={onDismiss}
              variant="outline" 
              className="px-6"
            >
              Start Fresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
