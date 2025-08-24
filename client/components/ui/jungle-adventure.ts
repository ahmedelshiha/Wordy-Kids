/**
 * Jungle Adventure Component Library
 *
 * A comprehensive design system for the Wordy Kids application
 * featuring immersive jungle-themed components built with:
 * - Design tokens for consistent theming
 * - CVA (Class Variance Authority) for type-safe variants
 * - Accessibility-first design
 * - Motion-safe animations
 * - Mobile-first responsive design
 * - Performance optimizations
 */

// Core Adventure Components
export {
  AdventureButton,
  adventureButtonVariants,
  type AdventureButtonProps,
} from "./adventure-button";

export {
  JungleCard,
  JungleCardHeader,
  JungleCardFooter,
  JungleCardTitle,
  JungleCardDescription,
  JungleCardContent,
  JungleCardIcon,
  jungleCardVariants,
  type JungleCardProps,
  type JungleCardHeaderProps,
  type JungleCardFooterProps,
  type JungleCardTitleProps,
  type JungleCardDescriptionProps,
  type JungleCardContentProps,
} from "./jungle-card";

export {
  JunglePanel,
  JunglePanelContent,
  JunglePanelBackground,
  junglePanelVariants,
  type JunglePanelProps,
  type JunglePanelContentProps,
  type JunglePanelBackgroundProps,
} from "./jungle-panel";

export {
  ProgressVine,
  progressVineVariants,
  type ProgressVineProps,
  type Milestone,
} from "./progress-vine";

// Re-export existing UI components for convenience
export { Button, buttonVariants, type ButtonProps } from "./button";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  type CardProps,
} from "./card";

export { Badge, badgeVariants, type BadgeProps } from "./badge";

export { Alert, AlertDescription, AlertTitle, type AlertProps } from "./alert";

export { Progress, type ProgressProps } from "./progress";

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsProps,
} from "./tabs";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  type DialogProps,
} from "./dialog";

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  type SheetProps,
} from "./sheet";

export { Slider, type SliderProps } from "./slider";

export { Switch, type SwitchProps } from "./switch";

export { Toggle, toggleVariants, type ToggleProps } from "./toggle";

export {
  toast,
  useToast,
  type ToastProps,
  type ToastActionElement,
} from "./use-toast";

export { Toaster } from "./toaster";

export {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  type ToastProps as SonnerToastProps,
} from "./toast";

/* ========================================
 * DESIGN SYSTEM PATTERNS
 * ======================================== */

/**
 * Component Usage Patterns
 *
 * 1. Page Layout:
 *    JunglePanel (sections) > JungleCard (content blocks) > AdventureButton (actions)
 *
 * 2. Interactive Elements:
 *    AdventureButton for primary actions
 *    JungleCard with interactive={true} for clickable content
 *    ProgressVine for showing learning progress
 *
 * 3. Theming:
 *    All components use design tokens from jungle-design-tokens.css
 *    CVA variants provide consistent styling options
 *    Motion respects user preferences automatically
 *
 * 4. Accessibility:
 *    All components include proper ARIA attributes
 *    Focus management and keyboard navigation
 *    Screen reader friendly labels and descriptions
 *
 * 5. Performance:
 *    Hardware acceleration for smooth animations
 *    Reduced motion and save-data preferences respected
 *    Lazy loading and efficient re-renders
 */

/* ========================================
 * MIGRATION GUIDE
 * ======================================== */

/**
 * Migrating from Legacy Components:
 *
 * Button → AdventureButton
 * - Replace variant="primary" with intent="primary"
 * - Add jungle-specific intents: jungle, adventure, fun, natural
 * - Size variants remain the same
 *
 * Card → JungleCard
 * - Add tone prop for semantic styling
 * - Use interactive={true} for clickable cards
 * - Pattern and elevation props for visual depth
 *
 * Progress → ProgressVine
 * - Add milestones array for learning checkpoints
 * - Jungle-themed styling with leaf markers
 * - Enhanced accessibility with live announcements
 *
 * Raw Gradient Classes → Design Tokens
 * - bg-gradient-to-r from-blue-500 to-purple-500 → bg-grad-adventure
 * - Custom gradients → use CSS custom properties from tokens
 */

/* ========================================
 * THEME CUSTOMIZATION
 * ======================================== */

/**
 * Customizing the Jungle Theme:
 *
 * 1. Colors: Update CSS custom properties in jungle-design-tokens.css
 *    --color-jungle-500: 122 39% 49%; (HSL format for alpha support)
 *
 * 2. Typography: Modify font family variables
 *    --font-display: "Your Font", var(--font-display);
 *
 * 3. Spacing: Adjust spacing scale
 *    --sp-4: 1rem; (base spacing unit)
 *
 * 4. Motion: Control animation speed
 *    --dur-normal: 250ms; (standard transition duration)
 *
 * 5. Admin Override: Use admin color namespace for professional sections
 *    --color-admin-bg: 220 13% 98%; (neutral admin palette)
 */
