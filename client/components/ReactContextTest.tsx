import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

/**
 * Simple component to test that React hooks and context are working
 * This should work if TooltipProvider issues are resolved
 */
export function ReactContextTest() {
  const [count, setCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">React Context Test</h3>
      
      {/* Test useState hook */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">useState Hook Test:</p>
        <Button 
          onClick={() => setCount(c => c + 1)}
          variant="outline"
        >
          Count: {count}
        </Button>
      </div>

      {/* Test Tooltip (requires working TooltipProvider context) */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Tooltip Context Test:</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={() => setShowTooltip(!showTooltip)}
              variant="outline"
            >
              Hover for tooltip
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>✅ TooltipProvider context is working!</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="text-sm text-green-600">
        {count > 0 ? "✅ React hooks working properly" : "Click button above to test React hooks"}
      </div>
    </div>
  );
}
