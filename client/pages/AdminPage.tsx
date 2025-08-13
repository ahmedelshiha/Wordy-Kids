import React, { useState, useEffect } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  Monitor,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Fingerprint,
  Server,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [securityStatus, setSecurityStatus] = useState<
    "secure" | "warning" | "locked"
  >("secure");
  const [deviceInfo, setDeviceInfo] = useState({
    type: "desktop",
    secure: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Detect device type and security
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    const isSecure = window.location.protocol === "https:";
    setDeviceInfo({
      type: isMobile ? "mobile" : "desktop",
      secure: isSecure || window.location.hostname === "localhost",
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate authentication delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Enhanced security checks
    if (loginAttempts >= 3) {
      setSecurityStatus("locked");
      setError(
        "Account temporarily locked due to multiple failed attempts. Please try again later.",
      );
      setLoading(false);
      return;
    }

    if (
      credentials.username === "admin" &&
      credentials.password === "admin123"
    ) {
      setError("");
      setSecurityStatus("secure");
      onLogin();
    } else {
      setLoginAttempts((prev) => prev + 1);
      if (loginAttempts >= 2) {
        setSecurityStatus("warning");
      }
      setError(
        `Invalid credentials. ${3 - loginAttempts - 1} attempts remaining.`,
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 md:p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Security Status Indicator */}
        <div className="flex items-center justify-center mb-4">
          <Badge
            className={`px-3 py-1 ${
              securityStatus === "secure"
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : securityStatus === "warning"
                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                  : "bg-red-500/20 text-red-300 border-red-500/30"
            }`}
          >
            {securityStatus === "secure" && (
              <CheckCircle className="w-3 h-3 mr-1" />
            )}
            {securityStatus === "warning" && (
              <AlertTriangle className="w-3 h-3 mr-1" />
            )}
            {securityStatus === "locked" && <Lock className="w-3 h-3 mr-1" />}
            {securityStatus === "secure"
              ? "Secure Connection"
              : securityStatus === "warning"
                ? "Security Warning"
                : "Account Locked"}
          </Badge>
        </div>

        <Card className="border border-slate-700/50 bg-slate-800/90 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-4">
            {/* Enhanced Logo with Animation */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
              <Shield className="w-10 h-10 text-white animate-gentle-bounce relative z-10" />
            </div>

            <CardTitle className="text-xl md:text-2xl font-bold text-white mb-2">
              🛡️ Administrator Access
            </CardTitle>
            <p className="text-slate-400 text-sm md:text-base">
              Secure portal to Wordy's Adventure management system
            </p>

            {/* Device & Security Info */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                {deviceInfo.type === "mobile" ? (
                  <Smartphone className="w-3 h-3" />
                ) : (
                  <Monitor className="w-3 h-3" />
                )}
                {deviceInfo.type}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Server className="w-3 h-3" />
                {deviceInfo.secure ? "Secured" : "Unsecured"}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Enhanced Username Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="flex items-center gap-2 text-slate-300"
                >
                  <User className="w-4 h-4" />
                  Administrator Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Enter your admin username"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 h-12"
                  disabled={loading || securityStatus === "locked"}
                  required
                />
              </div>

              {/* Enhanced Password Field with Toggle */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="flex items-center gap-2 text-slate-300"
                >
                  <KeyRound className="w-4 h-4" />
                  Administrator Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter your admin password"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 h-12 pr-12"
                    disabled={loading || securityStatus === "locked"}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Enhanced Error Display */}
              {error && (
                <Alert
                  className={`border ${
                    securityStatus === "locked"
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-orange-500/50 bg-orange-500/10"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <AlertDescription
                    className={`${
                      securityStatus === "locked"
                        ? "text-red-400"
                        : "text-orange-400"
                    } text-sm`}
                  >
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Login Attempts Indicator */}
              {loginAttempts > 0 && (
                <div className="flex justify-center">
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < loginAttempts ? "bg-red-500" : "bg-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Login Button */}
              <Button
                type="submit"
                className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                  loading
                    ? "bg-blue-600 cursor-not-allowed"
                    : securityStatus === "locked"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                }`}
                disabled={loading || securityStatus === "locked"}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : securityStatus === "locked" ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Account Locked
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Access Admin Dashboard
                  </>
                )}
              </Button>
            </form>

            {/* Security Features Display */}
            <div className="space-y-3">
              <div className="border-t border-slate-700"></div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Fingerprint className="w-3 h-3" />
                  Multi-Factor Ready
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Shield className="w-3 h-3" />
                  End-to-End Encrypted
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="pt-4 border-t border-slate-700">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="w-full text-slate-400 hover:text-white hover:bg-slate-700/50 h-10"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Main Application
              </Button>
            </div>

            {/* Demo Credentials - Enhanced Design */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-2 py-1">
                  DEMO
                </Badge>
                <span className="text-xs text-slate-400">
                  Development Access
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Username:</span>
                  <code className="text-blue-300 bg-slate-700/50 px-2 py-0.5 rounded font-mono">
                    admin
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Password:</span>
                  <code className="text-blue-300 bg-slate-700/50 px-2 py-0.5 rounded font-mono">
                    admin123
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminDashboard onNavigateBack={() => navigate("/")} />
    </div>
  );
};

export default AdminPage;
