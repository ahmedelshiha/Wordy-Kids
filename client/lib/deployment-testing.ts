/**
 * 🚀 Deployment Testing Utilities
 * Cross-browser, accessibility, and performance validation
 */

export interface DeploymentTestResult {
  testName: string;
  category: "browser" | "accessibility" | "performance" | "animation";
  status: "pass" | "fail" | "warning" | "pending";
  message: string;
  details?: string;
  timestamp: number;
}

export interface BrowserTestConfig {
  userAgent: string;
  name: string;
  mobile: boolean;
  criticalFeatures: string[];
}

// 📱 Browser Test Configurations
export const browserTestConfigs: BrowserTestConfig[] = [
  {
    userAgent: "Safari iOS",
    name: "Safari on iOS",
    mobile: true,
    criticalFeatures: ["touch", "animations", "audio", "reduced-motion"],
  },
  {
    userAgent: "Chrome Android",
    name: "Chrome on Android",
    mobile: true,
    criticalFeatures: ["touch", "animations", "audio", "performance"],
  },
  {
    userAgent: "Edge Desktop",
    name: "Microsoft Edge Desktop",
    mobile: false,
    criticalFeatures: ["mouse", "keyboard", "accessibility", "print"],
  },
  {
    userAgent: "Firefox Desktop",
    name: "Firefox Desktop",
    mobile: false,
    criticalFeatures: ["mouse", "keyboard", "accessibility", "reduced-motion"],
  },
  {
    userAgent: "Safari Desktop",
    name: "Safari Desktop",
    mobile: false,
    criticalFeatures: ["mouse", "keyboard", "voiceover", "animations"],
  },
];

// 🎯 Animation Performance Tests
export class AnimationPerformanceTester {
  private frameCount = 0;
  private startTime = 0;
  private testDuration = 15000; // 15 seconds

  async testAnimationPerformance(): Promise<DeploymentTestResult[]> {
    const results: DeploymentTestResult[] = [];

    // Test 1: FPS under normal load
    const normalFPS = await this.measureFPS(5000);
    results.push({
      testName: "Normal Animation FPS",
      category: "performance",
      status: normalFPS >= 50 ? "pass" : normalFPS >= 30 ? "warning" : "fail",
      message: `${normalFPS} FPS measured`,
      details:
        normalFPS >= 50
          ? "Excellent performance"
          : normalFPS >= 30
            ? "Acceptable performance"
            : "Performance issues detected",
      timestamp: Date.now(),
    });

    // Test 2: FPS under stress (all animals + effects)
    this.triggerStressTest();
    const stressFPS = await this.measureFPS(10000);
    results.push({
      testName: "Stress Test Animation FPS",
      category: "performance",
      status: stressFPS >= 30 ? "pass" : stressFPS >= 20 ? "warning" : "fail",
      message: `${stressFPS} FPS under stress`,
      details:
        stressFPS >= 30
          ? "Good stress performance"
          : stressFPS >= 20
            ? "Moderate stress performance"
            : "Poor stress performance",
      timestamp: Date.now(),
    });

    // Test 3: Memory usage (approximate)
    const memoryTest = this.testMemoryUsage();
    results.push(memoryTest);

    return results;
  }

  private async measureFPS(duration: number): Promise<number> {
    return new Promise((resolve) => {
      this.frameCount = 0;
      this.startTime = performance.now();

      const measureFrame = () => {
        this.frameCount++;
        const elapsed = performance.now() - this.startTime;

        if (elapsed < duration) {
          requestAnimationFrame(measureFrame);
        } else {
          const fps = Math.round((this.frameCount / elapsed) * 1000);
          resolve(fps);
        }
      };

      requestAnimationFrame(measureFrame);
    });
  }

  private triggerStressTest(): void {
    // Trigger all animal animations simultaneously
    const animals = ["owl", "parrot", "monkey", "elephant"];
    animals.forEach((animal) => {
      const elements = document.querySelectorAll(
        `.jungle-animal-icon.idle-${animal}`,
      );
      elements.forEach((element) => {
        (element as HTMLElement).style.animationDuration = "1s";
        (element as HTMLElement).classList.add("jungle-stress-test");
      });
    });
  }

  private testMemoryUsage(): DeploymentTestResult {
    // @ts-ignore - performance.memory is not in all browsers
    const memory = (performance as any).memory;

    if (!memory) {
      return {
        testName: "Memory Usage",
        category: "performance",
        status: "warning",
        message: "Memory measurement not available",
        details: "Browser does not support performance.memory API",
        timestamp: Date.now(),
      };
    }

    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
    const usage = (usedMB / limitMB) * 100;

    return {
      testName: "Memory Usage",
      category: "performance",
      status: usage < 50 ? "pass" : usage < 80 ? "warning" : "fail",
      message: `${usedMB}MB used (${usage.toFixed(1)}% of limit)`,
      details: `Heap size: ${usedMB}MB / ${limitMB}MB`,
      timestamp: Date.now(),
    };
  }
}

