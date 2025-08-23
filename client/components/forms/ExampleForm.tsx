// Comprehensive Example Form - Demonstrates all enhanced form features
// This form shows how to integrate all components and features together

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Enhanced form components
import { FormField } from './FormField';
import EnhancedInput from './EnhancedInput';
import EnhancedSelect from './EnhancedSelect';
import EnhancedCheckbox from './EnhancedCheckbox';
import EnhancedRadioGroup from './EnhancedRadioGroup';
import FormSection from './FormSection';
import FormActions from './FormActions';
import { useEnhancedForm } from './useEnhancedForm';
import { FormSchemas } from '@/lib/form-validation';

// Icons
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Star,
  GameController,
  BookOpen,
  Palette,
  Music,
  Trophy,
  Settings,
  Sparkles,
  Clock,
  Timer,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

// Mock data for demonstration
const interestOptions = [
  {
    value: 'animals',
    label: 'Animals',
    description: 'Learn about wildlife and pets',
    emoji: '🦁',
    category: 'Nature',
    difficulty: 'easy' as const,
    popular: true,
    points: 10,
  },
  {
    value: 'science',
    label: 'Science',
    description: 'Explore the wonders of science',
    emoji: '🔬',
    category: 'Education',
    difficulty: 'medium' as const,
    points: 15,
  },
  {
    value: 'art',
    label: 'Art & Creativity',
    description: 'Express yourself through art',
    emoji: '🎨',
    category: 'Creative',
    difficulty: 'easy' as const,
    points: 10,
  },
  {
    value: 'music',
    label: 'Music',
    description: 'Learn instruments and rhythm',
    emoji: '🎵',
    category: 'Creative',
    difficulty: 'medium' as const,
    points: 15,
  },
  {
    value: 'sports',
    label: 'Sports',
    description: 'Stay active and healthy',
    emoji: '⚽',
    category: 'Physical',
    difficulty: 'medium' as const,
    points: 15,
  },
  {
    value: 'reading',
    label: 'Reading',
    description: 'Discover amazing stories',
    emoji: '📚',
    category: 'Education',
    difficulty: 'easy' as const,
    recommended: true,
    points: 10,
  },
];

const learningStyleOptions = [
  {
    value: 'visual',
    label: 'Visual Learner',
    description: 'I learn best with pictures, diagrams, and colors',
    emoji: '👀',
    difficulty: 'easy' as const,
  },
  {
    value: 'auditory',
    label: 'Auditory Learner',
    description: 'I learn best by listening and discussing',
    emoji: '👂',
    difficulty: 'easy' as const,
  },
  {
    value: 'kinesthetic',
    label: 'Hands-on Learner',
    description: 'I learn best by doing and moving',
    emoji: '🤲',
    difficulty: 'medium' as const,
  },
  {
    value: 'mixed',
    label: 'Mixed Style',
    description: 'I like to learn in different ways',
    emoji: '🌈',
    difficulty: 'easy' as const,
    recommended: true,
  },
];

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner', emoji: '🌱' },
  { value: 'intermediate', label: 'Intermediate', emoji: '🌿' },
  { value: 'advanced', label: 'Advanced', emoji: '🌳' },
];

const reminderOptions = [
  { value: 'daily', label: 'Daily reminders', emoji: '📅' },
  { value: 'weekly', label: 'Weekly check-ins', emoji: '📊' },
  { value: 'monthly', label: 'Monthly progress', emoji: '📈' },
];

interface ExampleFormData {
  // Personal Information
  childName: string;
  age: number;
  parentEmail: string;
  phone: string;
  location: string;
  
  // Learning Preferences
  interests: string[];
  learningStyle: string;
  difficulty: string;
  sessionLength: number;
  
  // Settings
  soundEnabled: boolean;
  animationsEnabled: boolean;
  voiceEnabled: boolean;
  reminders: string[];
  
  // Parental Controls
  screenTimeLimit: number;
  contentFiltering: boolean;
  progressReports: boolean;
}

const initialValues: ExampleFormData = {
  childName: '',
  age: 6,
  parentEmail: '',
  phone: '',
  location: '',
  interests: [],
  learningStyle: '',
  difficulty: 'beginner',
  sessionLength: 15,
  soundEnabled: true,
  animationsEnabled: true,
  voiceEnabled: true,
  reminders: [],
  screenTimeLimit: 60,
  contentFiltering: true,
  progressReports: true,
};

