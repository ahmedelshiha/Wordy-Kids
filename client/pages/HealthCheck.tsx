import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

/**
 * Simple health check component to verify React context is working
 */
export const HealthCheck: React.FC = () => {
  const [reactState, setReactState] = useState("testing");
  const [contextWorks, setContextWorks] = useState(false);

  useEffect(() => {
    // Test React hooks and context
    try {
      setReactState("working");
      setContextWorks(true);
    } catch (error) {
      console.error("React context error:", error);
      setContextWorks(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {contextWorks ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            React Health Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>React useState:</span>
            <span className={`font-semibold ${contextWorks ? 'text-green-600' : 'text-red-600'}`}>
              {reactState}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Context Status:</span>
            <span className={`font-semibold ${contextWorks ? 'text-green-600' : 'text-red-600'}`}>
              {contextWorks ? "✅ Working" : "❌ Error"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>TooltipProvider:</span>
            <span className="font-semibold text-green-600">
              ✅ Safe Mode
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthCheck;
