import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  UserPlus, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Heart, 
  Sparkles,
  Check,
  Camera,
  Palette,
  Volume2,
  X,
  ArrowRight,
  Smile,
  Baby,
  BookOpen,
  Trophy,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  level: number;
  totalPoints: number;
  wordsLearned: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  favoriteCategory: string;
  interests: string[];
  parentConnection: string;
  createdAt: Date;
  lastActive?: Date;
  backgroundColor?: string;
  achievements: any[];
}

interface EnhancedAddChildProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChild: (child: ChildProfile) => void;
  existingChildren?: ChildProfile[];
}

interface FormStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
}

const FORM_STEPS: FormStep[] = [
  {
    id: 'basic',
    title: "Let's meet your little learner!",
    subtitle: "Tell us their name and age",
    icon: Smile
  },
  {
    id: 'avatar',
    title: "Pick their perfect avatar!",
    subtitle: "Choose a fun character they'll love",
    icon: Camera
  },
  {
    id: 'interests',
    title: "What do they love?",
    subtitle: "Select their favorite topics",
    icon: Heart
  },
  {
    id: 'personalize',
    title: "Make it special!",
    subtitle: "Customize their learning experience",
    icon: Sparkles
  }
];

const AVATAR_OPTIONS = [
  { emoji: '👦', label: 'Boy', category: 'child' },
  { emoji: '👧', label: 'Girl', category: 'child' },
  { emoji: '🧒', label: 'Kid', category: 'child' },
  { emoji: '👶', label: 'Baby', category: 'child' },
  { emoji: '🦸‍♂️', label: 'Super Boy', category: 'hero' },
  { emoji: '🦸‍♀️', label: 'Super Girl', category: 'hero' },
  { emoji: '🧑‍🚀', label: 'Astronaut', category: 'space' },
  { emoji: '🧑‍🎨', label: 'Artist', category: 'creative' },
  { emoji: '🧑‍🔬', label: 'Scientist', category: 'science' },
  { emoji: '🧑‍🏫', label: 'Student', category: 'school' },
  { emoji: '🦄', label: 'Unicorn', category: 'fantasy' },
  { emoji: '🐸', label: 'Frog', category: 'animals' },
  { emoji: '🐼', label: 'Panda', category: 'animals' },
  { emoji: '🦊', label: 'Fox', category: 'animals' },
  { emoji: '���', label: 'Bear', category: 'animals' },
  { emoji: '🐱', label: 'Cat', category: 'animals' }
];

const INTEREST_OPTIONS = [
  { id: 'animals', emoji: '🐾', label: 'Animals', color: 'bg-green-100 text-green-700' },
  { id: 'space', emoji: '🚀', label: 'Space', color: 'bg-blue-100 text-blue-700' },
  { id: 'science', emoji: '🔬', label: 'Science', color: 'bg-purple-100 text-purple-700' },
  { id: 'art', emoji: '🎨', label: 'Art', color: 'bg-pink-100 text-pink-700' },
  { id: 'music', emoji: '🎵', label: 'Music', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'sports', emoji: '⚽', label: 'Sports', color: 'bg-orange-100 text-orange-700' },
  { id: 'cooking', emoji: '👨‍🍳', label: 'Cooking', color: 'bg-red-100 text-red-700' },
  { id: 'reading', emoji: '📚', label: 'Reading', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'nature', emoji: '🌿', label: 'Nature', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'games', emoji: '🎮', label: 'Games', color: 'bg-cyan-100 text-cyan-700' }
];

const BACKGROUND_COLORS = [
  { color: 'from-pink-200 to-pink-300', name: 'Pink Dreams' },
  { color: 'from-blue-200 to-blue-300', name: 'Ocean Blue' },
  { color: 'from-purple-200 to-purple-300', name: 'Purple Magic' },
  { color: 'from-green-200 to-green-300', name: 'Forest Green' },
  { color: 'from-yellow-200 to-yellow-300', name: 'Sunshine' },
  { color: 'from-orange-200 to-orange-300', name: 'Sunset' }
];

