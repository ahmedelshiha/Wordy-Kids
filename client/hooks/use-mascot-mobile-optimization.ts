import { useState, useEffect } from "react";

export interface MascotMobileConfig {
  isMobile: boolean;
  size: "tiny" | "small" | "medium" | "large";
  delayMinutes: number;
  showSpeechBubble: boolean;
  animationDuration: string;
  position: {
    bottom: string;
    right: string;
  };
}

export function useMascotMobileOptimization(): MascotMobileConfig {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const screenCheck = window.innerWidth <= 768;
      setIsMobile(mobileCheck || screenCheck);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return {
    isMobile,
    size: isMobile ? "small" : "medium",
    delayMinutes: 5, // Always 5 minutes as requested
    showSpeechBubble: true,
    animationDuration: isMobile ? "2.5s" : "2s",
    position: {
      bottom: isMobile ? "0.5rem" : "1rem",
      right: isMobile ? "0.5rem" : "1rem",
    },
  };
}

export function getMobileMascotClasses(isMobile: boolean): string {
  const baseClasses = "fixed z-50 transition-all duration-500 bg-white/90 backdrop-blur-sm rounded-full shadow-lg animate-mascot-bounce";
  const mobileClasses = isMobile 
    ? "bottom-2 right-2 p-2 max-w-[250px]" 
    : "bottom-4 right-4 p-4 max-w-xs";
  
  return `${baseClasses} ${mobileClasses}`;
}
