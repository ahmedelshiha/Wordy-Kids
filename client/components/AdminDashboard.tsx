import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Trash2,
  Shield,
  BarChart3,
  Clock,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  Upload,
  Filter,
  Eye,
  MessageSquare,
  Star,
  Calendar,
  Activity,
  Database,
  Globe,
  Zap,
  Target,
  Award,
  UserCheck,
  UserX,
  FileText,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  RefreshCw,
  PieChart,
  MoreVertical,
  CheckSquare,
  ExternalLink,
  Lock,
  Unlock,
  Ban,
  AlertCircle,
  Info,
  CreditCard,
  Archive,
  Package,
  Layers,
  Tags,
  Hash,
  Type,
  Volume2,
  Image as ImageIcon,
  BookMarked,
  GraduationCap,
  Brain,
  Lightbulb,
  Palette,
  Music,
  Camera,
  Gamepad2,
  Puzzle,
  Bell,
  SaveIcon,
  Send,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import BulkWordImport from "@/components/BulkWordImport";
import WordEditor from "@/components/WordEditor";
import ContentModerationPanel from "@/components/ContentModerationPanel";
import AdvancedAnalyticsDashboard from "@/components/AdvancedAnalyticsDashboard";
import EnhancedUserManagement from "@/components/EnhancedUserManagement";

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
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "parent" | "child";
  status: "active" | "suspended" | "inactive";
  createdAt: Date;
  lastActive: Date;
  childrenCount?: number;
  totalSessions: number;
  supportTickets: number;
  subscriptionType: "free" | "premium" | "family";
}

interface AdminCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  wordCount: number;
  difficulty: "easy" | "medium" | "hard";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  responses: Array<{
    id: string;
    message: string;
    isAdmin: boolean;
    timestamp: Date;
    author: string;
  }>;
}

interface SystemAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalWords: number;
  totalSessions: number;
  avgSessionDuration: number;
  platformEngagement: number;
  userGrowthRate: number;
  contentApprovalRate: number;
  supportResponseTime: number;
  systemUptime: number;
}

interface AdminDashboardProps {
  onNavigateBack?: () => void;
}

const sampleWords: AdminWord[] = [
  {
    id: "1",
    word: "elephant",
    pronunciation: "EL-uh-fant",
    definition: "A large mammal with a trunk and tusks",
    example: "The elephant sprayed water with its trunk.",
    category: "Animals",
    difficulty: "easy",
    funFact: "Elephants can live up to 70 years!",
    status: "approved",
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    usageCount: 1247,
    accuracy: 87,
  },
  {
    id: "2",
    word: "crystallize",
    pronunciation: "KRIS-tuh-lahyz",
    definition: "To form into crystals or become clear",
    example: "The solution will crystallize overnight.",
    category: "Science",
    difficulty: "hard",
    status: "pending",
    submittedBy: "teacher@school.edu",
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    usageCount: 0,
    accuracy: 0,
  },
];

const sampleUsers: AdminUser[] = [
  {
    id: "1",
    name: "John Parent",
    email: "john@example.com",
    role: "parent",
    status: "active",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    childrenCount: 2,
    totalSessions: 145,
    supportTickets: 1,
    subscriptionType: "premium",
  },
  {
    id: "2",
    name: "Alex Child",
    email: "alex@example.com",
    role: "child",
    status: "active",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    totalSessions: 87,
    supportTickets: 0,
    subscriptionType: "family",
  },
];

