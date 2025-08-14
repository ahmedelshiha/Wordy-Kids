import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Save,
  RefreshCw,
} from "lucide-react";
import { refreshWordDatabase } from "@/lib/cacheManager";
import { realTimeWordDB } from "@/lib/realTimeWordDatabase";

interface WordImportData {
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  funFact?: string;
  status: "valid" | "invalid" | "duplicate";
  errors: string[];
}

interface BulkWordImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<{ id: string; name: string; emoji: string }>;
  onImport: (words: WordImportData[]) => void;
}

const BulkWordImport: React.FC<BulkWordImportProps> = ({
  open,
  onOpenChange,
  categories,
  onImport,
}) => {
  const [step, setStep] = useState<"input" | "validate" | "review">("input");
  const [importData, setImportData] = useState("");
  const [defaultCategory, setDefaultCategory] = useState("");
  const [defaultDifficulty, setDefaultDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("easy");
  const [parsedWords, setParsedWords] = useState<WordImportData[]>([]);
  const [validationProgress, setValidationProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  const csvTemplate = `word,pronunciation,definition,example,category,difficulty,funFact
butterfly,/ˈbʌtərflaɪ/,A colorful insect with beautiful wings,Butterflies start as caterpillars,animals,medium,Butterflies taste with their feet!
rainbow,/ˈreɪnboʊ/,Colorful arc in the sky after rain,Rainbows have seven colors,nature,medium,You can never reach the end of a rainbow!
telescope,/ˈteləskoʊp/,An instrument for looking at distant objects,Astronomers use telescopes to study stars,objects,hard,The Hubble telescope can see 13 billion years into the past!`;

  const validateWords = async (data: string) => {
    setIsValidating(true);
    setValidationProgress(0);

    const lines = data.trim().split("\n");
    const words: WordImportData[] = [];

    // Skip header if it exists
    const startIndex = lines[0].toLowerCase().includes("word") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line
        .split(",")
        .map((part) => part.trim().replace(/^"|"$/g, ""));

      const wordData: WordImportData = {
        word: parts[0] || "",
        pronunciation: parts[1] || "",
        definition: parts[2] || "",
        example: parts[3] || "",
        category: parts[4] || defaultCategory,
        difficulty:
          (parts[5] as "easy" | "medium" | "hard") || defaultDifficulty,
        funFact: parts[6] || "",
        status: "valid",
        errors: [],
      };

      // Validation rules
      const errors: string[] = [];

      if (!wordData.word) errors.push("Word is required");
      if (!wordData.definition) errors.push("Definition is required");
      if (!wordData.example) errors.push("Example is required");
      if (!wordData.category) errors.push("Category is required");
      if (wordData.word && wordData.word.length < 2)
        errors.push("Word too short");
      if (wordData.definition && wordData.definition.length < 10)
        errors.push("Definition too short");
      if (wordData.example && wordData.example.length < 10)
        errors.push("Example too short");

      // Check for duplicates
      if (
        words.some((w) => w.word.toLowerCase() === wordData.word.toLowerCase())
      ) {
        errors.push("Duplicate word in this import");
      }

      wordData.errors = errors;
      wordData.status = errors.length > 0 ? "invalid" : "valid";

      words.push(wordData);

      // Update progress
      setValidationProgress(
        ((i - startIndex + 1) / (lines.length - startIndex)) * 100,
      );

      // Small delay to show progress
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    setParsedWords(words);
    setIsValidating(false);
    setValidationProgress(100);
    setStep("review");
  };

  const handleImport = () => {
    const validWords = parsedWords.filter((word) => word.status === "valid");
    onImport(validWords);

    // Trigger real-time database refresh
    refreshWordDatabase();
    realTimeWordDB.invalidateCaches();

    handleReset();
  };

  const handleReset = () => {
    setStep("input");
    setImportData("");
    setParsedWords([]);
    setValidationProgress(0);
    setIsValidating(false);
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "word_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validWords = parsedWords.filter((w) => w.status === "valid");
  const invalidWords = parsedWords.filter((w) => w.status === "invalid");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            Bulk Word Import
          </DialogTitle>
          <DialogDescription>
            Import multiple words at once using CSV format
          </DialogDescription>
        </DialogHeader>

        {step === "input" && (
          <div className="space-y-6">
            {/* Template Download */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Download our template to ensure your data is formatted
                  correctly, or paste your CSV data below.
                </p>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>
              </CardContent>
            </Card>

            {/* Default Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Default Settings</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Default Category</Label>
                  <Select
                    value={defaultCategory}
                    onValueChange={setDefaultCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default category" />
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
                  <Label>Default Difficulty</Label>
                  <Select
                    value={defaultDifficulty}
                    onValueChange={(value: any) => setDefaultDifficulty(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Data Input */}
            <div>
              <Label htmlFor="importData">Paste CSV Data</Label>
              <Textarea
                id="importData"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your CSV data here..."
                className="mt-2 min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
        )}

        {step === "validate" && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <RefreshCw
                  className={`w-12 h-12 mx-auto mb-4 text-blue-500 ${isValidating ? "animate-spin" : ""}`}
                />
                <h3 className="text-lg font-semibold mb-2">
                  Validating Words...
                </h3>
                <Progress value={validationProgress} className="mb-2" />
                <p className="text-sm text-slate-600">
                  {validationProgress.toFixed(0)}% complete
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {validWords.length}
                  </div>
                  <p className="text-sm text-slate-600">Valid Words</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">
                    {invalidWords.length}
                  </div>
                  <p className="text-sm text-slate-600">Invalid Words</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {parsedWords.length}
                  </div>
                  <p className="text-sm text-slate-600">Total Words</p>
                </CardContent>
              </Card>
            </div>

            {/* Error Summary */}
            {invalidWords.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  {invalidWords.length} words have validation errors and will
                  not be imported. Review the details below to fix the issues.
                </AlertDescription>
              </Alert>
            )}

            {/* Words Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Import Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {parsedWords.map((word, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        word.status === "valid"
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{word.word}</span>
                            <Badge
                              variant={
                                word.status === "valid"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {word.status}
                            </Badge>
                            <Badge variant="outline">{word.category}</Badge>
                            <Badge variant="outline">{word.difficulty}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {word.definition}
                          </p>
                          {word.errors.length > 0 && (
                            <div className="mt-2">
                              {word.errors.map((error, i) => (
                                <span
                                  key={i}
                                  className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded mr-1"
                                >
                                  {error}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          {step === "input" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setStep("validate");
                  validateWords(importData);
                }}
                disabled={!importData.trim() || !defaultCategory}
              >
                <Eye className="w-4 h-4 mr-2" />
                Validate Data
              </Button>
            </>
          )}

          {step === "validate" && (
            <Button variant="outline" onClick={handleReset}>
              Cancel Validation
            </Button>
          )}

          {step === "review" && (
            <>
              <Button variant="outline" onClick={handleReset}>
                Start Over
              </Button>
              <Button
                onClick={handleImport}
                disabled={validWords.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Import {validWords.length} Words
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkWordImport;
