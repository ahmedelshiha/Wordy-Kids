/**
 * 🎯 Global Animation Control Service
 * Manages animation suspension/resumption across the entire application.
 * Especially useful for parent gates, modals, and focus-heavy interactions.
 */

interface AnimationControlState {
  isSuspended: boolean;
  suspensionReason?: string;
  suspendedAt?: number;
}

class AnimationControlManager {
  private state: AnimationControlState = {
    isSuspended: false,
  };

  private listeners: Set<(state: AnimationControlState) => void> = new Set();

  /**
   * Suspend all jungle animations globally
   * @param reason - Optional reason for suspension (for debugging)
   */
  suspend(reason?: string): void {
    if (this.state.isSuspended) return; // Already suspended

    this.state = {
      isSuspended: true,
      suspensionReason: reason,
      suspendedAt: Date.now(),
    };

    // Add global CSS class to body
    document.body.classList.add("jungle-animations-suspended");

    // Notify all listeners
    this.notifyListeners();

    console.debug("🎯 Animations suspended:", reason || "No reason provided");
  }

  /**
   * Resume all jungle animations globally
   */
  resume(): void {
    if (!this.state.isSuspended) return; // Already active

    const wasReason = this.state.suspensionReason;
    const duration = this.state.suspendedAt
      ? Date.now() - this.state.suspendedAt
      : 0;

    this.state = {
      isSuspended: false,
    };

    // Remove global CSS class from body
    document.body.classList.remove("jungle-animations-suspended");

    // Notify all listeners
    this.notifyListeners();

    console.debug(
      `🎯 Animations resumed after ${duration}ms:`,
      wasReason || "No reason provided",
    );
  }

  /**
   * Toggle suspension state
   * @param reason - Optional reason for suspension
   */
  toggle(reason?: string): void {
    if (this.state.isSuspended) {
      this.resume();
    } else {
      this.suspend(reason);
    }
  }

  /**
   * Get current suspension state
   */
  get isSuspended(): boolean {
    return this.state.isSuspended;
  }

  /**
   * Get full state object (read-only)
   */
  get currentState(): Readonly<AnimationControlState> {
    return { ...this.state };
  }

  /**
   * Subscribe to animation state changes
   * @param listener - Callback function called when state changes
   * @returns Unsubscribe function
   */
  subscribe(listener: (state: AnimationControlState) => void): () => void {
    this.listeners.add(listener);

    // Immediately call with current state
    listener(this.currentState);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all subscribers of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error("Animation control listener error:", error);
      }
    });
  }

  /**
   * Force resume (emergency escape hatch)
   * Useful if animations get stuck in suspended state
   */
  forceResume(): void {
    console.warn("🚨 Force resuming animations - emergency override");
    document.body.classList.remove("jungle-animations-suspended");
    this.state = { isSuspended: false };
    this.notifyListeners();
  }
}

// Create singleton instance
export const animationControl = new AnimationControlManager();

// React hook for easy component integration
export function useAnimationControl() {
  // Dynamic import to avoid bundling issues
  const { useState, useEffect } = require("react");

  const [state, setState] = useState<AnimationControlState>(
    animationControl.currentState,
  );

  useEffect(() => {
    const unsubscribe = animationControl.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    suspend: animationControl.suspend.bind(animationControl),
    resume: animationControl.resume.bind(animationControl),
    toggle: animationControl.toggle.bind(animationControl),
    forceResume: animationControl.forceResume.bind(animationControl),
  };
}

export default animationControl;
