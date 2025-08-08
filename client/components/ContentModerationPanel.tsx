import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Shield,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
  Clock,
  User,
  FileText,
  Search,
  Filter,
  Ban,
  Archive,
  Send,
  Zap,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
} from "lucide-react";

interface ContentReport {
  id: string;
  type: "word" | "user_content" | "inappropriate_usage" | "safety_concern";
  contentId: string;
  contentTitle: string;
  reportedBy: string;
  reportedAt: Date;
  reason: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
  evidence?: {
    screenshots?: string[];
    logs?: string[];
    userReports?: number;
  };
}

interface SafetyRule {
  id: string;
  name: string;
  description: string;
  category: "content" | "behavior" | "language" | "safety";
  severity: "low" | "medium" | "high" | "critical";
  isActive: boolean;
  autoAction: "flag" | "quarantine" | "block" | "escalate";
  keywords: string[];
  createdAt: Date;
  triggeredCount: number;
}

interface ContentModerationPanelProps {
  reports?: ContentReport[];
  safetyRules?: SafetyRule[];
  onResolveReport?: (reportId: string, resolution: string) => void;
  onUpdateRule?: (rule: SafetyRule) => void;
}

const sampleReports: ContentReport[] = [
  {
    id: "report_1",
    type: "word",
    contentId: "word_123",
    contentTitle: "inappropriate_word",
    reportedBy: "teacher@school.edu",
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reason: "Inappropriate content",
    description:
      "This word contains content that may not be suitable for children.",
    priority: "high",
    status: "pending",
    evidence: {
      userReports: 3,
    },
  },
  {
    id: "report_2",
    type: "user_content",
    contentId: "submission_456",
    contentTitle: "User submitted word: 'example'",
    reportedBy: "parent@email.com",
    reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    reason: "Quality concern",
    description: "The definition seems unclear and might confuse children.",
    priority: "medium",
    status: "reviewing",
    assignedTo: "moderator@wordadventure.com",
    evidence: {
      userReports: 1,
    },
  },
  {
    id: "report_3",
    type: "safety_concern",
    contentId: "interaction_789",
    contentTitle: "Unusual learning pattern detected",
    reportedBy: "system",
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    reason: "Safety monitoring",
    description:
      "Automated system detected unusual learning patterns that may indicate misuse.",
    priority: "urgent",
    status: "resolved",
    assignedTo: "safety@wordadventure.com",
    resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    resolution:
      "Investigated and found to be normal advanced learning behavior. No action needed.",
  },
];

