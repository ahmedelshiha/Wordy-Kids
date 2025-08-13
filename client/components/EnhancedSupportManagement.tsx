import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MessageSquare,
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  Eye,
  Edit,
  MoreVertical,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  Mail,
  Phone,
  Calendar,
  User,
  Tag,
  RefreshCw,
  Send,
  Paperclip,
  Star,
  Flag,
  UserCheck,
  Settings,
  Bell,
  Trash2,
  Reply,
  Forward,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  FileText,
  ChevronDown,
  ChevronRight,
  Hash,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Save,
  X,
  Info,
  AlertTriangle,
  Ban,
  Unlock,
  Shield,
  Zap,
  Timer,
  History,
  ExternalLink,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: "parent" | "child" | "teacher" | "admin";
  userAvatar?: string;
  subject: string;
  description: string;
  category: "technical" | "billing" | "content" | "account" | "feature_request" | "bug_report" | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
  assignedTo?: string;
  assignedToAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  firstResponseAt?: Date;
  tags: string[];
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  responses: Array<{
    id: string;
    message: string;
    isAdmin: boolean;
    author: string;
    authorAvatar?: string;
    timestamp: Date;
    attachments?: Array<{
      id: string;
      name: string;
      url: string;
    }>;
    internal?: boolean; // Internal notes visible only to admins
  }>;
  satisfaction?: {
    rating: number;
    feedback?: string;
    submittedAt: Date;
  };
  relatedTickets?: string[];
  escalated?: boolean;
  escalatedAt?: Date;
  escalatedTo?: string;
  deviceInfo?: {
    browser: string;
    os: string;
    device: string;
    screenSize: string;
  };
  urgencyScore: number; // Calculated urgency score
  autoResponders?: boolean;
  slaBreached?: boolean;
  businessHours?: boolean;
}

interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "agent" | "supervisor" | "admin";
  status: "online" | "away" | "busy" | "offline";
  specialties: string[];
  activeTickets: number;
  totalTickets: number;
  avgResponseTime: number;
  satisfactionRating: number;
  workload: "light" | "moderate" | "heavy";
}

interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  satisfactionScore: number;
  slaCompliance: number;
  firstContactResolution: number;
  escalationRate: number;
  ticketVolumeChange: number;
  categoryBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  hourlyVolume: Array<{ hour: number; count: number }>;
}

