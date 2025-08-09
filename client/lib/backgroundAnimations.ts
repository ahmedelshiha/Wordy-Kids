// Utility for managing background animations setting

export const isBackgroundAnimationsEnabled = (): boolean => {
  // Default to false (disabled by default)
  const saved = localStorage.getItem('backgroundAnimations');
  return saved === 'true';
};

export const setBackgroundAnimationsEnabled = (enabled: boolean): void => {
  localStorage.setItem('backgroundAnimations', enabled.toString());
  window.dispatchEvent(new CustomEvent('backgroundAnimationsChanged', { detail: enabled }));
};

// Hook for components to listen to background animations changes
export const useBackgroundAnimations = (callback: (enabled: boolean) => void) => {
  const handleChange = (event: CustomEvent) => {
    callback(event.detail);
  };

  window.addEventListener('backgroundAnimationsChanged', handleChange as EventListener);
  
  return () => {
    window.removeEventListener('backgroundAnimationsChanged', handleChange as EventListener);
  };
};
