import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  UserPlus,
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Baby,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    childName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Format birth date as dd/mm/yyyy
    if (e.target.name === "birthDate") {
      // Remove all non-digit characters
      const digits = value.replace(/\D/g, "");

      // Format as dd/mm/yyyy
      if (digits.length >= 1) {
        if (digits.length <= 2) {
          value = digits;
        } else if (digits.length <= 4) {
          value = digits.slice(0, 2) + "/" + digits.slice(2);
        } else {
          value =
            digits.slice(0, 2) +
            "/" +
            digits.slice(2, 4) +
            "/" +
            digits.slice(4, 8);
        }
      }
    } else {
      value = value.trim();
    }

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    // Clear any existing messages when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Enhanced validation with specific field feedback
    const errors = [];
    if (!formData.childName.trim()) errors.push("Child's name");
    if (!formData.birthDate.trim()) errors.push("Birth date");
    if (!formData.email.trim()) errors.push("Parent email");
    if (!formData.password) errors.push("Password");
    if (!formData.confirmPassword) errors.push("Password confirmation");

    if (errors.length > 0) {
      setMessage({
        type: "error",
        text: `Please complete: ${errors.join(", ")}`,
      });
      setIsLoading(false);
      return;
    }

    // Validate child name
    if (formData.childName.trim().length < 2) {
      setMessage({
        type: "error",
        text: "Child's name must be at least 2 characters long",
      });
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z\s'-]+$/.test(formData.childName.trim())) {
      setMessage({
        type: "error",
        text: "Child's name should only contain letters, spaces, hyphens, and apostrophes",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match",
      });
      setIsLoading(false);
      return;
    }

    // Enhanced password validation
    if (formData.password.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters for account security",
      });
      setIsLoading(false);
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setMessage({
        type: "error",
        text: "Password should include uppercase, lowercase, and numbers for better security",
      });
      setIsLoading(false);
      return;
    }

    // Calculate age from birth date (dd/mm/yyyy format)
    const dateParts = formData.birthDate.split("/");
    if (dateParts.length !== 3) {
      setMessage({
        type: "error",
        text: "Please enter birth date in dd/mm/yyyy format",
      });
      setIsLoading(false);
      return;
    }

    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in Date
    const year = parseInt(dateParts[2]);

    if (
      isNaN(day) ||
      isNaN(month) ||
      isNaN(year) ||
      day < 1 ||
      day > 31 ||
      month < 0 ||
      month > 11 ||
      year < 1900 ||
      year > new Date().getFullYear()
    ) {
      setMessage({
        type: "error",
        text: "Please enter a valid birth date in dd/mm/yyyy format",
      });
      setIsLoading(false);
      return;
    }

    const birthDate = new Date(year, month, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge =
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;

    if (actualAge < 3 || actualAge > 18) {
      setMessage({
        type: "error",
        text: `Child appears to be ${actualAge} years old. This platform is designed for children aged 3-18 years.`,
      });
      setIsLoading(false);
      return;
    }

    // Check if email already exists for parents
    const existingUsers = JSON.parse(
      localStorage.getItem("wordAdventureUsers") || "[]",
    );
    const userExists = existingUsers.some(
      (u: any) => u.email === formData.email,
    );

    // Enhanced email validation
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address format",
      });
      setIsLoading(false);
      return;
    }

    if (userExists) {
      setMessage({
        type: "error",
        text: "This email is already registered. Please use a different email address or sign in instead.",
      });
      setIsLoading(false);
      return;
    }

    // Create parent account and child profile
    setTimeout(() => {
      // Create parent user account
      const newUser = {
        username: formData.email.split("@")[0], // Use email prefix as username
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString(),
        isParent: true,
      };

      existingUsers.push(newUser);
      localStorage.setItem("wordAdventureUsers", JSON.stringify(existingUsers));

      // Create child profile for parent dashboard
      const existingChildren = JSON.parse(
        localStorage.getItem("parentDashboardChildren") || "[]",
      );
      const newChild = {
        id: Date.now().toString(),
        name: formData.childName.trim(),
        age: actualAge,
        avatar:
          actualAge <= 6
            ? "👶"
            : actualAge <= 10
              ? "🧒"
              : actualAge <= 14
                ? "👦"
                : "👨‍🎓",
        level: 1,
        totalPoints: 0,
        wordsLearned: 0,
        currentStreak: 0,
        weeklyGoal: actualAge <= 6 ? 5 : actualAge <= 10 ? 10 : 15,
        weeklyProgress: 0,
        favoriteCategory: "Animals",
        lastActive: new Date(),
        preferredLearningTime: "After school (4-6 PM)",
        difficultyPreference:
          actualAge <= 6 ? "easy" : actualAge <= 10 ? "medium" : "medium",
        parentNotes: "",
        customWords: [],
        weeklyTarget: actualAge <= 6 ? 10 : actualAge <= 10 ? 15 : 20,
        monthlyTarget: actualAge <= 6 ? 40 : actualAge <= 10 ? 60 : 80,
        recentAchievements: [],
        learningStrengths: [],
        areasForImprovement: [],
        motivationalRewards: [],
        birthDate: formData.birthDate,
        parentEmail: formData.email,
      };

      existingChildren.push(newChild);
      localStorage.setItem(
        "parentDashboardChildren",
        JSON.stringify(existingChildren),
      );

      setMessage({
        type: "success",
        text: `Child profile created successfully! ${formData.childName} is ready to start learning!`,
      });

      // Navigate to login page after successful creation
      setTimeout(() => {
        navigate("/");
      }, 1500);
      setIsLoading(false);
    }, 1500);
  };

  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-2 md:p-4">
      {/* Simple Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 text-3xl">📚</div>
        <div className="absolute top-32 right-20 text-3xl">✨</div>
        <div className="absolute bottom-20 left-20 text-3xl">🎯</div>
        <div className="absolute bottom-32 right-20 text-3xl">🌟</div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-2 md:mb-8">
          <div className="flex justify-center mb-2 md:mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 md:p-6 rounded-full shadow-lg">
              <BookOpen className="w-8 md:w-12 h-8 md:h-12 text-white" />
            </div>
          </div>
          <h1 className="text-xl md:text-4xl font-bold text-gray-800 mb-1 md:mb-4">
            Create Child Profile
          </h1>
          <p className="text-sm md:text-lg text-gray-600">
            Set up a learning profile for your child
          </p>
        </div>

        {/* Sign Up Form */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200 rounded-lg">
          <CardHeader className="pb-2 md:pb-6">
            <CardTitle className="text-center text-xl text-gray-800">
              Create Child Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 md:pt-6">
            <form onSubmit={handleSignUp} className="space-y-2 md:space-y-4">
              {/* Child Name Field */}
              <div>
                <Label
                  htmlFor="childName"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Baby className="w-4 h-4" />
                  Child's Name
                </Label>
                <Input
                  id="childName"
                  name="childName"
                  type="text"
                  placeholder="Enter your child's first name"
                  autoComplete="given-name"
                  spellCheck={true}
                  maxLength={50}
                  value={formData.childName}
                  onChange={handleInputChange}
                  className="mt-1 md:mt-2 border-gray-300 focus:border-blue-500 text-base"
                  disabled={isLoading}
                />
              </div>

              {/* Birth Date Field */}
              <div>
                <Label
                  htmlFor="birthDate"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Birth Date
                </Label>
                <div className="relative">
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="mt-1 md:mt-2 border-gray-300 focus:border-blue-500 text-base pr-12"
                    maxLength={10}
                    disabled={isLoading}
                  />
                  {/* Hidden date picker for calendar selection */}
                  <input
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.value) {
                        const date = new Date(e.target.value);
                        const day = date.getDate().toString().padStart(2, "0");
                        const month = (date.getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const year = date.getFullYear();
                        const formattedDate = `${day}/${month}/${year}`;
                        setFormData({
                          ...formData,
                          birthDate: formattedDate,
                        });
                        if (message) {
                          setMessage(null);
                        }
                      }
                    }}
                    disabled={isLoading}
                  />
                  {/* Calendar icon for visual indication */}
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Parent Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter parent's email address"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 md:mt-2 border-gray-300 focus:border-blue-500 text-base"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Parent Password
                </Label>
                <div className="relative mt-1 md:mt-2">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password (min 8 chars, mixed case + numbers)"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="border-gray-300 focus:border-blue-500 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </Label>
                <div className="relative mt-1 md:mt-2">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password to confirm"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="border-gray-300 focus:border-blue-500 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <div
                  className={`text-center p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {message.type === "success" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    {message.text}
                  </div>
                </div>
              )}

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Profile...
                  </div>
                ) : (
                  <>
                    <Baby className="w-4 h-4 mr-2" />
                    Create Child Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center mt-3 md:mt-6">
          <Button
            onClick={handleBackToLogin}
            variant="link"
            className="p-0 h-auto text-sm text-gray-500 hover:text-gray-700 underline-offset-2"
            disabled={isLoading}
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
