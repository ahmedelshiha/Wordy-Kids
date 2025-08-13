import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Wand2,
  FileText,
  Upload,
  Zap,
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Clock,
  Award,
  Star,
  BookOpen,
  Users,
  Globe,
  Activity,
} from "lucide-react";

interface QuickActionsProps {
  onCreateWithWizard: () => void;
  onQuickCreate: () => void;
  onBulkImport: () => void;
  recentWordsCount: number;
  totalWords: number;
  qualityScore: number;
}

const CreateWordQuickActions: React.FC<QuickActionsProps> = ({
  onCreateWithWizard,
  onQuickCreate,
  onBulkImport,
  recentWordsCount,
  totalWords,
  qualityScore,
}) => {
  const creationMethods = [
    {
      id: "wizard",
      title: "Smart Wizard",
      description: "Guided word creation with AI assistance",
      icon: <Wand2 className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      onClick: onCreateWithWizard,
      features: [
        "Step-by-step guidance",
        "Smart suggestions",
        "Template library",
        "Auto-fill features",
      ],
      recommended: true,
    },
    {
      id: "quick",
      title: "Quick Entry",
      description: "Fast word creation for experts",
      icon: <FileText className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      onClick: onQuickCreate,
      features: [
        "Advanced editor",
        "All fields available",
        "Real-time validation",
        "Professional mode",
      ],
      recommended: false,
    },
    {
      id: "bulk",
      title: "Bulk Import",
      description: "Import multiple words at once",
      icon: <Upload className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      onClick: onBulkImport,
      features: [
        "CSV import",
        "Batch processing",
        "Validation checks",
        "Progress tracking",
      ],
      recommended: false,
    },
  ];

  const insights = [
    {
      label: "This Week",
      value: recentWordsCount,
      icon: <Clock className="w-4 h-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Total Words",
      value: totalWords,
      icon: <BookOpen className="w-4 h-4" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Quality Score",
      value: `${qualityScore}%`,
      icon: <Award className="w-4 h-4" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          Word Creation Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Insights */}
        <div className="grid grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="text-center">
              <div
                className={`w-12 h-12 ${insight.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}
              >
                <span className={insight.color}>{insight.icon}</span>
              </div>
              <div className={`text-lg font-bold ${insight.color}`}>
                {insight.value}
              </div>
              <p className="text-xs text-slate-600">{insight.label}</p>
            </div>
          ))}
        </div>

        {/* Creation Methods */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Choose Your Creation Method
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creationMethods.map((method) => (
              <Card
                key={method.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg group relative overflow-hidden ${
                  method.recommended ? "ring-2 ring-blue-500/20" : ""
                }`}
                onClick={method.onClick}
              >
                {method.recommended && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-500 text-white text-xs">
                      Recommended
                    </Badge>
                  </div>
                )}

                <CardContent className="p-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}
                  >
                    {method.icon}
                  </div>

                  <h5 className="font-semibold text-slate-800 mb-1">
                    {method.title}
                  </h5>
                  <p className="text-sm text-slate-600 mb-3">
                    {method.description}
                  </p>

                  <div className="space-y-1">
                    {method.features.slice(0, 2).map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs text-slate-500"
                      >
                        <div className="w-1 h-1 bg-slate-400 rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-slate-700 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Activity
            </h4>
            {recentWordsCount > 0 && (
              <Badge
                variant="outline"
                className="text-green-600 border-green-300"
              >
                +{recentWordsCount} this week
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Words Created</span>
                <span className="font-medium">
                  {recentWordsCount}/10 weekly goal
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((recentWordsCount / 10) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Quality Maintained</span>
                <span className="font-medium">{qualityScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                  style={{ width: `${qualityScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Pro Tips for Word Creation
          </h4>
          <div className="space-y-1 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3" />
              <span>Use the Smart Wizard for comprehensive entries</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3" />
              <span>Include fun facts to make learning engaging</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3" />
              <span>Add multimedia content for visual learners</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3" />
              <span>Tag words properly for better organization</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateWordQuickActions;
