import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Eye,
  CheckCircle2,
  XCircle,
  Volume2,
  Lightbulb,
  Star,
  ArrowRight,
} from "lucide-react";
import { playSoundIfEnabled } from "@/lib/soundEffects";
import { audioService } from "@/lib/audioService";

interface ReadingPassage {
  id: string;
  title: string;
  text: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  readingTime: number; // in minutes
  vocabularyWords: Array<{
    word: string;
    definition: string;
    context: string;
  }>;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    type: "vocabulary" | "comprehension" | "inference";
  }>;
}

interface ReadingComprehensionProps {
  passage: ReadingPassage;
  onComplete: (score: number, totalQuestions: number) => void;
}

const samplePassage: ReadingPassage = {
  id: "butterfly-garden",
  title: "The Magical Butterfly Garden",
  text: `In a small village, there lived a girl named Maya who discovered a magnificent butterfly garden hidden behind her grandmother's house. The garden was filled with vibrant flowers of every color imaginable - brilliant red roses, sunny yellow daffodils, and deep purple violets.

As Maya explored the garden, she noticed hundreds of butterflies dancing among the flowers. Each butterfly was unique and beautiful. Some had orange and black wings like tiny pieces of stained glass, while others shimmered with blue and green colors that seemed to change in the sunlight.

Maya observed that the butterflies were not just pretty to look at - they were working hard! They moved from flower to flower, collecting sweet nectar and helping the plants by carrying pollen. This process, called pollination, helps flowers create new seeds so more beautiful plants can grow.

The most amazing discovery came when Maya found a chrysalis hanging from a tree branch. She watched patiently over several days as a caterpillar transformed into a magnificent butterfly. This incredible change, called metamorphosis, showed Maya that even the most ordinary-looking creatures can become something extraordinary.

From that day on, Maya visited the garden every morning, learning something new about these wonderful insects and the important role they play in nature.`,
  difficulty: "medium",
  category: "nature",
  readingTime: 3,
  vocabularyWords: [
    {
      word: "magnificent",
      definition: "extremely beautiful, impressive, or grand",
      context: "discovered a magnificent butterfly garden",
    },
    {
      word: "vibrant",
      definition: "bright and striking in color",
      context: "filled with vibrant flowers of every color",
    },
    {
      word: "metamorphosis",
      definition: "the process of transformation from one form to another",
      context: "This incredible change, called metamorphosis",
    },
    {
      word: "pollination",
      definition: "the transfer of pollen from one flower to another",
      context: "This process, called pollination, helps flowers",
    },
  ],
  questions: [
    {
      id: "q1",
      question: "Where did Maya discover the butterfly garden?",
      options: [
        "In the village square",
        "Behind her grandmother's house",
        "In the school playground",
        "At the local park",
      ],
      correctAnswer: "Behind her grandmother's house",
      explanation:
        'The text states that Maya "discovered a magnificent butterfly garden hidden behind her grandmother\'s house."',
      type: "comprehension",
    },
    {
      id: "q2",
      question: 'What does "pollination" mean in the story?',
      options: [
        "Butterflies eating flowers",
        "Flowers changing colors",
        "Carrying pollen to help flowers create seeds",
        "Butterflies sleeping on flowers",
      ],
      correctAnswer: "Carrying pollen to help flowers create seeds",
      explanation:
        'The passage explains that pollination "helps flowers create new seeds so more beautiful plants can grow."',
      type: "vocabulary",
    },
    {
      id: "q3",
      question: "What can we infer about Maya's personality from the story?",
      options: [
        "She is impatient and restless",
        "She is curious and observant",
        "She is afraid of insects",
        "She prefers staying indoors",
      ],
      correctAnswer: "She is curious and observant",
      explanation:
        "Maya explores the garden, observes the butterflies carefully, and watches the chrysalis patiently, showing her curious and observant nature.",
      type: "inference",
    },
    {
      id: "q4",
      question: 'What does "metamorphosis" describe in the passage?',
      options: [
        "The butterfly flying away",
        "The flowers changing colors",
        "A caterpillar transforming into a butterfly",
        "Maya growing taller",
      ],
      correctAnswer: "A caterpillar transforming into a butterfly",
      explanation:
        'The passage describes metamorphosis as the "incredible change" Maya observed when "a caterpillar transformed into a magnificent butterfly."',
      type: "vocabulary",
    },
  ],
};

