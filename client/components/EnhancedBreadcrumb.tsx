import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Home,
  Target,
  BookOpen,
  Brain,
  Trophy,
  Users,
  Sword,
  ArrowLeft,
} from "lucide-react";

interface BreadcrumbItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  isActive?: boolean;
  onClick?: () => void;
}

interface EnhancedBreadcrumbProps {
  currentTab: string;
  userRole: "child" | "parent";
  selectedCategory?: string;
  learningMode?: string;
  onNavigate: (tab: string) => void;
  onBackToChild?: () => void;
}

export function EnhancedBreadcrumb({
  currentTab,
  userRole,
  selectedCategory,
  learningMode,
  onNavigate,
  onBackToChild,
}: EnhancedBreadcrumbProps) {
  const getTabInfo = (tabId: string) => {
    const tabs: Record<
      string,
      { label: string; icon: React.ComponentType<any>; color: string }
    > = {
      dashboard: { label: "Dashboard", icon: Target, color: "purple" },
      learn: { label: "Word Library", icon: BookOpen, color: "green" },
      quiz: { label: "Quiz Time", icon: Brain, color: "pink" },
      progress: { label: "My Journey", icon: Trophy, color: "yellow" },
      adventure: { label: "Adventure", icon: Sword, color: "blue" },
      parent: { label: "Parent Dashboard", icon: Users, color: "purple" },
    };
    return tabs[tabId] || { label: tabId, icon: Home, color: "gray" };
  };

  const currentTabInfo = getTabInfo(currentTab);
  const Icon = currentTabInfo.icon;

  const buildBreadcrumb = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      {
        id: "home",
        label: "Wordy's Adventure",
        icon: Home,
        onClick: () => onNavigate("dashboard"),
      },
    ];

    if (userRole === "parent") {
      items.push({
        id: "parent",
        label: "Parent Dashboard",
        icon: Users,
        isActive: true,
      });
    } else {
      // Add current tab
      items.push({
        id: currentTab,
        label: currentTabInfo.label,
        icon: currentTabInfo.icon,
        isActive: true,
        onClick: () => onNavigate(currentTab),
      });

      // Add specific context if available
      if (currentTab === "learn" && selectedCategory) {
        items.push({
          id: "category",
          label: selectedCategory,
          icon: BookOpen,
        });

        if (learningMode && learningMode !== "selector") {
          items.push({
            id: "mode",
            label:
              learningMode === "cards" ? "Learning Cards" : "Matching Game",
            icon: learningMode === "cards" ? BookOpen : Brain,
          });
        }
      }
    }

    return items;
  };

  const breadcrumbItems = buildBreadcrumb();

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-1 text-sm">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              )}

              {item.onClick ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={item.onClick}
                  className={`h-7 px-2 text-xs ${
                    item.isActive
                      ? "text-educational-blue font-medium"
                      : "text-gray-600 hover:text-educational-blue"
                  }`}
                >
                  <item.icon className="w-3 h-3 mr-1" />
                  {item.label}
                </Button>
              ) : (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded ${
                    item.isActive
                      ? "text-educational-blue font-medium"
                      : "text-gray-600"
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {userRole === "parent" && onBackToChild && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToChild}
              className="h-7 px-3 text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Back to Learning
            </Button>
          )}

          {userRole === "child" && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-1 bg-educational-blue/10 text-educational-blue"
            >
              Learning Mode
            </Badge>
          )}

          {userRole === "parent" && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-1 bg-purple-100 text-purple-700"
            >
              Parent View
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for mobile
export function CompactBreadcrumb({
  currentTab,
  userRole,
  onBackToChild,
}: Pick<EnhancedBreadcrumbProps, "currentTab" | "userRole" | "onBackToChild">) {
  const getTabInfo = (tabId: string) => {
    const tabs: Record<
      string,
      { label: string; icon: React.ComponentType<any> }
    > = {
      dashboard: { label: "Dashboard", icon: Target },
      learn: { label: "Word Library", icon: BookOpen },
      quiz: { label: "Quiz", icon: Brain },
      progress: { label: "Journey", icon: Trophy },
      adventure: { label: "Adventure", icon: Sword },
      parent: { label: "Parent Dashboard", icon: Users },
    };
    return tabs[tabId] || { label: tabId, icon: Home };
  };

  const currentTabInfo = getTabInfo(currentTab);
  const Icon = currentTabInfo.icon;

  return (
    <div className="bg-white/90 backdrop-blur-sm px-3 py-2 border-b border-gray-200 md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-educational-blue" />
          <span className="text-sm font-medium text-gray-800">
            {currentTabInfo.label}
          </span>
        </div>

        {userRole === "parent" && onBackToChild && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToChild}
            className="h-6 px-2 text-xs"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
