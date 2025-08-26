import { expect, beforeAll, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { toHaveNoViolations } from "jest-axe";

// Extend Vitest's expect with testing-library and axe matchers
expect.extend(matchers);
expect.extend(toHaveNoViolations);

// Mock global APIs for testing environment
beforeAll(() => {
  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };

  // Mock matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });

  // Mock scrollTo
  Object.defineProperty(window, "scrollTo", {
    writable: true,
    value: () => {},
  });

  // Mock localStorage
  const localStorageMock = {
    getItem: (key: string) => {
      return localStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
      localStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
      localStorage.removeItem(key);
    },
    clear: () => {
      localStorage.clear();
    },
  };
  Object.defineProperty(window, "localStorage", {
    writable: true,
    value: localStorageMock,
  });
});

// Clean up DOM after each test
afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  document.documentElement.className = "";
  localStorage.clear();
});
