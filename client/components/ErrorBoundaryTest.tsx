import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBoundary } from "./common/ErrorBoundary";

// Test component that can trigger errors
const ErrorGeneratingComponent: React.FC<{ shouldError: boolean }> = ({
  shouldError,
}) => {
  if (shouldError) {
    throw new Error(
      "This is a test error to verify ErrorBoundary functionality",
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-green-800">✅ Component working normally</p>
    </div>
  );
};

// Another test component for naming conflicts
const MapTestComponent: React.FC = () => {
  // Test that we can use JavaScript Map without conflicts
  const testMap = new Map();
  testMap.set("test", "value");

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-blue-800">
        ✅ Map usage working: {testMap.get("test")}
      </p>
    </div>
  );
};

export const ErrorBoundaryTest: React.FC = () => {
  const [triggerKidError, setTriggerKidError] = useState(false);
  const [triggerParentError, setTriggerParentError] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🛠️ ErrorBoundary Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Use these buttons to test ErrorBoundary functionality with different
            fallback types:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => setTriggerKidError(true)}
              variant="destructive"
              className="w-full"
            >
              Test Kid Fallback (Jungle Theme)
            </Button>

            <Button
              onClick={() => setTriggerParentError(true)}
              variant="destructive"
              className="w-full"
            >
              Test Parent Fallback (Diagnostic)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Button
              onClick={() => setTriggerKidError(false)}
              variant="outline"
              className="w-full"
            >
              Reset Kid Component
            </Button>

            <Button
              onClick={() => setTriggerParentError(false)}
              variant="outline"
              className="w-full"
            >
              Reset Parent Component
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kid Error Boundary Test */}
        <Card>
          <CardHeader>
            <CardTitle>Kid Fallback Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary fallbackType="kid" componentName="KidTestComponent">
              <ErrorGeneratingComponent shouldError={triggerKidError} />
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* Parent Error Boundary Test */}
        <Card>
          <CardHeader>
            <CardTitle>Parent Fallback Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary
              fallbackType="parent"
              componentName="ParentTestComponent"
            >
              <ErrorGeneratingComponent shouldError={triggerParentError} />
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>

      {/* Map Naming Conflict Test */}
      <Card>
        <CardHeader>
          <CardTitle>Map Naming Conflict Test</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorBoundary fallbackType="parent" componentName="MapTestComponent">
            <MapTestComponent />
          </ErrorBoundary>
        </CardContent>
      </Card>

      {/* Development Tools */}
      {process.env.NODE_ENV === "development" && (
        <Card>
          <CardHeader>
            <CardTitle>🔧 Development Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => {
                // Import telemetry and show data
                import("@/lib/telemetry").then(({ telemetry }) => {
                  const data = telemetry.exportData();
                  if (data) {
                    console.log("Telemetry Data:", data);
                    alert("Telemetry data logged to console");
                  }
                });
              }}
              variant="outline"
              size="sm"
            >
              Export Telemetry Data
            </Button>

            <Button
              onClick={() => {
                import("@/lib/telemetry").then(({ telemetry }) => {
                  const summary = telemetry.getErrorSummary();
                  console.log("Error Summary:", summary);
                  alert(`Total Errors: ${summary.totalErrors}`);
                });
              }}
              variant="outline"
              size="sm"
            >
              View Error Summary
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ErrorBoundaryTest;