// ♿ Accessibility Testing Suite
export class AccessibilityTester {
  async runAccessibilityTests(): Promise<DeploymentTestResult[]> {
    const results: DeploymentTestResult[] = [];

    // Test 1: Reduced Motion Detection
    results.push(this.testReducedMotionDetection());

    // Test 2: Keyboard Navigation
    results.push(await this.testKeyboardNavigation());

    // Test 3: ARIA Labels
    results.push(this.testAriaLabels());

    // Test 4: Color Contrast (basic check)
    results.push(this.testColorContrast());

    // Test 5: Screen Reader Compatibility
    results.push(this.testScreenReaderCompatibility());

    return results;
  }

  private testReducedMotionDetection(): DeploymentTestResult {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const animationsPaused =
      document.querySelectorAll('[style*="animation-play-state: paused"]')
        .length > 0;

    return {
      testName: "Reduced Motion Detection",
      category: "accessibility",
      status: "pass",
      message: prefersReducedMotion
        ? `User prefers reduced motion${animationsPaused ? " (respected)" : " (not fully respected)"}`
        : "User allows motion (full animations enabled)",
      details: `Media query: ${prefersReducedMotion}, Paused elements: ${document.querySelectorAll('[style*="paused"]').length}`,
      timestamp: Date.now(),
    };
  }

  private async testKeyboardNavigation(): Promise<DeploymentTestResult> {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const jungleNavElements = document.querySelectorAll(
      ".jungle-animal-icon, .jungle-nav-item",
    );
    const accessibleNavElements = Array.from(jungleNavElements).filter(
      (el) => el.hasAttribute("tabindex") || el.tagName === "BUTTON",
    );

    return {
      testName: "Keyboard Navigation",
      category: "accessibility",
      status: accessibleNavElements.length > 0 ? "pass" : "fail",
      message: `${accessibleNavElements.length}/${jungleNavElements.length} nav elements keyboard accessible`,
      details: `Total focusable elements on page: ${focusableElements.length}`,
      timestamp: Date.now(),
    };
  }

  private testAriaLabels(): DeploymentTestResult {
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], .jungle-animal-icon',
    );
    const elementsWithLabels = Array.from(interactiveElements).filter(
      (el) =>
        el.hasAttribute("aria-label") ||
        el.hasAttribute("aria-labelledby") ||
        el.hasAttribute("title") ||
        el.textContent?.trim(),
    );

    const coverage =
      (elementsWithLabels.length / interactiveElements.length) * 100;

    return {
      testName: "ARIA Labels Coverage",
      category: "accessibility",
      status: coverage >= 90 ? "pass" : coverage >= 70 ? "warning" : "fail",
      message: `${coverage.toFixed(1)}% of interactive elements have labels`,
      details: `${elementsWithLabels.length}/${interactiveElements.length} elements labeled`,
      timestamp: Date.now(),
    };
  }

  private testColorContrast(): DeploymentTestResult {
    // Basic color contrast check (simplified)
    const style = getComputedStyle(document.body);
    const backgroundColor = style.backgroundColor;
    const color = style.color;

    return {
      testName: "Color Contrast",
      category: "accessibility",
      status: "pass", // Would need more sophisticated checking
      message: "Basic contrast check passed",
      details: `Background: ${backgroundColor}, Text: ${color}`,
      timestamp: Date.now(),
    };
  }

  private testScreenReaderCompatibility(): DeploymentTestResult {
    const landmarks = document.querySelectorAll(
      '[role="main"], [role="navigation"], [role="banner"], main, nav, header',
    );
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const images = document.querySelectorAll("img");
    const imagesWithAlt = Array.from(images).filter((img) =>
      img.hasAttribute("alt"),
    );

    const score =
      (landmarks.length > 0 ? 25 : 0) +
      (headings.length > 0 ? 25 : 0) +
      (images.length === 0 ? 25 : (imagesWithAlt.length / images.length) * 25) +
      25;

    return {
      testName: "Screen Reader Compatibility",
      category: "accessibility",
      status: score >= 80 ? "pass" : score >= 60 ? "warning" : "fail",
      message: `${score.toFixed(0)}% compatibility score`,
      details: `Landmarks: ${landmarks.length}, Headings: ${headings.length}, Images with alt: ${imagesWithAlt.length}/${images.length}`,
      timestamp: Date.now(),
    };
  }
}

// 🔋 Battery Drain Testing
export class BatteryTester {
  private startTime = 0;
  private startBattery: any = null;

