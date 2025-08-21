import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryKey: number;
}

interface UniversalErrorBoundaryProps {
  children: ReactNode;
  fallbackType: "kid" | "parent";
  componentName: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class UniversalErrorBoundary extends Component<
  UniversalErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: UniversalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryKey: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to telemetry
    this.logErrorToTelemetry(error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call optional onError prop
    this.props.onError?.(error, errorInfo);

    console.error(
      `ErrorBoundary caught error in ${this.props.componentName}:`,
      error,
      errorInfo,
    );
  }

  private logErrorToTelemetry = (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // Enhanced telemetry logging
      const telemetryData = {
        event: "ui_error",
        component: this.props.componentName,
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryAttempt: this.state.retryKey,
      };

      // Log to console for development
      console.error("🚨 UI Error Telemetry:", telemetryData);

      // Send to telemetry service (if available)
      if (typeof window !== "undefined" && (window as any).telemetry) {
        (window as any).telemetry.log("ui_error", telemetryData);
      }

      // Backup analytics tracking
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "exception", {
          description: `${this.props.componentName}: ${error.message}`,
          fatal: false,
        });
      }
    } catch (telemetryError) {
      console.error("Failed to log error to telemetry:", telemetryError);
    }
  };

  private handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryKey: prevState.retryKey + 1,
    }));
  };

  private renderKidFallback() {
    const { componentName } = this.props;
    const { error } = this.state;

    return (
      <div className="min-h-[400px] flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <Card className="max-w-md w-full border-2 border-jungle/20 shadow-lg bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-jungle to-sunshine rounded-full flex items-center justify-center">
                <span className="text-2xl">🌳</span>
              </div>
            </div>
            <CardTitle className="text-jungle-dark text-xl font-bold">
              🚧 Jungle Path Under Construction
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 text-sm">
              Oops! Our jungle friends are fixing something in the{" "}
              <span className="font-semibold text-jungle">{componentName}</span>{" "}
              area.
            </p>

            <div className="bg-jungle/10 rounded-lg p-3 border border-jungle/20">
              <div className="flex items-center justify-center gap-2 text-jungle-dark">
                <span className="text-base">🐒</span>
                <span className="text-sm font-medium">
                  Don't worry, we'll have it ready soon!
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full bg-gradient-to-r from-jungle to-sunshine hover:from-jungle-dark hover:to-sunshine-dark text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again 🌟
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="w-full border-jungle/30 text-jungle hover:bg-jungle/10"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home Base 🏠
              </Button>
            </div>

            <div className="flex justify-center space-x-2 mt-4">
              <span className="text-lg">🌳</span>
              <span className="text-lg">🦋</span>
              <span className="text-lg">🌸</span>
              <span className="text-lg">🐯</span>
              <span className="text-lg">🌿</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  private renderParentFallback() {
    const { componentName } = this.props;
    const { error, errorInfo } = this.state;

    return (
      <div className="min-h-[400px] flex items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-2xl w-full shadow-lg">
          <CardHeader className="border-b bg-red-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-800">
                  Component Error - {componentName}
                </CardTitle>
                <Badge variant="destructive" className="mt-1">
                  Error Boundary Triggered
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Error Details:</h4>
                <div className="bg-gray-100 p-3 rounded-lg text-sm">
                  <p className="font-mono text-red-600">
                    {error?.name}: {error?.message}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Component:</h4>
                <div className="bg-gray-100 p-3 rounded-lg text-sm">
                  <p className="font-mono">{componentName}</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Retry Attempt: {this.state.retryKey}
                  </p>
                </div>
              </div>
            </div>

            {error?.stack && (
              <details className="space-y-2">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-gray-600">
                  Stack Trace (Click to expand)
                </summary>
                <div className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-40">
                  <pre className="font-mono text-gray-700 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              </details>
            )}

            {errorInfo?.componentStack && (
              <details className="space-y-2">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-gray-600">
                  Component Stack (Click to expand)
                </summary>
                <div className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-32">
                  <pre className="font-mono text-gray-700 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Component
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                <Bug className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p className="text-blue-800">
                <strong>For Support:</strong> This error has been logged with
                timestamp{" "}
                <code className="bg-blue-100 px-1 rounded">
                  {new Date().toISOString()}
                </code>
                . Please include this information when reporting the issue.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallbackType === "kid"
        ? this.renderKidFallback()
        : this.renderParentFallback();
    }

    // Re-render children with new key on retry to force component remount
    return <div key={this.state.retryKey}>{this.props.children}</div>;
  }
}

// HOC wrapper for easier usage
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackType: "kid" | "parent",
  componentName: string,
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <UniversalErrorBoundary
      fallbackType={fallbackType}
      componentName={componentName}
    >
      <WrappedComponent {...props} />
    </UniversalErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return WithErrorBoundaryComponent;
}

export default UniversalErrorBoundary;
