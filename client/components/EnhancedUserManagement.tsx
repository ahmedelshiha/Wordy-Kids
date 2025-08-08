import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Ban,
  Unlock,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Download,
  Plus,
  AlertTriangle,
  Clock,
  Star,
  Activity,
  GraduationCap,
  Heart,
  MessageSquare,
  FileText,
  Key,
  Settings,
  Crown,
  Zap,
} from "lucide-react";
import type { AdminUser, SupportTicket } from "@shared/api";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: "content" | "users" | "analytics" | "system" | "moderation";
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  icon: React.ReactNode;
}

interface EnhancedUserManagementProps {
  users?: AdminUser[];
  tickets?: SupportTicket[];
  onUpdateUser?: (userId: string, updates: Partial<AdminUser>) => void;
  onDeleteUser?: (userId: string) => void;
  onCreateUser?: (user: Omit<AdminUser, "id">) => void;
}

const permissions: Permission[] = [
  {
    id: "view_analytics",
    name: "View Analytics",
    description: "Access to analytics dashboard and reports",
    category: "analytics",
  },
  {
    id: "manage_content",
    name: "Manage Content",
    description: "Create, edit, and approve content",
    category: "content",
  },
  {
    id: "moderate_content",
    name: "Moderate Content",
    description: "Review reports and moderate user-generated content",
    category: "moderation",
  },
  {
    id: "manage_users",
    name: "Manage Users",
    description: "Create, edit, and delete user accounts",
    category: "users",
  },
  {
    id: "view_users",
    name: "View Users",
    description: "View user profiles and basic information",
    category: "users",
  },
  {
    id: "manage_support",
    name: "Manage Support",
    description: "Handle support tickets and user inquiries",
    category: "users",
  },
  {
    id: "system_admin",
    name: "System Administration",
    description: "Full system access and configuration",
    category: "system",
  },
  {
    id: "export_data",
    name: "Export Data",
    description: "Export user data and reports",
    category: "analytics",
  },
];

const userRoles: UserRole[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access",
    permissions: [
      "system_admin",
      "manage_users",
      "manage_content",
      "moderate_content",
      "view_analytics",
      "export_data",
    ],
    color: "bg-red-100 text-red-800",
    icon: <Crown className="w-4 h-4" />,
  },
  {
    id: "moderator",
    name: "Content Moderator",
    description: "Content moderation and support",
    permissions: [
      "moderate_content",
      "manage_content",
      "manage_support",
      "view_users",
      "view_analytics",
    ],
    color: "bg-blue-100 text-blue-800",
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: "teacher",
    name: "Teacher",
    description: "Educational content management",
    permissions: ["manage_content", "view_users", "view_analytics"],
    color: "bg-green-100 text-green-800",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    id: "parent",
    name: "Parent",
    description: "Child account management",
    permissions: ["view_users"],
    color: "bg-purple-100 text-purple-800",
    icon: <Heart className="w-4 h-4" />,
  },
  {
    id: "child",
    name: "Child",
    description: "Learning account",
    permissions: [],
    color: "bg-yellow-100 text-yellow-800",
    icon: <Star className="w-4 h-4" />,
  },
];

const sampleUsers: AdminUser[] = [
  {
    id: "user_1",
    name: "John Administrator",
    email: "admin@wordadventure.com",
    role: "admin",
    status: "active",
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    totalSessions: 450,
    supportTickets: 0,
    subscriptionType: "premium",
    permissions: ["system_admin"],
    profileData: {
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=JA",
      bio: "Platform administrator and lead developer",
    },
  },
  {
    id: "user_2",
    name: "Sarah Teacher",
    email: "sarah@school.edu",
    role: "teacher",
    status: "active",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    totalSessions: 234,
    supportTickets: 2,
    subscriptionType: "school",
    permissions: ["manage_content", "view_users", "view_analytics"],
    profileData: {
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ST",
      bio: "5th grade teacher passionate about vocabulary education",
    },
  },
  {
    id: "user_3",
    name: "Mike Parent",
    email: "mike@email.com",
    role: "parent",
    status: "active",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
    childrenCount: 2,
    totalSessions: 89,
    supportTickets: 1,
    subscriptionType: "family",
    permissions: ["view_users"],
    profileData: {
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MP",
    },
  },
];

