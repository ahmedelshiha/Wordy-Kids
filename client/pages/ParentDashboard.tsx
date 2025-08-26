import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JungleAdventureParentDashboard } from "@/components/JungleAdventureParentDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, Users, ChevronLeft, AlertCircle } from "lucide-react";
import { enhancedAnalytics } from "@/lib/enhancedAnalyticsSystem";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface ParentDashboardProps {
  className?: string;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({
  className = "",
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Track page view
    enhancedAnalytics.trackEvent({
      type: "parent_dashboard_view",
      data: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        parentId: user?.id || "anonymous",
      },
    });

    // Simulate authentication check and access validation
    const validateAccess = async () => {
      try {
        setIsLoading(true);

        // Check if user is authenticated
        if (!isAuthenticated) {
          navigate("/login");
          return;
        }

        // Simulate COPPA/GDPR compliance check
        // In a real app, this would verify parental consent and data processing agreements
        const hasValidConsent =
          localStorage.getItem("parental_consent") === "granted";
        const hasDataProcessingAgreement =
          localStorage.getItem("data_processing_consent") === "granted";

        if (!hasValidConsent || !hasDataProcessingAgreement) {
          // Redirect to consent flow
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        // All checks passed
        setHasAccess(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to validate parent dashboard access:", error);
        setHasAccess(false);
        setIsLoading(false);
      }
    };

    validateAccess();
  }, [isAuthenticated, user, navigate]);

  const handleBack = () => {
    enhancedAnalytics.trackEvent({
      type: "parent_dashboard_exit",
      data: {
        timestamp: new Date().toISOString(),
        parentId: user?.id || "anonymous",
      },
    });
    navigate("/app");
  };

  const handleGrantConsent = () => {
    // In a real app, this would show a proper consent flow
    localStorage.setItem("parental_consent", "granted");
    localStorage.setItem("data_processing_consent", "granted");

    enhancedAnalytics.trackEvent({
      type: "parental_consent_granted",
      data: {
        timestamp: new Date().toISOString(),
        parentId: user?.id || "anonymous",
      },
    });

    setHasAccess(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="text-6xl mb-4 animate-bounce">👨‍👩‍👧‍👦</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Preparing Parent Dashboard
            </h2>
            <p className="text-green-600 mb-4">
              Verifying access and loading family data...
            </p>
            <Progress value={65} className="w-64 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // No access (need consent)
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CardContent className="space-y-6">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Parental Consent Required
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">
                    COPPA Compliance
                  </p>
                  <p className="text-blue-700">
                    We need your consent to collect and process your child's
                    learning data in compliance with the Children's Online
                    Privacy Protection Act.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-purple-800 mb-1">
                    GDPR Compliance
                  </p>
                  <p className="text-purple-700">
                    Your consent is required for data processing under the
                    General Data Protection Regulation.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleGrantConsent}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                Grant Consent & Continue
              </Button>
              <Button variant="outline" onClick={handleBack} className="w-full">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              By granting consent, you agree to our privacy policy and data
              processing terms. You can withdraw consent at any time from the
              dashboard settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 ${className}`}
    >
      <ErrorBoundary fallbackType="parent" componentName="ParentDashboard">
        <JungleAdventureParentDashboard onBack={handleBack} />
      </ErrorBoundary>
    </div>
  );
};

export default ParentDashboard;