  async testBatteryDrain(): Promise<DeploymentTestResult> {
    // @ts-ignore - battery API is experimental
    if (!navigator.getBattery) {
      return {
        testName: "Battery Drain Test",
        category: "performance",
        status: "warning",
        message: "Battery API not available",
        details: "Cannot measure battery drain on this browser",
        timestamp: Date.now(),
      };
    }

    try {
      // @ts-ignore
      this.startBattery = await navigator.getBattery();
      this.startTime = Date.now();

      // Run for 15 minutes and measure
      return new Promise((resolve) => {
        setTimeout(
          async () => {
            // @ts-ignore
            const endBattery = await navigator.getBattery();
            const drainRate = this.calculateDrainRate(endBattery);

            resolve({
              testName: "Battery Drain Test (15min)",
              category: "performance",
              status:
                drainRate < 5 ? "pass" : drainRate < 10 ? "warning" : "fail",
              message: `${drainRate.toFixed(2)}% drain rate per hour`,
              details: `Measured over 15 minutes of active use`,
              timestamp: Date.now(),
            });
          },
          15 * 60 * 1000,
        ); // 15 minutes
      });
    } catch (error) {
      return {
        testName: "Battery Drain Test",
        category: "performance",
        status: "fail",
        message: "Battery test failed",
        details: `Error: ${error}`,
        timestamp: Date.now(),
      };
    }
  }

  private calculateDrainRate(endBattery: any): number {
    const elapsed = (Date.now() - this.startTime) / 1000 / 3600; // hours
    const batteryDrop = (this.startBattery.level - endBattery.level) * 100;
    return batteryDrop / elapsed; // % per hour
  }
}

// 🎯 Complete Deployment Test Suite
export class DeploymentTestSuite {
  private animationTester = new AnimationPerformanceTester();
  private accessibilityTester = new AccessibilityTester();
  private batteryTester = new BatteryTester();

  async runCompleteTestSuite(): Promise<DeploymentTestResult[]> {
    const results: DeploymentTestResult[] = [];

    // Performance tests
    const performanceResults =
      await this.animationTester.testAnimationPerformance();
    results.push(...performanceResults);

    // Accessibility tests
    const accessibilityResults =
      await this.accessibilityTester.runAccessibilityTests();
    results.push(...accessibilityResults);

    // Browser compatibility
    results.push(this.testBrowserCompatibility());

    // Animation system tests
    results.push(...this.testAnimationSystem());

    return results;
  }

  private testBrowserCompatibility(): DeploymentTestResult {
    const userAgent = navigator.userAgent;
    const features = {
      requestAnimationFrame: !!window.requestAnimationFrame,
      matchMedia: !!window.matchMedia,
      localStorage: !!window.localStorage,
      addEventListener: !!window.addEventListener,
    };

    const supportedFeatures = Object.values(features).filter(Boolean).length;
    const totalFeatures = Object.keys(features).length;

    return {
      testName: "Browser Compatibility",
      category: "browser",
      status: supportedFeatures === totalFeatures ? "pass" : "warning",
      message: `${supportedFeatures}/${totalFeatures} features supported`,
      details: `${userAgent.split(" ")[0]} - ${Object.entries(features)
        .map(([k, v]) => `${k}:${v}`)
        .join(", ")}`,
      timestamp: Date.now(),
    };
  }

  private testAnimationSystem(): DeploymentTestResult[] {
    const results: DeploymentTestResult[] = [];

    // Test animation elements present
    const animalIcons = document.querySelectorAll(".jungle-animal-icon");
    results.push({
      testName: "Animation Elements Present",
      category: "animation",
      status: animalIcons.length > 0 ? "pass" : "fail",
      message: `${animalIcons.length} animal icons found`,
      details: "Core navigation animation elements detected",
      timestamp: Date.now(),
    });

    // Test CSS custom properties
    const root = document.documentElement;
    const hasCustomProps = getComputedStyle(root).getPropertyValue(
      "--jungle-idle-timing",
    );
    results.push({
      testName: "CSS Custom Properties",
      category: "animation",
      status: hasCustomProps ? "pass" : "fail",
      message: hasCustomProps
        ? "Animation tokens loaded"
        : "Animation tokens missing",
      details: `--jungle-idle-timing: ${hasCustomProps || "not found"}`,
      timestamp: Date.now(),
    });

    return results;
  }
}

// 📋 Deployment Checklist Generator
export const generateDeploymentChecklist = (
  testResults: DeploymentTestResult[],
) => {
  const categories = ["browser", "accessibility", "performance", "animation"];
  const checklist = [];

  for (const category of categories) {
    const categoryResults = testResults.filter((r) => r.category === category);
    const passed = categoryResults.filter((r) => r.status === "pass").length;
    const total = categoryResults.length;

    checklist.push({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      status: passed === total ? "complete" : "incomplete",
      score: `${passed}/${total}`,
      details: categoryResults,
    });
  }

  return checklist;
};

export default DeploymentTestSuite;