const EnhancedUserManagement: React.FC<EnhancedUserManagementProps> = ({
  users = sampleUsers,
  tickets = [],
  onUpdateUser,
  onDeleteUser,
  onCreateUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [formData, setFormData] = useState<Partial<AdminUser>>({
    name: "",
    email: "",
    role: "child",
    status: "active",
    subscriptionType: "free",
    permissions: [],
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData(user);
    setEditMode("edit");
    setShowUserDialog(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      role: "child",
      status: "active",
      subscriptionType: "free",
      permissions: [],
    });
    setEditMode("create");
    setShowUserDialog(true);
  };

  const handleSaveUser = () => {
    if (editMode === "create") {
      onCreateUser?.(formData as Omit<AdminUser, "id">);
    } else if (selectedUser) {
      onUpdateUser?.(selectedUser.id, formData);
    }
    setShowUserDialog(false);
  };

  const getRoleColor = (role: string) => {
    const roleConfig = userRoles.find((r) => r.id === role);
    return roleConfig?.color || "bg-gray-100 text-gray-800";
  };

  const getRoleIcon = (role: string) => {
    const roleConfig = userRoles.find((r) => r.id === role);
    return roleConfig?.icon || <Users className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) return;

    switch (action) {
      case "activate":
        selectedUsers.forEach((userId) => {
          onUpdateUser?.(userId, { status: "active" });
        });
        break;
      case "suspend":
        selectedUsers.forEach((userId) => {
          onUpdateUser?.(userId, { status: "suspended" });
        });
        break;
      case "delete":
        selectedUsers.forEach((userId) => {
          onDeleteUser?.(userId);
        });
        break;
    }
    setSelectedUsers([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Enhanced User Management
          </h2>
          <p className="text-slate-600">
            Comprehensive user administration with advanced features
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button size="sm" onClick={handleCreateUser}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {users.length}
            </div>
            <p className="text-sm text-slate-600">Total Users</p>
          </CardContent>
        </Card>
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
            <GraduationCap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === "teacher").length}
            </div>
            <p className="text-sm text-slate-600">Teachers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-pink-600">
              {users.filter((u) => u.role === "parent").length}
            </div>
            <p className="text-sm text-slate-600">Parents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter((u) => u.subscriptionType === "premium").length}
            </div>
            <p className="text-sm text-slate-600">Premium</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {userRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      {role.icon}
                      {role.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            {selectedUsers.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Bulk Actions ({selectedUsers.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleBulkAction("activate")}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("suspend")}>
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleBulkAction("delete")}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers(filteredUsers.map((u) => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers((prev) => [...prev, user.id]);
                        } else {
                          setSelectedUsers((prev) =>
                            prev.filter((id) => id !== user.id),
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.profileData?.avatar ? (
                        <img
                          src={user.profileData.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.subscriptionType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.lastActive.toLocaleDateString()}
                      <br />
                      <span className="text-slate-500">
                        {user.lastActive.toLocaleTimeString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{user.totalSessions}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Key className="w-4 h-4 mr-2" />
                          Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          View Activity Log
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editMode === "create" ? "Create New User" : "Edit User"}
            </DialogTitle>
            <DialogDescription>
              {editMode === "create"
                ? "Add a new user to the platform"
                : "Modify user information and permissions"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role || "child"}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            {role.icon}
                            {role.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status || "active"}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subscription">Subscription</Label>
                  <Select
                    value={formData.subscriptionType || "free"}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({
                        ...prev,
                        subscriptionType: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  Permissions control what actions this user can perform in the
                  system. Role-based permissions are automatically applied.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {Object.entries(
                  permissions.reduce(
                    (acc, perm) => {
                      if (!acc[perm.category]) acc[perm.category] = [];
                      acc[perm.category].push(perm);
                      return acc;
                    },
                    {} as Record<string, Permission[]>,
                  ),
                ).map(([category, perms]) => (
                  <div key={category}>
                    <h4 className="font-semibold capitalize mb-2">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {perms.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          <Checkbox
                            checked={
                              formData.permissions?.includes(permission.id) ||
                              false
                            }
                            onCheckedChange={(checked) => {
                              const currentPerms = formData.permissions || [];
                              if (checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  permissions: [...currentPerms, permission.id],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  permissions: currentPerms.filter(
                                    (p) => p !== permission.id,
                                  ),
                                }));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{permission.name}</p>
                            <p className="text-sm text-slate-600">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.profileData?.bio || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profileData: {
                        ...prev.profileData,
                        bio: e.target.value,
                      },
                    }))
                  }
                  placeholder="Brief description about the user..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={formData.profileData?.avatar || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profileData: {
                        ...prev.profileData,
                        avatar: e.target.value,
                      },
                    }))
                  }
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              {editMode === "create" ? "Create User" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedUserManagement;
