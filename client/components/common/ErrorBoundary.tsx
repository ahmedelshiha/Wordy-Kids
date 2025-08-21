import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parentDashboardAnalytics } from "@/lib/parentDashboardAnalytics";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackType?: "kid" | "parent";
  componentName?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ""
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { componentName = "unknown", fallbackType = "parent" } = this.props;
    
    // Log error to telemetry
    try {
      parentDashboardAnalytics.trackError(
        fallbackType === "kid" ? "dashboard" : "map",
        error.message,
        {
          componentName,
          stack: error.stack?.substring(0, 500),
          errorInfo: JSON.stringify(errorInfo).substring(0, 300),
          timestamp: new Date().toISOString(),
          errorId: this.state.errorId,
          userAgent: navigator.userAgent.substring(0, 100),
          url: window.location.href
        }
      );
    } catch (telemetryError) {
      console.error("Failed to log error to telemetry:", telemetryError);
    }

    // Update state with error info
    this.setState({
      errorInfo
    });

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("🚨 ErrorBoundary caught an error:", {
        error,
        errorInfo,
        componentName,
        fallbackType
      });
    }
  }

  handleRetry = () => {
    const { onReset } = this.props;
    
    // Log retry attempt
    try {
      parentDashboardAnalytics.trackFeatureUsage("error_boundary", "retry_clicked", {
        componentName: this.props.componentName,
        errorId: this.state.errorId
      });
    } catch (error) {
      console.error("Failed to track retry:", error);
    }

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ""
    });

    // Call custom reset handler if provided
    if (onReset) {
      onReset();
    }
  };

  handleGoHome = () => {
    try {
      parentDashboardAnalytics.trackFeatureUsage("error_boundary", "home_clicked", {
        componentName: this.props.componentName,
        errorId: this.state.errorId
      });
    } catch (error) {
      console.error("Failed to track home navigation:", error);
    }

    window.location.href = "/";
  };

  renderKidFallback() {
    const { error } = this.state;
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-jungle-light via-green-50 to-white">
        <Card className="max-w-md w-full text-center border-jungle border-2 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                {/* Jungle parrot mascot */}
                <div className="text-6xl animate-bounce">🦜</div>
                <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-jungle-dark">
              Oops! Something went wrong in the jungle!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-jungle text-lg">
              Don't worry, our jungle parrot is fixing things! 🌿
            </p>
            
            {/* Decorative vines */}
            <div className="flex justify-center space-x-2 my-4">
              <TreePine className="text-jungle animate-jungle-sway" size={24} />
              <TreePine className="text-jungle-light animate-jungle-sway animation-delay-500" size={28} />
              <TreePine className="text-jungle animate-jungle-sway animation-delay-1000" size={24} />
            </div>

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full bg-jungle hover:bg-jungle-dark text-white font-semibold py-3 rounded-xl shadow-lg transform transition-transform hover:scale-105"
                size="lg"
              >
                <RefreshCw className="mr-2" size={20} />
                Try Again! 🌟
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full border-jungle text-jungle hover:bg-jungle-light font-semibold py-3 rounded-xl"
                size="lg"
              >
                <Home className="mr-2" size={20} />
                Go Home 🏠
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  🔧 Developer Info
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {error.message}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  renderParentFallback() {
    const { error, errorInfo, errorId } = this.state;
    const { componentName } = this.props;
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="text-orange-500" size={32} />
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Application Error
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {componentName ? `Error in ${componentName}` : "An unexpected error occurred"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-2">Error Details:</p>
              <p className="text-red-700 text-sm">
                {error?.message || "Unknown error occurred"}
              </p>
              {errorId && (
                <p className="text-red-600 text-xs mt-2">
                  Error ID: {errorId}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={this.handleRetry}
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="mr-2" size={16} />
                Retry
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="mr-2" size={16} />
                Go Home
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium">
                  🔧 Development Details
                </summary>
                <div className="mt-3 space-y-3">
                  {error && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Error:</p>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                        {error.toString()}
                      </pre>
                    </div>
                  )}
                  
                  {error?.stack && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Stack Trace:</p>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {errorInfo && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Component Stack:</p>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  render() {
    const { hasError } = this.state;
    const { children, fallbackType = "parent" } = this.props;

    if (hasError) {
      return fallbackType === "kid" ? this.renderKidFallback() : this.renderParentFallback();
    }

    return children;
  }
}

export default ErrorBoundary;