export function EnhancedAddChildProfile({ 
  isOpen, 
  onClose, 
  onAddChild, 
  existingChildren = [] 
}: EnhancedAddChildProfileProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: 6,
    avatar: '👦',
    interests: [] as string[],
    backgroundColor: 'from-pink-200 to-pink-300',
    parentConnection: 'child'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [touchFeedback, setTouchFeedback] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setFormData({
        name: '',
        age: 6,
        avatar: '👦',
        interests: [],
        backgroundColor: 'from-pink-200 to-pink-300',
        parentConnection: 'child'
      });
      setNameError('');
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Enhanced name validation
  const validateName = (name: string) => {
    if (!name.trim()) {
      return "Please enter your child's name";
    }
    if (name.trim().length < 2) {
      return "Name should be at least 2 characters";
    }
    if (existingChildren.some(child => child.name.toLowerCase() === name.trim().toLowerCase())) {
      return "A child with this name already exists";
    }
    return '';
  };

  // Handle touch feedback for better mobile UX
  const handleTouchFeedback = (id: string) => {
    setTouchFeedback(id);
    setTimeout(() => setTouchFeedback(null), 200);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      const error = validateName(formData.name);
      if (error) {
        setNameError(error);
        return;
      }
      setNameError('');
    }

    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newChild: ChildProfile = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      age: formData.age,
      avatar: formData.avatar,
      level: 1,
      totalPoints: 0,
      wordsLearned: 0,
      currentStreak: 0,
      weeklyGoal: Math.min(10 + formData.age, 20),
      weeklyProgress: 0,
      favoriteCategory: formData.interests[0] || "Animals",
      interests: formData.interests,
      parentConnection: formData.parentConnection,
      backgroundColor: formData.backgroundColor,
      createdAt: new Date(),
      achievements: []
    };

    onAddChild(newChild);
    setShowSuccess(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  const toggleInterest = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const currentStepData = FORM_STEPS[currentStep];
  const progress = ((currentStep + 1) / FORM_STEPS.length) * 100;

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 w-[95vw] max-w-[400px] sm:w-full">
          <div className="text-center py-8">
            <div className="mb-6 relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 animate-bounce">
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Welcome to the family! 🎉
            </h2>
            <p className="text-green-700 mb-4">
              {formData.name} is ready to start their learning adventure!
            </p>
            <div className="text-4xl mb-4 animate-bounce">
              {formData.avatar}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto p-0 gap-0 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 overflow-hidden w-[95vw] max-w-[350px] h-[80vh] max-h-[480px] sm:h-auto sm:max-h-[75vh] flex flex-col [&>button]:hidden">
        {/* Header */}
        <div className="p-3 sm:p-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-purple-100"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <span className="text-sm font-medium text-purple-600">
                Step {currentStep + 1} of {FORM_STEPS.length}
              </span>
            </div>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <Progress 
              value={progress} 
              className="h-2 bg-purple-100"
            />
            <div 
              className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step header */}
          <div className="text-center mb-4">
            <div className="mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <currentStepData.icon className="w-7 h-7 text-purple-600" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              {currentStepData.title}
            </h2>
            <p className="text-sm text-gray-600">
              {currentStepData.subtitle}
            </p>
          </div>
        </div>

        {/* Form content */}
        <div className="px-3 sm:px-4 pb-3 flex-1 overflow-y-auto min-h-0">
          <form ref={formRef} className="space-y-4">
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <div className="space-y-4 animate-slide-in-from-right">
                <div>
                  <Label htmlFor="childName" className="text-sm font-medium text-gray-700 mb-2 block">
                    What's your child's name?
                  </Label>
                  <Input
                    id="childName"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (nameError) setNameError('');
                    }}
                    placeholder="Enter their name"
                    className={cn(
                      "text-center text-lg font-medium h-10 rounded-lg border-2 transition-all duration-200",
                      nameError 
                        ? "border-red-300 bg-red-50" 
                        : "border-purple-200 focus:border-purple-400 bg-white"
                    )}
                    autoFocus
                    autoComplete="given-name"
                    inputMode="text"
                    enterKeyHint="next"
                    aria-describedby={nameError ? "name-error" : undefined}
                  />
                  {nameError && (
                    <p id="name-error" className="text-red-600 text-sm mt-2 animate-shake">
                      {nameError}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    How old are they?
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                      <Button
                        key={age}
                        type="button"
                        variant={formData.age === age ? "default" : "outline"}
                        className={cn(
                          "h-10 rounded-lg transition-all duration-200 transform",
                          formData.age === age 
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105" 
                            : "border-purple-200 hover:border-purple-300 hover:bg-purple-50",
                          touchFeedback === `age-${age}` && "scale-95"
                        )}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, age }));
                          handleTouchFeedback(`age-${age}`);
                        }}
                        aria-pressed={formData.age === age}
                      >
                        <span className="text-lg font-semibold">{age}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Avatar Selection */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-slide-in-from-right">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-gentle-bounce">
                    <span className="text-3xl">{formData.avatar}</span>
                  </div>
                  <p className="text-sm text-gray-600">Selected avatar</p>
                </div>

                <div className="space-y-4">
                  {['child', 'hero', 'space', 'creative', 'animals', 'fantasy'].map(category => {
                    const categoryAvatars = AVATAR_OPTIONS.filter(avatar => avatar.category === category);
                    if (categoryAvatars.length === 0) return null;

                    return (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                          {category === 'child' ? 'Kids' : category}
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                          {categoryAvatars.map((avatar) => (
                            <Button
                              key={avatar.emoji}
                              type="button"
                              variant={formData.avatar === avatar.emoji ? "default" : "outline"}
                              className={cn(
                                "h-14 w-14 rounded-xl transition-all duration-200 transform",
                                formData.avatar === avatar.emoji 
                                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-110" 
                                  : "border-purple-200 hover:border-purple-300 hover:bg-purple-50 hover:scale-105",
                                touchFeedback === avatar.emoji && "scale-95"
                              )}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, avatar: avatar.emoji }));
                                handleTouchFeedback(avatar.emoji);
                              }}
                              aria-label={avatar.label}
                              aria-pressed={formData.avatar === avatar.emoji}
                            >
                              <span className="text-2xl">{avatar.emoji}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Interests */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-slide-in-from-right">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Select up to 5 things {formData.name} loves most
                  </p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {formData.interests.length} / 5 selected
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = formData.interests.includes(interest.id);
                    const isDisabled = !isSelected && formData.interests.length >= 5;

                    return (
                      <Button
                        key={interest.id}
                        type="button"
                        variant="outline"
                        disabled={isDisabled}
                        className={cn(
                          "h-16 flex flex-col items-center gap-1 rounded-xl transition-all duration-200 transform",
                          isSelected 
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg scale-105" 
                            : isDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : "border-purple-200 hover:border-purple-300 hover:bg-purple-50 hover:scale-105",
                          touchFeedback === interest.id && "scale-95"
                        )}
                        onClick={() => {
                          if (!isDisabled) {
                            toggleInterest(interest.id);
                            handleTouchFeedback(interest.id);
                          }
                        }}
                        aria-pressed={isSelected}
                        aria-disabled={isDisabled}
                      >
                        <span className="text-xl">{interest.emoji}</span>
                        <span className="text-xs font-medium">{interest.label}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 absolute top-1 right-1" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Personalization */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-slide-in-from-right">
                {/* Background color selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Choose their theme color
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {BACKGROUND_COLORS.map((bg) => (
                      <Button
                        key={bg.color}
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-16 rounded-xl border-2 transition-all duration-200 transform overflow-hidden relative",
                          formData.backgroundColor === bg.color 
                            ? "border-purple-500 shadow-lg scale-105" 
                            : "border-gray-200 hover:border-purple-300 hover:scale-105",
                          touchFeedback === bg.color && "scale-95"
                        )}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, backgroundColor: bg.color }));
                          handleTouchFeedback(bg.color);
                        }}
                        aria-label={bg.name}
                        aria-pressed={formData.backgroundColor === bg.color}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${bg.color}`} />
                        <span className="relative text-xs font-medium text-gray-700">
                          {bg.name}
                        </span>
                        {formData.backgroundColor === bg.color && (
                          <Check className="absolute top-1 right-1 w-4 h-4 text-purple-600" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Relationship selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    {formData.name} is your...
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'child', label: 'Child', emoji: '👶' },
                      { id: 'student', label: 'Student', emoji: '🎓' },
                      { id: 'grandchild', label: 'Grandchild', emoji: '👴' },
                      { id: 'other', label: 'Other', emoji: '👨‍👩‍👧‍👦' }
                    ].map((relation) => (
                      <Button
                        key={relation.id}
                        type="button"
                        variant={formData.parentConnection === relation.id ? "default" : "outline"}
                        className={cn(
                          "h-12 flex items-center gap-2 rounded-xl transition-all duration-200 transform",
                          formData.parentConnection === relation.id 
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105" 
                            : "border-purple-200 hover:border-purple-300 hover:bg-purple-50 hover:scale-105",
                          touchFeedback === relation.id && "scale-95"
                        )}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, parentConnection: relation.id }));
                          handleTouchFeedback(relation.id);
                        }}
                        aria-pressed={formData.parentConnection === relation.id}
                      >
                        <span className="text-lg">{relation.emoji}</span>
                        <span className="text-sm font-medium">{relation.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Preview card */}
                <div className="mt-8">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Preview
                  </Label>
                  <Card className={cn(
                    "bg-gradient-to-br",
                    formData.backgroundColor,
                    "border-2 border-purple-200 transform hover:scale-105 transition-all duration-200"
                  )}>
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{formData.avatar}</div>
                      <h3 className="font-bold text-gray-800">{formData.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{formData.age} years old</p>
                      {formData.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {formData.interests.slice(0, 3).map(interestId => {
                            const interest = INTEREST_OPTIONS.find(i => i.id === interestId);
                            return interest ? (
                              <Badge key={interestId} variant="secondary" className="text-xs">
                                {interest.emoji} {interest.label}
                              </Badge>
                            ) : null;
                          })}
                          {formData.interests.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{formData.interests.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 pt-3 border-t border-purple-100 flex-shrink-0 bg-purple-50/50">
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onClose : handleBack}
              className="flex-1 h-10 rounded-lg border-purple-200 hover:bg-purple-50"
              disabled={isSubmitting}
            >
              {currentStep === 0 ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </>
              )}
            </Button>
            
            {currentStep === FORM_STEPS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name.trim()}
                className="flex-1 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Profile
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !formData.name.trim()) ||
                  (currentStep === 2 && formData.interests.length === 0)
                }
                className="flex-1 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick Add Child Button Component
export function QuickAddChildButton({ 
  onClick, 
  className = "",
  variant = "default" 
}: { 
  onClick: () => void;
  className?: string;
  variant?: "default" | "compact" | "floating";
}) {
  if (variant === "floating") {
    return (
      <Button
        onClick={onClick}
        className={cn(
          "fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110",
          className
        )}
        aria-label="Add new child profile"
      >
        <UserPlus className="w-6 h-6" />
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        onClick={onClick}
        size="sm"
        className={cn(
          "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white",
          className
        )}
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Add Child
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      className={cn(
        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
        className
      )}
    >
      <UserPlus className="w-4 h-4 mr-2" />
      Add Your First Child
    </Button>
  );
}
