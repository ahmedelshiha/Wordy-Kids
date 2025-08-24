import React, { useState } from "react";
import { usePronunciation } from "../lib/unifiedPronunciationService";
import {
  sanitizeTTSInput,
  logSpeechError,
  createSafeUtterance,
} from "../lib/speechUtils";
import {
  audioService,
  enhancedAudioService,
} from "../lib/pronunciationMigrationAdapter";
import { AlertCircle, CheckCircle, Bug, Volume2, Play } from "lucide-react";

const PronunciationDebugger: React.FC = () => {
  const { speak, quickSpeak, isSupported } = usePronunciation();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Test cases that might cause "[object Object]" errors
  const testCases = [
    // Normal cases
    { name: "Simple string", input: "hello", expected: "pass" },
    { name: "Number", input: 123, expected: "pass" },
    { name: "Boolean", input: true, expected: "pass" },

    // Problematic cases
    { name: "Plain object", input: { word: "test" }, expected: "pass" },
    {
      name: "Object without word prop",
      input: { foo: "bar" },
      expected: "handle",
    },
    { name: "Array of strings", input: ["hello", "world"], expected: "pass" },
    {
      name: "Nested object",
      input: { text: { value: "nested" } },
      expected: "handle",
    },
    {
      name: "React-like element",
      input: { $$typeof: "react", props: { children: "React text" } },
      expected: "pass",
    },
    { name: "Function", input: () => "function result", expected: "handle" },
    { name: "null", input: null, expected: "pass" },
    { name: "undefined", input: undefined, expected: "pass" },
    { name: "Empty object", input: {}, expected: "handle" },
    {
      name: "Circular reference",
      input: (() => {
        const obj: any = {};
        obj.self = obj;
        return obj;
      })(),
      expected: "handle",
    },
  ];

  const runDebugTests = async () => {
    setIsRunning(true);
    const results: any[] = [];

    for (const testCase of testCases) {
      try {
        // Test sanitization
        const sanitized = sanitizeTTSInput(testCase.input);

        // Test utterance creation
        const utterance = createSafeUtterance(testCase.input);

        // Test legacy audioService
        let legacyResult = "not tested";
        try {
          await audioService.pronounceWord(testCase.input, {
            onStart: () => {},
            onEnd: () => {},
            onError: (error) => {
              legacyResult = `error: ${error}`;
            },
          });
          legacyResult = "success";
        } catch (error) {
          legacyResult = `exception: ${error}`;
        }

        // Test unified system
        let unifiedResult = "not tested";
        try {
          await speak(testCase.input);
          unifiedResult = "success";
        } catch (error) {
          unifiedResult = `exception: ${error}`;
        }

        results.push({
          name: testCase.name,
          input: testCase.input,
          inputType: typeof testCase.input,
          inputConstructor: testCase.input?.constructor?.name,
          sanitized,
          sanitizedLength: sanitized.length,
          utteranceCreated: !!utterance,
          legacyResult,
          unifiedResult,
          status:
            sanitized && utterance && legacyResult !== "not tested"
              ? "pass"
              : "fail",
        });

        // Small delay to prevent overwhelming the speech system
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          name: testCase.name,
          input: testCase.input,
          error: String(error),
          status: "error",
        });
      }
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const runQuickTest = async (input: any) => {
    try {
      console.log("🧪 Quick test input:", input);
      const sanitized = sanitizeTTSInput(input);
      console.log("🧪 Sanitized:", sanitized);

      if (sanitized) {
        await quickSpeak(sanitized);
        console.log("✅ Quick test passed");
      } else {
        console.log("❌ Quick test failed - empty sanitized input");
      }
    } catch (error) {
      console.error("❌ Quick test error:", error);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>Speech synthesis not supported - cannot run debug tests</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Bug className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-800">
          Pronunciation Debugger
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={runDebugTests}
            disabled={isRunning}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Bug className="h-4 w-4" />
            {isRunning ? "Running Tests..." : "Run Debug Tests"}
          </button>

          <button
            onClick={() => runQuickTest("Quick test")}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Quick Test
          </button>

          <button
            onClick={() => runQuickTest({ word: "Object test" })}
            disabled={isRunning}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Test Object Input
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Test Results:</h4>
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Test</th>
                    <th className="text-left p-2">Input Type</th>
                    <th className="text-left p-2">Sanitized</th>
                    <th className="text-left p-2">Utterance</th>
                    <th className="text-left p-2">Legacy</th>
                    <th className="text-left p-2">Unified</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-2 font-medium">{result.name}</td>
                      <td className="p-2 text-gray-600">{result.inputType}</td>
                      <td className="p-2 text-gray-600">
                        {result.sanitized ? (
                          <span
                            className="text-green-600"
                            title={result.sanitized}
                          >
                            ✓ ({result.sanitizedLength})
                          </span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                      <td className="p-2">
                        {result.utteranceCreated ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </td>
                      <td className="p-2 text-xs">
                        <span
                          className={
                            result.legacyResult === "success"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {result.legacyResult}
                        </span>
                      </td>
                      <td className="p-2 text-xs">
                        <span
                          className={
                            result.unifiedResult === "success"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {result.unifiedResult}
                        </span>
                      </td>
                      <td className="p-2">
                        {result.status === "pass" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : result.status === "error" ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Manual Test Area</h4>
          <p className="text-sm text-gray-600 mb-2">
            Open the browser console to see detailed debug logs when testing.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                console.log("Testing problematic input...");
                runQuickTest({ someObject: "test", nested: { deep: "value" } });
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Test Complex Object
            </button>
            <button
              onClick={() => {
                console.log("Testing React-like element...");
                runQuickTest({
                  $$typeof: "react.element",
                  props: { children: "React children text" },
                });
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Test React Element
            </button>
            <button
              onClick={() => {
                console.log("Testing array...");
                runQuickTest(["word", "array", "test"]);
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Test Array
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationDebugger;
