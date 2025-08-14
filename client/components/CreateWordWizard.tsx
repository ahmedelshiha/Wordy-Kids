import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Wand2,
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Zap,
  Brain,
  Target,
  BookOpen,
  Type,
  FileText,
  Volume2,
  Image as ImageIcon,
  Tags,
  Layers,
  Plus,
  X,
  Search,
  Filter,
  Globe,
  Clock,
  Star,
  Award,
  Palette,
  Music,
  Camera,
  Mic,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Settings,
  HelpCircle,
  Eye,
  PenTool,
  Package,
  Hash,
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  Flag,
  Shield,
  Lock,
  Unlock,
  Database,
  ExternalLink,
  Copy,
  Bookmark,
  Heart,
  ThumbsUp,
  Coffee,
  Rocket,
  Crown,
  Gift,
  Flame,
  Rainbow,
  Sun,
  Moon,
  Cloud,
  Mountain,
  Leaf,
  Flower,
  Cat,
  Dog,
  Fish,
  Bird,
  Butterfly,
  Apple,
  Cake,
  Car,
  Home,
  Book,
  Ball,
  Plane,
  Ship,
  Train,
  Bike,
} from "lucide-react";

interface AdminWord {
  id: string;
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  funFact?: string;
  emoji?: string;
  imageUrl?: string;
  audioUrl?: string;
  status: "approved" | "pending" | "rejected";
  submittedBy?: string;
  submittedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  usageCount: number;
  accuracy: number;
  lastUsed?: Date;
  tags?: string[];
  synonyms?: string[];
  antonyms?: string[];
  relatedWords?: string[];
  isActive: boolean;
}

interface WordTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  structure: {
    word: string;
    pronunciation?: string;
    definition: string;
    example: string;
    funFact?: string;
    emoji?: string;
    tags?: string[];
  };
  color: string;
}

interface CreateWordWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<{ id: string; name: string; emoji: string }>;
  onSave: (word: AdminWord) => void;
  existingWords?: AdminWord[];
}

