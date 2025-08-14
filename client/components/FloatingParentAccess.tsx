import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, X, ArrowRight, Shield, BarChart3, Settings, Eye } from 'lucide-react';

interface FloatingParentAccessProps {
  onAccessParentDashboard: () => void;
  currentTab: string;
}

export function FloatingParentAccess({ onAccessParentDashboard, currentTab }: FloatingParentAccessProps) {
  const [showQuickInfo, setShowQuickInfo] = useState(false);

  const getTabDisplayName = (tab: string) => {
    const tabNames: Record<string, string> = {
      dashboard: "Dashboard",
      learn: "Word Library", 
      quiz: "Quiz Time",
      progress: "Learning Journey",
      adventure: "Adventure Mode"
    };
    return tabNames[tab] || tab;
  };

  return (
    <>
      {/* Floating Parent Access Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="relative">
          {/* Quick Info Popup */}
          {showQuickInfo && (
            <div className="absolute bottom-full right-0 mb-2 w-64">
              <Card className="shadow-lg border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      Parent Access
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickInfo(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="text-xs text-purple-700">
                    <p className="mb-2">Monitor your child's learning progress:</p>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        <BarChart3 className="w-3 h-3" />
                        Progress tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <Eye className="w-3 h-3" />
                        Activity monitoring
                      </li>
                      <li className="flex items-center gap-2">
                        <Settings className="w-3 h-3" />
                        Learning controls
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-600">Currently in:</span>
                    <Badge variant="secondary" className="text-purple-700">
                      {getTabDisplayName(currentTab)}
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={() => {
                      setShowQuickInfo(false);
                      onAccessParentDashboard();
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs"
                    size="sm"
                  >
                    Access Parent Dashboard
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Main Button */}
          <Button
            onClick={() => setShowQuickInfo(!showQuickInfo)}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            size="sm"
          >
            <Users className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {showQuickInfo && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setShowQuickInfo(false)}
        />
      )}
    </>
  );
}

// Compact version for mobile
export function CompactParentAccess({ onAccessParentDashboard }: { onAccessParentDashboard: () => void }) {
  return (
    <Button
      onClick={onAccessParentDashboard}
      className="fixed top-4 right-16 z-40 h-8 px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs md:hidden"
      size="sm"
    >
      <Users className="w-3 h-3 mr-1" />
      Parent
    </Button>
  );
}
