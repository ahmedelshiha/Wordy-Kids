import React, { useState } from "react";
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
    combination: string;
  }>;
}

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  shortcut: string;
  color: string;
}

export function DesktopQuickActions({
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
}: DesktopQuickActionsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: "Navigation",
      shortcuts: [
        { key: "Alt+Q", description: "Toggle Quick Actions", combination: "Alt + Q" },
        { key: "Alt+H", description: "Show Help/Shortcuts", combination: "Alt + H" },
        { key: "Alt+S", description: "Open Settings", combination: "Alt + S" },
        { key: "Alt+G", description: "Show Goals", combination: "Alt + G" },
      ],
    },
    {
      title: "Data Management",
      shortcuts: [
        { key: "Alt+A", description: "Add New Child", combination: "Alt + A" },
        { key: "Alt+R", description: "Refresh Data", combination: "Alt + R" },
        { key: "Alt+E", description: "Export Data", combination: "Alt + E" },
        { key: "Alt+T", description: "Toggle Analytics", combination: "Alt + T" },
      ],
    },
    {
      title: "Quick Access",
      shortcuts: [
        { key: "Ctrl+/", description: "Search", combination: "Ctrl + /" },
        { key: "Escape", description: "Close Dialogs", combination: "Esc" },
        { key: "Enter", description: "Confirm Action", combination: "Enter" },
        { key: "Tab", description: "Next Element", combination: "Tab" },
      ],
    },
  ];

  const quickActions: QuickAction[] = [
    {
      icon: Plus,
      label: "Add Child",
      onClick: onAddChild,
      shortcut: "Alt+A",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: RefreshCw,
      label: "Refresh",
      onClick: onRefreshData,
      shortcut: "Alt+R",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      onClick: onToggleAnalytics,
      shortcut: "Alt+T",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      icon: Target,
      label: "Goals",
      onClick: onShowGoals,
      shortcut: "Alt+G",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      icon: Download,
      label: "Export",
      onClick: onExportData,
      shortcut: "Alt+E",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: onOpenSettings,
      shortcut: "Alt+S",
      color: "bg-gray-500 hover:bg-gray-600",
    },
    {
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
    <>
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

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {quickActions.map((action, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={action.onClick}
                    disabled={isLoading}
                    className={cn(
                      "h-16 flex flex-col gap-1 text-white transition-all duration-200",
                      action.color,
                    )}
                    size="sm"
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <div className="text-center">
                    <p className="font-medium">{action.label}</p>
                    <p className="text-xs opacity-75">{action.shortcut}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t pt-3 mt-3">
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
            {shortcutGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-900 border-b pb-2">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcutIndex}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm text-gray-700">
                        {shortcut.description}
                      </span>
                      <kbd className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-mono text-gray-600">
                        {shortcut.combination.split(" + ").map((key, keyIndex, array) => (
                          <React.Fragment key={keyIndex}>
                            <span>{key}</span>
                            {keyIndex < array.length - 1 && (
                              <span className="text-gray-400">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