const WORD_TEMPLATES: WordTemplate[] = [
  {
    id: "animal",
    name: "Animal",
    description: "Living creatures and wildlife",
    icon: <Cat className="w-5 h-5" />,
    category: "Animals",
    difficulty: "easy",
    structure: {
      word: "elephant",
      pronunciation: "EL-uh-fant",
      definition: "A large gray mammal with a long trunk and big ears",
      example: "The elephant used its trunk to pick up peanuts.",
      funFact: "Elephants can remember other elephants for decades!",
      emoji: "🐘",
      tags: ["mammal", "large", "wildlife", "africa", "asia"],
    },
    color: "from-green-400 to-green-600",
  },
  {
    id: "action",
    name: "Action Verb",
    description: "Action words and movements",
    icon: <Zap className="w-5 h-5" />,
    category: "Actions",
    difficulty: "medium",
    structure: {
      word: "jumping",
      pronunciation: "JUMP-ing",
      definition: "Moving up from the ground using your legs",
      example: "The frog is jumping from lily pad to lily pad.",
      funFact: "Some animals can jump 20 times their body height!",
      emoji: "🦘",
      tags: ["verb", "movement", "action", "exercise"],
    },
    color: "from-blue-400 to-blue-600",
  },
  {
    id: "feeling",
    name: "Emotion",
    description: "Feelings and emotions",
    icon: <Heart className="w-5 h-5" />,
    category: "Feelings",
    difficulty: "medium",
    structure: {
      word: "happy",
      pronunciation: "HAP-ee",
      definition: "Feeling good, joyful, or pleased about something",
      example: "She felt happy when she saw her birthday cake.",
      funFact: "Smiling can actually make you feel happier!",
      emoji: "😊",
      tags: ["emotion", "positive", "feeling", "mood"],
    },
    color: "from-pink-400 to-pink-600",
  },
  {
    id: "object",
    name: "Everyday Object",
    description: "Common things we use daily",
    icon: <Package className="w-5 h-5" />,
    category: "Objects",
    difficulty: "easy",
    structure: {
      word: "chair",
      pronunciation: "CHAIR",
      definition: "A piece of furniture for sitting on",
      example: "Please sit down on the red chair.",
      funFact: "The first chairs were used by ancient Egyptians!",
      emoji: "🪑",
      tags: ["furniture", "home", "sitting", "everyday"],
    },
    color: "from-purple-400 to-purple-600",
  },
  {
    id: "nature",
    name: "Nature",
    description: "Natural world and environment",
    icon: <Leaf className="w-5 h-5" />,
    category: "Nature",
    difficulty: "easy",
    structure: {
      word: "rainbow",
      pronunciation: "RAIN-bow",
      definition: "A colorful arc in the sky after rain",
      example: "We saw a beautiful rainbow after the storm.",
      funFact:
        "Rainbows have seven main colors: red, orange, yellow, green, blue, indigo, violet!",
      emoji: "🌈",
      tags: ["weather", "colors", "sky", "beautiful"],
    },
    color: "from-emerald-400 to-emerald-600",
  },
  {
    id: "food",
    name: "Food",
    description: "Delicious foods and cooking",
    icon: <Apple className="w-5 h-5" />,
    category: "Food",
    difficulty: "easy",
    structure: {
      word: "pizza",
      pronunciation: "PEET-zah",
      definition: "A round flat bread with cheese and toppings",
      example: "We ordered a pepperoni pizza for dinner.",
      funFact: "Pizza was invented in Italy over 1,000 years ago!",
      emoji: "🍕",
      tags: ["food", "italian", "cheese", "delicious"],
    },
    color: "from-orange-400 to-orange-600",
  },
  {
    id: "science",
    name: "Science",
    description: "Scientific concepts and discoveries",
    icon: <Brain className="w-5 h-5" />,
    category: "Science",
    difficulty: "hard",
    structure: {
      word: "gravity",
      pronunciation: "GRAV-ih-tee",
      definition: "The force that pulls things toward the Earth",
      example: "Gravity makes the apple fall from the tree.",
      funFact: "Gravity is weaker on the Moon than on Earth!",
      emoji: "🍎",
      tags: ["physics", "force", "earth", "science"],
    },
    color: "from-indigo-400 to-indigo-600",
  },
  {
    id: "transport",
    name: "Transportation",
    description: "Ways to travel and move around",
    icon: <Car className="w-5 h-5" />,
    category: "Transportation",
    difficulty: "easy",
    structure: {
      word: "bicycle",
      pronunciation: "BY-sih-kul",
      definition: "A vehicle with two wheels that you pedal with your feet",
      example: "I ride my bicycle to school every morning.",
      funFact: "The first bicycle was invented in 1817!",
      emoji: "🚲",
      tags: ["vehicle", "exercise", "eco-friendly", "two-wheels"],
    },
    color: "from-cyan-400 to-cyan-600",
  },
];

const SMART_SUGGESTIONS = {
  emojis: {
    animals: ["🐘", "🦁", "🐸", "🦋", "🐝", "🐢", "🦘", "🦉", "🐧", "🦒"],
    actions: ["⚡", "🏃", "🤸", "🕺", "🎯", "⚽", "🏊", "🚴", "🧗", "🤹"],
    feelings: ["😊", "😢", "😮", "🤔", "😴", "😡", "😍", "🤗", "😎", "🥳"],
    objects: ["📚", "🪑", "🏠", "🚗", "📱", "✏️", "🎒", "👕", "👟", "⚽"],
    nature: ["🌈", "🌸", "🌊", "⛰️", "🌙", "☀️", "❄️", "🍃", "🌺", "🦋"],
    food: ["🍕", "🍎", "🥖", "🧁", "🥕", "🍓", "🥪", "🍝", "🥗", "🍯"],
    science: ["🔬", "🧪", "⚗️", "🔭", "🧬", "⚛️", "🌡️", "💡", "🔋", "🧲"],
    transport: ["🚲", "🚗", "✈️", "🚢", "🚂", "🚌", "🛵", "🛸", "🚁", "⛵"],
  },
  pronunciations: {
    patterns: [
      { pattern: /tion$/, replacement: "-shun" },
      { pattern: /ing$/, replacement: "-ing" },
      { pattern: /ed$/, replacement: "-ed" },
      { pattern: /ly$/, replacement: "-lee" },
      { pattern: /ough/, replacement: "-uff" },
      { pattern: /ph/, replacement: "f" },
      { pattern: /gh/, replacement: "" },
    ],
  },
  funFacts: {
    templates: [
      "Did you know that [WORD] comes from the [LANGUAGE] word '[ORIGIN]'?",
      "[WORD] is one of the most commonly used words in English!",
      "The word [WORD] has been around for over [NUMBER] years!",
      "In some cultures, [WORD] is considered very important.",
      "Scientists have discovered amazing things about [WORD]!",
    ],
  },
};

