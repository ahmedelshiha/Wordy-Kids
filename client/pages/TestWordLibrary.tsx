import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Monitor,
} from "lucide-react";
import { EnhancedWordCard } from "@/components/EnhancedWordCard";
import { EnhancedCategorySelector } from "@/components/EnhancedCategorySelector";
import { wordsDatabase } from "@/data/wordsDatabase";

export function TestWordLibrary() {
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const tests = [
    {
      id: "wordcard",
      name: "Enhanced Word Card",
      description:
        "Test mobile-optimized word card with swipe gestures and accessibility",
      component: () => (
        <div className="max-w-sm mx-auto">
          <EnhancedWordCard
            word={wordsDatabase[0]}
            enableSwipeGestures={true}
            showAccessibilityFeatures={true}
            showVocabularyBuilder={true}
            onFavorite={(word) => console.log("Favorited:", word.word)}
            onWordMastered={(id, rating) =>
              console.log("Mastered:", id, rating)
            }
          />
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              Test Instructions:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tap the card to flip it</li>
              <li>
                • On mobile: Swipe left to favorite, right to flip, up to
                pronounce
              </li>
              <li>• Test accessibility controls (eye and target icons)</li>
              <li>• Try the pronunciation and rating buttons</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      name: "Enhanced Category Selector",
      description:
        "Test mobile-first category selection with search and filters",
      component: () => (
        <div>
          <EnhancedCategorySelector
            selectedCategory="animals"
            onSelectCategory={(cat) => console.log("Selected:", cat)}
            userInterests={["animals", "nature"]}
            enableAccessibility={true}
            showAdvanced={true}
            showGameification={true}
          />
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">
              Test Instructions:
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Search for categories using the search bar</li>
              <li>• Filter by difficulty level</li>
              <li>• Test accessibility controls</li>
              <li>• Try selecting different categories</li>
              <li>• Notice the personalized recommendations</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "responsive",
      name: "Responsive Design Test",
      description: "Test how components adapt to different screen sizes",
      component: () => (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Responsive Breakpoints Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-red-100 p-4 rounded-lg">
                  <div className="text-center">
                    <Smartphone className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <p className="text-sm font-semibold">Mobile</p>
                    <p className="text-xs text-gray-600">&lt; 768px</p>
                    <div className="block sm:hidden">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto mt-2" />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-100 p-4 rounded-lg">
                  <div className="text-center">
                    <Monitor className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-sm font-semibold">Tablet</p>
                    <p className="text-xs text-gray-600">768px - 1024px</p>
                    <div className="hidden sm:block lg:hidden">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto mt-2" />
                    </div>
                  </div>
                </div>

                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="text-center">
                    <Monitor className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-semibold">Desktop</p>
                    <p className="text-xs text-gray-600">&gt; 1024px</p>
                    <div className="hidden lg:block">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto mt-2" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Responsive Features:</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Grid layouts adapt to screen size</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Touch targets are 44px minimum on mobile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Text scales appropriately</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Navigation adapts to mobile patterns</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "accessibility",
      name: "Accessibility Test",
      description: "Test accessibility features and keyboard navigation",
      component: () => (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Features Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Keyboard Navigation Test:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Word Card:</h5>
                      <ul className="text-sm space-y-1">
                        <li>
                          <kbd className="px-2 py-1 bg-gray-200 rounded">
                            Tab
                          </kbd>{" "}
                          - Navigate through elements
                        </li>
                        <li>
                          <kbd className="px-2 py-1 bg-gray-200 rounded">
                            Enter
                          </kbd>{" "}
                          - Activate buttons
                        </li>
                        <li>
                          <kbd className="px-2 py-1 bg-gray-200 rounded">
                            Space
                          </kbd>{" "}
                          - Flip card
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Category Selector:</h5>
                      <ul className="text-sm space-y-1">
                        <li>
                          <kbd className="px-2 py-1 bg-gray-200 rounded">
                            Arrow keys
                          </kbd>{" "}
                          - Navigate categories
                        </li>
                        <li>
                          <kbd className="px-2 py-1 bg-gray-200 rounded">
                            Enter
                          </kbd>{" "}
                          - Select category
                        </li>
                        <li>
                          <kbd className="px-2 py-1 bg-gray-200 rounded">/</kbd>{" "}
                          - Focus search
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Screen Reader Support:
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>ARIA labels and descriptions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Live regions for dynamic content</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Semantic HTML structure</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Focus management</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">
                    Visual Accessibility:
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>High contrast mode available</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Large text option</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Reduced motion respect</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Color contrast WCAG AA compliant</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  const markTestResult = (testId: string, passed: boolean) => {
    setTestResults((prev) => ({ ...prev, [testId]: passed }));
  };

  if (currentTest) {
    const test = tests.find((t) => t.id === currentTest);
    if (!test) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentTest(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tests
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{test.name}</h1>
              <p className="text-slate-600">{test.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            <test.component />

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Test Results</h3>
                <div className="flex gap-4">
                  <Button
                    onClick={() => markTestResult(test.id, true)}
                    className={`flex items-center gap-2 ${
                      testResults[test.id] === true
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Pass
                  </Button>
                  <Button
                    onClick={() => markTestResult(test.id, false)}
                    variant="outline"
                    className={`flex items-center gap-2 ${
                      testResults[test.id] === false
                        ? "border-red-500 text-red-500"
                        : ""
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Fail
                  </Button>
                </div>
                {testResults[test.id] !== undefined && (
                  <p
                    className={`mt-2 text-sm ${
                      testResults[test.id] ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Test marked as {testResults[test.id] ? "passed" : "failed"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Word Library Component Tests
          </h1>
          <p className="text-xl text-slate-600">
            Test and validate the enhanced mobile experience and accessibility
            features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {tests.map((test) => (
            <Card
              key={test.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                testResults[test.id] === true
                  ? "ring-2 ring-green-500"
                  : testResults[test.id] === false
                    ? "ring-2 ring-red-500"
                    : ""
              }`}
              onClick={() => setCurrentTest(test.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      {test.name}
                    </h3>
                    <p className="text-sm text-slate-600">{test.description}</p>
                  </div>
                  <div className="ml-4">
                    {testResults[test.id] === true && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {testResults[test.id] === false && (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </div>
                <Button className="w-full">Run Test</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overall Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-2 rounded"
                >
                  <span className="font-medium">{test.name}</span>
                  <div className="flex items-center gap-2">
                    {testResults[test.id] === true && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 text-sm">Passed</span>
                      </>
                    )}
                    {testResults[test.id] === false && (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 text-sm">Failed</span>
                      </>
                    )}
                    {testResults[test.id] === undefined && (
                      <span className="text-gray-500 text-sm">Not tested</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(testResults).length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Summary:</h4>
                <p className="text-blue-700">
                  {Object.values(testResults).filter(Boolean).length} of{" "}
                  {Object.keys(testResults).length} tests passed
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
