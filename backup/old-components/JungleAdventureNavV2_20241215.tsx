// 🚨 Deprecated: Use JungleAdventureNavV3.tsx instead
// This component has been moved to deprecated folder as part of navigation upgrade
// Migration to V3 includes:
// - Enhanced jungle theming with proper gradients
// - Improved parent menu integration
// - Better mobile/desktop responsive design
// - Optimized performance and accessibility
// - Simplified prop interface

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Book,
  Trophy,
  Settings,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAccessibilityFeatures } from "@/hooks/use-accessibility-features";
import { useLocation, useNavigate } from "react-router-dom";
import type { JungleAdventureNavProps } from "../types/jungle-adventure-nav-types";

// Simple navigation items without external dependencies
const DEFAULT_NAV_ITEMS = [
  {
    id: "home",
    icon: Home,
    label: "Home",
    path: "/",
    badge: null as number | null,
  },
  {
    id: "library",
    icon: Book,
    label: "Library",
    path: "/library",
    badge: null as number | null,
  },
  {
    id: "achievements",
    icon: Trophy,
    label: "Achievements",
    path: "/achievements",
    badge: null as number | null,
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    path: "/settings",
    badge: null as number | null,
  },
];

export default function JungleAdventureNavV2({
  navItems = DEFAULT_NAV_ITEMS,
  showParentMenu = false,
  parentMenuConfig,
  onParentMenuOpen,
  className,
  ...props
}: JungleAdventureNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { keyboardNavigation } = useAccessibilityFeatures();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mount effect for portal
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [keyboardNavigation, isMobileMenuOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const mobileMenuComponent = isMounted ? (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="fixed left-0 top-0 z-50 h-full w-72 bg-jungle/95 backdrop-blur-sm border-r border-jungle-dark/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-jungle-dark/20">
              <span className="text-lg font-bold text-white">Navigation</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:bg-jungle-dark/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation Items */}
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-white hover:bg-jungle-dark/20",
                      isActive && "bg-jungle-dark/30 text-white"
                    )}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge
                        variant="secondary" 
                        className="ml-auto bg-sunshine text-navy text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </nav>

            {/* Parent Menu in Mobile */}
            {showParentMenu && parentMenuConfig && (
              <div className="absolute bottom-4 left-4 right-4">
                <Button
                  onClick={() => {
                    onParentMenuOpen?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-sunshine hover:bg-sunshine-dark text-navy font-semibold"
                >
                  👨‍👩‍👧‍👦 {parentMenuConfig.title}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  ) : null;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn(
        "hidden md:flex items-center gap-1 bg-jungle/90 backdrop-blur-sm rounded-full px-3 py-2 border border-jungle-dark/20",
        className
      )} {...props}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.id}
              size="sm"
              variant="ghost"
              className={cn(
                "relative gap-2 text-white/80 hover:text-white hover:bg-jungle-dark/20 transition-colors",
                isActive && "text-white bg-jungle-dark/30"
              )}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden lg:inline">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 bg-sunshine text-navy text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
        
        {/* Parent Menu Button - Desktop */}
        {showParentMenu && parentMenuConfig && (
          <Button
            size="sm"
            onClick={onParentMenuOpen}
            className="ml-2 bg-sunshine hover:bg-sunshine-dark text-navy font-semibold"
          >
            👨‍👩‍👧‍👦
            <span className="hidden lg:inline ml-1">{parentMenuConfig.title}</span>
          </Button>
        )}
      </nav>

      {/* Mobile Menu Trigger */}
      <Button
        size="sm"
        variant="ghost"
        className="md:hidden text-white hover:bg-jungle-dark/20"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <MenuIcon className="h-5 w-5" />
      </Button>

      {/* Mobile Menu Portal */}
      {typeof document !== "undefined" && createPortal(mobileMenuComponent, document.body)}
    </>
  );
}