const CreateWordWizard: React.FC<CreateWordWizardProps> = ({
  open,
  onOpenChange,
  categories,
  onSave,
  existingWords = [],
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<WordTemplate | null>(
    null,
  );
  const [useTemplate, setUseTemplate] = useState(true);
  const [smartAssistEnabled, setSmartAssistEnabled] = useState(true);
  const [guidedMode, setGuidedMode] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState<Partial<AdminWord>>({
    word: "",
    pronunciation: "",
    definition: "",
    example: "",
    category: "",
    difficulty: "easy",
    funFact: "",
    emoji: "",
    imageUrl: "",
    audioUrl: "",
    tags: [],
    synonyms: [],
    antonyms: [],
    relatedWords: [],
    isActive: true,
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [completionScore, setCompletionScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState({
    emojis: [] as string[],
    pronunciation: "",
    funFact: "",
    tags: [] as string[],
    relatedWords: [] as string[],
  });

  // Tag inputs
  const [newTag, setNewTag] = useState("");
  const [newSynonym, setNewSynonym] = useState("");
  const [newAntonym, setNewAntonym] = useState("");
  const [newRelatedWord, setNewRelatedWord] = useState("");

  // Advanced features
  const [duplicateCheck, setDuplicateCheck] = useState<AdminWord[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [autoFillProgress, setAutoFillProgress] = useState(0);

  const autoFillTimeout = useRef<NodeJS.Timeout | null>(null);

  const steps = [
    { id: 1, title: "Choose Template", icon: <Wand2 className="w-4 h-4" /> },
    { id: 2, title: "Basic Info", icon: <Type className="w-4 h-4" /> },
    { id: 3, title: "Details", icon: <FileText className="w-4 h-4" /> },
    { id: 4, title: "Enrich", icon: <Sparkles className="w-4 h-4" /> },
    { id: 5, title: "Review", icon: <CheckCircle className="w-4 h-4" /> },
  ];

  // Calculate completion score
  useEffect(() => {
    const requiredFields = ["word", "definition", "example", "category"];
    const optionalFields = [
      "pronunciation",
      "funFact",
      "emoji",
      "imageUrl",
      "audioUrl",
    ];

    let score = 0;
    let total = requiredFields.length * 2 + optionalFields.length;

    requiredFields.forEach((field) => {
      if (formData[field as keyof typeof formData]) score += 2;
    });

    optionalFields.forEach((field) => {
      if (formData[field as keyof typeof formData]) score += 1;
    });

    // Bonus for relationships
    if ((formData.tags?.length || 0) > 0) score += 1;
    if ((formData.synonyms?.length || 0) > 0) score += 1;
    if ((formData.antonyms?.length || 0) > 0) score += 1;
    if ((formData.relatedWords?.length || 0) > 0) score += 1;

    total += 4;
    setCompletionScore(Math.min(100, Math.round((score / total) * 100)));
  }, [formData]);

  // Smart suggestions based on current word
  useEffect(() => {
    if (!smartAssistEnabled || !formData.word) return;

    const word = formData.word.toLowerCase();
    const category = formData.category?.toLowerCase() || "";

    // Generate suggestions
    const newSuggestions = {
      emojis: generateEmojiSuggestions(word, category),
      pronunciation: generatePronunciationSuggestion(word),
      funFact: generateFunFactSuggestion(word),
      tags: generateTagSuggestions(word, category),
      relatedWords: generateRelatedWordSuggestions(word, category),
    };

    setSuggestions(newSuggestions);
  }, [formData.word, formData.category, smartAssistEnabled]);

  // Check for duplicates
  useEffect(() => {
    if (!formData.word) {
      setDuplicateCheck([]);
      return;
    }

    const word = formData.word.toLowerCase();
    const duplicates = existingWords.filter(
      (w) =>
        w.word.toLowerCase().includes(word) ||
        word.includes(w.word.toLowerCase()),
    );
    setDuplicateCheck(duplicates);
  }, [formData.word, existingWords]);

  // Auto-fill with smart suggestions
  useEffect(() => {
    if (!smartAssistEnabled || currentStep < 3) return;

    if (autoFillTimeout.current) {
      clearTimeout(autoFillTimeout.current);
    }

    autoFillTimeout.current = setTimeout(() => {
      if (suggestions.pronunciation && !formData.pronunciation) {
        setFormData((prev) => ({
          ...prev,
          pronunciation: suggestions.pronunciation,
        }));
        setAutoFillProgress(25);
      }

      setTimeout(() => {
        if (suggestions.emojis.length > 0 && !formData.emoji) {
          setFormData((prev) => ({ ...prev, emoji: suggestions.emojis[0] }));
          setAutoFillProgress(50);
        }
      }, 500);

      setTimeout(() => {
        if (suggestions.funFact && !formData.funFact) {
          setFormData((prev) => ({ ...prev, funFact: suggestions.funFact }));
          setAutoFillProgress(75);
        }
      }, 1000);

      setTimeout(() => {
        if (suggestions.tags.length > 0 && (formData.tags?.length || 0) === 0) {
          setFormData((prev) => ({
            ...prev,
            tags: suggestions.tags.slice(0, 3),
          }));
          setAutoFillProgress(100);
        }
      }, 1500);

      setTimeout(() => setAutoFillProgress(0), 3000);
    }, 2000);

    return () => {
      if (autoFillTimeout.current) {
        clearTimeout(autoFillTimeout.current);
      }
    };
  }, [suggestions, formData.word, smartAssistEnabled, currentStep]);

  const generateEmojiSuggestions = (
    word: string,
    category: string,
  ): string[] => {
    const categoryEmojis =
      SMART_SUGGESTIONS.emojis[
        category as keyof typeof SMART_SUGGESTIONS.emojis
      ] || [];
    const wordSpecific = getWordSpecificEmojis(word);
    return [...new Set([...wordSpecific, ...categoryEmojis])].slice(0, 5);
  };

  const getWordSpecificEmojis = (word: string): string[] => {
    const emojiMap: Record<string, string[]> = {
      // Animals
      cat: ["🐱", "🐈", "😺"],
      dog: ["🐶", "🐕", "🦮"],
      fish: ["🐟", "🐠", "🎣"],
      bird: ["🐦", "🕊️", "🦅"],
      butterfly: ["🦋", "🌸"],
      bee: ["🐝", "🍯"],
      // Food
      apple: ["🍎", "🍏", "🌳"],
      pizza: ["🍕", "🇮🇹"],
      cake: ["🎂", "🧁", "🎉"],
      // Transport
      car: ["🚗", "🚙", "🛣️"],
      plane: ["✈️", "🛩️", "🌍"],
      bike: ["🚲", "🚴"],
      // Nature
      sun: ["☀️", "🌞", "🌅"],
      moon: ["🌙", "🌛", "⭐"],
      tree: ["🌳", "🌲", "🍃"],
      // Objects
      book: ["📚", "📖", "📝"],
      phone: ["📱", "☎️", "📞"],
      home: ["🏠", "🏡", "🏘️"],
    };

    return emojiMap[word.toLowerCase()] || [];
  };

  const generatePronunciationSuggestion = (word: string): string => {
    let pronunciation = word.toUpperCase();

    SMART_SUGGESTIONS.pronunciations.patterns.forEach(
      ({ pattern, replacement }) => {
        pronunciation = pronunciation.replace(pattern, replacement);
      },
    );

    // Add stress markers for longer words
    if (word.length > 6) {
      const syllableCount = word.match(/[aeiou]/gi)?.length || 1;
      if (syllableCount > 2) {
        const mid = Math.floor(pronunciation.length / 2);
        pronunciation =
          pronunciation.slice(0, mid) + "-" + pronunciation.slice(mid);
      }
    }

    return pronunciation;
  };

  const generateFunFactSuggestion = (word: string): string => {
    const templates = SMART_SUGGESTIONS.funFacts.templates;
    const randomTemplate =
      templates[Math.floor(Math.random() * templates.length)];

    return randomTemplate
      .replace(/\[WORD\]/g, word)
      .replace(
        /\[LANGUAGE\]/g,
        ["Latin", "Greek", "French", "German"][Math.floor(Math.random() * 4)],
      )
      .replace(/\[ORIGIN\]/g, word + "us")
      .replace(/\[NUMBER\]/g, String(Math.floor(Math.random() * 500) + 100));
  };

  const generateTagSuggestions = (word: string, category: string): string[] => {
    const baseTags = [category.toLowerCase(), formData.difficulty || "easy"];
    const wordLength = word.length;

    if (wordLength <= 4) baseTags.push("short");
    else if (wordLength >= 8) baseTags.push("long");

    if (word.includes("ing")) baseTags.push("verb", "action");
    if (word.includes("ed")) baseTags.push("past-tense");
    if (word.includes("ly")) baseTags.push("adverb");

    return [...new Set(baseTags)];
  };

  const generateRelatedWordSuggestions = (
    word: string,
    category: string,
  ): string[] => {
    // This would ideally use a real word association API
    const categoryWords: Record<string, string[]> = {
      animals: ["habitat", "species", "wildlife", "nature", "forest"],
      food: ["cooking", "eating", "kitchen", "recipe", "delicious"],
      transport: ["travel", "journey", "vehicle", "road", "destination"],
      actions: ["movement", "activity", "exercise", "motion", "energy"],
      feelings: ["emotion", "mood", "expression", "heart", "mind"],
    };

    return (
      categoryWords[category.toLowerCase()] || [
        "learning",
        "education",
        "vocabulary",
      ]
    );
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.word?.trim()) errors.push("Word is required");
    if (!formData.definition?.trim()) errors.push("Definition is required");
    if (!formData.example?.trim()) errors.push("Example is required");
    if (!formData.category) errors.push("Category is required");

    if (formData.word && formData.word.length < 2) {
      errors.push("Word must be at least 2 characters");
    }

    if (formData.definition && formData.definition.length < 10) {
      errors.push("Definition should be more descriptive");
    }

    if (
      formData.example &&
      !formData.example
        .toLowerCase()
        .includes(formData.word?.toLowerCase() || "")
    ) {
      errors.push("Example should include the word");
    }

    return errors;
  };

  const handleTemplateSelect = (template: WordTemplate) => {
    setSelectedTemplate(template);
    if (useTemplate) {
      setFormData((prev) => ({
        ...prev,
        ...template.structure,
        category: template.category,
        difficulty: template.difficulty,
      }));
    }
    if (guidedMode) {
      setCurrentStep(2);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    const errors = validateForm();
    setValidationErrors(errors);

    if (errors.length === 0) {
      try {
        setIsSaving(true);

        const newWord: AdminWord = {
          id: `word_${Date.now()}`,
          word: formData.word!.trim(),
          pronunciation: formData.pronunciation?.trim() || "",
          definition: formData.definition!.trim(),
          example: formData.example!.trim(),
          category: formData.category!,
          difficulty: formData.difficulty!,
          funFact: formData.funFact?.trim(),
          emoji: formData.emoji?.trim(),
          imageUrl: formData.imageUrl?.trim(),
          audioUrl: formData.audioUrl?.trim(),
          status: "pending",
          submittedAt: new Date(),
          usageCount: 0,
          accuracy: 0,
          tags: formData.tags || [],
          synonyms: formData.synonyms || [],
          antonyms: formData.antonyms || [],
          relatedWords: formData.relatedWords || [],
          isActive: formData.isActive ?? true,
        };

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        onSave(newWord);
        onOpenChange(false);

        // Reset form
        setFormData({
          word: "",
          pronunciation: "",
          definition: "",
          example: "",
          category: "",
          difficulty: "easy",
          funFact: "",
          emoji: "",
          imageUrl: "",
          audioUrl: "",
          tags: [],
          synonyms: [],
          antonyms: [],
          relatedWords: [],
          isActive: true,
        });
        setCurrentStep(1);
        setSelectedTemplate(null);
      } catch (error) {
        console.error("Failed to create word:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const addTag = (
    type: "tags" | "synonyms" | "antonyms" | "relatedWords",
    value: string,
  ) => {
    if (!value.trim()) return;

    const currentArray = formData[type] || [];
    if (!currentArray.includes(value.trim())) {
      setFormData((prev) => ({
        ...prev,
        [type]: [...currentArray, value.trim()],
      }));
    }

    // Clear input
    if (type === "tags") setNewTag("");
    else if (type === "synonyms") setNewSynonym("");
    else if (type === "antonyms") setNewAntonym("");
    else if (type === "relatedWords") setNewRelatedWord("");
  };

  const removeTag = (
    type: "tags" | "synonyms" | "antonyms" | "relatedWords",
    value: string,
  ) => {
    const currentArray = formData[type] || [];
    setFormData((prev) => ({
      ...prev,
      [type]: currentArray.filter((item) => item !== value),
    }));
  };

  const applySuggestion = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep === step.id
                ? "bg-blue-600 text-white"
                : currentStep > step.id
                  ? "bg-green-600 text-white"
                  : "bg-slate-200 text-slate-600"
            }`}
          >
            {currentStep > step.id ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              step.icon
            )}
          </div>
          <span
            className={`ml-2 text-sm font-medium hidden md:inline ${
              currentStep === step.id ? "text-blue-600" : "text-slate-600"
            }`}
          >
            {step.title}
          </span>
          {index < steps.length - 1 && (
            <div className="w-8 md:w-16 h-0.5 bg-slate-200 mx-2 md:mx-4" />
          )}
        </div>
      ))}
    </div>
  );

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Choose a Starting Point
        </h3>
        <p className="text-slate-600">
          Select a template to get started quickly, or skip to start from
          scratch
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={useTemplate}
            onCheckedChange={setUseTemplate}
            id="use-template"
          />
          <Label htmlFor="use-template" className="text-sm">
            Use Template
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={smartAssistEnabled}
            onCheckedChange={setSmartAssistEnabled}
            id="smart-assist"
          />
          <Label htmlFor="smart-assist" className="text-sm">
            Smart Assist
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={guidedMode}
            onCheckedChange={setGuidedMode}
            id="guided-mode"
          />
          <Label htmlFor="guided-mode" className="text-sm">
            Guided Mode
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {WORD_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplate?.id === template.id
                ? "ring-2 ring-blue-500 shadow-lg"
                : "hover:shadow-md"
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <CardContent className="p-4">
              <div
                className={`w-full h-24 bg-gradient-to-br ${template.color} rounded-lg mb-3 flex items-center justify-center text-white`}
              >
                {template.icon}
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">
                {template.name}
              </h4>
              <p className="text-xs text-slate-600 mb-2">
                {template.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
                <Badge
                  className={
                    template.difficulty === "easy"
                      ? "bg-green-100 text-green-800"
                      : template.difficulty === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {template.difficulty}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedTemplate(null);
            setCurrentStep(2);
          }}
        >
          Skip Templates - Start Fresh
        </Button>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Basic Information
        </h3>
        <p className="text-slate-600">
          Enter the core details for your new word
        </p>
      </div>

      {/* Duplicate Check Alert */}
      {duplicateCheck.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Similar words found:</p>
              <div className="flex flex-wrap gap-2">
                {duplicateCheck.slice(0, 3).map((word, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {word.word}
                  </Badge>
                ))}
                {duplicateCheck.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{duplicateCheck.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="word" className="text-sm font-medium">
            Word *
          </Label>
          <Input
            id="word"
            value={formData.word || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, word: e.target.value }))
            }
            placeholder="Enter the word"
            className="text-lg"
          />
          {smartAssistEnabled && formData.word && (
            <p className="text-xs text-slate-500">
              💡 {formData.word.length} characters,{" "}
              {
                formData.word
                  .split("")
                  .filter((c) => "aeiou".includes(c.toLowerCase())).length
              }{" "}
              vowels
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emoji" className="text-sm font-medium">
            Emoji
          </Label>
          <div className="flex gap-2">
            <Input
              id="emoji"
              value={formData.emoji || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, emoji: e.target.value }))
              }
              placeholder="📚"
              className="w-16 text-center text-lg"
              maxLength={2}
            />
            {smartAssistEnabled && suggestions.emojis.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="text-xs font-medium mb-2">
                    Suggested emojis:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {suggestions.emojis.map((emoji, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-lg"
                        onClick={() => applySuggestion("emoji", emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pronunciation" className="text-sm font-medium">
          Pronunciation
        </Label>
        <div className="flex gap-2">
          <Input
            id="pronunciation"
            value={formData.pronunciation || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pronunciation: e.target.value,
              }))
            }
            placeholder="/pronunciation/"
          />
          {smartAssistEnabled && suggestions.pronunciation && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                applySuggestion("pronunciation", suggestions.pronunciation)
              }
            >
              <Wand2 className="w-4 h-4 mr-1" />
              Suggest
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Category *
          </Label>
          <Select
            value={formData.category || ""}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.emoji} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty" className="text-sm font-medium">
            Difficulty *
          </Label>
          <Select
            value={formData.difficulty || "easy"}
            onValueChange={(value: any) =>
              setFormData((prev) => ({ ...prev, difficulty: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">🟢 Easy</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="hard">🔴 Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Definition & Examples
        </h3>
        <p className="text-slate-600">
          Provide clear explanations and usage examples
        </p>
      </div>

      {autoFillProgress > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Brain className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Smart Assistant is filling details...
                </span>
                <span className="text-sm">{autoFillProgress}%</span>
              </div>
              <Progress value={autoFillProgress} className="h-2" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="definition" className="text-sm font-medium">
          Definition *
        </Label>
        <Textarea
          id="definition"
          value={formData.definition || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, definition: e.target.value }))
          }
          placeholder="Clear and simple definition..."
          rows={3}
        />
        <div className="text-xs text-slate-500 text-right">
          {formData.definition?.length || 0}/500 characters
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="example" className="text-sm font-medium">
          Example Sentence *
        </Label>
        <Textarea
          id="example"
          value={formData.example || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, example: e.target.value }))
          }
          placeholder="Example sentence using the word..."
          rows={2}
        />
        {formData.word &&
          formData.example &&
          !formData.example
            .toLowerCase()
            .includes(formData.word.toLowerCase()) && (
            <p className="text-xs text-orange-600">
              💡 Consider including "{formData.word}" in your example
            </p>
          )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="funFact" className="text-sm font-medium">
          Fun Fact (Optional)
        </Label>
        <div className="flex gap-2">
          <Textarea
            id="funFact"
            value={formData.funFact || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, funFact: e.target.value }))
            }
            placeholder="Interesting fact about this word..."
            rows={2}
          />
          {smartAssistEnabled && suggestions.funFact && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => applySuggestion("funFact", suggestions.funFact)}
              className="self-start mt-1"
            >
              <Lightbulb className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderEnrichment = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Enrich Your Word
        </h3>
        <p className="text-slate-600">
          Add relationships and multimedia to enhance learning
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Tags className="w-4 h-4" />
          Tags
        </Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tags..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag("tags", newTag);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addTag("tags", newTag)}
            disabled={!newTag.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {smartAssistEnabled && suggestions.tags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Suggested tags:</p>
            <div className="flex flex-wrap gap-1">
              {suggestions.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 text-xs"
                  onClick={() => addTag("tags", tag)}
                >
                  {tag} <Plus className="w-2 h-2 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {(formData.tags || []).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-red-100 hover:text-red-700"
              onClick={() => removeTag("tags", tag)}
            >
              {tag} <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Media */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="imageUrl"
            className="text-sm font-medium flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Image URL
          </Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
            }
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="audioUrl"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Audio URL
          </Label>
          <Input
            id="audioUrl"
            value={formData.audioUrl || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, audioUrl: e.target.value }))
            }
            placeholder="https://example.com/audio.mp3"
          />
        </div>
      </div>

      {/* Relationships */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Synonyms</Label>
          <div className="flex gap-2">
            <Input
              value={newSynonym}
              onChange={(e) => setNewSynonym(e.target.value)}
              placeholder="Similar words..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag("synonyms", newSynonym);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag("synonyms", newSynonym)}
              disabled={!newSynonym.trim()}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {(formData.synonyms || []).map((synonym, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-red-50 text-xs"
                onClick={() => removeTag("synonyms", synonym)}
              >
                {synonym} <X className="w-2 h-2 ml-1" />
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Antonyms</Label>
          <div className="flex gap-2">
            <Input
              value={newAntonym}
              onChange={(e) => setNewAntonym(e.target.value)}
              placeholder="Opposite words..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag("antonyms", newAntonym);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag("antonyms", newAntonym)}
              disabled={!newAntonym.trim()}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {(formData.antonyms || []).map((antonym, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-red-50 text-xs"
                onClick={() => removeTag("antonyms", antonym)}
              >
                {antonym} <X className="w-2 h-2 ml-1" />
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Related Words</Label>
          <div className="flex gap-2">
            <Input
              value={newRelatedWord}
              onChange={(e) => setNewRelatedWord(e.target.value)}
              placeholder="Related words..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag("relatedWords", newRelatedWord);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag("relatedWords", newRelatedWord)}
              disabled={!newRelatedWord.trim()}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {(formData.relatedWords || []).map((word, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-red-50 text-xs"
                onClick={() => removeTag("relatedWords", word)}
              >
                {word} <X className="w-2 h-2 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Review Your Word
        </h3>
        <p className="text-slate-600">Double-check everything before saving</p>
      </div>

      {/* Completion Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-800">Completion Score</h4>
            <Badge
              className={
                completionScore >= 80
                  ? "bg-green-100 text-green-800"
                  : completionScore >= 60
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }
            >
              {completionScore}%
            </Badge>
          </div>
          <Progress value={completionScore} className="h-3" />
          <p className="text-sm text-blue-600 mt-2">
            {completionScore >= 80
              ? "Excellent! Your word is comprehensive."
              : completionScore >= 60
                ? "Good! Consider adding more details."
                : "Needs more information for a complete entry."}
          </p>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium text-red-800">
                Please fix these issues:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Word Preview */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{formData.emoji || "📚"}</div>
            <h3 className="text-2xl font-bold text-slate-800 capitalize">
              {formData.word || "Your Word"}
            </h3>
            {formData.pronunciation && (
              <p className="text-slate-600">/{formData.pronunciation}/</p>
            )}
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="outline">📁 {formData.category}</Badge>
              <Badge
                className={
                  formData.difficulty === "easy"
                    ? "bg-green-100 text-green-800"
                    : formData.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }
              >
                {formData.difficulty === "easy"
                  ? "🌟"
                  : formData.difficulty === "medium"
                    ? "⭐"
                    : "🔥"}
                {formData.difficulty}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <div>
              <h4 className="font-medium text-slate-700 mb-1">Definition:</h4>
              <p className="text-slate-600">
                {formData.definition || "No definition provided"}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-slate-700 mb-1">Example:</h4>
              <p className="text-slate-600 italic">
                "{formData.example || "No example provided"}"
              </p>
            </div>
            {formData.funFact && (
              <div>
                <h4 className="font-medium text-slate-700 mb-1">Fun Fact:</h4>
                <p className="text-blue-600">💡 {formData.funFact}</p>
              </div>
            )}

            {(formData.tags?.length || 0) > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 mb-1">Tags:</h4>
                <div className="flex flex-wrap gap-1">
                  {formData.tags!.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-blue-600">
              {formData.word?.length || 0}
            </div>
            <p className="text-xs text-slate-600">Characters</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-green-600">
              {(formData.tags?.length || 0) +
                (formData.synonyms?.length || 0) +
                (formData.antonyms?.length || 0)}
            </div>
            <p className="text-xs text-slate-600">Relationships</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-purple-600">
              {(formData.imageUrl ? 1 : 0) + (formData.audioUrl ? 1 : 0)}
            </div>
            <p className="text-xs text-slate-600">Media Files</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-orange-600">
              {completionScore}%
            </div>
            <p className="text-xs text-slate-600">Complete</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderTemplateSelection();
      case 2:
        return renderBasicInfo();
      case 3:
        return renderDetails();
      case 4:
        return renderEnrichment();
      case 5:
        return renderReview();
      default:
        return renderTemplateSelection();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-500" />
            Create New Word
            {selectedTemplate && (
              <Badge variant="outline" className="ml-2">
                {selectedTemplate.name} Template
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Use our guided wizard to create comprehensive word entries with
            smart assistance
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2">
          {renderStepIndicator()}
          {renderCurrentStep()}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {completionScore > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 transition-all"
                      style={{ width: `${completionScore}%` }}
                    />
                  </div>
                  <span className="text-slate-600">{completionScore}%</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>

              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}

              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    currentStep === 2 && (!formData.word || !formData.category)
                  }
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={isSaving || validationErrors.length > 0}
                  className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Word
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWordWizard;