export const ReadingComprehension: React.FC<ReadingComprehensionProps> = ({
  passage = samplePassage,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<
    "vocabulary" | "reading" | "questions"
  >("vocabulary");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [highlightedWords, setHighlightedWords] = useState<Set<string>>(
    new Set(),
  );

  const currentQuestion = passage.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === passage.questions.length - 1;

  const handleVocabularyComplete = () => {
    setCurrentStep("reading");
    playSoundIfEnabled.success();
  };

  const handleReadingComplete = () => {
    setCurrentStep("questions");
    playSoundIfEnabled.success();
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: answer });
    setShowFeedback(true);

    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      playSoundIfEnabled.success();
    } else {
      audioService.playEncouragementSound();
    }

    setTimeout(() => {
      if (isLastQuestion) {
        onComplete(score + (isCorrect ? 1 : 0), passage.questions.length);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowFeedback(false);
      }
    }, 3000);
  };

  const highlightVocabularyWords = (text: string) => {
    let highlightedText = text;
    passage.vocabularyWords.forEach(({ word }) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        `<mark class="bg-educational-yellow/30 px-1 rounded cursor-pointer hover:bg-educational-yellow/50 transition-colors" onclick="showWordDefinition('${word}')">${word}</mark>`,
      );
    });
    return highlightedText;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-educational-green";
      case "medium":
        return "bg-educational-orange";
      case "hard":
        return "bg-educational-pink";
      default:
        return "bg-educational-blue";
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "vocabulary":
        return <BookOpen className="w-4 h-4" />;
      case "comprehension":
        return <Eye className="w-4 h-4" />;
      case "inference":
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const renderVocabularyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Key Vocabulary Words
        </h2>
        <p className="text-slate-600">
          Learn these important words before reading the passage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {passage.vocabularyWords.map((vocabWord, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-educational-blue mb-2">
                {vocabWord.word}
              </h3>
              <p className="text-slate-700 mb-3">{vocabWord.definition}</p>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm text-slate-600">
                  <strong>In context:</strong> "{vocabWord.context}"
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="mt-3 w-full"
                onClick={() => playSoundIfEnabled.pronunciation()}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Pronounce
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          size="lg"
          onClick={handleVocabularyComplete}
          className="bg-educational-blue text-white"
        >
          I'm Ready to Read!
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderReadingStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-educational-blue" />
              {passage.title}
            </CardTitle>
            <div className="flex gap-2">
              <Badge
                className={`${getDifficultyColor(passage.difficulty)} text-white`}
              >
                {passage.difficulty}
              </Badge>
              <Badge variant="outline">{passage.readingTime} min read</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none">
          <div
            className="text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: highlightVocabularyWords(passage.text),
            }}
          />
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          size="lg"
          onClick={handleReadingComplete}
          className="bg-educational-green text-white"
        >
          I Finished Reading!
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderQuestionsStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getQuestionTypeIcon(currentQuestion.type)}
              Question {currentQuestionIndex + 1} of {passage.questions.length}
            </CardTitle>
            <Badge variant="outline" className="capitalize">
              {currentQuestion.type}
            </Badge>
          </div>
          <Progress
            value={
              ((currentQuestionIndex + 1) / passage.questions.length) * 100
            }
            className="h-2"
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-800">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className={`w-full p-4 text-left justify-start hover:scale-105 transition-all ${
                  showFeedback
                    ? option === currentQuestion.correctAnswer
                      ? "bg-green-100 border-green-300 text-green-800"
                      : selectedAnswers[currentQuestion.id] === option
                        ? "bg-red-100 border-red-300 text-red-800"
                        : "opacity-50"
                    : selectedAnswers[currentQuestion.id] === option
                      ? "bg-educational-blue text-white"
                      : ""
                }`}
                disabled={showFeedback}
                onClick={() => handleAnswerSelect(option)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option}</span>
                  {showFeedback && (
                    <span>
                      {option === currentQuestion.correctAnswer ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : selectedAnswers[currentQuestion.id] === option ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : null}
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {showFeedback && (
            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-educational-orange" />
                  Explanation
                </h4>
                <p className="text-slate-700">{currentQuestion.explanation}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[
        { key: "vocabulary", label: "Vocabulary", icon: BookOpen },
        { key: "reading", label: "Reading", icon: Eye },
        { key: "questions", label: "Questions", icon: Star },
      ].map(({ key, label, icon: Icon }, index) => (
        <div
          key={key}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            currentStep === key
              ? "bg-educational-blue text-white"
              : index <
                  ["vocabulary", "reading", "questions"].indexOf(currentStep)
                ? "bg-green-100 text-green-800"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="font-medium">{label}</span>
          {index <
            ["vocabulary", "reading", "questions"].indexOf(currentStep) && (
            <CheckCircle2 className="w-4 h-4" />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {renderStepIndicator()}

      {currentStep === "vocabulary" && renderVocabularyStep()}
      {currentStep === "reading" && renderReadingStep()}
      {currentStep === "questions" && renderQuestionsStep()}
    </div>
  );
};
