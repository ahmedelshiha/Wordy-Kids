// URGENT SECURITY FIX FOR WORDY KIDS
// Replace client/pages/SignUp.tsx with secure password handling

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Calendar } from 'lucide-react';

// SECURITY IMPROVEMENT: Install and use crypto-js for client-side hashing
// Run: npm install crypto-js @types/crypto-js
import CryptoJS from 'crypto-js';

// Secure password hashing utility
const SecurityUtils = {
  // Generate a random salt for each password
  generateSalt: (): string => {
    return CryptoJS.lib.WordArray.random(128/8).toString();
  },

  // Hash password with salt using PBKDF2 (secure for client-side)
  hashPassword: (password: string, salt: string): string => {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 512/32,
      iterations: 10000
    }).toString();
  },

  // Verify password against stored hash
  verifyPassword: (password: string, storedHash: string, salt: string): boolean => {
    const hash = SecurityUtils.hashPassword(password, salt);
    return hash === storedHash;
  },

  // Generate secure user ID
  generateSecureId: (): string => {
    return CryptoJS.lib.WordArray.random(16).toString();
  }
};

interface UserData {
  id: string;
  name: string;
  email: string;
  age: number;
  passwordHash: string;  // Store hash instead of plaintext
  salt: string;          // Store salt for verification
  createdAt: string;
  lastLogin?: string;
}

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Password strength validation
  const validatePassword = (password: string): string[] => {
    const issues: string[] = [];
    
    if (password.length < 8) {
      issues.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      issues.push('Password must contain at least one number');
    }
    
    return issues;
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpFormData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordIssues = validatePassword(formData.password);
    if (passwordIssues.length > 0) {
      newErrors.password = passwordIssues[0]; // Show first issue
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Age validation
    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age)) {
      newErrors.age = 'Age is required';
    } else if (age < 3 || age > 18) {
      newErrors.age = 'Age must be between 3 and 18 for this educational app';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if user already exists
  const checkExistingUser = (email: string): boolean => {
    try {
      const existingUsers: UserData[] = JSON.parse(
        localStorage.getItem("wordAdventureUsers") || "[]"
      );
      return existingUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
    } catch (error) {
      console.error('Error checking existing users:', error);
      return false;
    }
  };

  // SECURE SIGNUP HANDLER
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check for existing user
    if (checkExistingUser(formData.email)) {
      setErrors({ email: 'An account with this email already exists' });
      return;
    }

    setIsLoading(true);

    try {
      // SECURITY IMPROVEMENT: Generate salt and hash password
      const salt = SecurityUtils.generateSalt();
      const passwordHash = SecurityUtils.hashPassword(formData.password, salt);
      
      const newUser: UserData = {
        id: SecurityUtils.generateSecureId(),
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        age: parseInt(formData.age),
        passwordHash: passwordHash,  // Store hash, NOT plaintext
        salt: salt,                  // Store salt for verification
        createdAt: new Date().toISOString(),
      };

      // Get existing users and add new user
      const existingUsers: UserData[] = JSON.parse(
        localStorage.getItem("wordAdventureUsers") || "[]"
      );
      
      existingUsers.push(newUser);

      // SECURITY IMPROVEMENT: Store users with hashed passwords
      localStorage.setItem("wordAdventureUsers", JSON.stringify(existingUsers));

      // Set current user session (without password data)
      const userSession = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        createdAt: newUser.createdAt
      };
      
      localStorage.setItem("currentUser", JSON.stringify(userSession));
      
      console.log('✅ User registered successfully with secure password storage');
      
      // Navigate to main app
      navigate('/app');
      
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ email: 'An error occurred during signup. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof SignUpFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Wordy Kids!</h1>
          <p className="text-gray-600">Create your learning adventure account</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Age Field */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="age"
                name="age"
                type="number"
                min="3"
                max="18"
                value={formData.age}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.age ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your age"
              />
            </div>
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 text-center">
            🔒 Your password is securely encrypted and stored safely
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;