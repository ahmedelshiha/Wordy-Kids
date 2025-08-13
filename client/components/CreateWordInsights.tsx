import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  Target,
  Award,
  Zap,
  Star,
  Brain,
  Lightbulb,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Heart,
  ThumbsUp,
  Trophy,
} from "lucide-react";

interface AdminWord {
  id: string;
  word: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  status: "approved" | "pending" | "rejected";
  usageCount: number;
  accuracy: number;
  submittedAt: Date;
  tags?: string[];
}

interface CreateWordInsightsProps {
  words: AdminWord[];
  categories: Array<{ id: string; name: string; emoji: string }>;
  onCreateWord: () => void;
}

const CreateWordInsights: React.FC<CreateWordInsightsProps> = ({
  words,
  categories,
  onCreateWord,
}) => {
  // Calculate insights
  const totalWords = words.length;
  const recentWords = words.filter(w => 
    (Date.now() - w.submittedAt.getTime()) < (7 * 24 * 60 * 60 * 1000)
  ).length;
  
  const categoryStats = categories.map(cat => ({
    ...cat,
    count: words.filter(w => w.category === cat.name).length,
    avgAccuracy: Math.round(
      words
        .filter(w => w.category === cat.name)
        .reduce((acc, w) => acc + w.accuracy, 0) / 
      Math.max(words.filter(w => w.category === cat.name).length, 1)
    ),
  })).sort((a, b) => b.count - a.count);

  const difficultyStats = {
    easy: words.filter(w => w.difficulty === "easy").length,
    medium: words.filter(w => w.difficulty === "medium").length,
    hard: words.filter(w => w.difficulty === "hard").length,
  };

  const statusStats = {
    approved: words.filter(w => w.status === "approved").length,
    pending: words.filter(w => w.status === "pending").length,
    rejected: words.filter(w => w.status === "rejected").length,
  };

  const topPerformingWords = words
    .filter(w => w.usageCount > 0)
    .sort((a, b) => (b.accuracy * b.usageCount) - (a.accuracy * a.usageCount))
    .slice(0, 5);

  const recommendedCategories = categoryStats
    .filter(cat => cat.count < 10)
    .slice(0, 3);

  const qualityScore = Math.round(
    (statusStats.approved / Math.max(totalWords, 1)) * 100
  );

  const diversityScore = Math.round(
    (categoryStats.filter(cat => cat.count > 0).length / categories.length) * 100
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          Word Creation Insights
        </h3>
        <p className="text-slate-600">
          Smart analytics to guide your content creation strategy
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{totalWords}</div>
            <p className="text-sm text-blue-700">Total Words</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{recentWords}</div>
            <p className="text-sm text-green-700">This Week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{qualityScore}%</div>
            <p className="text-sm text-purple-700">Quality Score</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <Globe className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{diversityScore}%</div>
            <p className="text-sm text-orange-700">Category Coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryStats.slice(0, 6).map((category, index) => (
              <div key={category.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{category.emoji}</span>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-slate-500">
                      {category.count} words • {category.avgAccuracy}% accuracy
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                      style={{ width: `${(category.count / Math.max(...categoryStats.map(c => c.count), 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    {category.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Difficulty Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Easy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(difficultyStats.easy / totalWords) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{difficultyStats.easy}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${(difficultyStats.medium / totalWords) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{difficultyStats.medium}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm">Hard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(difficultyStats.hard / totalWords) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{difficultyStats.hard}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(statusStats.approved / totalWords) * 100} 
                    className="w-24 h-2"
                  />
                  <span className="text-sm font-medium">{statusStats.approved}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(statusStats.pending / totalWords) * 100} 
                    className="w-24 h-2"
                  />
                  <span className="text-sm font-medium">{statusStats.pending}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Rejected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(statusStats.rejected / totalWords) * 100} 
                    className="w-24 h-2"
                  />
                  <span className="text-sm font-medium">{statusStats.rejected}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Words */}
      {topPerformingWords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Performing Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformingWords.map((word, index) => (
                <div key={word.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium capitalize">{word.word}</p>
                      <p className="text-xs text-slate-500">
                        {word.category} • {word.difficulty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {word.accuracy}% accuracy
                    </div>
                    <div className="text-xs text-slate-500">
                      {word.usageCount} uses
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Lightbulb className="w-5 h-5" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendedCategories.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-800 mb-2">
                  Categories needing more words:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recommendedCategories.map((category) => (
                    <Badge key={category.id} variant="outline" className="text-blue-700 border-blue-300">
                      {category.emoji} {category.name} ({category.count} words)
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>
                  Current quality score: {qualityScore}%
                  {qualityScore < 80 && " - Consider reviewing pending words"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>
                  Category coverage: {diversityScore}%
                  {diversityScore < 70 && " - Add words to underrepresented categories"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {recentWords > 5 
                    ? `Great! ${recentWords} words added this week` 
                    : `Only ${recentWords} words added this week - consider increasing content creation`}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Center */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-green-800 mb-2">
            Ready to Create Amazing Words?
          </h4>
          <p className="text-green-700 mb-4">
            Use our smart wizard to create comprehensive, engaging word entries
          </p>
          <Button
            onClick={onCreateWord}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
          >
            <Zap className="w-4 h-4 mr-2" />
            Start Creating
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWordInsights;
