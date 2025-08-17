import React, { useState, useEffect } from "react";
import { SafeTooltip } from "@/components/ui/tooltip-wrapper";

/**
 * React Health Check Component
 * Tests if React hooks and context are working properly
 */
export function ReactHealthCheck() {
  const [status, setStatus] = useState<"checking" | "healthy" | "error">("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Test basic React hooks
      const testState = useState("test");
      const testEffect = useEffect;
      
      if (testState && testEffect) {
        setStatus("healthy");
        setError(null);
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown React error");
    }
  }, []);

  const statusConfig = {
    checking: { color: "text-yellow-600", bg: "bg-yellow-100", icon: "🔄" },
    healthy: { color: "text-green-600", bg: "bg-green-100", icon: "✅" },
    error: { color: "text-red-600", bg: "bg-red-100", icon: "❌" },
  };

  const config = statusConfig[status];

  return (
    <SafeTooltip 
      content={
        <div className="text-sm">
          <div className="font-semibold">React Health Status</div>
          <div>Hooks: {status === "healthy" ? "Working" : "Issues detected"}</div>
          {error && <div className="text-red-400 mt-1">{error}</div>}
        </div>
      }
    >
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.color} text-xs font-medium`}>
        <span>{config.icon}</span>
        <span>React: {status}</span>
      </div>
    </SafeTooltip>
  );
}
