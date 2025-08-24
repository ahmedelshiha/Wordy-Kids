import React from "react";
import { JunglePanel, JungleCard, JungleCardHeader, JungleCardTitle, JungleCardDescription, JungleCardContent, JungleCardFooter } from "@/components/ui/jungle-adventure";
import { AdventureButton } from "@/components/ui/adventure-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users, BarChart3, Settings, Shield, Database, Activity, AlertTriangle, CheckCircle, Info } from "lucide-react";

/**
 * AdminTemplate - Professional admin interface using controlled exception palette
 * Maintains jungle design tokens but uses neutral admin colors
 * Full accessibility and performance optimization
 */

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalWords: number;
  avgAccuracy: number;
  systemHealth: "healthy" | "warning" | "critical";
  serverLoad: number;
  uptimePercentage: number;
}

interface UserManagementData {
  totalChildren: number;
  totalParents: number;
  recentRegistrations: number;
  activeSubscriptions: number;
}

interface AdminAlert {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: Date;
  resolved?: boolean;
}

interface AdminTemplateProps {
  systemStats: SystemStats;
  userManagement: UserManagementData;
  alerts: AdminAlert[];
  onSystemAction: (action: string) => void;
  onUserAction: (action: string, userId?: string) => void;
  onViewLogs: () => void;
  onExportData: () => void;
}

