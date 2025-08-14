import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
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
  Edit,
  Save,
  Volume2,
  Image as ImageIcon,
  Link,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  History,
  Users,
  TrendingUp,
  Upload,
  Download,
  Clock,
  Globe,
  Bookmark,
  Star,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Shield,
  Brain,
  Target,
  Lightbulb,
  Palette,
  Settings,
  HelpCircle,
  X,
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  RefreshCw,
  ExternalLink,
  FileText,
  Lock,
  Unlock,
  Database,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  Info,
  Music,
  Camera,
  Mic,
  Type,
  Hash,
  Tags,
  Layers,
  Package,
  Award,
  Flag,
  BookOpen,
  GraduationCap,
  PenTool,
  Sparkles,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
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
  modificationHistory?: Array<{
    id: string;
    action: "created" | "updated" | "approved" | "rejected";
    timestamp: Date;
    author: string;
    changes?: Record<string, any>;
  }>;
}

interface WordEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word: AdminWord | null;
  categories: Array<{ id: string; name: string; emoji: string }>;
  onSave: (word: AdminWord) => void;
  mode: "edit" | "create";
}

interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning" | "info";
}

const WordEditor: React.FC<WordEditorProps> = ({
  open,
  onOpenChange,
  word,
  categories,
  onSave,
  mode,
}) => {
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

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);

  // Tag input states
  const [newTag, setNewTag] = useState("");
  const [newSynonym, setNewSynonym] = useState("");
  const [newAntonym, setNewAntonym] = useState("");
  const [newRelatedWord, setNewRelatedWord] = useState("");

  // Advanced features
  const [suggestionMode, setSuggestionMode] = useState(false);
  const [aiAssistEnabled, setAiAssistEnabled] = useState(false);
  const [templateMode, setTemplateMode] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);
  const [audioRecording, setAudioRecording] = useState(false);

  // Refs for advanced features
  const originalFormData = useRef<Partial<AdminWord>>({});
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const formValidationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize form data and track changes
  useEffect(() => {
    if (word && mode === "edit") {
      const initialData = {
        ...word,
        tags: word.tags || [],
        synonyms: word.synonyms || [],
        antonyms: word.antonyms || [],
        relatedWords: word.relatedWords || [],
      };
      setFormData(initialData);
      originalFormData.current = initialData;
    } else if (mode === "create") {
      const initialData = {
        word: "",
        pronunciation: "",
        definition: "",
        example: "",
        category: "",
        difficulty: "easy" as const,
        funFact: "",
        emoji: "",
        imageUrl: "",
        audioUrl: "",
        tags: [],
        synonyms: [],
        antonyms: [],
        relatedWords: [],
        isActive: true,
      };
      setFormData(initialData);
      originalFormData.current = initialData;
    }
    setValidationErrors([]);
    setActiveTab("basic");
    setHasUnsavedChanges(false);
  }, [word, mode, open]);

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
    let total = requiredFields.length + optionalFields.length;

    requiredFields.forEach((field) => {
      if (formData[field as keyof typeof formData]) score += 2;
    });

    optionalFields.forEach((field) => {
      if (formData[field as keyof typeof formData]) score += 1;
    });

    // Bonus points for relationships
    if ((formData.tags?.length || 0) > 0) score += 1;
    if ((formData.synonyms?.length || 0) > 0) score += 1;
    if ((formData.antonyms?.length || 0) > 0) score += 1;
    if ((formData.relatedWords?.length || 0) > 0) score += 1;

    total += 4; // For relationships
    setCompletionScore(Math.min(100, Math.round((score / total) * 100)));
  }, [formData]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(originalFormData.current);
    setHasUnsavedChanges(hasChanges);
  }, [formData]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || mode === "create") return;

    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    autoSaveTimeout.current = setTimeout(() => {
      handleAutoSave();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [formData, autoSaveEnabled, hasUnsavedChanges, mode]);

  // Real-time validation
  useEffect(() => {
    if (formValidationTimeout.current) {
      clearTimeout(formValidationTimeout.current);
    }

    formValidationTimeout.current = setTimeout(() => {
      const errors = validateForm();
      setValidationErrors(errors);
    }, 500);

    return () => {
      if (formValidationTimeout.current) {
        clearTimeout(formValidationTimeout.current);
      }
    };
  }, [formData]);

  const handleAutoSave = useCallback(async () => {
    if (!word || mode !== "edit") return;

    try {
      setIsSaving(true);
      // Simulate auto-save API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      originalFormData.current = { ...formData };
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, word, mode]);

  const validateForm = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Required field validation
    if (!formData.word?.trim()) {
      errors.push({
        field: "word",
        message: "Word is required",
        severity: "error",
      });
    } else if (formData.word.length < 2) {
      errors.push({
        field: "word",
        message: "Word must be at least 2 characters long",
        severity: "error",
      });
    } else if (formData.word.length > 50) {
      errors.push({
        field: "word",
        message: "Word should be under 50 characters",
        severity: "warning",
      });
    }

    if (!formData.definition?.trim()) {
      errors.push({
        field: "definition",
        message: "Definition is required",
        severity: "error",
      });
    } else if (formData.definition.length < 10) {
      errors.push({
        field: "definition",
        message: "Definition should be at least 10 characters",
        severity: "error",
      });
    } else if (formData.definition.length > 500) {
      errors.push({
        field: "definition",
        message: "Definition is too long (max 500 characters)",
        severity: "warning",
      });
    }

    if (!formData.example?.trim()) {
      errors.push({
        field: "example",
        message: "Example sentence is required",
        severity: "error",
      });
    } else if (formData.example.length < 10) {
      errors.push({
        field: "example",
        message: "Example should be at least 10 characters",
        severity: "error",
      });
    } else if (
      !formData.example
        .toLowerCase()
        .includes(formData.word?.toLowerCase() || "")
    ) {
      errors.push({
        field: "example",
        message: "Example should include the word being defined",
        severity: "warning",
      });
    }

    if (!formData.category) {
      errors.push({
        field: "category",
        message: "Category is required",
        severity: "error",
      });
    }

    // URL validation
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      errors.push({
        field: "imageUrl",
        message: "Invalid image URL format",
        severity: "error",
      });
    }

    if (formData.audioUrl && !isValidUrl(formData.audioUrl)) {
      errors.push({
        field: "audioUrl",
        message: "Invalid audio URL format",
        severity: "error",
      });
    }

    // Pronunciation validation
    if (formData.pronunciation && formData.pronunciation.length > 100) {
      errors.push({
        field: "pronunciation",
        message: "Pronunciation should be under 100 characters",
        severity: "warning",
      });
    }

    // Content quality suggestions
    if (!formData.pronunciation?.trim()) {
      errors.push({
        field: "pronunciation",
        message: "Consider adding pronunciation for better learning",
        severity: "info",
      });
    }

    if (!formData.funFact?.trim()) {
      errors.push({
        field: "funFact",
        message: "Fun facts make learning more engaging",
        severity: "info",
      });
    }

    if (!formData.emoji?.trim()) {
      errors.push({
        field: "emoji",
        message: "Adding an emoji improves visual appeal",
        severity: "info",
      });
    }

    if ((formData.tags?.length || 0) === 0) {
      errors.push({
        field: "tags",
        message: "Tags help with organization and discovery",
        severity: "info",
      });
    }

    return errors;
  }, [formData]);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    const errors = validateForm().filter((e) => e.severity === "error");
    setValidationErrors(validateForm());

    if (errors.length === 0) {
      try {
        setIsSaving(true);

        const wordToSave: AdminWord = {
          id: word?.id || `word_${Date.now()}`,
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
          status: word?.status || "pending",
          submittedBy: word?.submittedBy,
          submittedAt: word?.submittedAt || new Date(),
          approvedBy: word?.approvedBy,
          approvedAt: word?.approvedAt,
          usageCount: word?.usageCount || 0,
          accuracy: word?.accuracy || 0,
          lastUsed: word?.lastUsed,
          tags: formData.tags || [],
          synonyms: formData.synonyms || [],
          antonyms: formData.antonyms || [],
          relatedWords: formData.relatedWords || [],
          isActive: formData.isActive ?? true,
          modificationHistory: [
            ...(word?.modificationHistory || []),
            {
              id: `mod_${Date.now()}`,
              action: mode === "create" ? "created" : "updated",
              timestamp: new Date(),
              author: "admin", // This should come from auth context
              changes: mode === "edit" ? getChanges() : undefined,
            },
          ],
        };

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        onSave(wordToSave);
        setHasUnsavedChanges(false);
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to save word:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getChanges = (): Record<string, any> => {
    const changes: Record<string, any> = {};
    const original = originalFormData.current;

    Object.keys(formData).forEach((key) => {
      const formKey = key as keyof typeof formData;
      if (
        JSON.stringify(formData[formKey]) !== JSON.stringify(original[formKey])
      ) {
        changes[key] = {
          from: original[formKey],
          to: formData[formKey],
        };
      }
    });

    return changes;
  };

  const addTag = useCallback(
    (
      type: "tags" | "synonyms" | "antonyms" | "relatedWords",
      value: string,
    ) => {
      if (!value.trim()) return;

      const currentArray = formData[type] || [];
      const trimmedValue = value.trim().toLowerCase();

      if (!currentArray.some((item) => item.toLowerCase() === trimmedValue)) {
        setFormData((prev) => ({
          ...prev,
          [type]: [...currentArray, value.trim()],
        }));
      }

      // Clear the input
      switch (type) {
        case "tags":
          setNewTag("");
          break;
        case "synonyms":
          setNewSynonym("");
          break;
        case "antonyms":
          setNewAntonym("");
          break;
        case "relatedWords":
          setNewRelatedWord("");
          break;
      }
    },
    [formData],
  );

  const removeTag = useCallback(
    (
      type: "tags" | "synonyms" | "antonyms" | "relatedWords",
      value: string,
    ) => {
      const currentArray = formData[type] || [];
      setFormData((prev) => ({
        ...prev,
        [type]: currentArray.filter((item) => item !== value),
      }));
    },
    [formData],
  );

  const duplicateWord = () => {
    const duplicatedData = {
      ...formData,
      word: `${formData.word} (Copy)`,
      id: undefined,
    };
    setFormData(duplicatedData);
    setHasUnsavedChanges(true);
  };

  const resetForm = () => {
    if (
      confirm(
        "Are you sure you want to reset all changes? This cannot be undone.",
      )
    ) {
      setFormData(originalFormData.current);
      setHasUnsavedChanges(false);
    }
  };

  const loadTemplate = (template: string) => {
    const templates = {
      noun: {
        word: "example",
        definition:
          "A thing representative of its kind or illustrating a general rule",
        example: "This painting is a perfect example of the artist's style",
        category: "General",
        difficulty: "medium" as const,
        tags: ["noun", "concept"],
      },
      verb: {
        word: "explain",
        definition: "To make something clear by describing it in detail",
        example: "The teacher will explain the math problem step by step",
        category: "Actions",
        difficulty: "easy" as const,
        tags: ["verb", "communication"],
      },
      adjective: {
        word: "magnificent",
        definition: "Extremely beautiful, elaborate, or impressive",
        example: "The magnificent castle stood high on the hill",
        category: "Descriptive",
        difficulty: "hard" as const,
        tags: ["adjective", "descriptive"],
      },
    };

    const templateData = templates[template as keyof typeof templates];
    if (templateData) {
      setFormData((prev) => ({ ...prev, ...templateData }));
    }
  };

  const generateSuggestions = () => {
    // Simulated AI suggestions based on current content
    const suggestions = {
      pronunciation: formData.word ? `/${formData.word.toUpperCase()}/` : "",
      funFact: "Did you know that this word has an interesting etymology?",
      tags: formData.category
        ? [formData.category.toLowerCase(), formData.difficulty]
        : [],
      emoji: "📚", // This would be generated based on the word/category
    };

    return suggestions;
  };

  const errorsByTab = {
    basic: validationErrors.filter((e) =>
      [
        "word",
        "pronunciation",
        "definition",
        "example",
        "category",
        "difficulty",
        "funFact",
        "emoji",
      ].includes(e.field),
    ),
    media: validationErrors.filter((e) =>
      ["imageUrl", "audioUrl"].includes(e.field),
    ),
    relationships: validationErrors.filter((e) =>
      ["tags", "synonyms", "antonyms", "relatedWords"].includes(e.field),
    ),
    analytics: [],
  };

  const getTabIcon = (tabName: string) => {
    const hasErrors = errorsByTab[tabName as keyof typeof errorsByTab].some(
      (e) => e.severity === "error",
    );
    const hasWarnings = errorsByTab[tabName as keyof typeof errorsByTab].some(
      (e) => e.severity === "warning",
    );

    if (hasErrors) return <XCircle className="w-4 h-4 text-red-500" />;
    if (hasWarnings)
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const renderTagInput = (
    type: "tags" | "synonyms" | "antonyms" | "relatedWords",
    label: string,
    value: string,
    setValue: (value: string) => void,
    placeholder: string,
    icon?: React.ReactNode,
    suggestions?: string[],
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
          <Badge variant="outline" className="text-xs">
            {(formData[type] || []).length}
          </Badge>
        </Label>
        {suggestions && suggestions.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <Lightbulb className="w-3 h-3 mr-1" />
                Suggestions
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="text-xs font-medium mb-2">
                Suggested {label.toLowerCase()}:
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 text-xs"
                    onClick={() => addTag(type, suggestion)}
                  >
                    {suggestion} <Plus className="w-2 h-2 ml-1" />
                  </Badge>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="pr-8"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(type, value);
              }
            }}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setValue("")}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => addTag(type, value)}
          disabled={!value.trim()}
          className="px-3"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {(formData[type] || []).map((item, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors group"
            onClick={() => removeTag(type, item)}
          >
            {item}
            <X className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
          </Badge>
        ))}
        {(formData[type] || []).length === 0 && (
          <div className="text-sm text-slate-400 italic">
            No {label.toLowerCase()} added yet
          </div>
        )}
      </div>
    </div>
  );

  const renderPreview = () => (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Eye className="w-5 h-5" />
          Word Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-6 bg-white rounded-lg border border-blue-200">
          <div className="text-4xl mb-2">{formData.emoji || "📚"}</div>
          <h3 className="text-2xl font-bold text-slate-800 capitalize mb-2">
            {formData.word || "Sample Word"}
          </h3>
          {formData.pronunciation && (
            <p className="text-slate-600 text-sm mb-2">
              /{formData.pronunciation}/
            </p>
          )}
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

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-slate-700">Definition:</h4>
            <p className="text-slate-600">
              {formData.definition || "Add a clear definition..."}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-slate-700">Example:</h4>
            <p className="text-slate-600 italic">
              "{formData.example || "Add an example sentence..."}"
            </p>
          </div>
          {formData.funFact && (
            <div>
              <h4 className="font-medium text-slate-700">Fun Fact:</h4>
              <p className="text-blue-600">💡 {formData.funFact}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${
          isFullscreen
            ? "max-w-[100vw] max-h-[100vh] w-full h-full m-0 rounded-none"
            : "max-w-6xl max-h-[95vh]"
        } overflow-hidden flex flex-col`}
      >
        <DialogHeader className="pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-500" />
                <DialogTitle>
                  {mode === "edit" ? "Edit Word" : "Create New Word"}
                </DialogTitle>
              </div>
              {hasUnsavedChanges && (
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-300"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
              {isSaving && (
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-300"
                >
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Saving...
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Completion Score */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 transition-all duration-500"
                        style={{ width: `${completionScore}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-600">
                      {completionScore}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Completion Score: {completionScore}%</p>
                </TooltipContent>
              </Tooltip>

              {/* Quick Actions */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview Word</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="h-8 w-8 p-0"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  </TooltipContent>
                </Tooltip>

                {mode === "edit" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={duplicateWord}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Duplicate Word</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      className="h-8 w-8 p-0"
                      disabled={!hasUnsavedChanges}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset Changes</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <DialogDescription className="flex items-center justify-between">
            <span>
              {mode === "edit"
                ? "Edit the details of this word entry"
                : "Add a new word to the vocabulary database"}
            </span>

            {lastSaved && (
              <span className="text-xs text-slate-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </DialogDescription>

          {/* Advanced Options Toggle */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={autoSaveEnabled}
                  onCheckedChange={setAutoSaveEnabled}
                  id="autosave"
                />
                <Label htmlFor="autosave" className="text-sm">
                  Auto-save
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={showAdvancedOptions}
                  onCheckedChange={setShowAdvancedOptions}
                  id="advanced"
                />
                <Label htmlFor="advanced" className="text-sm">
                  Advanced
                </Label>
              </div>
            </div>

            {showAdvancedOptions && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTemplateMode(!templateMode)}
                  className="h-7 px-2 text-xs"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Templates
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSuggestionMode(!suggestionMode)}
                  className="h-7 px-2 text-xs"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  AI Assist
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Validation Errors Summary */}
        {validationErrors.length > 0 && (
          <Alert
            className={`mb-4 ${
              validationErrors.some((e) => e.severity === "error")
                ? "border-red-200 bg-red-50"
                : validationErrors.some((e) => e.severity === "warning")
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-blue-200 bg-blue-50"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <div className="flex flex-wrap gap-2 mb-2">
                {validationErrors.filter((e) => e.severity === "error").length >
                  0 && (
                  <Badge variant="destructive" className="text-xs">
                    {
                      validationErrors.filter((e) => e.severity === "error")
                        .length
                    }{" "}
                    Errors
                  </Badge>
                )}
                {validationErrors.filter((e) => e.severity === "warning")
                  .length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-yellow-400 text-yellow-700"
                  >
                    {
                      validationErrors.filter((e) => e.severity === "warning")
                        .length
                    }{" "}
                    Warnings
                  </Badge>
                )}
                {validationErrors.filter((e) => e.severity === "info").length >
                  0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-400 text-blue-700"
                  >
                    {
                      validationErrors.filter((e) => e.severity === "info")
                        .length
                    }{" "}
                    Suggestions
                  </Badge>
                )}
              </div>

              <div className="space-y-1 max-h-20 overflow-y-auto">
                {validationErrors.slice(0, 3).map((error, index) => (
                  <div key={index} className="text-sm flex items-center gap-2">
                    {error.severity === "error" && (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    {error.severity === "warning" && (
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                    )}
                    {error.severity === "info" && (
                      <Info className="w-3 h-3 text-blue-500" />
                    )}
                    <span className="capitalize">{error.field}:</span>
                    <span>{error.message}</span>
                  </div>
                ))}
                {validationErrors.length > 3 && (
                  <div className="text-xs text-slate-500">
                    +{validationErrors.length - 3} more issues...
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Templates Panel */}
        {templateMode && (
          <Card className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-purple-800">Word Templates</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTemplateMode(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadTemplate("noun")}
                  className="text-xs"
                >
                  <Package className="w-3 h-3 mr-1" />
                  Noun Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadTemplate("verb")}
                  className="text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Verb Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadTemplate("adjective")}
                  className="text-xs"
                >
                  <Palette className="w-3 h-3 mr-1" />
                  Adjective Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex-1 overflow-hidden">
          {isPreviewMode ? (
            <div className="h-full overflow-y-auto p-4">{renderPreview()}</div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden md:inline">Basic Info</span>
                  <span className="md:hidden">Basic</span>
                  {getTabIcon("basic")}
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span className="hidden md:inline">Media</span>
                  <span className="md:hidden">Media</span>
                  {getTabIcon("media")}
                </TabsTrigger>
                <TabsTrigger
                  value="relationships"
                  className="flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span className="hidden md:inline">Relations</span>
                  <span className="md:hidden">Tags</span>
                  {getTabIcon("relationships")}
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden md:inline">Analytics</span>
                  <span className="md:hidden">Stats</span>
                  {getTabIcon("analytics")}
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="basic" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="word" className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Word *
                      </Label>
                      <Input
                        id="word"
                        value={formData.word || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            word: e.target.value,
                          }))
                        }
                        placeholder="Enter the word"
                        className={
                          validationErrors.some(
                            (e) => e.field === "word" && e.severity === "error",
                          )
                            ? "border-red-300 focus:border-red-500"
                            : ""
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="emoji"
                        className="flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Emoji
                      </Label>
                      <Input
                        id="emoji"
                        value={formData.emoji || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            emoji: e.target.value,
                          }))
                        }
                        placeholder="📚"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="pronunciation"
                      className="flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      Pronunciation
                    </Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="definition"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Definition *
                    </Label>
                    <Textarea
                      id="definition"
                      value={formData.definition || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          definition: e.target.value,
                        }))
                      }
                      placeholder="Clear and simple definition..."
                      rows={3}
                      className={
                        validationErrors.some(
                          (e) =>
                            e.field === "definition" && e.severity === "error",
                        )
                          ? "border-red-300 focus:border-red-500"
                          : ""
                      }
                    />
                    <div className="text-xs text-slate-500 text-right">
                      {formData.definition?.length || 0}/500 characters
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="example"
                      className="flex items-center gap-2"
                    >
                      <PenTool className="w-4 h-4" />
                      Example Sentence *
                    </Label>
                    <Textarea
                      id="example"
                      value={formData.example || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          example: e.target.value,
                        }))
                      }
                      placeholder="Example sentence using the word..."
                      rows={2}
                      className={
                        validationErrors.some(
                          (e) =>
                            e.field === "example" && e.severity === "error",
                        )
                          ? "border-red-300 focus:border-red-500"
                          : ""
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="category"
                        className="flex items-center gap-2"
                      >
                        <Layers className="w-4 h-4" />
                        Category *
                      </Label>
                      <Select
                        value={formData.category || ""}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                      >
                        <SelectTrigger
                          className={
                            validationErrors.some(
                              (e) =>
                                e.field === "category" &&
                                e.severity === "error",
                            )
                              ? "border-red-300 focus:border-red-500"
                              : ""
                          }
                        >
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
                      <Label
                        htmlFor="difficulty"
                        className="flex items-center gap-2"
                      >
                        <Target className="w-4 h-4" />
                        Difficulty Level *
                      </Label>
                      <Select
                        value={formData.difficulty || "easy"}
                        onValueChange={(value: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            difficulty: value,
                          }))
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

                  <div className="space-y-2">
                    <Label
                      htmlFor="funFact"
                      className="flex items-center gap-2"
                    >
                      <Lightbulb className="w-4 h-4" />
                      Fun Fact (Optional)
                    </Label>
                    <Textarea
                      id="funFact"
                      value={formData.funFact || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          funFact: e.target.value,
                        }))
                      }
                      placeholder="Interesting fact about this word..."
                      rows={2}
                    />
                  </div>

                  {showAdvancedOptions && (
                    <div className="border-t pt-4 space-y-4">
                      <h4 className="font-medium text-slate-700 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Advanced Options
                      </h4>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm">Word Status</Label>
                          <p className="text-xs text-slate-500">
                            Control if this word is active in the system
                          </p>
                        </div>
                        <Switch
                          checked={formData.isActive ?? true}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              isActive: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="media" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="imageUrl"
                        className="flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Image URL
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="imageUrl"
                          value={formData.imageUrl || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              imageUrl: e.target.value,
                            }))
                          }
                          placeholder="https://example.com/image.jpg"
                          className={
                            validationErrors.some(
                              (e) =>
                                e.field === "imageUrl" &&
                                e.severity === "error",
                            )
                              ? "border-red-300 focus:border-red-500"
                              : ""
                          }
                        />
                        {showAdvancedOptions && (
                          <Button variant="outline" size="sm" className="px-3">
                            <Upload className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {formData.imageUrl && (
                        <div className="mt-3">
                          <img
                            src={formData.imageUrl}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="audioUrl"
                        className="flex items-center gap-2"
                      >
                        <Volume2 className="w-4 h-4" />
                        Audio URL
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="audioUrl"
                          value={formData.audioUrl || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              audioUrl: e.target.value,
                            }))
                          }
                          placeholder="https://example.com/audio.mp3"
                          className={
                            validationErrors.some(
                              (e) =>
                                e.field === "audioUrl" &&
                                e.severity === "error",
                            )
                              ? "border-red-300 focus:border-red-500"
                              : ""
                          }
                        />
                        {showAdvancedOptions && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-3"
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-3"
                              onClick={() => setAudioRecording(!audioRecording)}
                            >
                              <Mic className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                      {formData.audioUrl && (
                        <div className="mt-3">
                          <audio controls className="w-full max-w-md">
                            <source src={formData.audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}

                      {audioRecording && (
                        <Alert className="bg-red-50 border-red-200">
                          <Mic className="w-4 h-4" />
                          <AlertDescription>
                            <div className="flex items-center justify-between">
                              <span>Recording audio... 0:23</span>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Pause className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {mediaUploadProgress > 0 && mediaUploadProgress < 100 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading media...</span>
                          <span>{mediaUploadProgress}%</span>
                        </div>
                        <Progress value={mediaUploadProgress} className="h-2" />
                      </div>
                    )}
                  </div>

                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>
                          Ensure media URLs are publicly accessible and
                          appropriate for children. Images should be clear and
                          relevant to the word meaning.
                        </p>
                        {showAdvancedOptions && (
                          <div className="text-xs text-slate-500">
                            <p>
                              • Supported image formats: JPG, PNG, WebP, SVG
                            </p>
                            <p>• Supported audio formats: MP3, OGG, WAV</p>
                            <p>
                              • Maximum file size: 10MB for images, 5MB for
                              audio
                            </p>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="relationships" className="space-y-6 mt-0">
                  {renderTagInput(
                    "tags",
                    "Tags",
                    newTag,
                    setNewTag,
                    "Add descriptive tags...",
                    <Tags className="w-4 h-4" />,
                    suggestionMode
                      ? ["educational", "vocabulary", "learning"]
                      : undefined,
                  )}

                  <Separator />

                  {renderTagInput(
                    "synonyms",
                    "Synonyms",
                    newSynonym,
                    setNewSynonym,
                    "Add words with similar meaning...",
                    <ArrowRight className="w-4 h-4" />,
                    suggestionMode && formData.word
                      ? [formData.word + "-like", "similar"]
                      : undefined,
                  )}

                  <Separator />

                  {renderTagInput(
                    "antonyms",
                    "Antonyms",
                    newAntonym,
                    setNewAntonym,
                    "Add words with opposite meaning...",
                    <ArrowLeft className="w-4 h-4" />,
                  )}

                  <Separator />

                  {renderTagInput(
                    "relatedWords",
                    "Related Words",
                    newRelatedWord,
                    setNewRelatedWord,
                    "Add related vocabulary...",
                    <Layers className="w-4 h-4" />,
                  )}

                  {suggestionMode && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <Brain className="w-4 h-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">
                            AI Suggestions for "{formData.word}":
                          </p>
                          <div className="space-y-1 text-sm">
                            <p>
                              • Consider adding tags: category-specific,
                              difficulty-based
                            </p>
                            <p>
                              • Synonyms might include: similar words in meaning
                            </p>
                            <p>
                              • Look for antonyms: words with opposite meaning
                            </p>
                            <p>
                              • Related words: words in the same semantic field
                            </p>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6 mt-0">
                  {mode === "edit" && word && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-600">
                              {word.usageCount.toLocaleString()}
                            </div>
                            <p className="text-sm text-slate-600">Times Used</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-600">
                              {word.accuracy}%
                            </div>
                            <p className="text-sm text-slate-600">
                              Accuracy Rate
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-purple-600">
                              {word.lastUsed
                                ? Math.floor(
                                    (Date.now() - word.lastUsed.getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  )
                                : 0}
                            </div>
                            <p className="text-sm text-slate-600">
                              Days Since Last Used
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {showAdvancedOptions && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-sm">
                                <PieChart className="w-4 h-4" />
                                Usage Breakdown
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Games</span>
                                <span className="text-sm font-medium">65%</span>
                              </div>
                              <Progress value={65} className="h-2" />
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Quizzes</span>
                                <span className="text-sm font-medium">25%</span>
                              </div>
                              <Progress value={25} className="h-2" />
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Practice</span>
                                <span className="text-sm font-medium">10%</span>
                              </div>
                              <Progress value={10} className="h-2" />
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-sm">
                                <LineChart className="w-4 h-4" />
                                Performance Trend
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>This Week</span>
                                  <Badge
                                    variant="outline"
                                    className="text-green-600"
                                  >
                                    +5%
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>This Month</span>
                                  <Badge
                                    variant="outline"
                                    className="text-green-600"
                                  >
                                    +12%
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>All Time</span>
                                  <Badge variant="outline">
                                    {word.accuracy}%
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Modification History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mode === "edit" && word?.modificationHistory ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {word.modificationHistory.map((entry, index) => (
                            <div
                              key={entry.id}
                              className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                            >
                              <div className="flex-shrink-0 mt-1">
                                {entry.action === "created" && (
                                  <Plus className="w-4 h-4 text-blue-500" />
                                )}
                                {entry.action === "updated" && (
                                  <Edit className="w-4 h-4 text-green-500" />
                                )}
                                {entry.action === "approved" && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                {entry.action === "rejected" && (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm capitalize">
                                    {entry.action === "created" &&
                                      "Word Created"}
                                    {entry.action === "updated" &&
                                      "Word Updated"}
                                    {entry.action === "approved" &&
                                      "Word Approved"}
                                    {entry.action === "rejected" &&
                                      "Word Rejected"}
                                  </p>
                                  <span className="text-xs text-slate-500">
                                    {entry.timestamp.toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                  by {entry.author}
                                </p>
                                {entry.changes && showAdvancedOptions && (
                                  <details className="mt-2">
                                    <summary className="text-xs text-blue-600 cursor-pointer">
                                      View Changes
                                    </summary>
                                    <div className="mt-1 p-2 bg-white rounded text-xs">
                                      <pre className="whitespace-pre-wrap">
                                        {JSON.stringify(entry.changes, null, 2)}
                                      </pre>
                                    </div>
                                  </details>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">
                            {mode === "create"
                              ? "Word history will be available after creation."
                              : "No modification history available."}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>

        <DialogFooter className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-xs text-orange-600">
                  You have unsaved changes
                </span>
              )}
              {lastSaved && (
                <span className="text-xs text-slate-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>

              {mode === "edit" && showAdvancedOptions && (
                <Button
                  variant="outline"
                  onClick={duplicateWord}
                  className="hidden md:flex"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
              )}

              <Button
                onClick={handleSave}
                disabled={
                  isSaving ||
                  validationErrors.some((e) => e.severity === "error")
                }
                className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === "edit" ? "Save Changes" : "Create Word"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WordEditor;
