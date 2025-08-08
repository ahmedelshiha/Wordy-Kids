import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  imageUrl?: string;
  audioUrl?: string;
  status: "approved" | "pending" | "rejected";
  submittedBy?: string;
  submittedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  usageCount: number;
  accuracy: number;
  tags?: string[];
  synonyms?: string[];
  antonyms?: string[];
  relatedWords?: string[];
}

interface WordEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word: AdminWord | null;
  categories: Array<{ id: string; name: string; emoji: string }>;
  onSave: (word: AdminWord) => void;
  mode: "edit" | "create";
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
    imageUrl: "",
    audioUrl: "",
    tags: [],
    synonyms: [],
    antonyms: [],
    relatedWords: [],
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [newTag, setNewTag] = useState("");
  const [newSynonym, setNewSynonym] = useState("");
  const [newAntonym, setNewAntonym] = useState("");
  const [newRelatedWord, setNewRelatedWord] = useState("");

  useEffect(() => {
    if (word && mode === "edit") {
      setFormData({
        ...word,
        tags: word.tags || [],
        synonyms: word.synonyms || [],
        antonyms: word.antonyms || [],
        relatedWords: word.relatedWords || [],
      });
    } else if (mode === "create") {
      setFormData({
        word: "",
        pronunciation: "",
        definition: "",
        example: "",
        category: "",
        difficulty: "easy",
        funFact: "",
        imageUrl: "",
        audioUrl: "",
        tags: [],
        synonyms: [],
        antonyms: [],
        relatedWords: [],
      });
    }
    setValidationErrors([]);
    setActiveTab("basic");
  }, [word, mode, open]);

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.word?.trim()) errors.push("Word is required");
    if (!formData.definition?.trim()) errors.push("Definition is required");
    if (!formData.example?.trim()) errors.push("Example is required");
    if (!formData.category) errors.push("Category is required");

    if (formData.word && formData.word.length < 2) {
      errors.push("Word must be at least 2 characters long");
    }

    if (formData.definition && formData.definition.length < 10) {
      errors.push("Definition must be at least 10 characters long");
    }

    if (formData.example && formData.example.length < 10) {
      errors.push("Example must be at least 10 characters long");
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      errors.push("Image URL is not valid");
    }

    if (formData.audioUrl && !isValidUrl(formData.audioUrl)) {
      errors.push("Audio URL is not valid");
    }

    return errors;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    const errors = validateForm();
    setValidationErrors(errors);

    if (errors.length === 0) {
      const wordToSave: AdminWord = {
        id: word?.id || `word_${Date.now()}`,
        word: formData.word!,
        pronunciation: formData.pronunciation || "",
        definition: formData.definition!,
        example: formData.example!,
        category: formData.category!,
        difficulty: formData.difficulty!,
        funFact: formData.funFact,
        imageUrl: formData.imageUrl,
        audioUrl: formData.audioUrl,
        status: word?.status || "pending",
        submittedBy: word?.submittedBy,
        submittedAt: word?.submittedAt || new Date(),
        approvedBy: word?.approvedBy,
        approvedAt: word?.approvedAt,
        usageCount: word?.usageCount || 0,
        accuracy: word?.accuracy || 0,
        tags: formData.tags,
        synonyms: formData.synonyms,
        antonyms: formData.antonyms,
        relatedWords: formData.relatedWords,
      };

      onSave(wordToSave);
      onOpenChange(false);
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

  const renderTagInput = (
    type: "tags" | "synonyms" | "antonyms" | "relatedWords",
    label: string,
    value: string,
    setValue: (value: string) => void,
    placeholder: string,
  ) => (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 mt-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(type, value);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => addTag(type, value)}
          disabled={!value.trim()}
        >
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {(formData[type] || []).map((item, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="cursor-pointer hover:bg-red-100 hover:text-red-700"
            onClick={() => removeTag(type, item)}
          >
            {item} ×
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-500" />
            {mode === "edit" ? "Edit Word" : "Create New Word"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Edit the details of this word entry"
              : "Add a new word to the vocabulary database"}
          </DialogDescription>
        </DialogHeader>

        {validationErrors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-red-700">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="media">Media & Audio</TabsTrigger>
            <TabsTrigger value="relationships">Word Relations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="word">Word *</Label>
                <Input
                  id="word"
                  value={formData.word || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, word: e.target.value }))
                  }
                  placeholder="Enter the word"
                />
              </div>
              <div>
                <Label htmlFor="pronunciation">Pronunciation</Label>
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
            </div>

            <div>
              <Label htmlFor="definition">Definition *</Label>
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
              />
            </div>

            <div>
              <Label htmlFor="example">Example Sentence *</Label>
              <Textarea
                id="example"
                value={formData.example || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, example: e.target.value }))
                }
                placeholder="Example sentence using the word..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
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
              <div>
                <Label htmlFor="difficulty">Difficulty Level *</Label>
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

            <div>
              <Label htmlFor="funFact">Fun Fact (Optional)</Label>
              <Textarea
                id="funFact"
                value={formData.funFact || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, funFact: e.target.value }))
                }
                placeholder="Interesting fact about this word..."
                rows={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <div>
              <Label htmlFor="imageUrl" className="flex items-center gap-2">
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
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="audioUrl" className="flex items-center gap-2">
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
              {formData.audioUrl && (
                <div className="mt-2">
                  <audio controls className="w-full">
                    <source src={formData.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>

            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Ensure media URLs are publicly accessible and appropriate for
                children. Images should be clear and relevant to the word
                meaning.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-4">
            {renderTagInput(
              "tags",
              "Tags",
              newTag,
              setNewTag,
              "Add descriptive tags...",
            )}
            <Separator />
            {renderTagInput(
              "synonyms",
              "Synonyms",
              newSynonym,
              setNewSynonym,
              "Add words with similar meaning...",
            )}
            <Separator />
            {renderTagInput(
              "antonyms",
              "Antonyms",
              newAntonym,
              setNewAntonym,
              "Add words with opposite meaning...",
            )}
            <Separator />
            {renderTagInput(
              "relatedWords",
              "Related Words",
              newRelatedWord,
              setNewRelatedWord,
              "Add related vocabulary...",
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {mode === "edit" && word && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {word.usageCount}
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
                    <p className="text-sm text-slate-600">Accuracy Rate</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Word History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mode === "edit" && word ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Word Created</p>
                        <p className="text-sm text-slate-600">
                          {word.submittedAt.toLocaleDateString()} by{" "}
                          {word.submittedBy || "System"}
                        </p>
                      </div>
                    </div>
                    {word.approvedAt && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">Word Approved</p>
                          <p className="text-sm text-slate-600">
                            {word.approvedAt.toLocaleDateString()} by{" "}
                            {word.approvedBy || "Admin"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-600">
                    Word history will be available after creation.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {mode === "edit" ? "Save Changes" : "Create Word"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WordEditor;