const sampleCategories: AdminCategory[] = [
  {
    id: "1",
    name: "Animals",
    emoji: "🐘",
    description: "Learn about creatures from around the world",
    wordCount: 45,
    difficulty: "easy",
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "Science",
    emoji: "🔬",
    description: "Explore scientific terms and concepts",
    wordCount: 32,
    difficulty: "medium",
    isActive: true,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
];

const sampleTickets: SupportTicket[] = [
  {
    id: "1",
    userId: "1",
    userName: "John Parent",
    userEmail: "john@example.com",
    subject: "Unable to track child's progress",
    description:
      "The dashboard is not showing my child's recent learning sessions.",
    priority: "medium",
    status: "open",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    responses: [],
  },
  {
    id: "2",
    userId: "3",
    userName: "Sarah Teacher",
    userEmail: "sarah@school.edu",
    subject: "Request for bulk word upload",
    description:
      "I have 200+ educational words I'd like to contribute to the platform.",
    priority: "low",
    status: "in_progress",
    assignedTo: "admin@wordadventure.com",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    responses: [
      {
        id: "1",
        message:
          "Thank you for your contribution! Please send the word list in CSV format.",
        isAdmin: true,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        author: "Admin Support",
      },
    ],
  },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateBack }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [words, setWords] = useState<AdminWord[]>(sampleWords);
  const [users, setUsers] = useState<AdminUser[]>(sampleUsers);
  const [categories, setCategories] =
    useState<AdminCategory[]>(sampleCategories);
  const [tickets, setTickets] = useState<SupportTicket[]>(sampleTickets);

  // Dialog states
  const [showWordDialog, setShowWordDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showWordEditor, setShowWordEditor] = useState(false);
  const [editingWord, setEditingWord] = useState<AdminWord | null>(null);
  const [wordEditorMode, setWordEditorMode] = useState<"create" | "edit">(
    "create",
  );

  // Form states
  const [newWordData, setNewWordData] = useState({
    word: "",
    pronunciation: "",
    definition: "",
    example: "",
    category: "",
    difficulty: "easy" as const,
    funFact: "",
  });

  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    emoji: "",
    description: "",
    difficulty: "easy" as const,
  });

  // Filter states
  const [wordFilter, setWordFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample analytics data
  const analytics: SystemAnalytics = {
    totalUsers: 2847,
    activeUsers: 1653,
    totalWords: 1200,
    totalSessions: 15672,
    avgSessionDuration: 12.5,
    platformEngagement: 78,
    userGrowthRate: 15.3,
    contentApprovalRate: 92,
    supportResponseTime: 4.2,
    systemUptime: 99.8,
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Enhanced Mobile Welcome Header */}
      <Card className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white mx-2 md:mx-0">
        <CardContent className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
            <div className="text-center md:text-left">
              <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">
                🛡️ Admin Dashboard
              </h2>
              <p className="text-slate-300 text-xs md:text-base">
                <span className="block md:inline">System Overview</span>
                <span className="hidden md:inline"> • {new Date().toLocaleDateString()}</span>
                <span className="block md:inline mt-1 md:mt-0">
                  <span className="text-green-400">●</span> All Systems Operational
                </span>
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="text-2xl md:text-3xl font-bold">
                {analytics.systemUptime}%
              </div>
              <p className="text-xs md:text-sm text-slate-300">System Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Mobile Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-3 md:p-6 text-center">
            <Users className="w-8 h-8 md:w-12 md:h-12 text-blue-500 mx-auto mb-2 md:mb-3" />
            <div className="text-xl md:text-3xl font-bold text-blue-600">
              <AnimatedCounter value={analytics.totalUsers} />
            </div>
            <p className="text-xs md:text-sm text-slate-600 font-medium">Total Users</p>
            <div className="mt-1 md:mt-2 text-xs text-green-600">
              +{analytics.userGrowthRate}% growth
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-3 md:p-6 text-center">
            <Activity className="w-8 h-8 md:w-12 md:h-12 text-green-500 mx-auto mb-2 md:mb-3" />
            <div className="text-xl md:text-3xl font-bold text-green-600">
              <AnimatedCounter value={analytics.activeUsers} />
            </div>
            <p className="text-xs md:text-sm text-slate-600 font-medium">Active Users</p>
            <div className="mt-1 md:mt-2 text-xs text-green-600">
              {Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}% engaged
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-3 md:p-6 text-center">
            <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-purple-500 mx-auto mb-2 md:mb-3" />
            <div className="text-xl md:text-3xl font-bold text-purple-600">
              <AnimatedCounter value={analytics.totalWords} />
            </div>
            <p className="text-xs md:text-sm text-slate-600 font-medium">Total Words</p>
            <div className="mt-1 md:mt-2 text-xs text-purple-600">
              {analytics.contentApprovalRate}% approved
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-3 md:p-6 text-center">
            <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-orange-500 mx-auto mb-2 md:mb-3" />
            <div className="text-xl md:text-3xl font-bold text-orange-600">
              <AnimatedCounter value={analytics.totalSessions} />
            </div>
            <p className="text-xs md:text-sm text-slate-600 font-medium">Sessions</p>
            <div className="mt-1 md:mt-2 text-xs text-orange-600">
              {analytics.avgSessionDuration}min avg
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                setWordEditorMode("create");
                setEditingWord(null);
                setShowWordEditor(true);
              }}
            >
              <Plus className="w-5 h-5" />
              Add Word
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setShowCategoryDialog(true)}
            >
              <Layers className="w-5 h-5" />
              New Category
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab("tickets")}
            >
              <MessageSquare className="w-5 h-5" />
              Support Queue
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart3 className="w-5 h-5" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    Word "elephant" approved
                  </p>
                  <p className="text-xs text-slate-600">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    15 new user registrations
                  </p>
                  <p className="text-xs text-slate-600">Today</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Flag className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    2 support tickets opened
                  </p>
                  <p className="text-xs text-slate-600">4 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-sm">
                      3 words pending review
                    </p>
                    <p className="text-xs text-slate-600">
                      Submitted 2 days ago
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={() => setActiveTab("content")}>
                  Review
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-sm">
                      2 urgent support tickets
                    </p>
                    <p className="text-xs text-slate-600">
                      Requires immediate attention
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={() => setActiveTab("tickets")}>
                  Handle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContentManagement = () => (
    <div className="space-y-6">
      {/* Content Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📚 Content Management</h2>
          <p className="text-slate-600">
            Manage words, categories, and content quality
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkImport(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setWordEditorMode("create");
              setEditingWord(null);
              setShowWordEditor(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Word
          </Button>
        </div>
      </div>

      {/* Content Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={wordFilter} onValueChange={setWordFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Words List */}
      <div className="space-y-4">
        {words
          .filter((word) => wordFilter === "all" || word.status === wordFilter)
          .filter(
            (word) =>
              searchTerm === "" ||
              word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
              word.category.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((word) => (
            <Card key={word.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{word.word}</h3>
                      <Badge
                        className={
                          word.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : word.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {word.status}
                      </Badge>
                      <Badge variant="outline">{word.category}</Badge>
                      <Badge variant="outline">{word.difficulty}</Badge>
                    </div>
                    <p className="text-slate-600 mb-2">
                      <strong>Definition:</strong> {word.definition}
                    </p>
                    <p className="text-slate-600 mb-2">
                      <strong>Example:</strong> {word.example}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>👥 {word.usageCount} uses</span>
                      <span>🎯 {word.accuracy}% accuracy</span>
                      <span>📅 {word.submittedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {word.status === "pending" && (
                      <>
                        <Button size="sm" className="bg-green-600 text-white">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setWordEditorMode("edit");
                        setEditingWord(word);
                        setShowWordEditor(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Categories Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Category Management
            </div>
            <Button size="sm" onClick={() => setShowCategoryDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{category.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold">{category.name}</h4>
                      <p className="text-sm text-slate-600">
                        {category.wordCount} words
                      </p>
                    </div>
                    <Badge
                      className={
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    {category.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{category.difficulty}</Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* User Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">👥 User Management</h2>
          <p className="text-slate-600">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button size="sm" onClick={() => setShowUserDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.status === "active").length}
            </div>
            <p className="text-sm text-slate-600">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {users.filter((u) => u.role === "parent").length}
            </div>
            <p className="text-sm text-slate-600">Parents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <GraduationCap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === "child").length}
            </div>
            <p className="text-sm text-slate-600">Children</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {users.filter((u) => u.subscriptionType === "premium").length}
            </div>
            <p className="text-sm text-slate-600">Premium Users</p>
          </CardContent>
        </Card>
      </div>

      {/* User Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="parent">Parents</SelectItem>
                <SelectItem value="child">Children</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {users
          .filter(
            (user) =>
              userFilter === "all" ||
              user.role === userFilter ||
              user.status === userFilter,
          )
          .filter(
            (user) =>
              searchTerm === "" ||
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <Badge
                          className={
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : user.status === "suspended"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {user.status}
                        </Badge>
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge
                          className={
                            user.subscriptionType === "premium"
                              ? "bg-purple-100 text-purple-800"
                              : user.subscriptionType === "family"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {user.subscriptionType}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-2">{user.email}</p>
                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span>
                          📅 Joined {user.createdAt.toLocaleDateString()}
                        </span>
                        <span>
                          🕒 Last active {user.lastActive.toLocaleDateString()}
                        </span>
                        <span>📚 {user.totalSessions} sessions</span>
                        {user.childrenCount && (
                          <span>👥 {user.childrenCount} children</span>
                        )}
                        {user.supportTickets > 0 && (
                          <span>🎫 {user.supportTickets} tickets</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={
                        user.status === "active"
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {user.status === "active" ? (
                        <Ban className="w-4 h-4" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                    </Button>
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

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📊 System Analytics</h2>
          <p className="text-slate-600">
            Platform insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Platform Engagement</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {analytics.platformEngagement}%
            </div>
            <Progress value={analytics.platformEngagement} className="mb-2" />
            <p className="text-sm text-slate-600">
              Daily active users / Total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Content Quality</h3>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {analytics.contentApprovalRate}%
            </div>
            <Progress value={analytics.contentApprovalRate} className="mb-2" />
            <p className="text-sm text-slate-600">Content approval rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Support Response</h3>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {analytics.supportResponseTime}h
            </div>
            <Progress value={75} className="mb-2" />
            <p className="text-sm text-slate-600">Average response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              User Growth Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>This Month</span>
                <span className="font-bold text-green-600">
                  +{analytics.userGrowthRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Session Duration</span>
                <span className="font-bold">
                  {analytics.avgSessionDuration}min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Sessions</span>
                <span className="font-bold">
                  {analytics.totalSessions.toLocaleString()}
                </span>
              </div>
              <div className="h-40 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-slate-500">
                📈 Detailed chart visualization would go here
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Content Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span>{category.emoji}</span>
                    <span>{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                      {category.wordCount}
                    </span>
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${(category.wordCount / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="h-40 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center text-slate-500 mt-4">
                🥧 Category distribution chart would go here
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            System Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.systemUptime}%
              </div>
              <p className="text-sm text-slate-600">System Uptime</p>
              <div className="mt-2">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${analytics.systemUptime}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2.1s</div>
              <p className="text-sm text-slate-600">Avg Load Time</p>
              <div className="mt-2">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">99.2%</div>
              <p className="text-sm text-slate-600">API Success Rate</p>
              <div className="mt-2">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: "99%" }}
                  />
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">156MB</div>
              <p className="text-sm text-slate-600">Memory Usage</p>
              <div className="mt-2">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: "62%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSupportTickets = () => (
    <div className="space-y-6">
      {/* Support Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🎫 Support Management</h2>
          <p className="text-slate-600">
            Handle user support requests and tickets
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Tickets
          </Button>
          <Button size="sm" onClick={() => setShowTicketDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {tickets.filter((t) => t.status === "open").length}
            </div>
            <p className="text-sm text-slate-600">Open Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">
              {tickets.filter((t) => t.status === "in_progress").length}
            </div>
            <p className="text-sm text-slate-600">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {tickets.filter((t) => t.status === "resolved").length}
            </div>
            <p className="text-sm text-slate-600">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Archive className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-600">
              {tickets.filter((t) => t.status === "closed").length}
            </div>
            <p className="text-sm text-slate-600">Closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={ticketFilter} onValueChange={setTicketFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets
          .filter(
            (ticket) =>
              ticketFilter === "all" || ticket.status === ticketFilter,
          )
          .filter(
            (ticket) =>
              searchTerm === "" ||
              ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {ticket.subject}
                      </h3>
                      <Badge
                        className={
                          ticket.status === "open"
                            ? "bg-red-100 text-red-800"
                            : ticket.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : ticket.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                        }
                      >
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        className={
                          ticket.priority === "urgent"
                            ? "bg-red-500 text-white"
                            : ticket.priority === "high"
                              ? "bg-orange-500 text-white"
                              : ticket.priority === "medium"
                                ? "bg-yellow-500 text-white"
                                : "bg-gray-500 text-white"
                        }
                      >
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-slate-600 mb-3">{ticket.description}</p>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <span>👤 {ticket.userName}</span>
                      <span>📧 {ticket.userEmail}</span>
                      <span>📅 {ticket.createdAt.toLocaleDateString()}</span>
                      <span>💬 {ticket.responses.length} responses</span>
                      {ticket.assignedTo && (
                        <span>👨‍💼 Assigned to {ticket.assignedTo}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" className="bg-blue-600 text-white">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
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

  return (
    <div className="space-y-6">
      {/* Enhanced Mobile Header */}
      <div className="mb-4 md:mb-6">
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-3 px-2">
            {onNavigateBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateBack}
                className="flex items-center gap-1 px-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="sr-only md:inline">Back</span>
              </Button>
            )}
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-slate-800">
                🛡️ Admin Panel
              </h1>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="relative p-2">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 min-w-[16px] h-4 text-[10px]">
                  3
                </Badge>
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-600 text-center px-2">
            System management and oversight
          </p>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onNavigateBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Main
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                🛡️ Administrator Dashboard
              </h1>
              <p className="text-slate-600">
                System management and oversight platform
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4 mr-2" />
              System Alerts
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[20px] h-5">
                3
              </Badge>
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Mobile Tab Navigation */}
        <div className="md:hidden mb-4">
          <TabsList className="grid w-full grid-cols-5 h-12 bg-slate-100">
            <TabsTrigger value="overview" className="flex flex-col items-center gap-0.5 px-1 py-2 data-[state=active]:bg-white">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex flex-col items-center gap-0.5 px-1 py-2 data-[state=active]:bg-white">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs">Content</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex flex-col items-center gap-0.5 px-1 py-2 data-[state=active]:bg-white">
              <Users className="w-4 h-4" />
              <span className="text-xs">Users</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col items-center gap-0.5 px-1 py-2 data-[state=active]:bg-white">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex flex-col items-center gap-0.5 px-1 py-2 data-[state=active]:bg-white">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">Support</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden md:block">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Support
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">{renderOverview()}</TabsContent>
        <TabsContent value="content">{renderContentManagement()}</TabsContent>
        <TabsContent value="users">{renderUserManagement()}</TabsContent>
        <TabsContent value="analytics">{renderAnalytics()}</TabsContent>
        <TabsContent value="tickets">{renderSupportTickets()}</TabsContent>
      </Tabs>

      {/* Add Word Dialog */}
      <Dialog open={showWordDialog} onOpenChange={setShowWordDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>📚 Add New Word</DialogTitle>
            <DialogDescription>
              Add a new word to the vocabulary database
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="word">Word</Label>
              <Input
                id="word"
                value={newWordData.word}
                onChange={(e) =>
                  setNewWordData((prev) => ({ ...prev, word: e.target.value }))
                }
                placeholder="Enter word"
              />
            </div>
            <div>
              <Label htmlFor="pronunciation">Pronunciation</Label>
              <Input
                id="pronunciation"
                value={newWordData.pronunciation}
                onChange={(e) =>
                  setNewWordData((prev) => ({
                    ...prev,
                    pronunciation: e.target.value,
                  }))
                }
                placeholder="EX-am-ple"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="definition">Definition</Label>
              <Textarea
                id="definition"
                value={newWordData.definition}
                onChange={(e) =>
                  setNewWordData((prev) => ({
                    ...prev,
                    definition: e.target.value,
                  }))
                }
                placeholder="Word definition..."
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="example">Example Sentence</Label>
              <Textarea
                id="example"
                value={newWordData.example}
                onChange={(e) =>
                  setNewWordData((prev) => ({
                    ...prev,
                    example: e.target.value,
                  }))
                }
                placeholder="Example sentence using the word..."
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newWordData.category}
                onValueChange={(value) =>
                  setNewWordData((prev) => ({ ...prev, category: value }))
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
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={newWordData.difficulty}
                onValueChange={(value: any) =>
                  setNewWordData((prev) => ({ ...prev, difficulty: value }))
                }
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
            <div className="col-span-2">
              <Label htmlFor="funFact">Fun Fact (Optional)</Label>
              <Textarea
                id="funFact"
                value={newWordData.funFact}
                onChange={(e) =>
                  setNewWordData((prev) => ({
                    ...prev,
                    funFact: e.target.value,
                  }))
                }
                placeholder="Interesting fact about this word..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowWordDialog(false)}>Add Word</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🏷️ Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category for organizing words
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategoryData.name}
                onChange={(e) =>
                  setNewCategoryData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Category name"
              />
            </div>
            <div>
              <Label htmlFor="categoryEmoji">Emoji</Label>
              <Input
                id="categoryEmoji"
                value={newCategoryData.emoji}
                onChange={(e) =>
                  setNewCategoryData((prev) => ({
                    ...prev,
                    emoji: e.target.value,
                  }))
                }
                placeholder="Choose an emoji"
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={newCategoryData.description}
                onChange={(e) =>
                  setNewCategoryData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Category description..."
              />
            </div>
            <div>
              <Label htmlFor="categoryDifficulty">Default Difficulty</Label>
              <Select
                value={newCategoryData.difficulty}
                onValueChange={(value: any) =>
                  setNewCategoryData((prev) => ({ ...prev, difficulty: value }))
                }
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setShowCategoryDialog(false)}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <BulkWordImport
        open={showBulkImport}
        onOpenChange={setShowBulkImport}
        categories={categories}
        onImport={(words) => {
          console.log("Importing words:", words);
          setShowBulkImport(false);
        }}
      />

      {/* Word Editor Dialog */}
      <WordEditor
        open={showWordEditor}
        onOpenChange={setShowWordEditor}
        word={editingWord}
        categories={categories}
        mode={wordEditorMode}
        onSave={(word) => {
          if (wordEditorMode === "create") {
            setWords((prev) => [...prev, word]);
          } else {
            setWords((prev) => prev.map((w) => (w.id === word.id ? word : w)));
          }
          setShowWordEditor(false);
        }}
      />
    </div>
  );
};

export default AdminDashboard;
