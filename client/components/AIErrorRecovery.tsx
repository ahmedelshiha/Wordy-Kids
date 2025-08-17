import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  RefreshCw, 
  WifiOff, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  Info,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export interface AIErrorRecoveryProps {
  error: string;
  errorType?: 'network' | 'service' | 'timeout' | 'unknown';
  onRetry: () => Promise<void>;
  onFallbackMode?: () => void;
  onOpenSettings?: () => void;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
  variant?: 'minimal' | 'detailed' | 'card';
}

const errorTypeConfig = {
  network: {
    icon: WifiOff,
    title: 'Connection Issue',
    description: 'Unable to connect to AI services. Check your internet connection.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  service: {
    icon: Brain,
    title: 'AI Service Unavailable',
    description: 'The AI system is temporarily unavailable. This usually resolves quickly.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  timeout: {
    icon: AlertCircle,
    title: 'Request Timeout',
    description: 'The AI took too long to respond. Please try again.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  unknown: {
    icon: AlertTriangle,
    title: 'Unexpected Error',
    description: 'Something went wrong with the AI system.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
};

export function AIErrorRecovery({
  error,
  errorType = 'unknown',
  onRetry,
  onFallbackMode,
  onOpenSettings,
  retryCount = 0,
  maxRetries = 3,
  className,
  variant = 'detailed'
}: AIErrorRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState(0);

  const config = errorTypeConfig[errorType];
  const Icon = config.icon;
  const canRetry = retryCount < maxRetries;

  // Auto-retry countdown for certain error types
  useEffect(() => {
    if (errorType === 'timeout' && retryCount === 0) {
      setAutoRetryCountdown(5);
      const countdown = setInterval(() => {
        setAutoRetryCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            handleRetry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdown);
    }
  }, [errorType, retryCount]);

  const handleRetry = async () => {
    if (!canRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const getRetryMessage = () => {
    if (retryCount === 0) return "Try Again";
    if (retryCount === 1) return "Retry";
    if (retryCount === 2) return "Try Once More";
    return "Last Attempt";
  };

  const getSuggestions = () => {
    const suggestions = [];
    
    if (errorType === 'network') {
      suggestions.push("Check your internet connection");
      suggestions.push("Try refreshing the page");
    } else if (errorType === 'service') {
      suggestions.push("Wait a moment and try again");
      suggestions.push("The issue usually resolves automatically");
    } else if (errorType === 'timeout') {
      suggestions.push("Try again - it might work faster now");
      suggestions.push("Check if other apps are using internet");
    }
    
    suggestions.push("Use basic mode without AI");
    if (onOpenSettings) suggestions.push("Check AI settings");
    
    return suggestions;
  };

  if (variant === 'minimal') {
    return (
      <Alert className={cn('border-l-4', config.borderColor, config.bgColor, className)}>
        <Icon className={cn('w-4 h-4', config.color)} />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">{config.title}</span>
          <div className="flex gap-2">
            {canRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying || autoRetryCountdown > 0}
                className="h-7 px-2"
              >
                {isRetrying ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : autoRetryCountdown > 0 ? (
                  `${autoRetryCountdown}s`
                ) : (
                  'Retry'
                )}
              </Button>
            )}
            {onFallbackMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onFallbackMode}
                className="h-7 px-2 text-xs"
              >
                Basic Mode
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn('w-full', config.borderColor, className)}>
        <CardHeader className="pb-3">
          <CardTitle className={cn('flex items-center gap-2 text-lg', config.color)}>
            <Icon className="w-5 h-5" />
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{config.description}</p>
          
          {error && showAdvanced && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-mono text-gray-700">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={retryCount > 0 ? "destructive" : "secondary"}>
                Attempt {retryCount + 1}/{maxRetries + 1}
              </Badge>
              {retryCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  Auto-retry enabled
                </Badge>
              )}
            </div>
            
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-auto p-0 text-xs"
            >
              {showAdvanced ? 'Hide' : 'Show'} Details
            </Button>
          </div>

          <div className="flex gap-2">
            {canRetry ? (
              <Button
                onClick={handleRetry}
                disabled={isRetrying || autoRetryCountdown > 0}
                className="flex-1"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : autoRetryCountdown > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Auto-retry in {autoRetryCountdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {getRetryMessage()}
                  </>
                )}
              </Button>
            ) : (
              <Alert className="flex-1 p-3">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  Max retries reached. Try basic mode or check settings.
                </AlertDescription>
              </Alert>
            )}
            
            {onFallbackMode && (
              <Button variant="outline" onClick={onFallbackMode}>
                Basic Mode
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant (default)
  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Error Alert */}
      <Alert className={cn('border-l-4', config.borderColor, config.bgColor)}>
        <Icon className={cn('w-5 h-5', config.color)} />
        <AlertDescription>
          <div className="space-y-3">
            <div>
              <h4 className={cn('font-semibold', config.color)}>{config.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{config.description}</p>
            </div>

            {/* Retry Progress */}
            {retryCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Retry Attempts</span>
                  <span>{retryCount}/{maxRetries}</span>
                </div>
                <Progress value={(retryCount / maxRetries) * 100} className="h-2" />
              </div>
            )}

            {/* Auto-retry countdown */}
            {autoRetryCountdown > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auto-retrying in {autoRetryCountdown} seconds...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {canRetry && !autoRetryCountdown && (
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isRetrying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {getRetryMessage()}
                </Button>
              )}
              
              {onFallbackMode && (
                <Button
                  variant="outline"
                  onClick={onFallbackMode}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Use Basic Mode
                </Button>
              )}
              
              {onOpenSettings && (
                <Button
                  variant="ghost"
                  onClick={onOpenSettings}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  AI Settings
                </Button>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Suggestions */}
      <Card>
        <CardContent className="p-4">
          <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            Suggestions
          </h5>
          <ul className="space-y-2 text-sm text-gray-600">
            {getSuggestions().map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                {suggestion}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Technical Details (expandable) */}
      {showAdvanced && error && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-sm">Technical Details</h5>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(false)}
                className="h-auto p-0 text-xs"
              >
                Hide
              </Button>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg font-mono text-xs text-gray-700 break-all">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {!showAdvanced && error && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setShowAdvanced(true)}
          className="text-xs text-gray-500"
        >
          Show technical details
        </Button>
      )}
    </div>
  );
}

// Hook for managing AI error recovery state
export function useAIErrorRecovery() {
  const [errors, setErrors] = useState<Array<{
    id: string;
    error: string;
    type: string;
    timestamp: number;
    retryCount: number;
  }>>([]);

  const addError = (error: string, type = 'unknown') => {
    const id = `error-${Date.now()}-${Math.random()}`;
    setErrors(prev => [...prev, {
      id,
      error,
      type,
      timestamp: Date.now(),
      retryCount: 0
    }]);
    return id;
  };

  const retryError = (id: string) => {
    setErrors(prev => prev.map(err => 
      err.id === id 
        ? { ...err, retryCount: err.retryCount + 1 }
        : err
    ));
  };

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(err => err.id !== id));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return {
    errors,
    addError,
    retryError,
    removeError,
    clearErrors
  };
}
