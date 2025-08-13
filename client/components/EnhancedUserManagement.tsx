import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  CreditCard,
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  Eye,
  Edit,
  Ban,
  Unlock,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Activity,
  Award,
  Bell,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Star,
  Target,
  Globe,
  BookOpen,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  RefreshCw,
  Save,
  X,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "parent" | "child" | "teacher";
  status: "active" | "suspended" | "inactive" | "pending";
  createdAt: Date;
  lastActive: Date;
  childrenCount?: number;
  totalSessions: number;
  supportTickets: number;
  subscriptionType: "free" | "premium" | "family" | "school";
  progress?: {
    wordsLearned: number;
    averageAccuracy: number;
    streakDays: number;
    totalPlayTime: number;
  };
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
    timezone: string;
  };
  location?: {
    country: string;
    state?: string;
    city?: string;
  };
  deviceInfo?: {
    platform: string;
    lastLoginDevice: string;
  };
  tags?: string[];
  notes?: string;
  parentId?: string;
  subscription?: {
    plan: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    paymentStatus: "paid" | "pending" | "failed" | "cancelled";
  };
}

interface UserFilters {
  role: string;
  status: string;
  subscription: string;
  location: string;
  dateRange: string;
}

interface BulkAction {
  type: "activate" | "suspend" | "delete" | "export" | "sendMessage" | "updateRole";
  label: string;
  icon: React.ComponentType<any>;
  variant?: "default" | "destructive" | "secondary";
}

// Enhanced mock data with more realistic and diverse users
const sampleUsers: AdminUser[] = [
  {
    id: "1",
    name: "John Parent",
    email: "john.parent@example.com",
    role: "parent",
    status: "active",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    childrenCount: 2,
    totalSessions: 145,
    supportTickets: 1,
    subscriptionType: "family",
    progress: {
      wordsLearned: 0,
      averageAccuracy: 0,
      streakDays: 0,
      totalPlayTime: 0,
    },
    preferences: {
      notifications: true,
      emailUpdates: true,
      language: "en",
      timezone: "UTC-5",
    },
    location: {
      country: "United States",
      state: "California",
      city: "San Francisco",
    },
    deviceInfo: {
      platform: "iOS",
      lastLoginDevice: "iPhone 15",
    },
    tags: ["premium-user", "engaged-parent"],
    subscription: {
      plan: "Family Plan",
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      isActive: true,
      paymentStatus: "paid",
    },
  },
  {
    id: "2",
    name: "Emma Johnson",
    email: "emma.j@kidschool.edu",
    role: "child",
    status: "active",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    totalSessions: 234,
    supportTickets: 0,
    subscriptionType: "school",
    parentId: "1",
    progress: {
      wordsLearned: 187,
      averageAccuracy: 92,
      streakDays: 12,
      totalPlayTime: 1420,
    },
    preferences: {
      notifications: true,
      emailUpdates: false,
      language: "en",
      timezone: "UTC-5",
    },
    location: {
      country: "United States",
      state: "California",
      city: "San Francisco",
    },
    deviceInfo: {
      platform: "Web",
      lastLoginDevice: "iPad",
    },
    tags: ["high-performer", "consistent-learner"],
  },
  {
    id: "3",
    name: "Dr. Sarah Williams",
    email: "s.williams@brightschool.edu",
    role: "teacher",
    status: "active",
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    childrenCount: 25,
    totalSessions: 89,
    supportTickets: 2,
    subscriptionType: "school",
    preferences: {
      notifications: true,
      emailUpdates: true,
      language: "en",
      timezone: "UTC-8",
    },
    location: {
      country: "United States",
      state: "Oregon",
      city: "Portland",
    },
    deviceInfo: {
      platform: "Web",
      lastLoginDevice: "Desktop",
    },
    tags: ["educator", "power-user", "content-creator"],
    notes: "Highly engaged teacher, frequently submits word suggestions",
  },
  {
    id: "4",
    name: "Alex Chen",
    email: "alex.chen88@gmail.com",
    role: "child",
    status: "suspended",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    totalSessions: 12,
    supportTickets: 3,
    subscriptionType: "free",
    progress: {
      wordsLearned: 23,
      averageAccuracy: 68,
      streakDays: 0,
      totalPlayTime: 145,
    },
    preferences: {
      notifications: false,
      emailUpdates: false,
      language: "en",
      timezone: "UTC+8",
    },
    location: {
      country: "Singapore",
      city: "Singapore",
    },
    deviceInfo: {
      platform: "Android",
      lastLoginDevice: "Samsung Galaxy",
    },
    tags: ["support-needed", "behavioral-issues"],
    notes: "Suspended due to inappropriate content reporting. Review scheduled for next week.",
  },
  {
    id: "5",
    name: "Maria Rodriguez",
    email: "maria.r@example.com",
    role: "parent",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    childrenCount: 1,
    totalSessions: 3,
    supportTickets: 0,
    subscriptionType: "premium",
    preferences: {
      notifications: true,
      emailUpdates: true,
      language: "es",
      timezone: "UTC-6",
    },
    location: {
      country: "Mexico",
      state: "Mexico City",
      city: "Mexico City",
    },
    deviceInfo: {
      platform: "iOS",
      lastLoginDevice: "iPhone 14",
    },
    tags: ["new-user", "spanish-speaker"],
    subscription: {
      plan: "Premium Monthly",
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isActive: false,
      paymentStatus: "pending",
    },
  },
];

