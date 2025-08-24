/**
 * Temporary stub for featureFlags to fix app loading issues
 */

// Stub implementation to prevent esbuild crashes
export const featureFlags = {
  isFeatureEnabled: () => true, // Enable all features by default
  getFeatureFlag: () => ({ rolloutPercentage: 100 }),
  getEnabledFeatures: () => [],
};