const sampleSafetyRules: SafetyRule[] = [
  {
    id: "rule_1",
    name: "Inappropriate Language Detection",
    description:
      "Detects and flags potentially inappropriate language in word submissions",
    category: "language",
    severity: "high",
    isActive: true,
    autoAction: "quarantine",
    keywords: ["inappropriate", "offensive", "harmful"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    triggeredCount: 12,
  },
  {
    id: "rule_2",
    name: "Content Quality Standards",
    description: "Ensures word definitions meet educational quality standards",
    category: "content",
    severity: "medium",
    isActive: true,
    autoAction: "flag",
    keywords: ["unclear", "confusing", "incorrect"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    triggeredCount: 45,
  },
  {
    id: "rule_3",
    name: "Child Safety Monitor",
    description:
      "Monitors for potential child safety concerns in content and interactions",
    category: "safety",
    severity: "critical",
    isActive: true,
    autoAction: "escalate",
    keywords: ["contact", "personal", "meet", "address"],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    triggeredCount: 3,
  },
];

const ContentModerationPanel: React.FC<ContentModerationPanelProps> = ({
  reports = sampleReports,
  safetyRules = sampleSafetyRules,
  onResolveReport,
  onUpdateRule,
}) => {
  const [activeTab, setActiveTab] = useState("reports");
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(
    null,
  );
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [resolutionText, setResolutionText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleResolveReport = () => {
    if (selectedReport && resolutionText.trim()) {
      onResolveReport?.(selectedReport.id, resolutionText);
      setShowReportDialog(false);
      setSelectedReport(null);
      setResolutionText("");
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || report.priority === filterPriority;
    const matchesSearch =
      searchTerm === "" ||
      report.contentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-red-800";
      case "reviewing":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Reports Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Content Reports</h3>
          <p className="text-sm text-slate-600">
            Review and manage content safety reports
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-red-100 text-red-800">
            {reports.filter((r) => r.status === "pending").length} Pending
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800">
            {reports.filter((r) => r.status === "reviewing").length} Reviewing
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{report.contentTitle}</h4>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    <Badge className={getPriorityColor(report.priority)}>
                      {report.priority}
                    </Badge>
                    <Badge variant="outline">
                      {report.type.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-slate-600 mb-3">{report.description}</p>
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {report.reportedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {report.reportedAt.toLocaleDateString()}
                    </span>
                    {report.evidence?.userReports && (
                      <span className="flex items-center gap-1">
                        <Flag className="w-4 h-4" />
                        {report.evidence.userReports} reports
                      </span>
                    )}
                    {report.assignedTo && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Assigned to {report.assignedTo}
                      </span>
                    )}
                  </div>
                  {report.resolution && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Resolution:</strong> {report.resolution}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedReport(report);
                      setShowReportDialog(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Review
                  </Button>
                  {report.status === "pending" && (
                    <>
                      <Button size="sm" className="bg-green-600 text-white">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Ban className="w-4 h-4 mr-1" />
                        Block
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSafetyRulesTab = () => (
    <div className="space-y-6">
      {/* Safety Rules Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Safety Rules & Automation</h3>
          <p className="text-sm text-slate-600">
            Configure automated content moderation rules
          </p>
        </div>
        <Button>
          <Shield className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Rules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {safetyRules.filter((r) => r.isActive).length}
            </div>
            <p className="text-sm text-slate-600">Active Rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">
              {safetyRules.reduce((sum, rule) => sum + rule.triggeredCount, 0)}
            </div>
            <p className="text-sm text-slate-600">Total Triggers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {safetyRules.filter((r) => r.severity === "critical").length}
            </div>
            <p className="text-sm text-slate-600">Critical Rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-sm text-slate-600">Accuracy Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Safety Rules List */}
      <div className="space-y-4">
        {safetyRules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{rule.name}</h4>
                    <Badge
                      className={
                        rule.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge className={getSeverityColor(rule.severity)}>
                      {rule.severity}
                    </Badge>
                    <Badge variant="outline">{rule.category}</Badge>
                  </div>
                  <p className="text-slate-600 mb-3">{rule.description}</p>
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <span>Auto Action: {rule.autoAction}</span>
                    <span>Triggered: {rule.triggeredCount} times</span>
                    <span>Created: {rule.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3">
                    <Label className="text-xs text-slate-500">Keywords:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rule.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Shield className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={rule.isActive ? "destructive" : "default"}
                  >
                    {rule.isActive ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            Content Moderation
          </h2>
          <p className="text-slate-600">
            Monitor and manage content safety and quality
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {reports.filter((r) => r.status === "pending").length}
            </div>
            <p className="text-sm text-slate-600">Pending Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">
              {reports.filter((r) => r.status === "reviewing").length}
            </div>
            <p className="text-sm text-slate-600">Under Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {reports.filter((r) => r.status === "resolved").length}
            </div>
            <p className="text-sm text-slate-600">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">4.2h</div>
            <p className="text-sm text-slate-600">Avg Response Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Safety Rules
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">{renderReportsTab()}</TabsContent>
        <TabsContent value="rules">{renderSafetyRulesTab()}</TabsContent>
        <TabsContent value="analytics">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Detailed moderation analytics and trends would be displayed here.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Report Review Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              Review Content Report
            </DialogTitle>
            <DialogDescription>
              Review this content report and take appropriate action
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Content Title</Label>
                  <p className="font-semibold">{selectedReport.contentTitle}</p>
                </div>
                <div>
                  <Label>Report Type</Label>
                  <Badge variant="outline">
                    {selectedReport.type.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Report Reason</Label>
                <p className="font-semibold">{selectedReport.reason}</p>
              </div>

              <div>
                <Label>Description</Label>
                <p>{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reported By</Label>
                  <p>{selectedReport.reportedBy}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={getPriorityColor(selectedReport.priority)}>
                    {selectedReport.priority}
                  </Badge>
                </div>
              </div>

              {selectedReport.status === "pending" && (
                <div>
                  <Label htmlFor="resolution">Resolution Notes</Label>
                  <Textarea
                    id="resolution"
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Describe the action taken and reasoning..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
            >
              Cancel
            </Button>
            {selectedReport?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    // Handle dismissal
                    setShowReportDialog(false);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Dismiss
                </Button>
                <Button
                  onClick={handleResolveReport}
                  disabled={!resolutionText.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resolve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentModerationPanel;
