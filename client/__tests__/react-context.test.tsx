import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React, { useState } from "react";

// Test component to verify React hooks are working
const TestComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <span data-testid="count">{count}</span>
      <button data-testid="increment" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </div>
  );
};

// Test TooltipProvider equivalent to ensure React context is working
const TestTooltipProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div data-testid="tooltip-provider">
      <div data-testid="tooltip-state">{isOpen ? "open" : "closed"}</div>
      <button data-testid="toggle-tooltip" onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      {children}
    </div>
  );
};

describe("React Context and Hooks Tests", () => {
  it("should render and use useState hook correctly", () => {
    render(<TestComponent />);

    const countElement = screen.getByTestId("count");
    expect(countElement).toHaveTextContent("0");

    const incrementButton = screen.getByTestId("increment");
    expect(incrementButton).toBeInTheDocument();
  });

  it("should handle useState in provider-like components", () => {
    render(
      <TestTooltipProvider>
        <div data-testid="child">Child content</div>
      </TestTooltipProvider>,
    );

    expect(screen.getByTestId("tooltip-provider")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-state")).toHaveTextContent("closed");
    expect(screen.getByTestId("child")).toHaveTextContent("Child content");
  });

  it("should verify React is available globally", () => {
    expect(React).toBeDefined();
    expect(React.useState).toBeDefined();
    expect(typeof React.useState).toBe("function");
  });

  it("should verify useState function is available", () => {
    // This test will fail if React context is null
    const TestHookComponent = () => {
      const [value] = useState("test");
      return <div data-testid="hook-test">{value}</div>;
    };

    render(<TestHookComponent />);
    expect(screen.getByTestId("hook-test")).toHaveTextContent("test");
  });
});
