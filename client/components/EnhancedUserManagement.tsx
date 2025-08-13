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

  // Add User form states
  const [addUserStep, setAddUserStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Import Users states
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [importValidation, setImportValidation] = useState<{
    valid: any[];
    invalid: any[];
    warnings: any[];
  }>({ valid: [], invalid: [], warnings: [] });
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string; data: any }>;
  } | null>(null);

  // Export Users states
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xlsx'>('csv');
  const [exportFilters, setExportFilters] = useState({
    role: 'all',
    status: 'all',
    subscription: 'all',
    dateRange: 'all',
    includeInactive: true,
  });
  const [exportFields, setExportFields] = useState<Record<string, boolean>>({
    name: true,
    email: true,
    role: true,
    status: true,
    subscriptionType: true,
    createdAt: true,
    lastActive: true,
    location: false,
    totalSessions: false,
    supportTickets: false,
    progress: false,
    preferences: false,
    tags: false,
    notes: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Add User form data
  const [newUserData, setNewUserData] = useState({
    // Basic Information
    name: "",
    email: "",
    role: "parent" as AdminUser["role"],
    status: "active" as AdminUser["status"],

    // Account Details
    subscriptionType: "free" as AdminUser["subscriptionType"],
    parentId: "",

    // Contact & Location
    location: {
      country: "",
      state: "",
      city: "",
    },

    // Preferences
    preferences: {
      notifications: true,
      emailUpdates: true,
      language: "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },

    // Additional Info
    tags: [] as string[],
    notes: "",

    // Password (for initial setup)
    password: "",
    confirmPassword: "",
    sendWelcomeEmail: true,
  });

  const bulkActions: BulkAction[] = [
    { type: "activate", label: "Activate Users", icon: CheckCircle, variant: "default" },
    { type: "suspend", label: "Suspend Users", icon: Ban, variant: "destructive" },
    { type: "updateRole", label: "Update Role", icon: Shield, variant: "secondary" },
    { type: "sendMessage", label: "Send Message", icon: MessageSquare, variant: "default" },
    { type: "export", label: "Export Data", icon: Download, variant: "secondary" },
    { type: "delete", label: "Delete Users", icon: X, variant: "destructive" },
  ];

  // Form validation functions
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Information
        if (!newUserData.name.trim()) {
          errors.name = "Name is required";
        }
        if (!newUserData.email.trim()) {
          errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(newUserData.email)) {
          errors.email = "Email is invalid";
        } else if (users.some(user => user.email === newUserData.email)) {
          errors.email = "Email already exists";
        }
        if (!newUserData.role) {
          errors.role = "Role is required";
        }
        break;

      case 2: // Account Details
        if (newUserData.password && newUserData.password.length < 8) {
          errors.password = "Password must be at least 8 characters";
        }
        if (newUserData.password !== newUserData.confirmPassword) {
          errors.confirmPassword = "Passwords do not match";
        }
        if (newUserData.role === "child" && !newUserData.parentId) {
          errors.parentId = "Parent is required for child accounts";
        }
        break;

      case 3: // Contact & Preferences - Optional, no validation needed
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetAddUserForm = () => {
    setNewUserData({
      name: "",
      email: "",
      role: "parent",
      status: "active",
      subscriptionType: "free",
      parentId: "",
      location: {
        country: "",
        state: "",
        city: "",
      },
      preferences: {
        notifications: true,
        emailUpdates: true,
        language: "en",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      tags: [],
      notes: "",
      password: "",
      confirmPassword: "",
      sendWelcomeEmail: true,
    });
    setAddUserStep(1);
    setFormErrors({});
  };

  const handleAddUser = async () => {
    if (!validateStep(addUserStep)) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create new user
      const newUser: AdminUser = {
        id: (users.length + 1).toString(),
        name: newUserData.name,
        email: newUserData.email,
        role: newUserData.role,
        status: newUserData.status,
        createdAt: new Date(),
        lastActive: new Date(),
        totalSessions: 0,
        supportTickets: 0,
        subscriptionType: newUserData.subscriptionType,
        parentId: newUserData.parentId || undefined,
        childrenCount: newUserData.role === "parent" ? 0 : undefined,
        location: {
          country: newUserData.location.country,
          state: newUserData.location.state,
          city: newUserData.location.city,
        },
        preferences: newUserData.preferences,
        tags: newUserData.tags,
        notes: newUserData.notes,
        progress: newUserData.role === "child" ? {
          wordsLearned: 0,
          averageAccuracy: 0,
          streakDays: 0,
          totalPlayTime: 0,
        } : undefined,
      };

      // Add to users list
      setUsers(prev => [newUser, ...prev]);

      // Reset form and close dialog
      resetAddUserForm();
      setShowUserDialog(false);

      // Show success message (you could implement a toast here)
      console.log("User created successfully:", newUser);

    } catch (error) {
      console.error("Error creating user:", error);
      setFormErrors({ submit: "Failed to create user. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getParentUsers = () => {
    return users.filter(user => user.role === "parent");
  };

  const getAvailableCountries = () => {
    const countries = [...new Set(users.map(user => user.location?.country).filter(Boolean))];
    return ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Spain", "Italy", "Japan", "Singapore", "Mexico", "Brazil", ...countries].filter((country, index, self) => self.indexOf(country) === index);
  };

  // Import Users utility functions
  const resetImportForm = () => {
    setImportFile(null);
    setImportData([]);
    setImportHeaders([]);
    setFieldMapping({});
    setImportValidation({ valid: [], invalid: [], warnings: [] });
    setImportProgress(0);
    setImportResults(null);
    setImportStep(1);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    });
  };

  const processImportFile = async (file: File) => {
    try {
      const text = await file.text();
      let data: string[][];

      if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      } else {
        throw new Error('Unsupported file type. Please upload a CSV file.');
      }

      if (data.length < 2) {
        throw new Error('File must contain at least a header row and one data row.');
      }

      const headers = data[0].map(h => h.replace(/"/g, '').trim());
      const rows = data.slice(1).map((row, index) => {
        const obj: any = { _rowIndex: index + 2 }; // +2 because we start from row 2 (after header)
        headers.forEach((header, i) => {
          obj[header] = row[i] ? row[i].replace(/"/g, '').trim() : '';
        });
        return obj;
      });

      setImportHeaders(headers);
      setImportData(rows);

      // Auto-map common fields
      const autoMapping: Record<string, string> = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('name') || lowerHeader === 'full name' || lowerHeader === 'user name') {
          autoMapping[header] = 'name';
        } else if (lowerHeader.includes('email') || lowerHeader === 'email address') {
          autoMapping[header] = 'email';
        } else if (lowerHeader.includes('role') || lowerHeader === 'user role') {
          autoMapping[header] = 'role';
        } else if (lowerHeader.includes('status') || lowerHeader === 'account status') {
          autoMapping[header] = 'status';
        } else if (lowerHeader.includes('subscription') || lowerHeader === 'plan') {
          autoMapping[header] = 'subscriptionType';
        } else if (lowerHeader.includes('country')) {
          autoMapping[header] = 'location.country';
        } else if (lowerHeader.includes('state') || lowerHeader.includes('region')) {
          autoMapping[header] = 'location.state';
        } else if (lowerHeader.includes('city')) {
          autoMapping[header] = 'location.city';
        }
      });

      setFieldMapping(autoMapping);
      setImportStep(2);

    } catch (error) {
      console.error('Error processing file:', error);
      setFormErrors({ file: error instanceof Error ? error.message : 'Failed to process file' });
    }
  };

  const validateImportData = () => {
    const valid: any[] = [];
    const invalid: any[] = [];
    const warnings: any[] = [];

    importData.forEach(row => {
      const errors: string[] = [];
      const warns: string[] = [];

      // Get mapped values
      const mappedData: any = {};
      Object.entries(fieldMapping).forEach(([header, field]) => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (!mappedData[parent]) mappedData[parent] = {};
          mappedData[parent][child] = row[header];
        } else {
          mappedData[field] = row[header];
        }
      });

      // Validate required fields
      if (!mappedData.name || mappedData.name.trim() === '') {
        errors.push('Name is required');
      }

      if (!mappedData.email || mappedData.email.trim() === '') {
        errors.push('Email is required');
      } else if (!/\S+@\S+\.\S+/.test(mappedData.email)) {
        errors.push('Invalid email format');
      } else if (users.some(user => user.email === mappedData.email)) {
        errors.push('Email already exists');
      }

      if (!mappedData.role) {
        warns.push('Role not specified, will default to "parent"');
        mappedData.role = 'parent';
      } else if (!['parent', 'child', 'teacher', 'admin'].includes(mappedData.role)) {
        errors.push('Invalid role. Must be: parent, child, teacher, or admin');
      }

      if (mappedData.status && !['active', 'inactive', 'pending', 'suspended'].includes(mappedData.status)) {
        warns.push('Invalid status, will default to "active"');
        mappedData.status = 'active';
      }

      if (mappedData.subscriptionType && !['free', 'premium', 'family', 'school'].includes(mappedData.subscriptionType)) {
        warns.push('Invalid subscription type, will default to "free"');
        mappedData.subscriptionType = 'free';
      }

      const validationResult = {
        ...row,
        _mappedData: mappedData,
        _errors: errors,
        _warnings: warns
      };

      if (errors.length > 0) {
        invalid.push(validationResult);
      } else {
        if (warns.length > 0) {
          warnings.push(validationResult);
        }
        valid.push(validationResult);
      }
    });

    setImportValidation({ valid, invalid, warnings });
    setImportStep(3);
  };

  const performImport = async () => {
    setIsImporting(true);
    setImportProgress(0);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string; data: any }>
    };

    const validUsers = [...importValidation.valid, ...importValidation.warnings];
    const totalUsers = validUsers.length;

    try {
      for (let i = 0; i < validUsers.length; i++) {
        const userData = validUsers[i];
        const progress = Math.round(((i + 1) / totalUsers) * 100);
        setImportProgress(progress);

        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 100));

          const newUser: AdminUser = {
            id: (users.length + i + 1).toString(),
            name: userData._mappedData.name,
            email: userData._mappedData.email,
            role: userData._mappedData.role || 'parent',
            status: userData._mappedData.status || 'active',
            createdAt: new Date(),
            lastActive: new Date(),
            totalSessions: 0,
            supportTickets: 0,
            subscriptionType: userData._mappedData.subscriptionType || 'free',
            location: {
              country: userData._mappedData.location?.country || '',
              state: userData._mappedData.location?.state || '',
              city: userData._mappedData.location?.city || '',
            },
            preferences: {
              notifications: true,
              emailUpdates: true,
              language: 'en',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            progress: userData._mappedData.role === 'child' ? {
              wordsLearned: 0,
              averageAccuracy: 0,
              streakDays: 0,
              totalPlayTime: 0,
            } : undefined,
          };

          // Add to users list (we'll batch this at the end)
          setUsers(prev => [newUser, ...prev]);
          results.success++;

        } catch (error) {
          results.failed++;
          results.errors.push({
            row: userData._rowIndex,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: userData._mappedData
          });
        }
      }

      setImportResults(results);
      setImportStep(4);

    } catch (error) {
      console.error('Import failed:', error);
      setFormErrors({ import: 'Import process failed. Please try again.' });
    } finally {
      setIsImporting(false);
    }
  };

  const getFieldMappingOptions = () => {
    return [
      { value: '', label: 'Do not import' },
      { value: 'name', label: 'Full Name *' },
      { value: 'email', label: 'Email Address *' },
      { value: 'role', label: 'User Role' },
      { value: 'status', label: 'Account Status' },
      { value: 'subscriptionType', label: 'Subscription Type' },
      { value: 'location.country', label: 'Country' },
      { value: 'location.state', label: 'State/Region' },
      { value: 'location.city', label: 'City' },
    ];
  };

  // Export Users utility functions
  const getExportableFields = () => {
    return [
      { key: 'name', label: 'Full Name', required: true },
      { key: 'email', label: 'Email Address', required: true },
      { key: 'role', label: 'User Role', required: false },
      { key: 'status', label: 'Account Status', required: false },
      { key: 'subscriptionType', label: 'Subscription Type', required: false },
      { key: 'createdAt', label: 'Created Date', required: false },
      { key: 'lastActive', label: 'Last Active', required: false },
      { key: 'totalSessions', label: 'Total Sessions', required: false },
      { key: 'supportTickets', label: 'Support Tickets', required: false },
      { key: 'location', label: 'Location (Country, State, City)', required: false },
      { key: 'progress', label: 'Learning Progress', required: false },
      { key: 'preferences', label: 'User Preferences', required: false },
      { key: 'tags', label: 'Tags', required: false },
      { key: 'notes', label: 'Admin Notes', required: false },
    ];
  };

  const getFilteredExportUsers = () => {
    return users.filter(user => {
      const matchesRole = exportFilters.role === 'all' || user.role === exportFilters.role;
      const matchesStatus = exportFilters.status === 'all' || user.status === exportFilters.status;
      const matchesSubscription = exportFilters.subscription === 'all' || user.subscriptionType === exportFilters.subscription;

      if (!exportFilters.includeInactive && user.status === 'inactive') {
        return false;
      }

      const now = new Date();
      let matchesDateRange = true;

      if (exportFilters.dateRange !== 'all') {
        const daysDiff = Math.floor((now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

        switch (exportFilters.dateRange) {
          case 'last7days':
            matchesDateRange = daysDiff <= 7;
            break;
          case 'last30days':
            matchesDateRange = daysDiff <= 30;
            break;
          case 'last90days':
            matchesDateRange = daysDiff <= 90;
            break;
          case 'lastYear':
            matchesDateRange = daysDiff <= 365;
            break;
        }
      }

      return matchesRole && matchesStatus && matchesSubscription && matchesDateRange;
    });
  };

  const formatUserDataForExport = (user: AdminUser) => {
    const data: any = {};

    if (exportFields.name) data.name = user.name;
    if (exportFields.email) data.email = user.email;
    if (exportFields.role) data.role = user.role;
    if (exportFields.status) data.status = user.status;
    if (exportFields.subscriptionType) data.subscriptionType = user.subscriptionType;
    if (exportFields.createdAt) data.createdAt = user.createdAt.toISOString().split('T')[0];
    if (exportFields.lastActive) data.lastActive = user.lastActive.toISOString().split('T')[0];
    if (exportFields.totalSessions) data.totalSessions = user.totalSessions;
    if (exportFields.supportTickets) data.supportTickets = user.supportTickets;

    if (exportFields.location && user.location) {
      data.country = user.location.country || '';
      data.state = user.location.state || '';
      data.city = user.location.city || '';
    }

    if (exportFields.progress && user.progress) {
      data.wordsLearned = user.progress.wordsLearned;
      data.averageAccuracy = user.progress.averageAccuracy;
      data.streakDays = user.progress.streakDays;
      data.totalPlayTime = user.progress.totalPlayTime;
    }

    if (exportFields.preferences && user.preferences) {
      data.notifications = user.preferences.notifications;
      data.emailUpdates = user.preferences.emailUpdates;
      data.language = user.preferences.language;
      data.timezone = user.preferences.timezone;
    }

    if (exportFields.tags && user.tags) {
      data.tags = user.tags.join(', ');
    }

    if (exportFields.notes && user.notes) {
      data.notes = user.notes;
    }

    if (user.parentId) {
      data.parentId = user.parentId;
    }

    if (user.childrenCount !== undefined) {
      data.childrenCount = user.childrenCount;
    }

    return data;
  };

  const generateCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape CSV values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  };

  const generateJSON = (data: any[]) => {
    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const performExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setExportProgress(25);

      const filteredUsers = getFilteredExportUsers();
      setExportProgress(50);

      const exportData = filteredUsers.map(formatUserDataForExport);
      setExportProgress(75);

      const timestamp = new Date().toISOString().split('T')[0];
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'csv':
          content = generateCSV(exportData);
          filename = `users_export_${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content = generateJSON(exportData);
          filename = `users_export_${timestamp}.json`;
          mimeType = 'application/json';
          break;
        case 'xlsx':
          // For XLSX, we'll generate CSV for now (would need additional library for true XLSX)
          content = generateCSV(exportData);
          filename = `users_export_${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      setExportProgress(90);
      downloadFile(content, filename, mimeType);
      setExportProgress(100);

      // Close dialog after successful export
      setTimeout(() => {
        setShowExportDialog(false);
        resetExportForm();
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      setFormErrors({ export: 'Export failed. Please try again.' });
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    }
  };

  const resetExportForm = () => {
    setExportFormat('csv');
    setExportFilters({
      role: 'all',
      status: 'all',
      subscription: 'all',
      dateRange: 'all',
      includeInactive: true,
    });
    setExportFields({
      name: true,
      email: true,
      role: true,
      status: true,
      subscriptionType: true,
      createdAt: true,
      lastActive: true,
      location: false,
      totalSessions: false,
      supportTickets: false,
      progress: false,
      preferences: false,
      tags: false,
      notes: false,
    });
    setFormErrors(prev => ({ ...prev, export: '' }));
  };

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
            <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </span>

              {/* Mobile Bulk Actions */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Bulk Actions
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {bulkActions.map((action) => (
                      <DropdownMenuItem
                        key={action.type}
                        onClick={() => {
                          setSelectedBulkAction(action);
                          setShowBulkActionDialog(true);
                        }}
                        className={
                          action.variant === "destructive"
                            ? "text-red-600 focus:text-red-600"
                            : ""
                        }
                      >
                        <action.icon className="w-4 h-4 mr-2" />
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedUsers([])}>
                      <X className="w-4 h-4 mr-2" />
                      Clear Selection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop Bulk Actions */}
              <div className="hidden md:flex gap-2 flex-wrap">
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-12 hidden sm:table-cell">Avatar</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 min-w-[150px]"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Name
                    {sortBy.field === "name" && (
                      sortBy.direction === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Subscription</TableHead>
                <TableHead className="hidden xl:table-cell">Location</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 hidden lg:table-cell"
                  onClick={() => handleSort("lastActive")}
                >
                  <div className="flex items-center gap-1">
                    Last Active
                    {sortBy.field === "lastActive" && (
                      sortBy.direction === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="hidden xl:table-cell">Progress</TableHead>
                <TableHead className="w-16">Actions</TableHead>
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
                <TableCell className="hidden sm:table-cell">
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
                      <div className="flex gap-1 hidden sm:flex">
                        {user.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge className={getSubscriptionColor(user.subscriptionType)}>
                    {user.subscriptionType}
                  </Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="text-sm">
                    {user.location?.city && user.location?.country
                      ? `${user.location.city}, ${user.location.country}`
                      : user.location?.country || "Unknown"
                    }
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="text-sm text-gray-500">
                    {user.lastActive.toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
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
        </div>
      </CardContent>
    </Card>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {filteredAndSortedUsers.map((user) => (
        <Card key={user.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => handleSelectUser(user.id)}
                />
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <AvatarFallback>
                    {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{user.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
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
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                <Badge className={getRoleColor(user.role)} size="sm">{user.role}</Badge>
                <Badge className={getStatusColor(user.status)} size="sm">{user.status}</Badge>
                <Badge className={getSubscriptionColor(user.subscriptionType)} size="sm">
                  {user.subscriptionType}
                </Badge>
              </div>

              {user.tags && user.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {user.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="text-xs sm:text-sm text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Joined {user.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Last active {user.lastActive.toLocaleDateString()}</span>
              </div>
              {user.location && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {user.location.city && user.location.country
                      ? `${user.location.city}, ${user.location.country}`
                      : user.location.country
                    }
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <BookOpen className="w-3 h-3 flex-shrink-0" />
                <span>{user.totalSessions} sessions</span>
              </div>
              {user.progress && (
                <div className="flex items-center gap-2">
                  <Award className="w-3 h-3 flex-shrink-0" />
                  <span>{user.progress.wordsLearned} words learned</span>
                </div>
              )}
            </div>

            {user.progress && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Accuracy</span>
                  <span className="font-medium">{user.progress.averageAccuracy}%</span>
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
              <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
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
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
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
          <CardContent className="p-6 sm:p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500 mb-4 text-sm sm:text-base">
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
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
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity</TabsTrigger>
                <TabsTrigger value="progress" className="text-xs sm:text-sm">Progress</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
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

      {/* Enhanced Add User Dialog */}
      {showUserDialog && (
        <Dialog open={showUserDialog} onOpenChange={(open) => {
          if (!open) {
            setShowUserDialog(false);
            resetAddUserForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Add New User</h2>
                  <p className="text-sm text-gray-500 font-normal">Create a new user account with personalized settings</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step <= addUserStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}>
                    {step < addUserStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 sm:w-24 h-1 mx-2 transition-colors ${
                      step < addUserStep ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Titles */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">
                {addUserStep === 1 && "Basic Information"}
                {addUserStep === 2 && "Account Details"}
                {addUserStep === 3 && "Contact & Preferences"}
              </h3>
              <p className="text-sm text-gray-500">
                {addUserStep === 1 && "Enter the user's basic information and role"}
                {addUserStep === 2 && "Set up account credentials and permissions"}
                {addUserStep === 3 && "Add contact details and preferences (optional)"}
              </p>
            </div>

            {/* Step 1: Basic Information */}
            {addUserStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={newUserData.name}
                      onChange={(e) => {
                        setNewUserData(prev => ({ ...prev, name: e.target.value }));
                        if (formErrors.name) {
                          setFormErrors(prev => ({ ...prev, name: "" }));
                        }
                      }}
                      placeholder="Enter full name"
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => {
                        setNewUserData(prev => ({ ...prev, email: e.target.value }));
                        if (formErrors.email) {
                          setFormErrors(prev => ({ ...prev, email: "" }));
                        }
                      }}
                      placeholder="Enter email address"
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role" className="text-sm font-medium">
                      User Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newUserData.role}
                      onValueChange={(value: AdminUser["role"]) => {
                        setNewUserData(prev => ({ ...prev, role: value }));
                        if (formErrors.role) {
                          setFormErrors(prev => ({ ...prev, role: "" }));
                        }
                      }}
                    >
                      <SelectTrigger className={formErrors.role ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Parent</div>
                              <div className="text-xs text-gray-500">Can manage children accounts</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="child">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Child</div>
                              <div className="text-xs text-gray-500">Learning account for students</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="teacher">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Teacher</div>
                              <div className="text-xs text-gray-500">Educator with content management</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Administrator</div>
                              <div className="text-xs text-gray-500">Full system access</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.role && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.role}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-sm font-medium">
                      Account Status
                    </Label>
                    <Select
                      value={newUserData.status}
                      onValueChange={(value: AdminUser["status"]) =>
                        setNewUserData(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-yellow-500" />
                            Pending Activation
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-gray-500" />
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Role-specific information */}
                {newUserData.role === "child" && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium">Child Account Notice</p>
                        <p>Child accounts require a parent to be assigned in the next step. They will have access to learning games and progress tracking.</p>
                      </div>
                    </div>
                  </div>
                )}

                {newUserData.role === "teacher" && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-800 dark:text-green-200">
                        <p className="font-medium">Teacher Account Permissions</p>
                        <p>Teachers can create and manage educational content, view student progress, and access analytics.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Account Details */}
            {addUserStep === 2 && (
              <div className="space-y-4">
                {newUserData.role === "child" && (
                  <div>
                    <Label htmlFor="parentId" className="text-sm font-medium">
                      Assign Parent <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newUserData.parentId}
                      onValueChange={(value) => {
                        setNewUserData(prev => ({ ...prev, parentId: value }));
                        if (formErrors.parentId) {
                          setFormErrors(prev => ({ ...prev, parentId: "" }));
                        }
                      }}
                    >
                      <SelectTrigger className={formErrors.parentId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a parent" />
                      </SelectTrigger>
                      <SelectContent>
                        {getParentUsers().map((parent) => (
                          <SelectItem key={parent.id} value={parent.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {parent.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{parent.name}</div>
                                <div className="text-xs text-gray-500">{parent.email}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.parentId && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.parentId}</p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="subscriptionType" className="text-sm font-medium">
                    Subscription Plan
                  </Label>
                  <Select
                    value={newUserData.subscriptionType}
                    onValueChange={(value: AdminUser["subscriptionType"]) =>
                      setNewUserData(prev => ({ ...prev, subscriptionType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          <div>
                            <div className="font-medium">Free</div>
                            <div className="text-xs text-gray-500">Basic features</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="premium">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <div>
                            <div className="font-medium">Premium</div>
                            <div className="text-xs text-gray-500">Advanced features</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="family">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <div>
                            <div className="font-medium">Family</div>
                            <div className="text-xs text-gray-500">Multiple children support</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="school">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <div>
                            <div className="font-medium">School</div>
                            <div className="text-xs text-gray-500">Educational institution</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password (Optional)
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUserData.password}
                      onChange={(e) => {
                        setNewUserData(prev => ({ ...prev, password: e.target.value }));
                        if (formErrors.password) {
                          setFormErrors(prev => ({ ...prev, password: "" }));
                        }
                      }}
                      placeholder="Leave empty to auto-generate"
                      className={formErrors.password ? "border-red-500" : ""}
                    />
                    {formErrors.password && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={newUserData.confirmPassword}
                      onChange={(e) => {
                        setNewUserData(prev => ({ ...prev, confirmPassword: e.target.value }));
                        if (formErrors.confirmPassword) {
                          setFormErrors(prev => ({ ...prev, confirmPassword: "" }));
                        }
                      }}
                      placeholder="Confirm password"
                      className={formErrors.confirmPassword ? "border-red-500" : ""}
                      disabled={!newUserData.password}
                    />
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendWelcomeEmail"
                    checked={newUserData.sendWelcomeEmail}
                    onCheckedChange={(checked) =>
                      setNewUserData(prev => ({ ...prev, sendWelcomeEmail: checked as boolean }))
                    }
                  />
                  <Label htmlFor="sendWelcomeEmail" className="text-sm">
                    Send welcome email with login instructions
                  </Label>
                </div>

                {!newUserData.password && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-medium">Auto-Generated Password</p>
                        <p>A secure password will be generated automatically and sent via welcome email.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Contact & Preferences */}
            {addUserStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country
                    </Label>
                    <Select
                      value={newUserData.location.country}
                      onValueChange={(value) =>
                        setNewUserData(prev => ({
                          ...prev,
                          location: { ...prev.location, country: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableCountries().map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-sm font-medium">
                      State/Region
                    </Label>
                    <Input
                      id="state"
                      value={newUserData.location.state}
                      onChange={(e) =>
                        setNewUserData(prev => ({
                          ...prev,
                          location: { ...prev.location, state: e.target.value }
                        }))
                      }
                      placeholder="Enter state/region"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={newUserData.location.city}
                      onChange={(e) =>
                        setNewUserData(prev => ({
                          ...prev,
                          location: { ...prev.location, city: e.target.value }
                        }))
                      }
                      placeholder="Enter city"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language" className="text-sm font-medium">
                      Preferred Language
                    </Label>
                    <Select
                      value={newUserData.preferences.language}
                      onValueChange={(value) =>
                        setNewUserData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, language: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timezone" className="text-sm font-medium">
                      Timezone
                    </Label>
                    <Input
                      id="timezone"
                      value={newUserData.preferences.timezone}
                      onChange={(e) =>
                        setNewUserData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, timezone: e.target.value }
                        }))
                      }
                      placeholder="Timezone"
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Notification Preferences</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notifications"
                        checked={newUserData.preferences.notifications}
                        onCheckedChange={(checked) =>
                          setNewUserData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, notifications: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="notifications" className="text-sm">
                        Enable push notifications
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailUpdates"
                        checked={newUserData.preferences.emailUpdates}
                        onCheckedChange={(checked) =>
                          setNewUserData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, emailUpdates: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="emailUpdates" className="text-sm">
                        Receive email updates and newsletters
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags" className="text-sm font-medium">
                    User Tags (Optional)
                  </Label>
                  <Input
                    id="tags"
                    value={newUserData.tags.join(", ")}
                    onChange={(e) =>
                      setNewUserData(prev => ({
                        ...prev,
                        tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                      }))
                    }
                    placeholder="e.g., new-user, premium-trial, beta-tester"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Admin Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={newUserData.notes}
                    onChange={(e) =>
                      setNewUserData(prev => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Add any additional notes about this user..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Form Errors */}
            {formErrors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    {formErrors.submit}
                  </p>
                </div>
              </div>
            )}

            {/* Dialog Footer */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  if (addUserStep > 1) {
                    setAddUserStep(prev => prev - 1);
                  } else {
                    setShowUserDialog(false);
                    resetAddUserForm();
                  }
                }}
                className="order-2 sm:order-1"
              >
                {addUserStep > 1 ? "Previous" : "Cancel"}
              </Button>

              <div className="flex gap-3 flex-1 order-1 sm:order-2">
                {addUserStep < 3 ? (
                  <Button
                    onClick={() => {
                      if (validateStep(addUserStep)) {
                        setAddUserStep(prev => prev + 1);
                      }
                    }}
                    className="flex-1"
                  >
                    Next Step
                    <ChevronDown className="w-4 h-4 ml-2 rotate-[-90deg]" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleAddUser}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating User...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create User
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Enhanced Import Users Dialog */}
      {showImportDialog && (
        <Dialog open={showImportDialog} onOpenChange={(open) => {
          if (!open) {
            setShowImportDialog(false);
            resetImportForm();
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Import Users</h2>
                  <p className="text-sm text-gray-500 font-normal">Bulk import users from CSV file</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step <= importStep
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}>
                    {step < importStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 4 && (
                    <div className={`w-8 sm:w-16 h-1 mx-2 transition-colors ${
                      step < importStep ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Titles */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">
                {importStep === 1 && "Upload File"}
                {importStep === 2 && "Map Fields"}
                {importStep === 3 && "Review & Validate"}
                {importStep === 4 && "Import Results"}
              </h3>
              <p className="text-sm text-gray-500">
                {importStep === 1 && "Upload your CSV file containing user data"}
                {importStep === 2 && "Map CSV columns to user fields"}
                {importStep === 3 && "Review data and fix any validation errors"}
                {importStep === 4 && "View import results and summary"}
              </p>
            </div>

            {/* Step 1: Upload File */}
            {importStep === 1 && (
              <div className="space-y-6">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImportFile(file);
                        setFormErrors(prev => ({ ...prev, file: "" }));
                      }
                    }}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="cursor-pointer flex flex-col items-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        {importFile ? importFile.name : "Choose a CSV file to upload"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Click to browse or drag and drop your file here
                      </p>
                    </div>
                  </label>

                  {importFile && (
                    <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        File selected: {importFile.name}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setImportFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                {formErrors.file && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-800 dark:text-red-200">{formErrors.file}</p>
                    </div>
                  </div>
                )}

                {/* CSV Format Information */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">CSV Format Requirements</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• First row must contain column headers</li>
                    <li>• Required fields: Name, Email</li>
                    <li>• Optional fields: Role, Status, Subscription, Country, State, City</li>
                    <li>• Role values: parent, child, teacher, admin</li>
                    <li>• Status values: active, inactive, pending, suspended</li>
                    <li>• Subscription values: free, premium, family, school</li>
                  </ul>
                </div>

                {/* Sample Template */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium">Need a template?</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download our CSV template to get started quickly
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const csvContent = "Name,Email,Role,Status,Subscription,Country,State,City\nJohn Doe,john@example.com,parent,active,premium,United States,California,San Francisco\nJane Smith,jane@example.com,child,active,family,United States,New York,New York";
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'user_import_template.csv';
                      a.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Map Fields */}
            {importStep === 2 && (
              <div className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium">Field Mapping</p>
                      <p>Map your CSV columns to user fields. Required fields are marked with *</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {importHeaders.map((header, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">CSV Column</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{header}</p>
                        {importData[0] && (
                          <p className="text-xs text-gray-500 mt-1">
                            Sample: "{importData[0][header]}"
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <Label className="font-medium">Maps to</Label>
                        <Select
                          value={fieldMapping[header] || ''}
                          onValueChange={(value) => {
                            setFieldMapping(prev => ({
                              ...prev,
                              [header]: value
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field to map to" />
                          </SelectTrigger>
                          <SelectContent>
                            {getFieldMappingOptions().map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mapping Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Mapping Summary</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-green-600">Mapped Fields:</p>
                      <ul className="mt-1 space-y-1">
                        {Object.entries(fieldMapping)
                          .filter(([, field]) => field)
                          .map(([header, field]) => (
                            <li key={header}>
                              {header} → {getFieldMappingOptions().find(o => o.value === field)?.label}
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Unmapped Columns:</p>
                      <ul className="mt-1 space-y-1">
                        {importHeaders
                          .filter(header => !fieldMapping[header])
                          .map(header => (
                            <li key={header}>{header}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review & Validate */}
            {importStep === 3 && (
              <div className="space-y-6">
                {/* Validation Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {importValidation.valid.length}
                      </div>
                      <p className="text-sm text-gray-600">Valid Records</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-600">
                        {importValidation.warnings.length}
                      </div>
                      <p className="text-sm text-gray-600">With Warnings</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">
                        {importValidation.invalid.length}
                      </div>
                      <p className="text-sm text-gray-600">Invalid Records</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Invalid Records */}
                {importValidation.invalid.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-3">
                      Invalid Records ({importValidation.invalid.length})
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {importValidation.invalid.slice(0, 10).map((record, index) => (
                        <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-red-800 dark:text-red-200">
                              Row {record._rowIndex}
                            </span>
                            <Badge variant="destructive">Invalid</Badge>
                          </div>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            {record._mappedData.name || 'No name'} - {record._mappedData.email || 'No email'}
                          </p>
                          <ul className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {record._errors.map((error: string, i: number) => (
                              <li key={i}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {importValidation.invalid.length > 10 && (
                        <p className="text-sm text-gray-500 text-center">
                          ... and {importValidation.invalid.length - 10} more invalid records
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Warning Records */}
                {importValidation.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-600 mb-3">
                      Records with Warnings ({importValidation.warnings.length})
                    </h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {importValidation.warnings.slice(0, 5).map((record, index) => (
                        <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-yellow-800 dark:text-yellow-200">
                              Row {record._rowIndex}
                            </span>
                            <Badge variant="secondary">Warning</Badge>
                          </div>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {record._mappedData.name} - {record._mappedData.email}
                          </p>
                          <ul className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            {record._warnings.map((warning: string, i: number) => (
                              <li key={i}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {importValidation.warnings.length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          ... and {importValidation.warnings.length - 5} more records with warnings
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Valid Records Preview */}
                {importValidation.valid.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600 mb-3">
                      Valid Records Preview ({importValidation.valid.length})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {importValidation.valid.slice(0, 5).map((record, index) => (
                        <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {record._mappedData.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-green-800 dark:text-green-200">
                                  {record._mappedData.name}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                  {record._mappedData.email} • {record._mappedData.role || 'parent'}
                                </p>
                              </div>
                            </div>
                            <Badge variant="default" className="bg-green-600">Valid</Badge>
                          </div>
                        </div>
                      ))}
                      {importValidation.valid.length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          ... and {importValidation.valid.length - 5} more valid records
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Import Results */}
            {importStep === 4 && importResults && (
              <div className="space-y-6">
                {/* Results Summary */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Import Complete!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your user import has been processed successfully
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-green-600">
                        {importResults.success}
                      </div>
                      <p className="text-sm text-gray-600">Users Successfully Imported</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-red-600">
                        {importResults.failed}
                      </div>
                      <p className="text-sm text-gray-600">Failed Imports</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Error Details */}
                {importResults.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-3">Import Errors</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {importResults.errors.map((error, index) => (
                        <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-red-800 dark:text-red-200">
                                Row {error.row}: {error.data.name || 'Unknown User'}
                              </p>
                              <p className="text-sm text-red-600 dark:text-red-400">{error.error}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.success > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        {importResults.success} user{importResults.success > 1 ? 's' : ''} have been successfully added to your system.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Import Progress */}
            {isImporting && (
              <div className="space-y-4">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
                  <p className="font-medium">Importing Users...</p>
                  <p className="text-sm text-gray-500">Please wait while we process your data</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                </div>
              </div>
            )}

            {/* Dialog Footer */}
            {!isImporting && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (importStep > 1 && importStep < 4) {
                      setImportStep(prev => prev - 1);
                    } else {
                      setShowImportDialog(false);
                      resetImportForm();
                    }
                  }}
                  className="order-2 sm:order-1"
                >
                  {importStep > 1 && importStep < 4 ? "Previous" : "Close"}
                </Button>

                <div className="flex gap-3 flex-1 order-1 sm:order-2">
                  {importStep === 1 && (
                    <Button
                      onClick={() => {
                        if (importFile) {
                          processImportFile(importFile);
                        } else {
                          setFormErrors({ file: "Please select a CSV file to upload." });
                        }
                      }}
                      disabled={!importFile}
                      className="flex-1"
                    >
                      Process File
                      <ChevronDown className="w-4 h-4 ml-2 rotate-[-90deg]" />
                    </Button>
                  )}

                  {importStep === 2 && (
                    <Button
                      onClick={validateImportData}
                      disabled={Object.values(fieldMapping).filter(Boolean).length === 0}
                      className="flex-1"
                    >
                      Validate Data
                      <ChevronDown className="w-4 h-4 ml-2 rotate-[-90deg]" />
                    </Button>
                  )}

                  {importStep === 3 && (
                    <Button
                      onClick={performImport}
                      disabled={importValidation.valid.length === 0 && importValidation.warnings.length === 0}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import {importValidation.valid.length + importValidation.warnings.length} Users
                    </Button>
                  )}

                  {importStep === 4 && (
                    <Button
                      onClick={() => {
                        setShowImportDialog(false);
                        resetImportForm();
                      }}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Finish
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedUserManagement;
