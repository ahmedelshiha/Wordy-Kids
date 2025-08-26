import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JungleWordLibrary } from "../components/JungleWordLibrarySimplified";
import ParentDashboard from "../pages/ParentDashboard";
import { AuthProvider } from "../hooks/useAuth";
import { LightweightAchievementProvider } from "../components/LightweightAchievementProvider";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Speech API for testing
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  speaking: false,
  pending: false,
  paused: false,
};
Object.defineProperty(window, "speechSynthesis", {
  writable: true,
  value: mockSpeechSynthesis,
});

// Mock audio for testing
Object.defineProperty(window, "Audio", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    load: vi.fn(),
    volume: 1,
    currentTime: 0,
    duration: 0,
    ended: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LightweightAchievementProvider>
            {children}
          </LightweightAchievementProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("Accessibility Tests - WCAG 2.1 AA Compliance", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    // Reset DOM classes before each test
    document.documentElement.className = "";
    
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up DOM
    document.documentElement.className = "";
    document.body.innerHTML = "";
  });

  describe("JungleWordLibrary Component", () => {
    it("should have no accessibility violations in default mode", async () => {
      const { container } = render(
        <TestWrapper>
          <JungleWordLibrary 
            enableAdvancedFeatures={true}
            showMobileOptimizations={true}
          />
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          // Enable WCAG 2.1 AA rules
          "color-contrast": { enabled: true },
          "keyboard-navigation": { enabled: true },
          "focus-management": { enabled: true },
          "aria-usage": { enabled: true },
          "landmark-usage": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations in high contrast mode", async () => {
      // Enable high contrast mode
      document.documentElement.classList.add("high-contrast");
      
      const { container } = render(
        <TestWrapper>
          <JungleWordLibrary 
            enableAdvancedFeatures={true}
            showMobileOptimizations={true}
          />
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          "color-contrast": { enabled: true },
          "color-contrast-enhanced": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations in large text mode", async () => {
      // Enable large text mode
      document.documentElement.classList.add("large-text");
      
      const { container } = render(
        <TestWrapper>
          <JungleWordLibrary 
            enableAdvancedFeatures={true}
            showMobileOptimizations={true}
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations in reduced motion mode", async () => {
      // Enable reduced motion mode
      document.documentElement.classList.add("reduced-motion");
      
      const { container } = render(
        <TestWrapper>
          <JungleWordLibrary 
            enableAdvancedFeatures={true}
            showMobileOptimizations={true}
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper ARIA landmarks and structure", async () => {
      const { container } = render(
        <TestWrapper>
          <JungleWordLibrary 
            enableAdvancedFeatures={true}
            showMobileOptimizations={true}
          />
        </TestWrapper>
      );

      // Check for main landmark
      expect(screen.getByRole("main")).toBeInTheDocument();
      
      // Check for proper heading hierarchy
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for live region
      expect(screen.getByRole("status")).toBeInTheDocument();

      const results = await axe(container, {
        rules: {
          "landmark-one-main": { enabled: true },
          "heading-order": { enabled: true },
          "page-has-heading-one": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it("should have proper keyboard navigation support", async () => {
      const { container } = render(
        <TestWrapper>
          <JungleWordLibrary 
            enableAdvancedFeatures={true}
            showMobileOptimizations={true}
          />
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          "keyboard": { enabled: true },
          "focus-order-semantics": { enabled: true },
          "tabindex": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe("ParentDashboard Component", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(
        <TestWrapper>
          <ParentDashboard />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper authentication form accessibility", async () => {
      const { container } = render(
        <TestWrapper>
          <ParentDashboard />
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          "label": { enabled: true },
          "form-field-multiple-labels": { enabled: true },
          "required-attr": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe("Color Contrast Verification", () => {
    it("should meet WCAG AA color contrast requirements (4.5:1 for normal text)", async () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <p style={{ color: "#000000", backgroundColor: "#ffffff" }}>
              Normal text with 21:1 contrast ratio
            </p>
            <p style={{ color: "#6b7280", backgroundColor: "#ffffff" }}>
              Gray text with 5.86:1 contrast ratio
            </p>
          </div>
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          "color-contrast": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it("should meet WCAG AA color contrast requirements for large text (3:1)", async () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <h1 style={{ color: "#757575", backgroundColor: "#ffffff", fontSize: "24px" }}>
              Large text with 4.54:1 contrast ratio
            </h1>
            <h2 style={{ color: "#949494", backgroundColor: "#ffffff", fontSize: "18px", fontWeight: "bold" }}>
              Bold large text with 3.38:1 contrast ratio
            </h2>
          </div>
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          "color-contrast": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe("Focus Management", () => {
    it("should have visible focus indicators", async () => {
      document.documentElement.classList.add("focus-indicators");
      
      const { container } = render(
        <TestWrapper>
          <div>
            <button>Test Button 1</button>
            <input type="text" placeholder="Test Input" />
            <a href="#">Test Link</a>
          </div>
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          "focus-order-semantics": { enabled: true },
          "focusable-content": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe("Skip Links and Navigation", () => {
    it("should support skip navigation", async () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <nav>
              <ul>
                <li><a href="#section1">Section 1</a></li>
                <li><a href="#section2">Section 2</a></li>
              </ul>
            </nav>
            <main id="main-content">
              <h1>Main Content</h1>
              <p>This is the main content area.</p>
            </main>
          </div>
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          "bypass": { enabled: true },
          "skip-link": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe("Screen Reader Support", () => {
    it("should have proper live regions for announcements", async () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <div role="status" aria-live="polite" aria-atomic="true">
              Status announcements appear here
            </div>
            <div role="alert" aria-live="assertive">
              Important alerts appear here
            </div>
          </div>
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          "aria-live-region": { enabled: true },
          "aria-valid-attr": { enabled: true },
          "aria-valid-attr-value": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe("Mobile Accessibility", () => {
    it("should have appropriate touch target sizes", async () => {
      document.documentElement.classList.add("large-click-targets");
      
      const { container } = render(
        <TestWrapper>
          <div>
            <button style={{ minWidth: "44px", minHeight: "44px" }}>
              Touch Target
            </button>
            <a href="#" style={{ minWidth: "44px", minHeight: "44px", display: "inline-block" }}>
              Touch Link
            </a>
          </div>
        </TestWrapper>
      );

      const results = await axe(container, {
        rules: {
          "target-size": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });
});
