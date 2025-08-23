// SECURITY FIX FOR WORDY KIDS - Secure SignUp with password hashing
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

// SECURITY IMPROVEMENT: Use crypto-js for client-side hashing
import CryptoJS from "crypto-js";

// Secure password hashing utility
const SecurityUtils = {
  // Generate a random salt for each password
  generateSalt: (): string => {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
  },

  // Hash password with salt using PBKDF2 (secure for client-side)
  hashPassword: (password: string, salt: string): string => {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 512 / 32,
      iterations: 10000,
    }).toString();
  },

  // Generate secure user ID
  generateSecureId: (): string => {
    return CryptoJS.lib.WordArray.random(16).toString();
  },
};

interface UserData {
  id: string;
  username?: string;
  name: string;
  email: string;
  age: number;
  passwordHash: string; // Store hash instead of plaintext
  salt: string; // Store salt for verification
  createdAt: string;
  lastLogin?: string;
  isParent?: boolean;
}

interface SignUpFormData {
  childName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
}

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
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

  // Password strength validation
  const validatePassword = (password: string): string[] => {
    const issues: string[] = [];

    if (password.length < 6) {
      issues.push("Password must be at least 6 characters long");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      issues.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      issues.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
      issues.push("Password must contain at least one number");
    }

    return issues;
  };

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

  // Check if user already exists
  const checkExistingUser = (email: string): boolean => {
    try {
      const existingUsers: UserData[] = JSON.parse(
        localStorage.getItem("wordAdventureUsers") || "[]",
      );
      return existingUsers.some(
        (user) => user.email.toLowerCase() === email.toLowerCase(),
      );
    } catch (error) {
      console.error("Error checking existing users:", error);
      return false;
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

    // Enhanced password validation with security requirements
    const passwordIssues = validatePassword(formData.password);
    if (passwordIssues.length > 0) {
      setMessage({
        type: "error",
        text: passwordIssues[0], // Show first issue
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

    // Check if email already exists
    if (checkExistingUser(formData.email)) {
      setMessage({
        type: "error",
        text: "This email is already registered. Please use a different email address or sign in instead.",
      });
      setIsLoading(false);
      return;
    }

    // SECURITY IMPROVEMENT: Create parent account and child profile with hashed password
    setTimeout(() => {
      try {
        // SECURITY IMPROVEMENT: Generate salt and hash password
        const salt = SecurityUtils.generateSalt();
        const passwordHash = SecurityUtils.hashPassword(
          formData.password,
          salt,
        );

        const newUser: UserData = {
          id: SecurityUtils.generateSecureId(),
          username: formData.email.split("@")[0], // Use email prefix as username
          name: formData.childName.trim(),
          email: formData.email.toLowerCase().trim(),
          age: actualAge,
          passwordHash: passwordHash, // Store hash, NOT plaintext
          salt: salt, // Store salt for verification
          createdAt: new Date().toISOString(),
          isParent: true,
        };

        // Get existing users and add new user
        const existingUsers: UserData[] = JSON.parse(
          localStorage.getItem("wordAdventureUsers") || "[]",
        );

        existingUsers.push(newUser);

        // SECURITY IMPROVEMENT: Store users with hashed passwords
        localStorage.setItem(
          "wordAdventureUsers",
          JSON.stringify(existingUsers),
        );

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
              ? "🐵"
              : actualAge <= 10
                ? "🦁"
                : actualAge <= 14
                  ? "🐅"
                  : "🦅",
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
          text: `🎉 Welcome to the jungle adventure! ${formData.childName} is ready to explore and learn!`,
        });

        console.log(
          "✅ User registered successfully with secure password storage",
        );

        // Navigate to login page after successful creation
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } catch (error) {
        console.error("Signup error:", error);
        setMessage({
          type: "error",
          text: "An error occurred during signup. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen login-background flex items-center justify-center p-2 md:p-4 relative overflow-hidden">
      {/* Main Content */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-4 md:mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex justify-center mb-4 md:mb-6">
            <motion.div
              className="bg-gradient-to-r from-jungle to-bright-orange p-4 md:p-6 rounded-full shadow-xl border-4 border-white"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-3xl md:text-5xl">🦁</span>
            </motion.div>
          </div>
          <motion.h1
            className="text-xl md:text-4xl font-bold text-navy mb-2 md:mb-4 font-['Baloo_2']"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join the Jungle Adventure! 🌟
          </motion.h1>
          <motion.p
            className="text-sm md:text-lg text-navy/80 font-['Baloo_2'] font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Create your explorer profile and start learning! 🎯
          </motion.p>
        </motion.div>

        {/* Sign Up Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-jungle/20 rounded-[20px] md:rounded-[24px] overflow-hidden">
            <CardHeader className="pb-1 md:pb-4 pt-3 md:pt-6 px-3 md:px-6 bg-gradient-to-r from-jungle/10 to-sunshine/10">
              <CardTitle className="text-center text-base md:text-xl text-navy font-['Baloo_2'] font-bold flex items-center justify-center gap-1 md:gap-2">
                <span className="text-lg md:text-2xl">🌍</span>
                <span className="text-sm md:text-base">
                  Create Explorer Profile
                </span>
                <span className="text-lg md:text-2xl">🎒</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 md:pt-6 px-3 md:px-6 pb-4 md:pb-6">
              <form
                onSubmit={handleSignUp}
                className="space-y-2.5 md:space-y-4"
              >
                {/* Child Name Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Label
                    htmlFor="childName"
                    className="text-xs md:text-sm font-semibold text-navy flex items-center gap-1 md:gap-2 font-['Baloo_2']"
                  >
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                    Young Explorer's Name
                  </Label>
                  <Input
                    id="childName"
                    name="childName"
                    type="text"
                    placeholder="What should we call our brave explorer?"
                    autoComplete="given-name"
                    spellCheck={true}
                    maxLength={50}
                    value={formData.childName}
                    onChange={handleInputChange}
                    className="mt-1 md:mt-2 border-jungle/30 focus:border-jungle focus:ring-jungle/20 text-sm md:text-base rounded-lg md:rounded-xl bg-white/80 font-['Baloo_2'] py-2 md:py-3"
                    disabled={isLoading}
                  />
                </motion.div>

                {/* Birth Date Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Label
                    htmlFor="birthDate"
                    className="text-xs md:text-sm font-semibold text-navy flex items-center gap-1 md:gap-2 font-['Baloo_2']"
                  >
                    <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                    Birthday Adventure
                  </Label>
                  <div className="relative">
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="text"
                      placeholder="dd/mm/yyyy"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="mt-1 md:mt-2 border-jungle/30 focus:border-jungle focus:ring-jungle/20 text-sm md:text-base pr-10 md:pr-12 rounded-lg md:rounded-xl bg-white/80 font-['Baloo_2'] py-2 md:py-3"
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
                          const day = date
                            .getDate()
                            .toString()
                            .padStart(2, "0");
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
                    {/* Calendar icon */}
                    <span className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-sm md:text-lg pointer-events-none">
                      📅
                    </span>
                  </div>
                </motion.div>

                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Label
                    htmlFor="email"
                    className="text-xs md:text-sm font-semibold text-navy flex items-center gap-1 md:gap-2 font-['Baloo_2']"
                  >
                    <Mail className="w-4 h-4 md:w-5 md:h-5" />
                    Parent's Contact
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="parent@email.com"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 md:mt-2 border-jungle/30 focus:border-jungle focus:ring-jungle/20 text-sm md:text-base rounded-lg md:rounded-xl bg-white/80 font-['Baloo_2'] py-2 md:py-3"
                    disabled={isLoading}
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Label
                    htmlFor="password"
                    className="text-xs md:text-sm font-semibold text-navy flex items-center gap-1 md:gap-2 font-['Baloo_2']"
                  >
                    <Lock className="w-4 h-4 md:w-5 md:h-5" />
                    Secret Explorer Code
                  </Label>
                  <div className="relative mt-1 md:mt-2">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password (min 6 chars, uppercase, lowercase, numbers)"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="border-jungle/30 focus:border-jungle focus:ring-jungle/20 pr-10 md:pr-12 rounded-lg md:rounded-xl bg-white/80 font-['Baloo_2'] text-sm md:text-base py-2 md:py-3"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-jungle hover:text-jungle-dark"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Label
                    htmlFor="confirmPassword"
                    className="text-xs md:text-sm font-semibold text-navy flex items-center gap-1 md:gap-2 font-['Baloo_2']"
                  >
                    <Lock className="w-4 h-4 md:w-5 md:h-5" />
                    Confirm Secret Code
                  </Label>
                  <div className="relative mt-1 md:mt-2">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Enter the same password again"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="border-jungle/30 focus:border-jungle focus:ring-jungle/20 pr-10 md:pr-12 rounded-lg md:rounded-xl bg-white/80 font-['Baloo_2'] text-sm md:text-base py-2 md:py-3"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-jungle hover:text-jungle-dark"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Message Display */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-center p-3 md:p-4 rounded-lg md:rounded-xl border-2 ${
                      message.type === "success"
                        ? "bg-jungle/10 text-jungle-dark border-jungle/30"
                        : "bg-coral-red/10 text-coral-red border-coral-red/30"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 font-['Baloo_2'] font-medium text-xs md:text-sm">
                      {message.type === "success" ? (
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                      {message.text}
                    </div>
                  </motion.div>
                )}

                {/* Sign Up Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 md:py-4 bg-gradient-to-r from-jungle to-bright-orange text-white hover:from-jungle-dark hover:to-orange-600 font-bold text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-lg md:rounded-xl font-['Baloo_2'] border-2 border-white/20"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-base md:text-lg">🌟</span>
                        <span className="text-sm md:text-base">
                          Creating Adventure Profile...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 md:gap-3">
                        <span className="text-lg md:text-2xl">🎯</span>
                        <span className="text-sm md:text-base">
                          Start Jungle Adventure!
                        </span>
                        <span className="text-lg md:text-2xl">🌟</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Login */}
        <motion.div
          className="text-center mt-4 md:mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <Button
            onClick={handleBackToLogin}
            variant="outline"
            className="group px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-sunshine/10 to-educational-yellow-light/10 border-2 border-sunshine/40 hover:border-sunshine hover:bg-sunshine/10 text-navy hover:text-navy-dark font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[44px] min-w-[160px] touch-target"
            style={{
              boxShadow: "0 2px 8px rgba(255, 193, 7, 0.2)",
              fontFamily: "Baloo 2",
              fontWeight: 600,
              letterSpacing: "0.3px",
            }}
            disabled={isLoading}
            aria-label="Return to the main jungle adventure login page"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg group-hover:animate-bounce">🏠</span>
              <span className="text-sm md:text-base">Back to Home Base</span>
              <span className="text-sm group-hover:animate-pulse">🌿</span>
            </div>
          </Button>
          <p className="text-xs text-sunshine-dark/70 mt-2 font-medium font-['Baloo_2']">
            🦋 Return to the jungle entrance
          </p>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <p className="text-xs text-green-700 text-center font-medium font-['Baloo_2']">
            🔒 Your password is securely encrypted and stored safely
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
