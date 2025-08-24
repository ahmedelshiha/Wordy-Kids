import React from "react";
import {
  JunglePanel,
  JungleCard,
  JungleCardHeader,
  JungleCardTitle,
  JungleCardDescription,
  JungleCardContent,
  JungleCardFooter,
} from "@/components/ui/jungle-adventure";
import { AdventureButton } from "@/components/ui/adventure-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, User, Lock, Leaf } from "lucide-react";

/**
 * LoginTemplate - Immersive jungle-themed login page
 * Mobile-first design with accessibility and performance optimization
 * Uses only design tokens and approved Jungle Adventure components
 */

interface LoginTemplateProps {
  onLogin?: (email: string, password: string) => void;
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  loading?: boolean;
  error?: string;
}

export function LoginTemplate({
  onLogin,
  onSignUp,
  onForgotPassword,
  loading = false,
  error,
}: LoginTemplateProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin && email && password) {
      onLogin(email, password);
    }
  };

  return (
    <JunglePanel
      background="primary"
      padding="lg"
      minHeight="screen"
      pattern="subtle"
      safeArea="both"
      className="flex items-center justify-center"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-jungle-200 motion-safe:anim-float">
          <Leaf className="w-8 h-8 opacity-30" />
        </div>
        <div className="absolute top-32 right-16 text-banana-200 motion-safe:anim-float anim-delay-1000">
          <Leaf className="w-6 h-6 opacity-40 rotate-45" />
        </div>
        <div className="absolute bottom-20 left-20 text-sky-200 motion-safe:anim-float anim-delay-500">
          <Leaf className="w-10 h-10 opacity-25 -rotate-12" />
        </div>
      </div>

      {/* Main login card */}
      <div className="w-full max-w-md px-4">
        <JungleCard
          tone="adventure"
          size="lg"
          elevation="floating"
          pattern="none"
          className="motion-safe:anim-fade-in"
        >
          <JungleCardHeader className="text-center">
            {/* Jungle logo/mascot area */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-grad-hero rounded-full flex items-center justify-center shadow-jungle motion-safe:anim-breath">
                  <span className="text-2xl">🌟</span>
                </div>
                <div className="absolute -top-2 -right-2 text-banana-500 motion-safe:anim-float">
                  <span className="text-lg">🍃</span>
                </div>
              </div>
            </div>

            <JungleCardTitle size="lg" className="text-jungle-700 font-display">
              Welcome to Jungle Adventure!
            </JungleCardTitle>
            <JungleCardDescription className="text-text-secondary">
              Sign in to continue your word learning journey through the magical
              jungle.
            </JungleCardDescription>
          </JungleCardHeader>

          <JungleCardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error alert */}
              {error && (
                <JungleCard tone="danger" size="sm" className="mb-4">
                  <JungleCardContent className="py-3">
                    <p className="text-sm text-danger">{error}</p>
                  </JungleCardContent>
                </JungleCard>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-text flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-jungle-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-input-h-md bg-surface border-jungle-200 focus:border-jungle-500 focus:ring-jungle-500 placeholder:text-text-muted"
                  disabled={loading}
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-text flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-jungle-500" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-input-h-md bg-surface border-jungle-200 focus:border-jungle-500 focus:ring-jungle-500 placeholder:text-text-muted pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login button */}
              <AdventureButton
                type="submit"
                intent="primary"
                size="lg"
                className="w-full mt-6"
                loading={loading}
                disabled={!email || !password || loading}
              >
                {loading ? "Signing in..." : "Start Adventure"}
              </AdventureButton>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <Separator className="flex-1" />
              <span className="text-xs text-text-muted font-medium">OR</span>
              <Separator className="flex-1" />
            </div>

            {/* Sign up prompt */}
            <div className="text-center space-y-3">
              <p className="text-sm text-text-secondary">
                New to Jungle Adventure?
              </p>
              <AdventureButton
                intent="outline"
                size="md"
                className="w-full"
                onClick={onSignUp}
                disabled={loading}
              >
                Create New Adventure
              </AdventureButton>
            </div>
          </JungleCardContent>

          <JungleCardFooter className="justify-center">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-jungle-600 hover:text-jungle-700 transition-colors underline"
              disabled={loading}
            >
              Forgot your password?
            </button>
          </JungleCardFooter>
        </JungleCard>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-muted">
            Safe and secure learning environment for children
          </p>
          <p className="text-xs text-text-muted mt-1">
            COPPA compliant • Privacy protected • Parent approved
          </p>
        </div>
      </div>
    </JunglePanel>
  );
}

/* ========================================
 * USAGE EXAMPLE
 * ======================================== */

/*
// In your login page component:
import { LoginTemplate } from "@/templates/LoginTemplate";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError("");
    
    try {
      await authenticateUser(email, password);
      router.push("/app");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginTemplate
      onLogin={handleLogin}
      onSignUp={() => router.push("/signup")}
      onForgotPassword={() => router.push("/forgot-password")}
      loading={loading}
      error={error}
    />
  );
}
*/
