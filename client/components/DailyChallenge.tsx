import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Target, 
  Star, 
  Clock, 
  Trophy,
  CheckCircle2,
  Flame,
  Gift
} from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { playSoundIfEnabled } from '@/lib/soundEffects';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'learn' | 'quiz' | 'streak' | 'accuracy' | 'time';
  target: number;
  current: number;
  reward: {
    points: number;
    badge?: string;
    title?: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in hours
  completed: boolean;
}

interface DailyChallengeProps {
  challenges: Challenge[];
  onChallengeComplete: (challengeId: string) => void;
  onStartChallenge: (challengeId: string) => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  challenges = [],
  onChallengeComplete,
  onStartChallenge
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Sample challenges if none provided
  const defaultChallenges: Challenge[] = [
    {
      id: 'daily-words',
      title: 'Word Explorer',
      description: 'Learn 5 new words today',
      type: 'learn',
      target: 5,
      current: 2,
      reward: { points: 50, badge: '📚' },
      difficulty: 'easy',
      timeLimit: 24,
      completed: false
    },
    {
      id: 'quiz-master',
      title: 'Quiz Champion',
      description: 'Score 100% on any quiz',
      type: 'accuracy',
      target: 100,
      current: 85,
      reward: { points: 100, badge: '🎯', title: 'Perfect Score!' },
      difficulty: 'hard',
      timeLimit: 24,
      completed: false
    },
    {
      id: 'speed-learner',
      title: 'Speed Learner',
      description: 'Complete 3 activities in 15 minutes',
      type: 'time',
      target: 3,
      current: 1,
      reward: { points: 75, badge: '⚡' },
      difficulty: 'medium',
      timeLimit: 24,
      completed: false
    },
    {
      id: 'streak-keeper',
      title: 'Streak Keeper',
      description: 'Maintain your learning streak',
      type: 'streak',
      target: 1,
      current: 1,
      reward: { points: 25, badge: '🔥' },
      difficulty: 'easy',
      timeLimit: 24,
      completed: true
    }
  ];

  const activeChallenges = challenges.length > 0 ? challenges : defaultChallenges;
  const completedToday = activeChallenges.filter(c => c.completed).length;
  const totalChallenges = activeChallenges.length;

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-educational-green';
      case 'medium': return 'bg-educational-orange';
      case 'hard': return 'bg-educational-pink';
      default: return 'bg-educational-blue';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'learn': return <Target className="w-4 h-4" />;
      case 'quiz': return <Trophy className="w-4 h-4" />;
      case 'streak': return <Flame className="w-4 h-4" />;
      case 'accuracy': return <Star className="w-4 h-4" />;
      case 'time': return <Clock className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const handleStartChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    playSoundIfEnabled.click();
    onStartChallenge(challenge.id);
  };

  const progressPercentage = (completedToday / totalChallenges) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-educational-purple to-educational-blue text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Daily Challenges
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              {timeRemaining} left
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg">Today's Progress</span>
              <span className="text-lg font-bold">
                <AnimatedCounter value={completedToday} /> / {totalChallenges}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-white/20" />
            <div className="flex justify-between text-sm opacity-90">
              <span>Keep going! You're doing great!</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeChallenges.map((challenge) => (
          <Card 
            key={challenge.id}
            className={`transition-all duration-300 hover:scale-105 ${
              challenge.completed 
                ? 'bg-green-50 border-green-200' 
                : 'hover:shadow-lg cursor-pointer'
            }`}
            onClick={() => !challenge.completed && handleStartChallenge(challenge)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(challenge.type)}
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white text-xs`}>
                    {challenge.difficulty}
                  </Badge>
                  {challenge.completed && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">{challenge.description}</p>
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    <AnimatedCounter value={challenge.current} /> / {challenge.target}
                  </span>
                </div>
                <Progress 
                  value={(challenge.current / challenge.target) * 100} 
                  className="h-2"
                />
              </div>

              {/* Rewards */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-educational-purple" />
                    <span className="font-medium text-sm">Rewards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {challenge.reward.badge && (
                      <span className="text-lg">{challenge.reward.badge}</span>
                    )}
                    <Badge variant="outline" className="text-educational-blue">
                      +{challenge.reward.points} pts
                    </Badge>
                  </div>
                </div>
                {challenge.reward.title && (
                  <p className="text-xs text-slate-600 mt-1">
                    Unlock: "{challenge.reward.title}"
                  </p>
                )}
              </div>

              {/* Action Button */}
              <Button
                className={`w-full ${
                  challenge.completed 
                    ? 'bg-green-500 text-white cursor-default' 
                    : 'bg-educational-blue text-white hover:bg-educational-blue/90'
                }`}
                disabled={challenge.completed}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartChallenge(challenge);
                }}
              >
                {challenge.completed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Completed!
                  </>
                ) : (
                  'Start Challenge'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Challenge Details Modal */}
      {selectedChallenge && !selectedChallenge.completed && (
        <Card className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md w-auto z-50 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTypeIcon(selectedChallenge.type)}
              {selectedChallenge.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">{selectedChallenge.description}</p>
            
            <div className="bg-educational-blue/5 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Target:</span>
                <span>{selectedChallenge.target}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Current Progress:</span>
                <span>{selectedChallenge.current}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Reward:</span>
                <span className="flex items-center gap-1">
                  {selectedChallenge.reward.badge} +{selectedChallenge.reward.points} pts
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedChallenge(null);
                  playSoundIfEnabled.click();
                }}
              >
                Maybe Later
              </Button>
              <Button
                className="flex-1 bg-educational-blue text-white"
                onClick={() => {
                  setSelectedChallenge(null);
                  playSoundIfEnabled.success();
                  // In a real app, this would navigate to the appropriate activity
                }}
              >
                Let's Go!
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overlay for modal */}
      {selectedChallenge && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSelectedChallenge(null)}
        />
      )}
    </div>
  );
};
