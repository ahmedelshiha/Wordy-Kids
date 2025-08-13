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
  Server
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
  const [securityStatus, setSecurityStatus] = useState<'secure' | 'warning' | 'locked'>('secure');
  const [deviceInfo, setDeviceInfo] = useState({ type: 'desktop', secure: true });
  const navigate = useNavigate();

  useEffect(() => {
    // Detect device type and security
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSecure = window.location.protocol === 'https:';
    setDeviceInfo({
      type: isMobile ? 'mobile' : 'desktop',
      secure: isSecure || window.location.hostname === 'localhost'
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate authentication delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Enhanced security checks
    if (loginAttempts >= 3) {
      setSecurityStatus('locked');
      setError("Account temporarily locked due to multiple failed attempts. Please try again later.");
      setLoading(false);
      return;
    }

    if (credentials.username === "admin" && credentials.password === "admin123") {
      setError("");
      setSecurityStatus('secure');
      onLogin();
    } else {
      setLoginAttempts(prev => prev + 1);
      if (loginAttempts >= 2) {
        setSecurityStatus('warning');
      }
      setError(`Invalid credentials. ${3 - loginAttempts - 1} attempts remaining.`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              🛡️ Administrator Access
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Secure access to Wordy's Adventure management dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
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
                  placeholder="Enter admin username"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Enter admin password"
                  className="mt-2"
                  required
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" size="lg">
                <Shield className="w-4 h-4 mr-2" />
                Access Admin Dashboard
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Main Application
              </Button>
            </div>

            {/* Demo credentials display */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 text-center">
                <strong>Demo Access:</strong> username: admin, password:
                admin123
              </p>
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
