import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart,
  Star,
  Trophy,
  Sparkles,
  ArrowLeft,
  Mail,
  Lock,
  UserPlus,
  HelpCircle,
  Key,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { audioService } from "@/lib/audioService";

const avatars = [
  {
    id: "cat",
    emoji: "🐱",
    name: "Whiskers",
    color: "from-orange-400 to-orange-600",
  },
  {
    id: "dog",
    emoji: "🐶",
    name: "Buddy",
    color: "from-brown-400 to-brown-600",
  },
  {
    id: "lion",
    emoji: "🦁",
    name: "Leo",
    color: "from-yellow-400 to-yellow-600",
  },
  {
    id: "unicorn",
    emoji: "🦄",
    name: "Sparkle",
    color: "from-pink-400 to-purple-600",
  },
  {
    id: "dragon",
    emoji: "🐉",
    name: "Flame",
    color: "from-green-400 to-green-600",
  },
  {
    id: "bear",
    emoji: "🐻",
    name: "Honey",
    color: "from-amber-400 to-amber-600",
  },
  {
    id: "rabbit",
    emoji: "🐰",
    name: "Hoppy",
    color: "from-gray-400 to-gray-600",
  },
  { id: "panda", emoji: "🐼", name: "Bamboo", color: "from-black to-gray-600" },
];

const savedProfiles = [
  {
    id: "alex",
    username: "alex_explorer",
    email: "alex@family.com",
    avatar: avatars[3],
    level: 5,
    points: 1250,
    streak: 7,
    wordsLearned: 42,
    hasPassword: true,
  },
  {
    id: "sam",
    username: "sam_smart",
    email: "sam@family.com",
    avatar: avatars[0],
    level: 3,
    points: 850,
    streak: 4,
    wordsLearned: 28,
    hasPassword: false,
  },
  {
    id: "taylor",
    username: "taylor_champion",
    email: "taylor@family.com",
    avatar: avatars[4],
    level: 7,
    points: 2100,
    streak: 12,
    wordsLearned: 67,
    hasPassword: true,
  },
];

type ViewMode = "main" | "login" | "create" | "forgot";

interface EnhancedChildLoginProps {
  onLogin: (profile: any) => void;
  onCreateProfile: () => void;
}