// Enhanced mock data with realistic tickets
const sampleTickets: SupportTicket[] = [
  {
    id: "ticket-001",
    userId: "user-123",
    userName: "Sarah Johnson",
    userEmail: "sarah.johnson@example.com",
    userRole: "parent",
    subject: "Unable to track child's progress",
    description: "I can't see my child's learning progress in the dashboard. The stats show zero even though she has been using the app for weeks.",
    category: "technical",
    priority: "medium",
    status: "open",
    assignedTo: "Agent Smith",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    tags: ["progress-tracking", "dashboard", "parent-account"],
    attachments: [],
    responses: [
      {
        id: "res-001",
        message: "Hello Sarah, thank you for contacting us. I'll help you resolve this issue. Can you please tell me your child's username so I can check their account?",
        isAdmin: true,
        author: "Agent Smith",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      }
    ],
    urgencyScore: 65,
    deviceInfo: {
      browser: "Chrome 120",
      os: "Windows 11",
      device: "Desktop",
      screenSize: "1920x1080"
    },
    businessHours: true,
  },
  {
    id: "ticket-002",
    userId: "user-456",
    userName: "Dr. Michael Chen",
    userEmail: "m.chen@brightschool.edu",
    userRole: "teacher",
    subject: "Bulk word upload feature request",
    description: "As an educator, I need to upload 200+ vocabulary words for my advanced students. The current interface only allows one word at a time.",
    category: "feature_request",
    priority: "low",
    status: "in_progress",
    assignedTo: "Jane Doe",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    firstResponseAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
    tags: ["feature-request", "bulk-upload", "teacher", "enhancement"],
    attachments: [
      {
        id: "att-001",
        name: "vocabulary_list.csv",
        url: "#",
        size: 15420,
        type: "text/csv"
      }
    ],
    responses: [
      {
        id: "res-002",
        message: "Thank you for this suggestion! I've forwarded this to our product team. This is indeed a valuable feature for educators.",
        isAdmin: true,
        author: "Jane Doe",
        timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "res-003",
        message: "I've attached a sample CSV file with the words I'd like to upload. Please let me know when this feature becomes available.",
        isAdmin: false,
        author: "Dr. Michael Chen",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      }
    ],
    urgencyScore: 30,
    deviceInfo: {
      browser: "Safari 17",
      os: "macOS Sonoma",
      device: "MacBook",
      screenSize: "2560x1600"
    },
    businessHours: true,
  },
  {
    id: "ticket-003",
    userId: "user-789",
    userName: "Emma Rodriguez",
    userEmail: "emma.r@gmail.com",
    userRole: "parent",
    subject: "Payment issue - Premium subscription",
    description: "My credit card was charged but my account still shows as free tier. I upgraded yesterday but nothing has changed.",
    category: "billing",
    priority: "high",
    status: "resolved",
    assignedTo: "Billing Team",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    firstResponseAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    tags: ["billing", "premium", "payment", "subscription"],
    attachments: [],
    responses: [
      {
        id: "res-004",
        message: "I've checked your account and can see the payment went through. Your premium features have been activated. Please log out and log back in to see the changes.",
        isAdmin: true,
        author: "Billing Team",
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
      },
      {
        id: "res-005",
        message: "Perfect! It's working now. Thank you for the quick resolution!",
        isAdmin: false,
        author: "Emma Rodriguez",
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
      }
    ],
    satisfaction: {
      rating: 5,
      feedback: "Excellent support! Very quick resolution.",
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    urgencyScore: 85,
    deviceInfo: {
      browser: "Chrome Mobile",
      os: "Android 14",
      device: "Samsung Galaxy S24",
      screenSize: "1080x2340"
    },
    businessHours: true,
  },
  {
    id: "ticket-004",
    userId: "user-101",
    userName: "Alex Thompson",
    userEmail: "alex.t@example.com",
    userRole: "child",
    subject: "Game freezes during word challenges",
    description: "The word matching game keeps freezing when I try to drag words. It happens every few games and I lose my progress.",
    category: "bug_report",
    priority: "medium",
    status: "waiting_user",
    assignedTo: "Tech Support",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    tags: ["bug", "game", "freezing", "word-matching", "child-account"],
    attachments: [],
    responses: [
      {
        id: "res-006",
        message: "Hi Alex! That sounds frustrating. Can you tell me what device you're using and what browser? Also, does this happen with other games too?",
        isAdmin: true,
        author: "Tech Support",
        timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "res-007",
        message: "Internal note: Similar reports from other users on older iPad models. Investigating performance optimization.",
        isAdmin: true,
        author: "Tech Support",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        internal: true,
      }
    ],
    urgencyScore: 70,
    deviceInfo: {
      browser: "Safari Mobile",
      os: "iOS 16",
      device: "iPad Air",
      screenSize: "820x1180"
    },
    businessHours: false,
  }
];

const sampleAgents: SupportAgent[] = [
  {
    id: "agent-001",
    name: "Agent Smith",
    email: "smith@support.com",
    role: "agent",
    status: "online",
    specialties: ["technical", "account"],
    activeTickets: 5,
    totalTickets: 234,
    avgResponseTime: 2.3,
    satisfactionRating: 4.7,
    workload: "moderate",
  },
  {
    id: "agent-002",
    name: "Jane Doe",
    email: "jane@support.com",
    role: "agent",
    status: "online",
    specialties: ["billing", "feature_request"],
    activeTickets: 3,
    totalTickets: 189,
    avgResponseTime: 1.8,
    satisfactionRating: 4.9,
    workload: "light",
  },
  {
    id: "agent-003",
    name: "Billing Team",
    email: "billing@support.com",
    role: "agent",
    status: "online",
    specialties: ["billing"],
    activeTickets: 8,
    totalTickets: 156,
    avgResponseTime: 1.2,
    satisfactionRating: 4.8,
    workload: "heavy",
  },
];

interface EnhancedSupportManagementProps {
  initialTickets?: SupportTicket[];
  agents?: SupportAgent[];
}

const EnhancedSupportManagement: React.FC<EnhancedSupportManagementProps> = ({
  initialTickets = sampleTickets,
  agents = sampleAgents,
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "createdAt",
    direction: "desc",
  });
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [showTicketDetail, setShowTicketDetail] = useState<SupportTicket | null>(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh functionality
  useEffect(() => {
    if (!isAutoRefresh) return;
    
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      // In a real app, this would fetch new tickets from the API
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  // Calculate metrics
  const metrics: SupportMetrics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "open").length;
    const resolved = tickets.filter(t => 
      t.status === "resolved" && 
      t.resolvedAt && 
      t.resolvedAt.toDateString() === new Date().toDateString()
    ).length;

    const responseTimes = tickets
      .filter(t => t.firstResponseAt)
      .map(t => {
        const created = t.createdAt.getTime();
        const firstResponse = t.firstResponseAt!.getTime();
        return (firstResponse - created) / (1000 * 60 * 60); // hours
      });

    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const satisfactionRatings = tickets
      .filter(t => t.satisfaction)
      .map(t => t.satisfaction!.rating);
    
    const satisfactionScore = satisfactionRatings.length > 0
      ? satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length
      : 0;

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    tickets.forEach(ticket => {
      categoryBreakdown[ticket.category] = (categoryBreakdown[ticket.category] || 0) + 1;
    });

    // Priority breakdown
    const priorityBreakdown: Record<string, number> = {};
    tickets.forEach(ticket => {
      priorityBreakdown[ticket.priority] = (priorityBreakdown[ticket.priority] || 0) + 1;
    });

    return {
      totalTickets: total,
      openTickets: open,
      resolvedToday: resolved,
      avgResponseTime,
      avgResolutionTime: 24.5, // Mock data
      satisfactionScore,
      slaCompliance: 94.2,
      firstContactResolution: 67.8,
      escalationRate: 8.5,
      ticketVolumeChange: 12.3,
      categoryBreakdown,
      priorityBreakdown,
      hourlyVolume: [], // Mock data
    };
  }, [tickets]);

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let filtered = tickets.filter(ticket => {
      const matchesSearch = searchTerm === "" || 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;
      const matchesAssignee = assigneeFilter === "all" || ticket.assignedTo === assigneeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssignee;
    });

    // Sort tickets
    filtered.sort((a, b) => {
      const aValue = a[sortBy.field as keyof SupportTicket];
      const bValue = b[sortBy.field as keyof SupportTicket];
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortBy.direction === "asc" 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortBy.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortBy.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter, assigneeFilter, sortBy]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "waiting_user": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "resolved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closed": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical": return <Settings className="w-4 h-4" />;
      case "billing": return <Target className="w-4 h-4" />;
      case "content": return <FileText className="w-4 h-4" />;
      case "account": return <User className="w-4 h-4" />;
      case "feature_request": return <Zap className="w-4 h-4" />;
      case "bug_report": return <AlertTriangle className="w-4 h-4" />;
      case "general": return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getAgentStatus = (status: string) => {
    switch (status) {
      case "online": return { color: "bg-green-500", label: "Online" };
      case "away": return { color: "bg-yellow-500", label: "Away" };
      case "busy": return { color: "bg-red-500", label: "Busy" };
      case "offline": return { color: "bg-gray-500", label: "Offline" };
      default: return { color: "bg-gray-500", label: "Unknown" };
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTickets(
      selectedTickets.length === filteredTickets.length 
        ? [] 
        : filteredTickets.map(ticket => ticket.id)
    );
  };

  const handleBulkStatusUpdate = (newStatus: string) => {
    setTickets(prev => 
      prev.map(ticket => 
        selectedTickets.includes(ticket.id) 
          ? { ...ticket, status: newStatus as any, updatedAt: new Date() }
          : ticket
      )
    );
    setSelectedTickets([]);
    setShowBulkActions(false);
  };

  const handleBulkAssign = (assignee: string) => {
    setTickets(prev => 
      prev.map(ticket => 
        selectedTickets.includes(ticket.id) 
          ? { ...ticket, assignedTo: assignee, updatedAt: new Date() }
          : ticket
      )
    );
    setSelectedTickets([]);
    setShowBulkActions(false);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">🎫 Support Management</h2>
          <p className="text-slate-600 mt-1">
            Comprehensive ticket management and customer support system
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
            <div className={`flex items-center gap-2 ${isAutoRefresh ? 'text-green-600' : ''}`}>
              <div className={`w-2 h-2 rounded-full ${isAutoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {isAutoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </div>
            <span>•</span>
            <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={isAutoRefresh ? "bg-green-50 border-green-200 text-green-700" : ""}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isAutoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Tickets
          </Button>
          
          <Button size="sm" onClick={() => setShowCreateTicket(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2 w-fit">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              <AnimatedCounter end={metrics.totalTickets} duration={1000} />
            </div>
            <p className="text-xs text-slate-600">Total Tickets</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg mx-auto mb-2 w-fit">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">
              <AnimatedCounter end={metrics.openTickets} duration={1000} />
            </div>
            <p className="text-xs text-slate-600">Open Tickets</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2 w-fit">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              <AnimatedCounter end={metrics.resolvedToday} duration={1000} />
            </div>
            <p className="text-xs text-slate-600">Resolved Today</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg mx-auto mb-2 w-fit">
              <Timer className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              <AnimatedCounter end={metrics.avgResponseTime} duration={1000} decimals={1} />h
            </div>
            <p className="text-xs text-slate-600">Avg Response</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-2 w-fit">
              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              <AnimatedCounter end={metrics.satisfactionScore} duration={1000} decimals={1} />
            </div>
            <p className="text-xs text-slate-600">Satisfaction</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg mx-auto mb-2 w-fit">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              <AnimatedCounter end={metrics.slaCompliance} duration={1000} decimals={1} />%
            </div>
            <p className="text-xs text-slate-600">SLA Compliance</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg mx-auto mb-2 w-fit">
              <Zap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-teal-600 mb-1">
              <AnimatedCounter end={metrics.firstContactResolution} duration={1000} decimals={1} />%
            </div>
            <p className="text-xs text-slate-600">First Contact</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg mx-auto mb-2 w-fit">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-1">
              +<AnimatedCounter end={metrics.ticketVolumeChange} duration={1000} decimals={1} />%
            </div>
            <p className="text-xs text-slate-600">Volume Change</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search and Primary Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets by subject, user, email, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_user">Waiting User</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant={viewMode === "kanban" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                >
                  <PieChart className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedTickets.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''} selected
                </span>
                
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Bulk Actions
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate("in_progress")}>
                        Mark as In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate("resolved")}>
                        Mark as Resolved
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate("closed")}>
                        Mark as Closed
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Assign To</DropdownMenuLabel>
                      {agents && agents.length > 0 ? agents.map(agent => (
                        <DropdownMenuItem
                          key={agent.id}
                          onClick={() => handleBulkAssign(agent.name)}
                        >
                          {agent.name}
                        </DropdownMenuItem>
                      )) : (
                        <DropdownMenuItem disabled>
                          No agents available
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTickets([])}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tickets Display */}
      {viewMode === "list" ? (
        <div className="space-y-4">
          {/* List Header */}
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Checkbox
              checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
              <div className="col-span-4">Subject & User</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Assigned</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>

          {/* Ticket List */}
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedTickets.includes(ticket.id)}
                    onCheckedChange={() => handleTicketSelect(ticket.id)}
                  />
                  
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    {/* Subject & User */}
                    <div className="col-span-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm cursor-pointer hover:text-blue-600"
                            onClick={() => setShowTicketDetail(ticket)}>
                          {ticket.subject}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-xs">
                              {ticket.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{ticket.userName}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(ticket.createdAt)}</span>
                        </div>
                        {ticket.tags.length > 0 && (
                          <div className="flex gap-1">
                            {ticket.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {ticket.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{ticket.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(ticket.category)}
                        <span className="text-sm capitalize">{ticket.category.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="col-span-1">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Assigned */}
                    <div className="col-span-2">
                      {ticket.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {ticket.assignedTo.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setShowTicketDetail(ticket)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Reply className="w-4 h-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Assign to Me
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="w-4 h-4 mr-2" />
                            Escalate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Urgency Indicator */}
                {ticket.urgencyScore > 80 && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">High Urgency Score: {ticket.urgencyScore}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredTickets.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search terms or filters to find tickets.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setCategoryFilter("all");
                  setAssigneeFilter("all");
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {["open", "in_progress", "waiting_user", "resolved", "closed"].map(status => (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium capitalize">{status.replace('_', ' ')}</h3>
                <Badge variant="secondary">
                  {filteredTickets.filter(t => t.status === status).length}
                </Badge>
              </div>
              
              <div className="space-y-3 min-h-[400px]">
                {filteredTickets
                  .filter(ticket => ticket.status === status)
                  .map(ticket => (
                    <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setShowTicketDetail(ticket)}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm leading-tight">{ticket.subject}</h4>
                            <Badge className={getPriorityColor(ticket.priority)} size="sm">
                              {ticket.priority}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Avatar className="w-4 h-4">
                              <AvatarFallback className="text-xs">
                                {ticket.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{ticket.userName}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatTimeAgo(ticket.createdAt)}</span>
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(ticket.category)}
                              <span>{ticket.category}</span>
                            </div>
                          </div>
                          
                          {ticket.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {ticket.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {ticket.assignedTo && (
                            <div className="flex items-center gap-2 text-xs">
                              <UserCheck className="w-3 h-3" />
                              <span>{ticket.assignedTo}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Detail Dialog */}
      {showTicketDetail && (
        <Dialog open={!!showTicketDetail} onOpenChange={() => setShowTicketDetail(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(showTicketDetail.category)}
                  <span>{showTicketDetail.subject}</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(showTicketDetail.priority)}>
                    {showTicketDetail.priority}
                  </Badge>
                  <Badge className={getStatusColor(showTicketDetail.status)}>
                    {showTicketDetail.status.replace('_', ' ')}
                  </Badge>
                </div>
              </DialogTitle>
              <DialogDescription>
                Ticket #{showTicketDetail.id} • Created {showTicketDetail.createdAt.toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="related">Related</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Description</Label>
                      <p className="text-sm mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {showTicketDetail.description}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="font-medium">User Information</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {showTicketDetail.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{showTicketDetail.userName}</p>
                            <p className="text-sm text-gray-500">{showTicketDetail.userEmail}</p>
                            <Badge variant="outline" className="text-xs">
                              {showTicketDetail.userRole}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {showTicketDetail.deviceInfo && (
                      <div>
                        <Label className="font-medium">Device Information</Label>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Browser:</span>
                            <span className="ml-2">{showTicketDetail.deviceInfo.browser}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">OS:</span>
                            <span className="ml-2">{showTicketDetail.deviceInfo.os}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Device:</span>
                            <span className="ml-2">{showTicketDetail.deviceInfo.device}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Screen:</span>
                            <span className="ml-2">{showTicketDetail.deviceInfo.screenSize}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Assignment</Label>
                      <div className="mt-2">
                        {showTicketDetail.assignedTo ? (
                          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Avatar>
                              <AvatarFallback>
                                {showTicketDetail.assignedTo.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{showTicketDetail.assignedTo}</p>
                              <p className="text-sm text-gray-500">Support Agent</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            No agent assigned
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="font-medium">Tags</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {showTicketDetail.tags.map(tag => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="font-medium">Timeline</Label>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>{showTicketDetail.createdAt.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Updated:</span>
                          <span>{showTicketDetail.updatedAt.toLocaleString()}</span>
                        </div>
                        {showTicketDetail.firstResponseAt && (
                          <div className="flex justify-between">
                            <span>First Response:</span>
                            <span>{showTicketDetail.firstResponseAt.toLocaleString()}</span>
                          </div>
                        )}
                        {showTicketDetail.resolvedAt && (
                          <div className="flex justify-between">
                            <span>Resolved:</span>
                            <span>{showTicketDetail.resolvedAt.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {showTicketDetail.satisfaction && (
                      <div>
                        <Label className="font-medium">Customer Satisfaction</Label>
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{showTicketDetail.satisfaction.rating}/5</span>
                          </div>
                          {showTicketDetail.satisfaction.feedback && (
                            <p className="text-sm italic">"{showTicketDetail.satisfaction.feedback}"</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="conversation" className="space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {showTicketDetail.responses.map((response, index) => (
                    <div key={response.id} className={`flex gap-3 ${response.isAdmin ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="flex-shrink-0">
                        <AvatarFallback>
                          {response.author.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 ${response.isAdmin ? 'text-right' : ''}`}>
                        <div className={`p-3 rounded-lg ${
                          response.isAdmin 
                            ? 'bg-blue-100 dark:bg-blue-900/20' 
                            : 'bg-gray-100 dark:bg-gray-800'
                        } ${response.internal ? 'border-2 border-yellow-200' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{response.author}</span>
                            <span className="text-xs text-gray-500">
                              {response.timestamp.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{response.message}</p>
                          {response.internal && (
                            <Badge className="mt-2" variant="outline">
                              <Lock className="w-3 h-3 mr-1" />
                              Internal Note
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your response..."
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Paperclip className="w-4 h-4 mr-2" />
                          Attach File
                        </Button>
                        <Checkbox id="internal" />
                        <Label htmlFor="internal" className="text-sm">Internal note</Label>
                      </div>
                      <Button>
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Ticket created</p>
                      <p className="text-xs text-gray-500">{showTicketDetail.createdAt.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {showTicketDetail.assignedTo && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Assigned to {showTicketDetail.assignedTo}</p>
                        <p className="text-xs text-gray-500">{showTicketDetail.updatedAt.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {showTicketDetail.responses.map((response, index) => (
                    <div key={response.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {response.isAdmin ? 'Agent responded' : 'Customer replied'}
                        </p>
                        <p className="text-xs text-gray-500">{response.timestamp.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  
                  {showTicketDetail.resolvedAt && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Ticket resolved</p>
                        <p className="text-xs text-gray-500">{showTicketDetail.resolvedAt.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="related" className="space-y-4">
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No related tickets</h3>
                  <p className="text-gray-500">
                    No other tickets found from this user or similar issues.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedSupportManagement;