export const ExampleForm: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState<'full' | 'components' | 'validation'>('full');
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Initialize form with enhanced features
  const form = useEnhancedForm(initialValues, {
    schema: FormSchemas.childRegistration,
    validationMode: 'onChange',
    validationDelay: 500,
    persistKey: 'demo-form',
    autoSave: true,
    autoSaveInterval: 10000,
    pointsSystem: true,
    trackTime: true,
    showProgress: true,
    steps: 4,
    stepValidation: true,
    announceErrors: true,
    pronunciationEnabled: true,
    onSubmit: async (data) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form submitted:', data);
      setSubmissionResult({
        success: true,
        data,
        message: '🎉 Registration complete! Welcome to Wordy Kids!',
      });
      
      toast.success('Registration successful!', {
        description: 'Welcome to your jungle learning adventure!',
      });
    },
    onFieldChange: (fieldName, value) => {
      console.log('Field changed:', fieldName, value);
    },
    onStepChange: (step) => {
      console.log('Step changed to:', step);
    },
  });

  const renderStepContent = () => {
    switch (form.formState.currentStep) {
      case 1:
        return (
          <FormSection
            title="👦 About the Young Explorer"
            description="Tell us about the amazing child who will be learning with us!"
            emoji="🌟"
            variant="card"
            theme="jungle"
            difficulty="easy"
            importance="critical"
            currentStep={1}
            totalSteps={4}
            showProgress
          >
            <div className="space-y-6">
              <EnhancedInput
                id="childName"
                label="Child's Name"
                placeholder="Enter your child's name"
                value={form.values.childName}
                onChange={(value) => form.setFieldValue('childName', value)}
                leftIcon={User}
                realTimeValidation
                pronounceLabel
                funMode
                theme="jungle"
                required
                hint="What should we call our brave jungle explorer?"
              />

              <EnhancedInput
                id="age"
                type="number"
                label="Age"
                placeholder="How old are they?"
                value={form.values.age}
                onChange={(value) => form.setFieldValue('age', parseInt(value) || 0)}
                leftIcon={Calendar}
                realTimeValidation
                theme="jungle"
                required
                hint="This helps us create age-appropriate adventures!"
              />

              <EnhancedInput
                id="parentEmail"
                type="email"
                label="Parent's Email"
                placeholder="your.email@example.com"
                value={form.values.parentEmail}
                onChange={(value) => form.setFieldValue('parentEmail', value)}
                leftIcon={Mail}
                realTimeValidation
                autoFormat="none"
                inputAssistance="auto"
                theme="jungle"
                required
                hint="We'll send you progress updates and important information"
              />

              <EnhancedInput
                id="phone"
                type="tel"
                label="Phone Number (Optional)"
                placeholder="(555) 123-4567"
                value={form.values.phone}
                onChange={(value) => form.setFieldValue('phone', value)}
                leftIcon={Phone}
                autoFormat="phone"
                realTimeValidation
                theme="jungle"
                hint="For urgent communication only"
              />
            </div>
          </FormSection>
        );

      case 2:
        return (
          <FormSection
            title="🎯 Learning Preferences"
            description="Help us customize the perfect learning experience!"
            emoji="🧠"
            variant="card"
            theme="jungle"
            difficulty="medium"
            importance="high"
            currentStep={2}
            totalSteps={4}
            showProgress
          >
            <div className="space-y-6">
              <EnhancedSelect
                id="interests"
                label="Learning Interests"
                placeholder="Choose what excites your child..."
                options={interestOptions}
                value={form.values.interests}
                onChange={(value) => form.setFieldValue('interests', value)}
                multiple
                searchable
                maxSelections={4}
                groupByCategory
                showPopularFirst
                pronounceOptions
                showDifficulty
                pointsSystem
                funAnimations
                enableFavorites
                gamification
                theme="jungle"
                required
                hint="Select up to 4 interests that spark curiosity!"
              />

              <EnhancedRadioGroup
                id="learningStyle"
                label="Learning Style"
                description="How does your child learn best?"
                options={learningStyleOptions}
                value={form.values.learningStyle}
                onChange={(value) => form.setFieldValue('learningStyle', value)}
                variant="cards"
                size="md"
                pronounceOptions
                showExplanations
                funAnimations
                colorTheme="jungle"
                theme="jungle"
                required
              />

              <EnhancedSelect
                id="difficulty"
                label="Starting Difficulty"
                placeholder="Choose starting level..."
                options={difficultyOptions}
                value={form.values.difficulty}
                onChange={(value) => form.setFieldValue('difficulty', value)}
                variant="default"
                theme="jungle"
                required
                hint="Don't worry, we'll adjust as your child progresses!"
              />
            </div>
          </FormSection>
        );

      case 3:
        return (
          <FormSection
            title="⚙️ App Settings"
            description="Customize the app experience for your child"
            emoji="🎛️"
            variant="card"
            theme="jungle"
            difficulty="easy"
            importance="medium"
            currentStep={3}
            totalSteps={4}
            showProgress
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EnhancedCheckbox
                  id="soundEnabled"
                  label="Sound Effects"
                  sublabel="Fun sounds and audio feedback"
                  emoji="🔊"
                  checked={form.values.soundEnabled}
                  onChange={(checked) => form.setFieldValue('soundEnabled', checked)}
                  variant="card"
                  size="md"
                  celebrationAnimation
                  successSound
                  funMode
                  theme="jungle"
                />

                <EnhancedCheckbox
                  id="animationsEnabled"
                  label="Animations"
                  sublabel="Engaging visual animations"
                  emoji="✨"
                  checked={form.values.animationsEnabled}
                  onChange={(checked) => form.setFieldValue('animationsEnabled', checked)}
                  variant="card"
                  size="md"
                  celebrationAnimation
                  funMode
                  theme="jungle"
                />

                <EnhancedCheckbox
                  id="voiceEnabled"
                  label="Voice Guidance"
                  sublabel="Spoken instructions and feedback"
                  emoji="🗣️"
                  checked={form.values.voiceEnabled}
                  onChange={(checked) => form.setFieldValue('voiceEnabled', checked)}
                  variant="card"
                  size="md"
                  celebrationAnimation
                  pronounceLabel
                  theme="jungle"
                />

                <EnhancedCheckbox
                  id="progressReports"
                  label="Progress Reports"
                  sublabel="Weekly learning summaries"
                  emoji="📊"
                  checked={form.values.progressReports}
                  onChange={(checked) => form.setFieldValue('progressReports', checked)}
                  variant="card"
                  size="md"
                  celebrationAnimation
                  theme="jungle"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-jungle-dark flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Session Settings
                </h4>

                <EnhancedInput
                  id="sessionLength"
                  type="number"
                  label="Session Length (minutes)"
                  placeholder="15"
                  value={form.values.sessionLength}
                  onChange={(value) => form.setFieldValue('sessionLength', parseInt(value) || 15)}
                  leftIcon={Clock}
                  theme="jungle"
                  hint="Recommended: 10-30 minutes for optimal learning"
                />

                <EnhancedInput
                  id="screenTimeLimit"
                  type="number"
                  label="Daily Screen Time Limit (minutes)"
                  placeholder="60"
                  value={form.values.screenTimeLimit}
                  onChange={(value) => form.setFieldValue('screenTimeLimit', parseInt(value) || 60)}
                  leftIcon={Timer}
                  theme="jungle"
                  hint="Healthy screen time for balanced development"
                />
              </div>
            </div>
          </FormSection>
        );

      case 4:
        return (
          <FormSection
            title="📋 Review & Confirm"
            description="Review your settings and complete registration"
            emoji="✅"
            variant="card"
            theme="jungle"
            difficulty="easy"
            importance="critical"
            currentStep={4}
            totalSteps={4}
            showProgress
            isComplete={form.formState.isValid && !form.formState.hasErrors}
          >
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-jungle/20 bg-jungle/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Child Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {form.values.childName || 'Not provided'}</div>
                    <div><strong>Age:</strong> {form.values.age} years old</div>
                    <div><strong>Parent Email:</strong> {form.values.parentEmail || 'Not provided'}</div>
                  </CardContent>
                </Card>

                <Card className="border-jungle/20 bg-jungle/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Learning Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Interests:</strong> {form.values.interests.length > 0 ? form.values.interests.join(', ') : 'None selected'}</div>
                    <div><strong>Learning Style:</strong> {form.values.learningStyle || 'Not selected'}</div>
                    <div><strong>Difficulty:</strong> {form.values.difficulty}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Points and Progress */}
              {form.formState.pointsEarned > 0 && (
                <motion.div
                  className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Registration Progress</h4>
                        <p className="text-sm text-yellow-700">
                          Great job completing the form!
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-200 text-yellow-800 font-bold">
                      {form.formState.pointsEarned} points earned!
                    </Badge>
                  </div>
                </motion.div>
              )}

              {/* Final confirmation */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900 mb-1">Ready to Start Learning!</h4>
                    <p className="text-blue-700">
                      By submitting this form, you're creating a personalized learning adventure for {form.values.childName || 'your child'}. 
                      Our jungle friends are excited to meet them! 🦁🌟
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FormSection>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-jungle-dark flex items-center justify-center gap-3">
            <span className="text-4xl">🌟</span>
            Enhanced Form System Demo
            <span className="text-4xl">🌟</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Experience all the enhanced form features in action!
          </p>
        </motion.div>

        {/* Demo Mode Selector */}
        <div className="flex justify-center gap-2">
          {[
            { key: 'full', label: 'Full Demo', emoji: '🚀' },
            { key: 'components', label: 'Components', emoji: '🧩' },
            { key: 'validation', label: 'Validation', emoji: '✅' },
          ].map((mode) => (
            <Button
              key={mode.key}
              variant={currentDemo === mode.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentDemo(mode.key as any)}
              className={cn(
                'transition-all duration-200',
                currentDemo === mode.key && 'bg-jungle text-white'
              )}
            >
              <span className="mr-2">{mode.emoji}</span>
              {mode.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Form Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-jungle">{form.formState.completionPercentage}%</div>
          <div className="text-sm text-gray-600">Complete</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-yellow-600">{form.formState.pointsEarned}</div>
          <div className="text-sm text-gray-600">Points</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">{Math.floor(form.formState.timeSpent / 60)}:{(form.formState.timeSpent % 60).toString().padStart(2, '0')}</div>
          <div className="text-sm text-gray-600">Time Spent</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">{form.formState.currentStep}/{form.formState.totalSteps}</div>
          <div className="text-sm text-gray-600">Step</div>
        </Card>
      </div>

      {/* Main Form */}
      <Card className="border-2 border-jungle/20">
        <CardContent className="p-6">
          {/* Step Content */}
          {renderStepContent()}

          {/* Form Actions */}
          <div className="mt-8">
            <FormActions
              onNext={form.formState.currentStep < form.formState.totalSteps ? form.nextStep : undefined}
              onPrevious={form.formState.currentStep > 1 ? form.previousStep : undefined}
              onSubmit={form.formState.currentStep === form.formState.totalSteps ? form.handleSubmit : undefined}
              canGoNext={form.canGoNext && form.formState.isValid}
              canGoPrevious={form.canGoPrevious}
              isSubmitting={form.formState.isSubmitting}
              isValid={form.formState.isValid}
              isDirty={form.formState.isDirty}
              hasErrors={form.formState.hasErrors}
              layout="spread"
              theme="jungle"
              showProgress
              currentStep={form.formState.currentStep}
              totalSteps={form.formState.totalSteps}
              pointsEarned={form.formState.pointsEarned}
              celebrateSuccess={form.formState.pointsEarned > 0}
              customActions={[
                {
                  id: 'help',
                  label: 'Get Help',
                  icon: HelpCircle,
                  onClick: () => form.requestHelp(),
                  variant: 'ghost',
                  tooltip: 'Need assistance? Click for help!',
                },
                {
                  id: 'reset',
                  label: 'Reset Form',
                  icon: RotateCcw,
                  onClick: form.reset,
                  variant: 'outline',
                  confirmMessage: 'Are you sure you want to reset the form? All progress will be lost.',
                  disabled: !form.formState.isDirty,
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submission Result */}
      {submissionResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center"
        >
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Success!</h3>
          <p className="text-green-700">{submissionResult.message}</p>
          <div className="mt-4 text-sm text-green-600">
            <strong>Total Points Earned:</strong> {form.formState.pointsEarned} points
          </div>
        </motion.div>
      )}

      {/* Debug Information (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8">
          <summary className="cursor-pointer font-medium text-gray-700 mb-4">
            🛠️ Debug Information (Development Only)
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Form Values</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(form.values, null, 2)}
                </pre>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Form State</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify({
                    isValid: form.formState.isValid,
                    hasErrors: form.formState.hasErrors,
                    isDirty: form.formState.isDirty,
                    currentStep: form.formState.currentStep,
                    pointsEarned: form.formState.pointsEarned,
                    completionPercentage: form.formState.completionPercentage,
                    errors: form.errors,
                  }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </details>
      )}
    </div>
  );
};

export default ExampleForm;
