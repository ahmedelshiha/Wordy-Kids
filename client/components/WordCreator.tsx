import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Save, 
  Volume2, 
  Image, 
  Sparkles,
  BookOpen,
  CheckCircle2,
  X,
  FileText,
  Target
} from 'lucide-react';
import { playSoundIfEnabled } from '@/lib/soundEffects';

interface WordData {
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  funFact: string;
  emoji: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

interface WordCreatorProps {
  onWordCreated: (word: WordData) => void;
  onClose: () => void;
}

const categories = [
  { value: 'animals', label: 'Animals', emoji: '🐾' },
  { value: 'food', label: 'Food', emoji: '🍎' },
  { value: 'nature', label: 'Nature', emoji: '🌳' },
  { value: 'science', label: 'Science', emoji: '🔬' },
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'general', label: 'General', emoji: '📚' },
  { value: 'emotions', label: 'Emotions', emoji: '😊' },
  { value: 'colors', label: 'Colors', emoji: '🌈' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { value: 'school', label: 'School', emoji: '🏫' }
];

const commonEmojis = [
  '📚', '🌟', '🎯', '💡', '🔍', '✨', '🎨', '🏆', '🌈', '🦋',
  '🌸', '🍎', '🎵', '🚀', '⭐', '💎', '🎊', '🌺', '🍋', '🎭'
];

const difficultyLevels = [
  { value: 'easy', label: 'Easy', color: 'bg-educational-green', description: 'Simple words for beginners' },
  { value: 'medium', label: 'Medium', color: 'bg-educational-orange', description: 'Intermediate vocabulary' },
  { value: 'hard', label: 'Hard', color: 'bg-educational-pink', description: 'Advanced or complex words' }
];

export const WordCreator: React.FC<WordCreatorProps> = ({
  onWordCreated,
  onClose
}) => {
  const [formData, setFormData] = useState<WordData>({
    word: '',
    pronunciation: '',
    definition: '',
    example: '',
    funFact: '',
    emoji: '📚',
    category: '',
    difficulty: 'easy',
    imageUrl: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof WordData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.word.trim()) errors.push('Word is required');
    if (!formData.definition.trim()) errors.push('Definition is required');
    if (!formData.category) errors.push('Category is required');
    if (formData.word.length > 50) errors.push('Word must be less than 50 characters');
    if (formData.definition.length < 10) errors.push('Definition must be at least 10 characters');
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const generateSuggestions = () => {
    setIsGenerating(true);
    playSoundIfEnabled.click();
    
    // Simulate AI generation with realistic delays
    setTimeout(() => {
      const word = formData.word.toLowerCase();
      
      // Generate pronunciation if empty
      if (!formData.pronunciation) {
        setFormData(prev => ({
          ...prev,
          pronunciation: `/${word.split('').map(c => c).join('')}/`
        }));
      }
      
      // Generate example if empty
      if (!formData.example && formData.definition) {
        const examples = [
          `The ${word} was amazing to see.`,
          `I learned about ${word} in school today.`,
          `Can you tell me more about ${word}?`,
          `The ${word} is very interesting.`
        ];
        setFormData(prev => ({
          ...prev,
          example: examples[Math.floor(Math.random() * examples.length)]
        }));
      }
      
      // Generate fun fact if empty
      if (!formData.funFact) {
        const facts = [
          `The word "${word}" has an interesting history!`,
          `Did you know that "${word}" comes from ancient languages?`,
          `"${word}" is related to many other words in English.`,
          `Scientists have discovered fascinating things about "${word}".`
        ];
        setFormData(prev => ({
          ...prev,
          funFact: facts[Math.floor(Math.random() * facts.length)]
        }));
      }
      
      setIsGenerating(false);
      playSoundIfEnabled.success();
    }, 2000);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onWordCreated(formData);
      playSoundIfEnabled.success();
      onClose();
    } else {
      playSoundIfEnabled.error();
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Basic Information</h3>
        <p className="text-slate-600">Let's start with the word and its meaning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="word">Word *</Label>
            <Input
              id="word"
              value={formData.word}
              onChange={(e) => handleInputChange('word', e.target.value)}
              placeholder="Enter the word..."
              className="text-lg font-semibold"
            />
          </div>

          <div>
            <Label htmlFor="pronunciation">Pronunciation</Label>
            <div className="flex gap-2">
              <Input
                id="pronunciation"
                value={formData.pronunciation}
                onChange={(e) => handleInputChange('pronunciation', e.target.value)}
                placeholder="/pronunciation/"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => playSoundIfEnabled.pronunciation()}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleInputChange('emoji', emoji)}
                  className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${
                    formData.emoji === emoji ? 'bg-educational-blue/20 ring-2 ring-educational-blue' : ''
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="definition">Definition *</Label>
            <Textarea
              id="definition"
              value={formData.definition}
              onChange={(e) => handleInputChange('definition', e.target.value)}
              placeholder="Write a clear, age-appropriate definition..."
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <span>{category.emoji}</span>
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => handleInputChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${level.color}`} />
                        <span>{level.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Examples & Fun Facts</h3>
        <p className="text-slate-600">Add context and interesting information</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="example">Example Sentence</Label>
          <Textarea
            id="example"
            value={formData.example}
            onChange={(e) => handleInputChange('example', e.target.value)}
            placeholder="Write a sentence showing how to use this word..."
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="funFact">Fun Fact</Label>
          <Textarea
            id="funFact"
            value={formData.funFact}
            onChange={(e) => handleInputChange('funFact', e.target.value)}
            placeholder="Share an interesting fact about this word..."
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="imageUrl">Image URL (Optional)</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl || ''}
            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <Card className="bg-educational-blue/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-educational-purple" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Need help with examples or fun facts? I can generate suggestions based on your word!
            </p>
            <Button
              onClick={generateSuggestions}
              disabled={!formData.word || isGenerating}
              className="bg-educational-purple text-white"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Preview Your Word</h3>
        <p className="text-slate-600">Review before saving</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">{formData.emoji}</div>
          <h2 className="text-3xl font-bold mb-2">{formData.word}</h2>
          {formData.pronunciation && (
            <p className="text-slate-600 mb-4">{formData.pronunciation}</p>
          )}
          <div className="flex justify-center gap-2 mb-4">
            <Badge className={`${difficultyLevels.find(l => l.value === formData.difficulty)?.color} text-white`}>
              {formData.difficulty}
            </Badge>
            <Badge variant="outline">
              {categories.find(c => c.value === formData.category)?.label}
            </Badge>
          </div>
          <div className="text-left space-y-3">
            <div>
              <h4 className="font-semibold text-sm text-slate-700">Definition:</h4>
              <p className="text-slate-800">{formData.definition}</p>
            </div>
            {formData.example && (
              <div>
                <h4 className="font-semibold text-sm text-slate-700">Example:</h4>
                <p className="text-slate-600 italic">"{formData.example}"</p>
              </div>
            )}
            {formData.funFact && (
              <div>
                <h4 className="font-semibold text-sm text-slate-700">Fun Fact:</h4>
                <p className="text-slate-600 text-sm">{formData.funFact}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-red-800">Please fix these issues:</span>
            </div>
            <ul className="text-sm text-red-700 list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-6 h-6 text-educational-blue" />
              Create New Word
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            {[
              { step: 1, label: 'Basic Info', icon: BookOpen },
              { step: 2, label: 'Details', icon: FileText },
              { step: 3, label: 'Preview', icon: Target }
            ].map(({ step, label, icon: Icon }) => (
              <div
                key={step}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all ${
                  currentStep === step
                    ? 'bg-educational-blue text-white'
                    : currentStep > step
                    ? 'bg-green-100 text-green-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {currentStep > step && <CheckCircle2 className="w-4 h-4" />}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderPreview()}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={currentStep === 1 && (!formData.word || !formData.definition || !formData.category)}
                  className="bg-educational-blue text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-educational-green text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Word
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