interface EnhancedUserManagementProps {
  initialUsers?: AdminUser[];
}

const EnhancedUserManagement: React.FC<EnhancedUserManagementProps> = ({
  initialUsers = sampleUsers,
}) => {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [sortBy, setSortBy] = useState<{
    field: keyof AdminUser;
    direction: "asc" | "desc";
  }>({ field: "lastActive", direction: "desc" });

  const [filters, setFilters] = useState<UserFilters>({
    role: "all",
    status: "all",
    subscription: "all",
    location: "all",
    dateRange: "all",
  });

  // Dialog states
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState<BulkAction | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userDetailView, setUserDetailView] = useState<AdminUser | null>(null);

  const bulkActions: BulkAction[] = [
    { type: "activate", label: "Activate Users", icon: CheckCircle, variant: "default" },
    { type: "suspend", label: "Suspend Users", icon: Ban, variant: "destructive" },
    { type: "updateRole", label: "Update Role", icon: Shield, variant: "secondary" },
    { type: "sendMessage", label: "Send Message", icon: MessageSquare, variant: "default" },
    { type: "export", label: "Export Data", icon: Download, variant: "secondary" },
    { type: "delete", label: "Delete Users", icon: X, variant: "destructive" },
  ];

  // Filtering and sorting logic
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = filters.role === "all" || user.role === filters.role;
      const matchesStatus = filters.status === "all" || user.status === filters.status;
      const matchesSubscription = filters.subscription === "all" || user.subscriptionType === filters.subscription;
      const matchesLocation = filters.location === "all" || user.location?.country === filters.location;

      return matchesSearch && matchesRole && matchesStatus && matchesSubscription && matchesLocation;
    });

    // Sort users
    filtered.sort((a, b) => {
      const aValue = a[sortBy.field];
      const bValue = b[sortBy.field];
      
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
  }, [users, searchTerm, filters, sortBy]);

  // Statistics calculations
  const userStats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === "active").length;
    const parents = users.filter(u => u.role === "parent").length;
    const children = users.filter(u => u.role === "child").length;
    const teachers = users.filter(u => u.role === "teacher").length;
    const premium = users.filter(u => ["premium", "family", "school"].includes(u.subscriptionType)).length;
    const suspended = users.filter(u => u.status === "suspended").length;
    const pending = users.filter(u => u.status === "pending").length;

    return { total, active, parents, children, teachers, premium, suspended, pending };
  }, [users]);

  const handleSort = (field: keyof AdminUser) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredAndSortedUsers.length
        ? []
        : filteredAndSortedUsers.map(user => user.id)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "suspended": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "teacher": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "parent": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "child": return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case "premium": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "family": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "school": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "free": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const renderUserStats = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4 mb-4 md:mb-6">
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{userStats.total}</div>
          <p className="text-xs text-slate-600">Total Users</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-2xl font-bold text-green-600">{userStats.active}</div>
          <p className="text-xs text-slate-600">Active</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-2xl font-bold text-green-600">{userStats.parents}</div>
          <p className="text-xs text-slate-600">Parents</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-2xl font-bold text-pink-600">{userStats.children}</div>
          <p className="text-xs text-slate-600">Children</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{userStats.teachers}</div>
          <p className="text-xs text-slate-600">Teachers</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-2xl font-bold text-purple-600">{userStats.premium}</div>
          <p className="text-xs text-slate-600">Premium</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <Ban className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-2xl font-bold text-red-600">{userStats.suspended}</div>
          <p className="text-xs text-slate-600">Suspended</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">{userStats.pending}</div>
          <p className="text-xs text-slate-600">Pending</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderFilters = () => (
    <Card className="mb-4 md:mb-6">
      <CardContent className="p-3 md:p-4">
        {/* Mobile Search */}
        <div className="space-y-3 md:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users by name, email, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Mobile Filter Toggle */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                    {(filters.role !== "all" || filters.status !== "all" || filters.subscription !== "all") && (
                      <Badge variant="secondary" className="ml-2">
                        {[filters.role, filters.status, filters.subscription].filter(f => f !== "all").length}
                      </Badge>
                    )}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, role: "all" }))}>
                  All Roles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, role: "parent" }))}>
                  Parents
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, role: "child" }))}>
                  Children
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, role: "teacher" }))}>
                  Teachers
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "all" }))}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "active" }))}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "suspended" }))}>
                  Suspended
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "pending" }))}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Subscription</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, subscription: "all" }))}>
                  All Plans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, subscription: "free" }))}>
                  Free
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, subscription: "premium" }))}>
                  Premium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, subscription: "family" }))}>
                  Family
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex md:items-center gap-4 mt-4 lg:mt-0">
            <div className="flex flex-wrap gap-2 flex-1">
              <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="parent">Parents</SelectItem>
                  <SelectItem value="child">Children</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.subscription} onValueChange={(value) => setFilters(prev => ({ ...prev, subscription: value }))}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                {bulkActions.map((action) => (
                  <Button
                    key={action.type}
                    variant={action.variant}
                    size="sm"
                    onClick={() => {
                      setSelectedBulkAction(action);
                      setShowBulkActionDialog(true);
                    }}
                    className="text-xs"
                  >
                    <action.icon className="w-3 h-3 mr-1" />
                    {action.label}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTableView = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-12">Avatar</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Name
                  {sortBy.field === "name" && (
                    sortBy.direction === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Location</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => handleSort("lastActive")}
              >
                <div className="flex items-center gap-1">
                  Last Active
                  {sortBy.field === "lastActive" && (
                    sortBy.direction === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleSelectUser(user.id)}
                  />
                </TableCell>
                <TableCell>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.tags && user.tags.length > 0 && (
                      <div className="flex gap-1">
                        {user.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getSubscriptionColor(user.subscriptionType)}>
                    {user.subscriptionType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {user.location?.city && user.location?.country
                      ? `${user.location.city}, ${user.location.country}`
                      : user.location?.country || "Unknown"
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500">
                    {user.lastActive.toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  {user.progress && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">
                        {user.progress.wordsLearned} words
                      </div>
                      <Progress 
                        value={user.progress.averageAccuracy} 
                        className="h-1 w-16"
                      />
                      <div className="text-xs text-gray-500">
                        {user.progress.averageAccuracy}% accuracy
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setUserDetailView(user)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingUser(user)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="w-4 h-4 mr-2" />
                        Email User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === "active" ? (
                        <DropdownMenuItem className="text-red-600">
                          <Ban className="w-4 h-4 mr-2" />
                          Suspend User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Activate User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAndSortedUsers.map((user) => (
        <Card key={user.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => handleSelectUser(user.id)}
                />
                <Avatar className="w-12 h-12">
                  <AvatarFallback>
                    {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setUserDetailView(user)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditingUser(user)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex gap-2">
                <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                <Badge className={getSubscriptionColor(user.subscriptionType)}>
                  {user.subscriptionType}
                </Badge>
              </div>

              {user.tags && user.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {user.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Joined {user.createdAt.toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Last active {user.lastActive.toLocaleDateString()}
              </div>
              {user.location && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  {user.location.city && user.location.country
                    ? `${user.location.city}, ${user.location.country}`
                    : user.location.country
                  }
                </div>
              )}
              <div className="flex items-center gap-2">
                <BookOpen className="w-3 h-3" />
                {user.totalSessions} sessions
              </div>
              {user.progress && (
                <div className="flex items-center gap-2">
                  <Award className="w-3 h-3" />
                  {user.progress.wordsLearned} words learned
                </div>
              )}
            </div>

            {user.progress && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Accuracy</span>
                  <span>{user.progress.averageAccuracy}%</span>
                </div>
                <Progress value={user.progress.averageAccuracy} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="min-w-0">
          <h2 className="text-2xl md:text-3xl font-bold truncate">👥 Enhanced User Management</h2>
          <p className="text-slate-600 mt-1 text-sm md:text-base">
            Comprehensive user administration with advanced filtering and bulk operations
          </p>
        </div>

        {/* Mobile Action Menu */}
        <div className="flex gap-2 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Actions
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowUserDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="w-4 h-4 mr-2" />
                Import Users
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export Users
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
          >
            {viewMode === "table" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </Button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Users
          </Button>
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

      {/* Statistics */}
      {renderUserStats()}

      {/* Filters */}
      {renderFilters()}

      {/* User List */}
      {viewMode === "table" ? renderTableView() : renderCardView()}

      {/* Empty State */}
      {filteredAndSortedUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or filters to find users.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setFilters({
                role: "all",
                status: "all",
                subscription: "all",
                location: "all",
                dateRange: "all",
              });
            }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User Detail Dialog */}
      {userDetailView && (
        <Dialog open={!!userDetailView} onOpenChange={() => setUserDetailView(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {userDetailView.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {userDetailView.name}
              </DialogTitle>
              <DialogDescription>
                Detailed user information and activity overview
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{userDetailView.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Role</Label>
                        <Badge className={getRoleColor(userDetailView.role)}>{userDetailView.role}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge className={getStatusColor(userDetailView.status)}>{userDetailView.status}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Subscription</Label>
                        <Badge className={getSubscriptionColor(userDetailView.subscriptionType)}>
                          {userDetailView.subscriptionType}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Location & Device</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {userDetailView.location && (
                        <div>
                          <Label className="text-sm font-medium">Location</Label>
                          <p className="text-sm">
                            {[userDetailView.location.city, userDetailView.location.state, userDetailView.location.country]
                              .filter(Boolean).join(", ")}
                          </p>
                        </div>
                      )}
                      {userDetailView.deviceInfo && (
                        <>
                          <div>
                            <Label className="text-sm font-medium">Platform</Label>
                            <p className="text-sm">{userDetailView.deviceInfo.platform}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Last Device</Label>
                            <p className="text-sm">{userDetailView.deviceInfo.lastLoginDevice}</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {userDetailView.tags && userDetailView.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        {userDetailView.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {userDetailView.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{userDetailView.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{userDetailView.totalSessions}</div>
                      <p className="text-sm text-gray-600">Total Sessions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{userDetailView.supportTickets}</div>
                      <p className="text-sm text-gray-600">Support Tickets</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {Math.floor((Date.now() - userDetailView.lastActive.getTime()) / (1000 * 60 * 60))}h
                      </div>
                      <p className="text-sm text-gray-600">Hours Since Last Active</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                {userDetailView.progress ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Learning Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Words Learned</span>
                            <span className="font-medium">{userDetailView.progress.wordsLearned}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Average Accuracy</span>
                            <span className="font-medium">{userDetailView.progress.averageAccuracy}%</span>
                          </div>
                          <Progress value={userDetailView.progress.averageAccuracy} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Current Streak</span>
                            <span className="font-medium">{userDetailView.progress.streakDays} days</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Total Play Time</span>
                            <span className="font-medium">{Math.floor(userDetailView.progress.totalPlayTime / 60)}h {userDetailView.progress.totalPlayTime % 60}m</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Progress Data</h3>
                      <p className="text-gray-500">This user hasn't started learning yet.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                {userDetailView.preferences && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Notifications</Label>
                          <p className="text-xs text-gray-500">Push notifications enabled</p>
                        </div>
                        <Badge variant={userDetailView.preferences.notifications ? "default" : "secondary"}>
                          {userDetailView.preferences.notifications ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Email Updates</Label>
                          <p className="text-xs text-gray-500">Email notifications enabled</p>
                        </div>
                        <Badge variant={userDetailView.preferences.emailUpdates ? "default" : "secondary"}>
                          {userDetailView.preferences.emailUpdates ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Language</Label>
                          <p className="text-xs text-gray-500">Interface language</p>
                        </div>
                        <Badge variant="outline">{userDetailView.preferences.language.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Timezone</Label>
                          <p className="text-xs text-gray-500">User timezone</p>
                        </div>
                        <Badge variant="outline">{userDetailView.preferences.timezone}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {userDetailView.subscription && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Subscription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Plan</Label>
                        <p className="text-sm">{userDetailView.subscription.plan}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge 
                          variant={userDetailView.subscription.isActive ? "default" : "secondary"}
                        >
                          {userDetailView.subscription.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Payment Status</Label>
                        <Badge 
                          className={
                            userDetailView.subscription.paymentStatus === "paid" 
                              ? "bg-green-100 text-green-800"
                              : userDetailView.subscription.paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {userDetailView.subscription.paymentStatus}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <p className="text-sm">{userDetailView.subscription.startDate.toLocaleDateString()}</p>
                      </div>
                      {userDetailView.subscription.endDate && (
                        <div>
                          <Label className="text-sm font-medium">End Date</Label>
                          <p className="text-sm">{userDetailView.subscription.endDate.toLocaleDateString()}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Action Dialog */}
      {showBulkActionDialog && selectedBulkAction && (
        <AlertDialog open={showBulkActionDialog} onOpenChange={setShowBulkActionDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <selectedBulkAction.icon className="w-5 h-5" />
                {selectedBulkAction.label}
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are about to {selectedBulkAction.label.toLowerCase()} {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowBulkActionDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                className={selectedBulkAction.variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
                onClick={() => {
                  // Handle bulk action here
                  console.log(`Performing ${selectedBulkAction.type} on users:`, selectedUsers);
                  setShowBulkActionDialog(false);
                  setSelectedUsers([]);
                }}
              >
                Confirm {selectedBulkAction.label}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default EnhancedUserManagement;