export function EnhancedChildLogin({
  onLogin,
  onCreateProfile,
}: EnhancedChildLoginProps) {
  const [currentView, setCurrentView] = useState<ViewMode>("main");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [createForm, setCreateForm] = useState({
    childName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    parentEmail: "",
  });
  const [forgotForm, setForgotForm] = useState({ username: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleProfileSelect = (profile: any) => {
    audioService.playWhooshSound();

    if (!profile.hasPassword) {
      // Quick login for profiles without password
      setSelectedProfile(profile.id);
      setTimeout(() => {
        onLogin(profile);
      }, 300);
    } else {
      // Show password login for protected profiles
      setSelectedProfile(profile);
      setLoginForm({ username: profile.username, password: "" });
      setCurrentView("login");
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setMessage(null);

    // Simulate login process
    setTimeout(() => {
      if (
        loginForm.password === "demo123" ||
        loginForm.password === selectedProfile?.id + "123"
      ) {
        audioService.playCheerSound();
        setMessage({ type: "success", text: "Welcome back! 🎉" });
        setTimeout(() => {
          onLogin(selectedProfile);
        }, 1000);
      } else {
        audioService.playEncouragementSound();
        setMessage({
          type: "error",
          text: "Oops! Check your password and try again! 🤗",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setMessage(null);

    // Basic validation
    if (createForm.password !== createForm.confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords don't match! Try again! 😊",
      });
      setIsLoading(false);
      return;
    }

    if (createForm.password.length < 4) {
      setMessage({
        type: "error",
        text: "Password needs at least 4 characters! 🔒",
      });
      setIsLoading(false);
      return;
    }

    // Simulate account creation
    setTimeout(() => {
      audioService.playCheerSound();
      setMessage({
        type: "success",
        text: "Account created! Let's start your adventure! 🚀",
      });
      setTimeout(() => {
        onCreateProfile();
      }, 1500);
      setIsLoading(false);
    }, 2000);
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);
    setMessage(null);

    // Simulate password recovery
    setTimeout(() => {
      audioService.playSuccessSound();
      setMessage({
        type: "success",
        text: "Recovery email sent! Ask a grown-up to check your email! 📧",
      });
      setIsLoading(false);
    }, 1500);
  };

  const renderMainView = () => (
    <div className="w-full max-w-5xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink p-6 rounded-full animate-pulse shadow-2xl">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-educational-blue to-educational-purple bg-clip-text text-transparent mb-4">
          🌟 Welcome to Word Adventure! 🌟
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Choose your learning buddy to start your amazing vocabulary journey!
        </p>
        <div className="flex justify-center gap-3 mb-6">
          <Badge className="bg-educational-green text-white px-4 py-2 text-sm animate-bounce">
            🎮 Fun Learning Games
          </Badge>
          <Badge className="bg-educational-blue text-white px-4 py-2 text-sm animate-bounce delay-100">
            🏆 Cool Achievements
          </Badge>
          <Badge className="bg-educational-purple text-white px-4 py-2 text-sm animate-bounce delay-200">
            🎯 Personalized Learning
          </Badge>
        </div>
      </div>

      {/* Existing Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {savedProfiles.map((profile) => (
          <Card
            key={profile.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              selectedProfile === profile.id
                ? "ring-4 ring-educational-blue bg-gradient-to-br from-blue-50 to-purple-50"
                : "hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50"
            } relative overflow-hidden`}
            onClick={() => handleProfileSelect(profile)}
          >
            {/* Security indicator */}
            {profile.hasPassword && (
              <div className="absolute top-3 right-3">
                <div className="bg-green-500 text-white rounded-full p-1">
                  <Lock className="w-3 h-3" />
                </div>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <div
                className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r ${profile.avatar.color} flex items-center justify-center text-5xl mb-4 shadow-xl animate-pulse`}
              >
                {profile.avatar.emoji}
              </div>
              <CardTitle className="text-2xl text-gray-800 capitalize">
                {profile.id}
              </CardTitle>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-lg font-semibold text-gray-600">
                  Level {profile.level}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Stats */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-educational-blue/10 rounded-xl p-3">
                  <div className="text-2xl font-bold text-educational-blue">
                    {profile.wordsLearned}
                  </div>
                  <div className="text-xs text-gray-600">Words Learned</div>
                </div>
                <div className="bg-educational-orange/10 rounded-xl p-3">
                  <div className="text-2xl font-bold text-educational-orange">
                    {profile.streak}
                  </div>
                  <div className="text-xs text-gray-600">Day Streak</div>
                </div>
              </div>

              {/* Points */}
              <div className="text-center bg-yellow-50 rounded-xl p-3">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-bold text-yellow-600">
                    {profile.points.toLocaleString()} Points
                  </span>
                </div>
              </div>

              {/* Learning Buddy */}
              <div className="text-center">
                <Badge
                  variant="secondary"
                  className="bg-educational-purple/20 text-educational-purple px-4 py-2"
                >
                  🎯 Learning with {profile.avatar.name}
                </Badge>
              </div>

              {/* Security status */}
              <div className="text-center">
                {profile.hasPassword ? (
                  <div className="text-xs text-green-600 flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" />
                    Protected Account
                  </div>
                ) : (
                  <div className="text-xs text-blue-600 flex items-center justify-center gap-1">
                    <Heart className="w-3 h-3" />
                    Quick Login
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6 flex-wrap">
        {/* Create New Account */}
        <Card
          className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-educational-green/10 to-educational-blue/10 border-2 border-dashed border-educational-green/30 hover:scale-105"
          onClick={() => setCurrentView("create")}
        >
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-educational-green to-educational-blue flex items-center justify-center text-4xl mb-4 shadow-lg">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Create New Account
            </h3>
            <p className="text-sm text-gray-600">
              Start your vocabulary journey with a brand new adventure!
            </p>
          </CardContent>
        </Card>

        {/* Need Help */}
        <Card
          className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-educational-purple/10 to-educational-pink/10 border-2 border-dashed border-educational-purple/30 hover:scale-105"
          onClick={() => setCurrentView("forgot")}
        >
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-educational-purple to-educational-pink flex items-center justify-center text-4xl mb-4 shadow-lg">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-gray-600">
              Forgot your password? We can help you get back in!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLoginView = () => (
    <div className="w-full max-w-md">
      <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-white/50">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            onClick={() => setCurrentView("main")}
            className="absolute top-4 left-4 p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div
            className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${selectedProfile?.avatar.color} flex items-center justify-center text-4xl mb-4 shadow-lg`}
          >
            {selectedProfile?.avatar.emoji}
          </div>
          <CardTitle className="text-2xl text-gray-800">
            Welcome back, {selectedProfile?.id}! 👋
          </CardTitle>
          <p className="text-gray-600">
            Enter your password to continue your adventure!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label
              htmlFor="username"
              className="text-lg font-semibold text-gray-700"
            >
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={loginForm.username}
              disabled
              className="text-center text-lg py-3 mt-2 bg-gray-50"
            />
          </div>

          <div>
            <Label
              htmlFor="password"
              className="text-lg font-semibold text-gray-700"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password..."
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              className="text-center text-lg py-3 mt-2 border-2"
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {message && (
            <div
              className={`text-center p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {message.type === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {message.text}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              disabled={isLoading || !loginForm.password}
              className="w-full bg-gradient-to-r from-educational-blue to-educational-purple text-white text-lg py-3"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </div>
              ) : (
                <>
                  <Key className="w-5 h-5 mr-2" />
                  Enter Adventure! 🚀
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setCurrentView("forgot")}
              className="w-full text-gray-600"
            >
              Forgot Password? 🤔
            </Button>
          </div>

          <div className="text-center bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Demo:</strong> Try password "demo123" or "
              {selectedProfile?.id}123"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCreateView = () => (
    <div className="w-full max-w-md">
      <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-white/50">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            onClick={() => setCurrentView("main")}
            className="absolute top-4 left-4 p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-educational-green to-educational-blue flex items-center justify-center text-4xl mb-4 shadow-lg">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-800">
            Create Your Account! ✨
          </CardTitle>
          <p className="text-gray-600">
            Let's set up your new vocabulary adventure!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label
              htmlFor="childName"
              className="text-sm font-semibold text-gray-700"
            >
              Your Name
            </Label>
            <Input
              id="childName"
              type="text"
              placeholder="What should we call you?"
              value={createForm.childName}
              onChange={(e) =>
                setCreateForm({ ...createForm, childName: e.target.value })
              }
              className="text-center py-2 mt-1"
            />
          </div>

          <div>
            <Label
              htmlFor="newUsername"
              className="text-sm font-semibold text-gray-700"
            >
              Username
            </Label>
            <Input
              id="newUsername"
              type="text"
              placeholder="Pick a cool username!"
              value={createForm.username}
              onChange={(e) =>
                setCreateForm({ ...createForm, username: e.target.value })
              }
              className="text-center py-2 mt-1"
            />
          </div>

          <div>
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700"
            >
              Your Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
              className="text-center py-2 mt-1"
            />
          </div>

          <div>
            <Label
              htmlFor="parentEmail"
              className="text-sm font-semibold text-gray-700"
            >
              Parent's Email
            </Label>
            <Input
              id="parentEmail"
              type="email"
              placeholder="parent@example.com"
              value={createForm.parentEmail}
              onChange={(e) =>
                setCreateForm({ ...createForm, parentEmail: e.target.value })
              }
              className="text-center py-2 mt-1"
            />
          </div>

          <div>
            <Label
              htmlFor="newPassword"
              className="text-sm font-semibold text-gray-700"
            >
              Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Create a secret password!"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm({ ...createForm, password: e.target.value })
              }
              className="text-center py-2 mt-1"
            />
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-gray-700"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Type your password again!"
              value={createForm.confirmPassword}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  confirmPassword: e.target.value,
                })
              }
              className="text-center py-2 mt-1"
            />
          </div>

          {message && (
            <div
              className={`text-center p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {message.type === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {message.text}
              </div>
            </div>
          )}

          <Button
            onClick={handleCreateAccount}
            disabled={
              isLoading ||
              !createForm.childName ||
              !createForm.username ||
              !createForm.password
            }
            className="w-full bg-gradient-to-r from-educational-green to-educational-blue text-white py-3"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Start My Adventure! 🚀
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderForgotView = () => (
    <div className="w-full max-w-md">
      <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-white/50">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            onClick={() => setCurrentView("main")}
            className="absolute top-4 left-4 p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-educational-purple to-educational-pink flex items-center justify-center text-4xl mb-4 shadow-lg">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-800">
            Need Help Getting In? 🤗
          </CardTitle>
          <p className="text-gray-600">
            Don't worry! We can help you reset your password!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label
              htmlFor="forgotUsername"
              className="text-lg font-semibold text-gray-700"
            >
              Username
            </Label>
            <Input
              id="forgotUsername"
              type="text"
              placeholder="Enter your username..."
              value={forgotForm.username}
              onChange={(e) =>
                setForgotForm({ ...forgotForm, username: e.target.value })
              }
              className="text-center text-lg py-3 mt-2 border-2"
            />
          </div>

          <div>
            <Label
              htmlFor="forgotEmail"
              className="text-lg font-semibold text-gray-700"
            >
              Email Address
            </Label>
            <Input
              id="forgotEmail"
              type="email"
              placeholder="Enter your email address..."
              value={forgotForm.email}
              onChange={(e) =>
                setForgotForm({ ...forgotForm, email: e.target.value })
              }
              className="text-center text-lg py-3 mt-2 border-2"
            />
          </div>

          {message && (
            <div
              className={`text-center p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {message.type === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {message.text}
              </div>
            </div>
          )}

          <Button
            onClick={handleForgotPassword}
            disabled={isLoading || !forgotForm.username || !forgotForm.email}
            className="w-full bg-gradient-to-r from-educational-purple to-educational-pink text-white text-lg py-3"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending Help...
              </div>
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                Send Recovery Email 📧
              </>
            )}
          </Button>

          <div className="text-center bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              💡 <strong>Tip:</strong> Ask a grown-up to help check your email
              for the reset link!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Fun Elements */}
      <div className="fixed top-10 left-10 text-5xl animate-bounce">🌟</div>
      <div className="fixed top-20 right-20 text-4xl animate-pulse">📚</div>
      <div className="fixed bottom-10 left-20 text-5xl animate-bounce delay-1000">
        🎯
      </div>
      <div className="fixed bottom-20 right-10 text-4xl animate-pulse delay-500">
        🚀
      </div>
      <div
        className="fixed top-1/2 left-5 text-3xl animate-spin"
        style={{ animationDuration: "4s" }}
      >
        ✨
      </div>
      <div className="fixed top-1/3 right-5 text-3xl animate-bounce delay-700">
        🎪
      </div>
      <div className="fixed bottom-1/3 left-1/4 text-2xl animate-pulse delay-1000">
        🌈
      </div>
      <div className="fixed top-1/4 right-1/4 text-3xl animate-bounce delay-500">
        🎨
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {currentView === "main" && renderMainView()}
        {currentView === "login" && renderLoginView()}
        {currentView === "create" && renderCreateView()}
        {currentView === "forgot" && renderForgotView()}
      </div>
    </div>
  );
}
