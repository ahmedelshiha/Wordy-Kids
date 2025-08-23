import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useOptimizedStorage,
  useUserProgress,
  useGameSettings,
  useWordCache,
} from "@/hooks/useOptimizedStorage";
import { StorageHealthDashboard } from "@/components/StorageHealthDashboard";

// Stable default values to prevent re-renders
const DEMO_DEFAULT_VALUE = { message: "Hello World!", count: 0 };
const DEMO_OPTIONS = { priority: "medium" as const, compress: true };

export const StorageOptimizationDemo: React.FC = () => {
  // Example usage of different storage hooks
  const [demoValue, setDemoValue, { loading: demoLoading, error: demoError }] =
    useOptimizedStorage(
      "demo_key",
      DEMO_DEFAULT_VALUE,
      DEMO_OPTIONS,
    );

  const { progress, updateProgress, addWordLearned, addAchievement } =
    useUserProgress("demo_user");
  const { settings, updateSetting } = useGameSettings();
  const { getCachedWord, cacheWord, clearWordCache, cacheSize } =
    useWordCache();

  const [newMessage, setNewMessage] = useState("");
  const [wordId, setWordId] = useState("");
  const [wordData, setWordData] = useState("");

  const handleUpdateDemo = useCallback(() => {
    setDemoValue({
      ...demoValue,
      message: newMessage || demoValue.message,
      count: demoValue.count + 1,
    });
  }, [demoValue, newMessage, setDemoValue]);

  const handleAddWord = useCallback(() => {
    if (wordId && wordData) {
      try {
        const parsedData = JSON.parse(wordData);
        cacheWord(wordId, parsedData);
        setWordId("");
        setWordData("");
      } catch (e) {
        alert("Invalid JSON data");
      }
    }
  }, [wordId, wordData, cacheWord]);

  const handleGetWord = useCallback(async () => {
    if (wordId) {
      const word = await getCachedWord(wordId);
      if (word) {
        alert(`Word found: ${JSON.stringify(word, null, 2)}`);
      } else {
        alert("Word not found in cache");
      }
    }
  }, [wordId, getCachedWord]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">LocalStorage Optimization Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of the comprehensive localStorage optimization system
        </p>
      </div>

      <Tabs defaultValue="hooks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hooks">Storage Hooks</TabsTrigger>
          <TabsTrigger value="progress">User Progress</TabsTrigger>
          <TabsTrigger value="settings">Game Settings</TabsTrigger>
          <TabsTrigger value="health">Storage Health</TabsTrigger>
        </TabsList>

        <TabsContent value="hooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>useOptimizedStorage Hook</CardTitle>
              <CardDescription>
                Basic storage with automatic compression, expiry, and cross-tab
                sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoLoading && <Badge variant="secondary">Loading...</Badge>}
              {demoError && (
                <Badge variant="destructive">Error: {demoError}</Badge>
              )}

              <div className="space-y-2">
                <Label>Current Value:</Label>
                <pre className="bg-muted p-2 rounded text-sm">
                  {JSON.stringify(demoValue, null, 2)}
                </pre>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newMessage">Update Message:</Label>
                <div className="flex gap-2">
                  <Input
                    id="newMessage"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Enter new message"
                  />
                  <Button onClick={handleUpdateDemo}>Update</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Word Cache Hook</CardTitle>
              <CardDescription>
                Caching system for word data with automatic cleanup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <Badge>Cache Size: {cacheSize} items</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wordId">Word ID:</Label>
                  <Input
                    id="wordId"
                    value={wordId}
                    onChange={(e) => setWordId(e.target.value)}
                    placeholder="word_123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wordData">Word Data (JSON):</Label>
                  <Textarea
                    id="wordData"
                    value={wordData}
                    onChange={(e) => setWordData(e.target.value)}
                    placeholder='{"word": "cat", "definition": "a small domesticated carnivorous mammal"}'
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddWord} variant="outline">
                  Cache Word
                </Button>
                <Button onClick={handleGetWord} variant="outline">
                  Get Word
                </Button>
                <Button onClick={clearWordCache} variant="destructive">
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Progress Management</CardTitle>
              <CardDescription>
                Track user progress with automatic persistence and expiry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Level</Label>
                  <div className="text-2xl font-bold">{progress.level}</div>
                </div>
                <div className="space-y-1">
                  <Label>Experience</Label>
                  <div className="text-2xl font-bold">
                    {progress.experience}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Words Learned</Label>
                  <div className="text-2xl font-bold">
                    {progress.wordsLearned.length}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Achievements</Label>
                  <div className="text-2xl font-bold">
                    {progress.achievements.length}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Streak Days</Label>
                  <div className="text-2xl font-bold">
                    {progress.streakDays}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Total Play Time</Label>
                  <div className="text-2xl font-bold">
                    {progress.totalPlayTime}min
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => addWordLearned("cat", 3)}
                  variant="outline"
                >
                  Learn Word "cat"
                </Button>
                <Button
                  onClick={() => addAchievement("first_word")}
                  variant="outline"
                >
                  Add Achievement
                </Button>
                <Button
                  onClick={() =>
                    updateProgress({
                      streakDays: progress.streakDays + 1,
                      totalPlayTime: progress.totalPlayTime + 15,
                    })
                  }
                  variant="outline"
                >
                  Update Stats
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Recent Words:</Label>
                <div className="flex flex-wrap gap-1">
                  {progress.wordsLearned.slice(-5).map((word: any, index) => (
                    <Badge key={index} variant="secondary">
                      {word.word} (diff: {word.difficulty})
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Achievements:</Label>
                <div className="flex flex-wrap gap-1">
                  {progress.achievements.map((achievement, index) => (
                    <Badge key={index} variant="default">
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Settings Management</CardTitle>
              <CardDescription>
                Manage game settings with cross-tab synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Volume: {Math.round(settings.volume * 100)}%</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.volume}
                    onChange={(e) =>
                      updateSetting("volume", parseFloat(e.target.value))
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <select
                    value={settings.theme}
                    onChange={(e) =>
                      updateSetting("theme", e.target.value as any)
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="jungle">Jungle</option>
                    <option value="ocean">Ocean</option>
                    <option value="space">Space</option>
                    <option value="farm">Farm</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <select
                    value={settings.difficulty}
                    onChange={(e) =>
                      updateSetting("difficulty", e.target.value as any)
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) =>
                      updateSetting("fontSize", e.target.value as any)
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Toggle Settings</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    ["soundEffects", "Sound Effects"],
                    ["music", "Music"],
                    ["animations", "Animations"],
                    ["autoAdvance", "Auto Advance"],
                    ["showHints", "Show Hints"],
                    ["highContrast", "High Contrast"],
                    ["reducedMotion", "Reduced Motion"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={
                          settings[key as keyof typeof settings] as boolean
                        }
                        onChange={(e) =>
                          updateSetting(key as any, e.target.checked)
                        }
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <StorageHealthDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StorageOptimizationDemo;
