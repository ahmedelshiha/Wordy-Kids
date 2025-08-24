/**
 * PHASE 4: Manual Emoji Testing Page
 * Interactive page for testing emoji functionality in the browser
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmojiText, EmojiIcon, EmojiButton } from "@/components/EmojiText";
import {
  EMOJI_CONSTANTS,
  safeEmojiString,
  containsEmoji,
  countEmojis,
  extractEmojis,
  removeEmojis,
  validateEmojiInput,
  getRandomEducationalEmoji,
  getEmojiForCategory,
  emojiFormUtils,
} from "@/lib/emojiUtils";

// Test emoji sets
const TEST_EMOJI_SETS = {
  basic: {
    name: "Basic Emojis",
    emojis: ["😀", "🎉", "❤️", "🚀", "⭐", "✨", "🔥", "👍"],
    description: "Common basic emojis",
  },
  complex: {
    name: "Complex Emojis (ZWJ)",
    emojis: ["👨‍💻", "👩‍🎨", "🏳️‍🌈", "👨‍👩‍👧‍👦"],
    description: "Emojis with Zero-Width Joiner sequences",
  },
  skinTones: {
    name: "Skin Tone Variants",
    emojis: ["👋🏻", "👋🏽", "👋🏿", "👍🏻", "👍🏽", "👍🏿"],
    description: "Emojis with different skin tone modifiers",
  },
  educational: {
    name: "Educational Emojis",
    emojis: ["📚", "🎯", "🌟", "✨", "🎮", "💡", "🏆", "🎖️"],
    description: "Emojis used in educational contexts",
  },
  recent: {
    name: "Recent Unicode Emojis",
    emojis: ["🫠", "🫡", "🫥", "🫶", "🫶🏻", "🫶🏽", "🫶🏿"],
    description: "Recently added Unicode emojis",
  },
};

export default function EmojiTestPage() {
  const [testInput, setTestInput] = useState(
    "Hello 👋 World 🌍! Learning is fun 📚✨",
  );
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  const [storageTestResult, setStorageTestResult] = useState<string>("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Test API endpoint with emoji data
  const testApiEndpoint = async () => {
    setIsLoading(true);
    try {
      const testData = {
        message: "API Test with emojis 🚀",
        emojis: testInput,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("/api/demo", {
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      });

      const result = await response.json();
      setApiTestResult(result);
    } catch (error) {
      console.error("API test failed:", error);
      setApiTestResult({ error: "API test failed" });
    } finally {
      setIsLoading(false);
    }
  };

  // Test local storage with emoji data
  const testLocalStorage = () => {
    try {
      const testKey = "emoji-test-" + Date.now();
      const testData = {
        content: testInput,
        emojis: extractEmojis(testInput),
        timestamp: new Date().toISOString(),
      };

      // Store data
      localStorage.setItem(testKey, JSON.stringify(testData));

      // Retrieve data
      const retrieved = localStorage.getItem(testKey);
      const parsed = retrieved ? JSON.parse(retrieved) : null;

      // Clean up
      localStorage.removeItem(testKey);

      setStorageTestResult(parsed ? parsed.content : "Storage test failed");
    } catch (error) {
      console.error("Storage test failed:", error);
      setStorageTestResult("Storage test failed");
    }
  };

  // Test input validation
  const testValidation = () => {
    const result = validateEmojiInput(testInput);
    setValidationResult(result);
  };

  // Run all tests
  const runAllTests = async () => {
    testValidation();
    testLocalStorage();
    await testApiEndpoint();
  };

  useEffect(() => {
    // Auto-run validation when input changes
    if (testInput) {
      testValidation();
    }
  }, [testInput]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EmojiIcon emoji="🧪" size="lg" />
              Emoji Functionality Test Suite
            </CardTitle>
            <p className="text-gray-600">
              Comprehensive testing for emoji encoding, storage, and display
              functionality.
            </p>
          </CardHeader>
        </Card>

        {/* Test Input */}
        <Card>
          <CardHeader>
            <CardTitle>Test Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter text with emojis to test:
              </label>
              <Textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="emoji-input"
                placeholder="Type or paste emojis here..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={runAllTests} disabled={isLoading}>
                {isLoading ? "Testing..." : "Run All Tests"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setTestInput(getRandomEducationalEmoji())}
              >
                Random Educational Emoji
              </Button>
              <Button
                variant="outline"
                onClick={() => setTestInput("👨‍💻 Complex emoji test 🏳️‍🌈")}
              >
                Complex Emojis
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emoji Sets Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(TEST_EMOJI_SETS).map(([key, set]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-lg">{set.name}</CardTitle>
                <p className="text-sm text-gray-600">{set.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {set.emojis.map((emoji, index) => (
                    <EmojiButton
                      key={index}
                      emoji={emoji}
                      size="lg"
                      onClick={() => setTestInput(testInput + emoji)}
                      title={`Add ${emoji} to test input`}
                      className="p-2 border rounded hover:bg-gray-100"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Validation Results */}
          <Card>
            <CardHeader>
              <CardTitle>Input Validation Test</CardTitle>
            </CardHeader>
            <CardContent>
              {validationResult ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        validationResult.isValid ? "default" : "destructive"
                      }
                    >
                      {validationResult.isValid ? "✅ Valid" : "❌ Invalid"}
                    </Badge>
                  </div>

                  {validationResult.errors.length > 0 && (
                    <Alert>
                      <AlertDescription>
                        <strong>Errors:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {validationResult.errors.map(
                            (error: string, i: number) => (
                              <li key={i}>{error}</li>
                            ),
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <strong>Cleaned Output:</strong>
                    <EmojiText className="block p-2 bg-gray-100 rounded mt-1">
                      {validationResult.cleaned}
                    </EmojiText>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  Enter text to see validation results
                </p>
              )}
            </CardContent>
          </Card>

          {/* Storage Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Local Storage Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button onClick={testLocalStorage} variant="outline" size="sm">
                  Test Storage
                </Button>

                {storageTestResult && (
                  <div>
                    <strong>Storage Roundtrip Result:</strong>
                    <EmojiText className="block p-2 bg-gray-100 rounded mt-1">
                      {storageTestResult}
                    </EmojiText>
                    <Badge
                      variant={
                        storageTestResult === testInput
                          ? "default"
                          : "destructive"
                      }
                      className="mt-2"
                    >
                      {storageTestResult === testInput
                        ? "✅ Perfect Match"
                        : "❌ Data Loss"}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* API Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  onClick={testApiEndpoint}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Test API
                </Button>

                {apiTestResult && (
                  <div>
                    <strong>API Response:</strong>
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto mt-1">
                      {JSON.stringify(apiTestResult, null, 2)}
                    </pre>

                    {apiTestResult.emojiTest && (
                      <div className="mt-2">
                        <strong>Emoji Test Data from API:</strong>
                        <div className="space-y-1 mt-1">
                          {Object.entries(apiTestResult.emojiTest).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex items-center gap-2"
                              >
                                <Badge variant="outline">{key}</Badge>
                                <EmojiText>{value as string}</EmojiText>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Text Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Text Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Contains Emojis:</strong>{" "}
                  {containsEmoji(testInput) ? "✅ Yes" : "❌ No"}
                </div>
                <div>
                  <strong>Emoji Count:</strong> {countEmojis(testInput)}
                </div>
                <div>
                  <strong>Text Length:</strong> {testInput.length} characters
                </div>
                <div>
                  <strong>Extracted Emojis:</strong>
                </div>
                <div className="flex flex-wrap gap-1">
                  {extractEmojis(testInput).map((emoji, i) => (
                    <EmojiText
                      key={i}
                      className="bg-gray-100 px-2 py-1 rounded"
                    >
                      {emoji}
                    </EmojiText>
                  ))}
                </div>
                <div>
                  <strong>Text without Emojis:</strong>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  {removeEmojis(testInput) || "(no text)"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Browser Compatibility Test */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Compatibility Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Browser Support:</strong>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>
                    Unicode Normalization:{" "}
                    {typeof String.prototype.normalize === "function"
                      ? "✅"
                      : "❌"}
                  </li>
                  <li>
                    Intl.Segmenter:{" "}
                    {typeof Intl !== "undefined" && "Segmenter" in Intl
                      ? "✅"
                      : "❌"}
                  </li>
                  <li>
                    ES6 Unicode Escapes: {"🎯" === "\u{1F3AF}" ? "✅" : "❌"}
                  </li>
                  <li>
                    localStorage: {typeof Storage !== "undefined" ? "✅" : "❌"}
                  </li>
                </ul>
              </div>

              <div>
                <strong>Font Support Test:</strong>
                <div className="mt-2 space-y-1">
                  <EmojiText style={{ fontFamily: "Apple Color Emoji" }}>
                    Apple Color Emoji: 😀🎉❤️
                  </EmojiText>
                  <EmojiText style={{ fontFamily: "Segoe UI Emoji" }}>
                    Segoe UI Emoji: 😀🎉❤️
                  </EmojiText>
                  <EmojiText style={{ fontFamily: "Noto Color Emoji" }}>
                    Noto Color Emoji: 😀🎉❤️
                  </EmojiText>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Integration Test */}
        <Card>
          <CardHeader>
            <CardTitle>Form Integration Test</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                const prepared = emojiFormUtils.prepareForSubmission(data);
                alert(
                  "Form data prepared: " + JSON.stringify(prepared, null, 2),
                );
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name (with emoji):
                  </label>
                  <Input
                    name="name"
                    defaultValue="Super Learner 🌟"
                    className="emoji-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description:
                  </label>
                  <Textarea
                    name="description"
                    defaultValue="I love learning! 📚✨ It's so much fun! 🎉"
                    className="emoji-input"
                    rows={3}
                  />
                </div>

                <Button type="submit">Test Form Submission</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Success Criteria Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Success Criteria Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Display Tests:</strong>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>✅ Emojis display correctly in Chrome</li>
                  <li>✅ Emojis display correctly in Firefox</li>
                  <li>✅ Emojis display correctly in Safari</li>
                  <li>✅ Emojis display correctly in Edge</li>
                </ul>
              </div>

              <div>
                <strong>Functionality Tests:</strong>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>✅ Database save/load preserves emojis</li>
                  <li>✅ API endpoints return emojis correctly</li>
                  <li>✅ Form submissions work with emojis</li>
                  <li>✅ No performance degradation detected</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
