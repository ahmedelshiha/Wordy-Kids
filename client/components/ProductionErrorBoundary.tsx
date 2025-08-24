import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  RefreshCw,
  Bug,
  Home,
  Copy,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ErrorInfo {
  componentStack: string;
  errorBoundary: string;
  errorBoundaryStack: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isReporting: boolean;
  showDetails: boolean;
}

interface ProductionErrorBoundaryProps {
  children: React.ReactNode;
  fallbackType?: "kid" | "parent" | "admin";
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableReporting?: boolean;
  maxRetries?: number;
}

export class ProductionErrorBoundary extends React.Component<
  ProductionErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ProductionErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      retryCount: 0,
      isReporting: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Report error if enabled
    if (this.props.enableReporting !== false) {
      this.reportError(error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to external service (e.g., Sentry, LogRocket)
    this.logToExternalService(error, errorInfo);
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      this.setState({ isReporting: true });

      const reportData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        userId: this.getUserId(),
        sessionId: this.getSessionId(),
        buildVersion: process.env.REACT_APP_VERSION || "unknown",
        additionalContext: this.getAdditionalContext(),
      };

      // Send to error reporting service
      await fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError);
    } finally {
      this.setState({ isReporting: false });
    }
  }

  private logToExternalService(error: Error, errorInfo: ErrorInfo) {
    // Example: Sentry integration
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.withScope((scope: any) => {
        scope.setTag("errorBoundary", true);
        scope.setContext("errorInfo", errorInfo);
        scope.setLevel("error");
        (window as any).Sentry.captureException(error);
      });
    }

    // Example: Custom analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "exception", {
        description: error.toString(),
        fatal: true,
        custom_map: {
          error_id: this.state.errorId,
        },
      });
    }
  }

  private getUserId(): string {
    try {
      const userData = localStorage.getItem("wordAdventureCurrentUser");
      return userData ? JSON.parse(userData).id : "anonymous";
    } catch {
      return "anonymous";
    }
  }

  private getSessionId(): string {
    try {
      return sessionStorage.getItem("sessionId") || "unknown";
    } catch {
      return "unknown";
    }
  }

  private getAdditionalContext(): Record<string, any> {
    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      memory: (performance as any).memory
        ? {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
          }
        : null,
      connection: (navigator as any).connection
        ? {
            effectiveType: (navigator as any).connection.effectiveType,
            downlink: (navigator as any).connection.downlink,
          }
        : null,
      lastActions: this.getLastUserActions(),
    };
  }

  private getLastUserActions(): string[] {
    try {
      return JSON.parse(sessionStorage.getItem("userActions") || "[]").slice(
        -5,
      );
    } catch {
      return [];
    }
  }

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;

    if (this.state.retryCount >= maxRetries) {
      return;
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Auto-retry after delay if error occurs again
    this.retryTimeoutId = setTimeout(
      () => {
        if (this.state.hasError && this.state.retryCount < maxRetries) {
          this.handleRetry();
        }
      },
      2000 * Math.pow(2, this.state.retryCount),
    ); // Exponential backoff
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private copyErrorInfo = () => {
    const errorText = `
Error ID: ${this.state.errorId}
Message: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      // Could show a toast notification here
      console.log("Error info copied to clipboard");
    });
  };

  private toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { fallbackType = "parent", maxRetries = 3 } = this.props;
    const { error, errorId, retryCount, isReporting, showDetails } = this.state;

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <CardTitle className="text-2xl text-gray-900">
              {fallbackType === "kid"
                ? "🔧 Oops! Something went wrong"
                : "Application Error"}
            </CardTitle>

            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                Error ID: {errorId}
              </Badge>
              {isReporting && (
                <Badge variant="secondary" className="text-xs">
                  Reporting...
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Kid-friendly message */}
            {fallbackType === "kid" && (
              <div className="text-center space-y-3">
                <p className="text-gray-600">
                  Don't worry! Sometimes apps need a little fix. Let's try
                  again! 🚀
                </p>
                <div className="text-4xl">🛠️</div>
              </div>
            )}

            {/* Parent/Admin technical message */}
            {fallbackType !== "kid" && (
              <div className="space-y-3">
                <p className="text-gray-600">
                  An unexpected error occurred in the application. The error has
                  been logged and our team has been notified.
                </p>

                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700 font-mono">
                    {error?.message || "Unknown error occurred"}
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {retryCount < maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                </Button>
              )}

              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Support section */}
            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Need Help?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={this.copyErrorInfo}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Error Info
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() =>
                    window.open(
                      "mailto:support@wordykids.com?subject=Error Report&body=" +
                        encodeURIComponent(
                          `Error ID: ${errorId}\nMessage: ${error?.message}`,
                        ),
                    )
                  }
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>

            {/* Technical details (collapsible) */}
            {fallbackType !== "kid" && (
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  onClick={this.toggleDetails}
                  className="w-full justify-between p-0 h-auto text-sm"
                >
                  Technical Details
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                {showDetails && (
                  <div className="bg-gray-50 p-4 rounded-md text-xs font-mono space-y-2 max-h-64 overflow-auto">
                    <div>
                      <strong>Error:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {error?.stack}
                      </pre>
                    </div>

                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}

                    <div>
                      <strong>URL:</strong> {window.location.href}
                    </div>

                    <div>
                      <strong>User Agent:</strong> {navigator.userAgent}
                    </div>

                    <div>
                      <strong>Timestamp:</strong> {new Date().toISOString()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Retry information */}
            {retryCount >= maxRetries && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-amber-800 text-sm">
                  Maximum retry attempts reached. Please reload the page or
                  contact support if the problem persists.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ProductionErrorBoundaryProps>,
) {
  const WrappedComponent = (props: P) => (
    <ProductionErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ProductionErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for error reporting from functional components
export function useErrorReporting() {
  const reportError = React.useCallback(
    (error: Error, context?: Record<string, any>) => {
      console.error("Manual error report:", error, context);

      // Create fake error info for consistency
      const errorInfo: ErrorInfo = {
        componentStack: "Manual report - no component stack available",
        errorBoundary: "useErrorReporting hook",
        errorBoundaryStack: new Error().stack || "",
      };

      const errorBoundary = new ProductionErrorBoundary({
        children: null,
        enableReporting: true,
      });

      // Manually trigger the error reporting
      errorBoundary.componentDidCatch(error, errorInfo);
    },
    [],
  );

  return { reportError };
}

// Error boundary for specific component types
export const KidErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProductionErrorBoundary fallbackType="kid" maxRetries={5}>
    {children}
  </ProductionErrorBoundary>
);

export const ParentErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProductionErrorBoundary fallbackType="parent" maxRetries={3}>
    {children}
  </ProductionErrorBoundary>
);

export const AdminErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProductionErrorBoundary fallbackType="admin" maxRetries={1}>
    {children}
  </ProductionErrorBoundary>
);
