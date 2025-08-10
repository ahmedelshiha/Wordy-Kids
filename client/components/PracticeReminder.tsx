import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  X, 
  Sparkles,
  Timer,
  Brain
} from 'lucide-react';

interface PracticeReminderProps {
  practiceWordCount: number;
  onStartPractice: () => void;
  onDismiss: () => void;
}

export const PracticeReminder: React.FC<PracticeReminderProps> = ({
  practiceWordCount,
  onStartPractice,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(), 300);
  };

  if (!isVisible) return null;

  return (
    <Card className={`mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 transition-all duration-300 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-gradient-to-r from-orange-400 to-red-400 p-3 rounded-full animate-pulse">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 bg-white text-orange-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {practiceWordCount}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-orange-700 text-lg">
                  Quick Practice Break? 
                </h3>
                <Sparkles className="w-5 h-5 text-yellow-500 animate-spin" />
              </div>
              <p className="text-orange-600 text-sm">
                You have <span className="font-semibold">{practiceWordCount} words</span> that could use some extra love! 
                <span className="ml-1">Ready for a quick 2-minute practice? 🎯</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-3 mr-4">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Timer className="w-4 h-4" />
                <span>~2 min</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Brain className="w-4 h-4" />
                <span>Quick practice</span>
              </div>
            </div>
            
            <Button
              onClick={onStartPractice}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Target className="w-4 h-4 mr-2" />
              Practice Now! 🚀
            </Button>
            
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Optional motivational message */}
        <div className="mt-3 pt-3 border-t border-orange-200">
          <div className="flex items-center justify-center gap-2 text-sm text-orange-600">
            <span>💪</span>
            <span className="font-medium">Practice makes perfect!</span>
            <span>⭐</span>
            <span>The more you practice, the stronger you become!</span>
            <span>🎉</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
