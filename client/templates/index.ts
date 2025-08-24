/**
 * Jungle Adventure Page Templates
 *
 * Pre-built, token-based page templates using the Jungle Adventure design system
 * All templates are mobile-first, accessible, and performance optimized
 */

export { LoginTemplate } from "./LoginTemplate";
export { AppHomeTemplate } from "./AppHomeTemplate";
export { AdminTemplate } from "./AdminTemplate";

/* ========================================
 * TEMPLATE USAGE GUIDELINES
 * ======================================== */

/**
 * Template Design Principles:
 *
 * 1. Token-Based Styling:
 *    - All colors use design tokens (no raw Tailwind classes)
 *    - Consistent spacing using token values
 *    - Typography follows design system scale
 *
 * 2. Component Composition:
 *    - Built with JungleCard, AdventureButton, and JunglePanel
 *    - Maintains visual consistency across all routes
 *    - Reusable component patterns
 *
 * 3. Accessibility First:
 *    - Proper ARIA labels and descriptions
 *    - Keyboard navigation support
 *    - Screen reader friendly structure
 *    - High contrast compliance
 *
 * 4. Performance Optimized:
 *    - Hardware accelerated animations
 *    - Lazy loading for heavy components
 *    - Reduced motion support
 *    - Save-data preferences
 *
 * 5. Mobile-First Design:
 *    - Touch-friendly targets (44px minimum)
 *    - Safe area handling for iOS devices
 *    - Responsive typography and spacing
 *    - Optimized for small screens
 */

/* ========================================
 * CUSTOMIZATION GUIDE
 * ======================================== */

/**
 * Adapting Templates for Your Needs:
 *
 * 1. Color Themes:
 *    - LoginTemplate: Adventure theme with jungle accents
 *    - AppHomeTemplate: Full jungle immersion with parallax
 *    - AdminTemplate: Professional neutral palette
 *
 * 2. Layout Modifications:
 *    - All templates use JunglePanel for consistent structure
 *    - Grid systems are responsive and flexible
 *    - Component spacing follows design token scale
 *
 * 3. Content Areas:
 *    - Templates provide structured content areas
 *    - Easy to replace with your own components
 *    - Maintains design system consistency
 *
 * 4. Interaction Patterns:
 *    - Consistent button patterns across templates
 *    - Form handling with proper validation states
 *    - Loading states and error handling
 */

/* ========================================
 * TEMPLATE SPECIFICATIONS
 * ======================================== */

/**
 * LoginTemplate:
 * - Route: /login, /signup
 * - Theme: Jungle adventure with subtle background
 * - Components: Centered card with form elements
 * - Features: Password visibility, error states, loading
 * - Accessibility: Full keyboard navigation, screen reader support
 *
 * AppHomeTemplate:
 * - Route: /app (main dashboard)
 * - Theme: Full jungle immersion with parallax effects
 * - Components: Hero section, progress tracking, quick actions
 * - Features: Dynamic stats, achievement system, category preview
 * - Accessibility: Reduced motion support, touch optimization
 *
 * AdminTemplate:
 * - Route: /admin
 * - Theme: Professional neutral (controlled exception)
 * - Components: Tabbed interface, data tables, system monitoring
 * - Features: User management, content admin, system settings
 * - Accessibility: High contrast, keyboard shortcuts, screen reader optimized
 */

/* ========================================
 * INTEGRATION EXAMPLES
 * ======================================== */

/**
 * Basic Integration:
 *
 * ```tsx
 * import { LoginTemplate } from "@/templates";
 *
 * export default function LoginPage() {
 *   return (
 *     <LoginTemplate
 *       onLogin={handleLogin}
 *       onSignUp={() => router.push("/signup")}
 *       loading={isLoading}
 *       error={errorMessage}
 *     />
 *   );
 * }
 * ```
 *
 * Advanced Customization:
 *
 * ```tsx
 * import { AppHomeTemplate } from "@/templates";
 * import { useUserStats, useQuickActions } from "@/hooks";
 *
 * export default function DashboardPage() {
 *   const stats = useUserStats();
 *   const quickActions = useQuickActions();
 *
 *   return (
 *     <AppHomeTemplate
 *       userName={user.name}
 *       stats={stats}
 *       quickActions={quickActions}
 *       onContinueLearning={() => router.push("/learn")}
 *       // ... other props
 *     />
 *   );
 * }
 * ```
 */