export function AdminTemplate({
  systemStats,
  userManagement,
  alerts,
  onSystemAction,
  onUserAction,
  onViewLogs,
  onExportData,
}: AdminTemplateProps) {
  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy": return "success";
      case "warning": return "warning";
      case "critical": return "danger";
      default: return "info";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertTriangle className="w-4 h-4" />;
      case "warning": return <AlertTriangle className="w-4 h-4" />;
      case "success": return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg">
      {/* Professional header */}
      <JunglePanel
        background="none"
        padding="md"
        className="bg-admin-surface border-b border-admin-border"
        safeArea="top"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-admin-accent rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-admin-text" />
              </div>
              <div>
                <h1 className="text-h3-fluid font-display font-bold text-admin-text">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-admin-muted">
                  Jungle Adventure Learning Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                className={`bg-${getHealthColor(systemStats.systemHealth)}-light text-${getHealthColor(systemStats.systemHealth)} border-${getHealthColor(systemStats.systemHealth)}/30`}
              >
                System {systemStats.systemHealth}
              </Badge>
              <AdventureButton
                intent="outline"
                size="sm"
                onClick={onViewLogs}
                className="border-admin-border text-admin-text hover:bg-admin-accent"
              >
                View Logs
              </AdventureButton>
            </div>
          </div>
        </div>
      </JunglePanel>

      {/* Main content */}
      <JunglePanel background="none" padding="lg" className="bg-admin-bg">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <JungleCard
              tone="default"
              size="md"
              elevation="low"
              className="bg-admin-surface border-admin-border"
            >
              <JungleCardContent className="text-center py-6">
                <Users className="w-8 h-8 text-admin-text mx-auto mb-3" />
                <div className="text-2xl font-bold text-admin-text">
                  {systemStats.activeUsers.toLocaleString()}
                </div>
                <div className="text-sm text-admin-muted">Active Users</div>
                <div className="text-xs text-admin-muted mt-1">
                  of {systemStats.totalUsers.toLocaleString()} total
                </div>
              </JungleCardContent>
            </JungleCard>

            <JungleCard
              tone="default"
              size="md"
              elevation="low"
              className="bg-admin-surface border-admin-border"
            >
              <JungleCardContent className="text-center py-6">
                <Database className="w-8 h-8 text-admin-text mx-auto mb-3" />
                <div className="text-2xl font-bold text-admin-text">
                  {systemStats.totalWords.toLocaleString()}
                </div>
                <div className="text-sm text-admin-muted">Words in Database</div>
                <div className="text-xs text-admin-muted mt-1">
                  {systemStats.avgAccuracy}% avg accuracy
                </div>
              </JungleCardContent>
            </JungleCard>

            <JungleCard
              tone="default"
              size="md"
              elevation="low"
              className="bg-admin-surface border-admin-border"
            >
              <JungleCardContent className="text-center py-6">
                <Activity className="w-8 h-8 text-admin-text mx-auto mb-3" />
                <div className="text-2xl font-bold text-admin-text">
                  {systemStats.serverLoad}%
                </div>
                <div className="text-sm text-admin-muted">Server Load</div>
                <div className="text-xs text-admin-muted mt-1">
                  {systemStats.uptimePercentage}% uptime
                </div>
              </JungleCardContent>
            </JungleCard>

            <JungleCard
              tone="default"
              size="md"
              elevation="low"
              className="bg-admin-surface border-admin-border"
            >
              <JungleCardContent className="text-center py-6">
                <BarChart3 className="w-8 h-8 text-admin-text mx-auto mb-3" />
                <div className="text-2xl font-bold text-admin-text">
                  {userManagement.recentRegistrations}
                </div>
                <div className="text-sm text-admin-muted">New This Week</div>
                <div className="text-xs text-admin-muted mt-1">
                  {userManagement.activeSubscriptions} subscriptions
                </div>
              </JungleCardContent>
            </JungleCard>
          </div>

          {/* Main admin tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 bg-admin-surface border border-admin-border">
              <TabsTrigger value="users" className="data-[state=active]:bg-admin-accent">
                User Management
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-admin-accent">
                Content Management
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-admin-accent">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-admin-accent">
                System Settings
              </TabsTrigger>
            </TabsList>

            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <JungleCard
                    tone="default"
                    size="lg"
                    elevation="medium"
                    className="bg-admin-surface border-admin-border"
                  >
                    <JungleCardHeader>
                      <JungleCardTitle className="text-admin-text">
                        User Search & Management
                      </JungleCardTitle>
                      <JungleCardDescription className="text-admin-muted">
                        Find and manage user accounts
                      </JungleCardDescription>
                    </JungleCardHeader>
                    <JungleCardContent className="space-y-4">
                      <div className="flex gap-3">
                        <Input
                          placeholder="Search by email, name, or ID..."
                          className="flex-1 bg-admin-bg border-admin-border focus:border-admin-text focus:ring-admin-text"
                        />
                        <AdventureButton
                          intent="primary"
                          size="md"
                          className="bg-admin-text text-admin-bg hover:bg-admin-muted"
                        >
                          Search
                        </AdventureButton>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-admin-text">Filter by Role</Label>
                          <Select>
                            <SelectTrigger className="w-48 bg-admin-bg border-admin-border">
                              <SelectValue placeholder="All users" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="children">Children</SelectItem>
                              <SelectItem value="parents">Parents</SelectItem>
                              <SelectItem value="teachers">Teachers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-admin-text">Show Active Only</Label>
                          <Switch />
                        </div>
                      </div>
                    </JungleCardContent>
                    <JungleCardFooter className="gap-3">
                      <AdventureButton
                        intent="outline"
                        size="sm"
                        onClick={onExportData}
                        className="border-admin-border text-admin-text hover:bg-admin-accent"
                      >
                        Export Data
                      </AdventureButton>
                      <AdventureButton
                        intent="primary"
                        size="sm"
                        className="bg-admin-text text-admin-bg hover:bg-admin-muted"
                      >
                        Bulk Actions
                      </AdventureButton>
                    </JungleCardFooter>
                  </JungleCard>
                </div>

                <div>
                  <JungleCard
                    tone="default"
                    size="lg"
                    elevation="medium"
                    className="bg-admin-surface border-admin-border"
                  >
                    <JungleCardHeader>
                      <JungleCardTitle className="text-admin-text">
                        User Statistics
                      </JungleCardTitle>
                    </JungleCardHeader>
                    <JungleCardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-admin-muted">Total Children</span>
                          <span className="font-semibold text-admin-text">
                            {userManagement.totalChildren.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-admin-muted">Total Parents</span>
                          <span className="font-semibold text-admin-text">
                            {userManagement.totalParents.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-admin-muted">Active Subscriptions</span>
                          <span className="font-semibold text-admin-text">
                            {userManagement.activeSubscriptions.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-admin-muted">New This Week</span>
                          <span className="font-semibold text-admin-text">
                            {userManagement.recentRegistrations}
                          </span>
                        </div>
                      </div>
                    </JungleCardContent>
                  </JungleCard>
                </div>
              </div>
            </TabsContent>

            {/* Content Management Tab */}
            <TabsContent value="content" className="space-y-6">
              <JungleCard
                tone="default"
                size="lg"
                elevation="medium"
                className="bg-admin-surface border-admin-border"
              >
                <JungleCardHeader>
                  <JungleCardTitle className="text-admin-text">
                    Content Management
                  </JungleCardTitle>
                  <JungleCardDescription className="text-admin-muted">
                    Manage words, categories, and learning content
                  </JungleCardDescription>
                </JungleCardHeader>
                <JungleCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AdventureButton
                      intent="outline"
                      size="lg"
                      className="h-24 flex-col border-admin-border text-admin-text hover:bg-admin-accent"
                      onClick={() => onSystemAction("manage-words")}
                    >
                      <Database className="w-6 h-6 mb-2" />
                      Manage Words
                    </AdventureButton>
                    <AdventureButton
                      intent="outline"
                      size="lg"
                      className="h-24 flex-col border-admin-border text-admin-text hover:bg-admin-accent"
                      onClick={() => onSystemAction("manage-categories")}
                    >
                      <BarChart3 className="w-6 h-6 mb-2" />
                      Categories
                    </AdventureButton>
                    <AdventureButton
                      intent="outline"
                      size="lg"
                      className="h-24 flex-col border-admin-border text-admin-text hover:bg-admin-accent"
                      onClick={() => onSystemAction("manage-achievements")}
                    >
                      <Settings className="w-6 h-6 mb-2" />
                      Achievements
                    </AdventureButton>
                  </div>
                </JungleCardContent>
              </JungleCard>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <JungleCard
                tone="default"
                size="lg"
                elevation="medium"
                className="bg-admin-surface border-admin-border"
              >
                <JungleCardHeader>
                  <JungleCardTitle className="text-admin-text">
                    Platform Analytics
                  </JungleCardTitle>
                  <JungleCardDescription className="text-admin-muted">
                    Monitor usage patterns and performance metrics
                  </JungleCardDescription>
                </JungleCardHeader>
                <JungleCardContent>
                  <div className="text-center text-admin-muted py-12">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Analytics dashboard would be integrated here</p>
                    <p className="text-sm mt-2">Charts, graphs, and detailed metrics</p>
                  </div>
                </JungleCardContent>
              </JungleCard>
            </TabsContent>

            {/* System Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <JungleCard
                tone="default"
                size="lg"
                elevation="medium"
                className="bg-admin-surface border-admin-border"
              >
                <JungleCardHeader>
                  <JungleCardTitle className="text-admin-text">
                    System Configuration
                  </JungleCardTitle>
                  <JungleCardDescription className="text-admin-muted">
                    Configure platform settings and preferences
                  </JungleCardDescription>
                </JungleCardHeader>
                <JungleCardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-admin-text">Security Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-admin-text">Enable 2FA</Label>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-admin-text">Password Requirements</Label>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-admin-text">Session Timeout</Label>
                          <Select>
                            <SelectTrigger className="w-32 bg-admin-bg border-admin-border">
                              <SelectValue placeholder="30m" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 min</SelectItem>
                              <SelectItem value="30">30 min</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-admin-text">System Preferences</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-admin-text">Maintenance Mode</Label>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-admin-text">Debug Logging</Label>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-admin-text">Auto Backup</Label>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </div>
                </JungleCardContent>
                <JungleCardFooter>
                  <AdventureButton
                    intent="primary"
                    size="md"
                    className="bg-admin-text text-admin-bg hover:bg-admin-muted"
                  >
                    Save Changes
                  </AdventureButton>
                </JungleCardFooter>
              </JungleCard>
            </TabsContent>
          </Tabs>

          {/* System Alerts */}
          {alerts.length > 0 && (
            <JungleCard
              tone="default"
              size="lg"
              elevation="medium"
              className="bg-admin-surface border-admin-border"
            >
              <JungleCardHeader>
                <JungleCardTitle className="text-admin-text">
                  System Alerts
                </JungleCardTitle>
                <JungleCardDescription className="text-admin-muted">
                  Recent system notifications and alerts
                </JungleCardDescription>
              </JungleCardHeader>
              <JungleCardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        alert.type === "error" ? "bg-danger-light border-danger/30" :
                        alert.type === "warning" ? "bg-warning-light border-warning/30" :
                        alert.type === "success" ? "bg-success-light border-success/30" :
                        "bg-info-light border-info/30"
                      }`}
                    >
                      <div className={`
                        ${alert.type === "error" ? "text-danger" :
                          alert.type === "warning" ? "text-warning" :
                          alert.type === "success" ? "text-success" :
                          "text-info"
                        }
                      `}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-admin-text">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-admin-muted mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-admin-muted mt-2">
                          {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                      {!alert.resolved && (
                        <AdventureButton
                          intent="ghost"
                          size="sm"
                          className="text-admin-text hover:bg-admin-accent"
                        >
                          Resolve
                        </AdventureButton>
                      )}
                    </div>
                  ))}
                </div>
              </JungleCardContent>
            </JungleCard>
          )}
        </div>
      </JunglePanel>
    </div>
  );
}

/* ========================================
 * USAGE EXAMPLE
 * ======================================== */

/*
// In your admin page component:
import { AdminTemplate } from "@/templates/AdminTemplate";

export default function AdminPage() {
  const systemStats = {
    totalUsers: 15420,
    activeUsers: 3250,
    totalWords: 8500,
    avgAccuracy: 87,
    systemHealth: "healthy" as const,
    serverLoad: 45,
    uptimePercentage: 99.8,
  };

  const userManagement = {
    totalChildren: 12340,
    totalParents: 3080,
    recentRegistrations: 156,
    activeSubscriptions: 2890,
  };

  const alerts = [
    {
      id: "1",
      type: "warning" as const,
      title: "High Server Load",
      message: "Server load is at 85%. Consider scaling resources.",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "success" as const,
      title: "Backup Completed",
      message: "Daily backup completed successfully at 2:00 AM",
      timestamp: new Date(Date.now() - 3600000),
    },
  ];

  return (
    <AdminTemplate
      systemStats={systemStats}
      userManagement={userManagement}
      alerts={alerts}
      onSystemAction={(action) => console.log("System action:", action)}
      onUserAction={(action, userId) => console.log("User action:", action, userId)}
      onViewLogs={() => router.push("/admin/logs")}
      onExportData={() => exportUserData()}
    />
  );
}
*/
