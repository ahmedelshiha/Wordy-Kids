import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Simple test components to verify accessibility principles
const SimpleButton = ({ children, ...props }: any) => (
  <button {...props}>{children}</button>
);

const SimpleForm = () => (
  <form>
    <label htmlFor="username">Username</label>
    <input id="username" type="text" />
    <label htmlFor="password">Password</label>
    <input id="password" type="password" />
    <button type="submit">Submit</button>
  </form>
);

const SimpleModal = ({ isOpen, children }: any) => {
  if (!isOpen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">Modal Title</h2>
      {children}
    </div>
  );
};

const SimpleNavigation = () => (
  <nav aria-label="Main navigation">
    <a href="#main" className="skip-link">
      Skip to main content
    </a>
    <ul>
      <li>
        <a href="/home" aria-current="page">
          Home
        </a>
      </li>
      <li>
        <a href="/about">About</a>
      </li>
      <li>
        <a href="/contact">Contact</a>
      </li>
    </ul>
  </nav>
);

const SimpleMain = () => (
  <>
    <main id="main" tabIndex={-1}>
      <h1>Page Title</h1>
      <p>Main content goes here.</p>
      <div role="status" aria-live="polite" aria-atomic="true">
        Status messages appear here
      </div>
    </main>
  </>
);

describe("Accessibility Core Principles - WCAG 2.1 AA", () => {
  it("should have no violations for properly labeled buttons", async () => {
    const { container } = render(
      <div>
        <SimpleButton aria-label="Close dialog">×</SimpleButton>
        <SimpleButton>Save</SimpleButton>
        <button>
          <span aria-hidden="true">🔍</span>
          <span className="sr-only">Search</span>
        </button>
      </div>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no violations for properly structured forms", async () => {
    const { container } = render(<SimpleForm />);

    const results = await axe(container, {
      rules: {
        label: { enabled: true },
        "form-field-multiple-labels": { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it("should have no violations for modal dialogs with proper ARIA", async () => {
    const { container } = render(
      <SimpleModal isOpen={true}>
        <p>Modal content</p>
        <button>Close</button>
      </SimpleModal>,
    );

    const results = await axe(container, {
      rules: {
        "aria-dialog-name": { enabled: true },
        "aria-valid-attr": { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it("should have no violations for navigation with skip links", async () => {
    const { container } = render(
      <div>
        <SimpleNavigation />
        <SimpleMain />
      </div>,
    );

    const results = await axe(container, {
      rules: {
        bypass: { enabled: true },
        "landmark-one-main": { enabled: true },
        "page-has-heading-one": { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it("should have no violations for color contrast in high contrast mode", async () => {
    const { container } = render(
      <div className="high-contrast">
        <p style={{ color: "#000000", backgroundColor: "#ffffff" }}>
          High contrast text
        </p>
        <button style={{ color: "#ffffff", backgroundColor: "#000000" }}>
          High contrast button
        </button>
      </div>,
    );

    const results = await axe(container, {
      rules: {
        "color-contrast": { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it("should properly support keyboard navigation", async () => {
    const { container } = render(
      <div>
        <button tabIndex={0}>First focusable</button>
        <a href="#section1">Link</a>
        <input type="text" placeholder="Text input" />
        <button tabIndex={0}>Last focusable</button>
      </div>,
    );

    const results = await axe(container, {
      rules: {
        keyboard: { enabled: true },
        tabindex: { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it("should have proper heading hierarchy", async () => {
    const { container } = render(
      <div>
        <h1>Main Title</h1>
        <h2>Section Title</h2>
        <h3>Subsection Title</h3>
        <h2>Another Section</h2>
      </div>,
    );

    const results = await axe(container, {
      rules: {
        "heading-order": { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it("should support live regions for screen readers", async () => {
    const { container } = render(
      <div>
        <div role="status" aria-live="polite" aria-atomic="true">
          Polite announcements
        </div>
        <div role="alert" aria-live="assertive">
          Urgent announcements
        </div>
      </div>,
    );

    const results = await axe(container, {
      rules: {
        "aria-valid-attr": { enabled: true },
        "aria-valid-attr-value": { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it("should have proper landmarks", async () => {
    const { container } = render(
      <div>
        <header role="banner">
          <h1>Site Title</h1>
        </header>
        <nav role="navigation" aria-label="Main">
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
          </ul>
        </nav>
        <main role="main">
          <h2>Page Content</h2>
        </main>
        <footer role="contentinfo">
          <p>Footer content</p>
        </footer>
      </div>,
    );

    const results = await axe(container, {
      rules: {
        "landmark-one-main": { enabled: true },
        "landmark-unique": { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it("should meet minimum touch target sizes for mobile", async () => {
    const { container } = render(
      <div>
        <button
          style={{
            minWidth: "44px",
            minHeight: "44px",
            padding: "12px",
            margin: "4px",
          }}
        >
          Mobile Button
        </button>
        <a
          href="#link"
          style={{
            minWidth: "44px",
            minHeight: "44px",
            display: "inline-block",
            padding: "12px",
          }}
        >
          Mobile Link
        </a>
      </div>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
