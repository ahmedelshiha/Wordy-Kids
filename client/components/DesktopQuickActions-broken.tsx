import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Download,
  RefreshCw,
  Settings,
  Target,
  BarChart3,
  Users,
  Keyboard,
  X,
  Command,
  Zap,
  BookOpen,
  Trophy,
  Bell,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DesktopQuickActionsProps {
  onAddChild: () => void;
  onRefreshData: () => void;
  onToggleAnalytics: () => void;
  onShowGoals: () => void;
  onExportData: () => void;
  onOpenSettings: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  isLoading?: boolean;
  notifications?: number;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    key: string;
    description: string;
    icon?: React.ComponentType<any>;
  }>;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { key: "Ctrl/Cmd + 1", description: "Overview", icon: Users },
      { key: "Ctrl/Cmd + 2", description: "Analytics", icon: BarChart3 },
      { key: "Ctrl/Cmd + 3", description: "Goals", icon: Target },
      { key: "Ctrl/Cmd + 4", description: "Achievements", icon: Trophy },
      { key: "Ctrl/Cmd + 5", description: "Settings", icon: Settings },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { key: "Ctrl/Cmd + N", description: "Add New Child", icon: Plus },
      { key: "Ctrl/Cmd + R", description: "Refresh Data", icon: RefreshCw },
      { key: "Ctrl/Cmd + E", description: "Export Data", icon: Download },
      { key: "Ctrl/Cmd + /", description: "Search", icon: Search },
      { key: "Escape", description: "Close Dialog", icon: X },
    ],
  },
  {
    title: "Quick Access",
    shortcuts: [
      { key: "Alt + Q", description: "Quick Actions Panel", icon: Zap },
      { key: "Alt + H", description: "Help & Shortcuts", icon: HelpCircle },
      { key: "Alt + G", description: "Set Goals", icon: Target },
      { key: "Alt + A", description: "View Analytics", icon: BarChart3 },
    ],
  },
];

export const DesktopQuickActions: React.FC<DesktopQuickActionsProps> = ({
  onAddChild,
  onRefreshData,
  onToggleAnalytics,
  onShowGoals,
  onExportData,
  onOpenSettings,
  isVisible,
  onToggleVisibility,
  isLoading = false,
  notifications = 0,
}) => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Quick actions panel toggle
      if (e.altKey && e.key === "q") {
        e.preventDefault();
        onToggleVisibility();
        return;
      }

      // Help shortcuts
      if (e.altKey && e.key === "h") {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // Quick access shortcuts
      if (e.altKey) {
        switch (e.key) {
          case "g":
            e.preventDefault();
            onShowGoals();
            break;
          case "a":
            e.preventDefault();
            onToggleAnalytics();
            break;
        }
      }

      // Escape to close dialogs
      if (e.key === "Escape") {
        setShowShortcuts(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleVisibility, onShowGoals, onToggleAnalytics]);

  const quickActions = [
    {
      id: "add-child",
      icon: Plus,
      label: "Add Child",
      onClick: onAddChild,
      shortcut: "Ctrl+N",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "refresh",
      icon: RefreshCw,
      label: "Refresh",
      onClick: onRefreshData,
      shortcut: "Ctrl+R",
      color: "bg-green-500 hover:bg-green-600",
      loading: isLoading,
    },
    {
      id: "analytics",
      icon: BarChart3,
      label: "Analytics",
      onClick: onToggleAnalytics,
      shortcut: "Ctrl+2",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      id: "goals",
      icon: Target,
      label: "Goals",
      onClick: onShowGoals,
      shortcut: "Ctrl+3",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      id: "export",
      icon: Download,
      label: "Export",
      onClick: onExportData,
      shortcut: "Ctrl+E",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      onClick: onOpenSettings,
      shortcut: "Ctrl+5",
      color: "bg-gray-500 hover:bg-gray-600",
    },
    {
      id: "help",
      icon: HelpCircle,
      label: "Help",
      onClick: () => setShowShortcuts(true),
      shortcut: "Alt+H",
      color: "bg-cyan-500 hover:bg-cyan-600",
    },
  ];

  if (!isVisible) {
    return (
      
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onToggleVisibility}
              className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
              size="sm"
            >
              <Zap className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {notifications > 9 ? "9+" : notifications}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Quick Actions (Alt+Q)</p>
          </TooltipContent>
        </Tooltip>
      
    );
  }

  return (
    
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
        <div className="bg-white/95 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-xl p-4 min-w-[200px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Quick Actions</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={action.onClick}
                    className={cn(
                      "w-full justify-start gap-3 text-white transition-all duration-200",
                      action.color,
                      hoveredAction === action.id && "scale-105 shadow-md",
                    )}
                    size="sm"
                    disabled={action.loading}
                    onMouseEnter={() => setHoveredAction(action.id)}
                    onMouseLeave={() => setHoveredAction(null)}
                  >
                    <action.icon
                      className={cn(
                        "h-4 w-4",
                        action.loading && "animate-spin",
                      )}
                    />
                    <span className="flex-1 text-left">{action.label}</span>
                    <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-white/20 rounded border">
                      {action.shortcut.includes("Ctrl")
                        ? action.shortcut.replace(
                            "Ctrl",
                            navigator.platform.includes("Mac") ? "⌘" : "Ctrl",
                          )
                        : action.shortcut}
                    </kbd>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>
                    {action.label} ({action.shortcut})
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Keyboard className="h-3 w-3" />
                Keyboard shortcuts
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShortcuts(true)}
                className="h-6 px-2 text-xs"
              >
                View all
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Learn keyboard shortcuts to navigate the parent dashboard more
              efficiently.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
            {shortcutGroups.map((group, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcutIndex}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {shortcut.icon && (
                          <shortcut.icon className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm text-gray-700">
                          {shortcut.description}
                        </span>
                      </div>
                      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                        {shortcut.key.includes("Ctrl")
                          ? shortcut.key.replace(
                              "Ctrl",
                              navigator.platform.includes("Mac") ? "⌘" : "Ctrl",
                            )
                          : shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Command className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Pro Tip</h4>
                <p className="text-sm text-blue-700">
                  Press{" "}
                  <kbd className="px-1 py-0.5 bg-blue-200 rounded text-xs">
                    Alt + Q
                  </kbd>{" "}
                  to quickly toggle the Quick Actions panel from anywhere in the
                  dashboard.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    
  );
};
