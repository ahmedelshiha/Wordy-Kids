import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Only check window size if we're in the browser
    if (typeof window !== "undefined") {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    // Default to desktop for SSR to avoid hydration mismatch
    return false;
  });

  React.useEffect(() => {
    // Ensure we're in the browser before accessing window
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
