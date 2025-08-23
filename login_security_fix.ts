// SECURITY FIX FOR LOGIN - Update client/pages/LoginForm.tsx
// This must be updated to work with the new secure password hashing

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import CryptoJS from 'crypto-js';

// Import the same security utilities used in SignUp
const SecurityUtils = {
  hashPassword: (password: string, salt: string): string => {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 512/32,
      iterations: 10000
    }).toString();
  },

  verifyPassword: (password: string, storedHash: string, salt: string): boolean => {
    const hash = SecurityUtils.hashPassword(password, salt);
    return hash === storedHash;
  }
};

interface UserData {
  id: string;
  name: string;
  email: string;
  age: number;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLogin?: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // SECURE LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      // Get stored users
      const storedUsers: UserData[] = JSON.parse(
        localStorage.getItem("wordAdventureUsers") || "[]"
      );

      // Find user by email
      const user = storedUsers.find(
        u => u.email.toLowerCase() === formData.email.toLowerCase().trim()
      );

      if (!user) {
        setError('No account found with this email address');
        setIsLoading(false);
        return;
      }

      // SECURITY IMPROVEMENT: Verify password using hash and salt
      const isPasswordValid = SecurityUtils.verifyPassword(
        formData.password,
        user.passwordHash,
        user.salt
      );

      if (!isPasswordValid) {
        setError('Invalid password');
        setIsLoading(false);
        return;
      }

      // Update last login time
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString()
      };

      // Update the user in storage
      const updatedUsers = storedUsers.map(u => 
        u.id === user.id ? updatedUser : u
      );
      localStorage.setItem("wordAdventureUsers", JSON.stringify(updatedUsers));

      // Set current user session (without sensitive data)
      const userSession = {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        createdAt: user.createdAt,
        lastLogin: updatedUser.lastLogin
      };
      
      localStorage.setItem("currentUser", JSON.stringify(userSession));
      
      console.log('✅ User logged in successfully with secure authentication');
      
      // Navigate to main app
      navigate('/app');
      
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle legacy users (those with plaintext passwords)
  const handleLegacyLogin = async (users: any[], email: string, password: string) => {
    const legacyUser = users.find(u => 
      u.email?.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (legacyUser) {
      // Migrate legacy user to secure format
      console.log('⚠️ Migrating legacy user to secure password storage');
      
      const salt = CryptoJS.lib.WordArray.random(128/8).toString();
      const passwordHash = SecurityUtils.hashPassword(password, salt);
      
      const migratedUser: UserData = {
        id: legacyUser.id || CryptoJS.lib.WordArray.random(16).toString(),
        name: legacyUser.name,
        email: legacyUser.email,
        age: legacyUser.age,
        passwordHash: passwordHash,
        salt: salt,
        createdAt: legacyUser.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Remove legacy user and add migrated user
      const updatedUsers = users.filter(u => u.email !== legacyUser.email);
      updatedUsers.push(migratedUser);
      localStorage.setItem("wordAdventureUsers", JSON.stringify(updatedUsers));

      // Set session
      const userSession = {
        id: migratedUser.id,
        name: migratedUser.name,
        email: migratedUser.email,
        age: migratedUser.age,
        createdAt: migratedUser.createdAt,
        lastLogin: migratedUser.lastLogin
      };
      
      localStorage.setItem("currentUser", JSON.stringify(userSession));
      
      console.log('✅ Legacy user successfully migrated and logged in');
      navigate('/app');
      return true;
    }
    
    return false;
  };

  // Enhanced login with legacy support
  const handleEnhancedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const storedData = localStorage.getItem("wordAdventureUsers");
      const users = JSON.parse(storedData || "[]");

      // First try secure login
      const secureUser = users.find((u: UserData) => 
        u.email?.toLowerCase() === formData.email.toLowerCase() && u.passwordHash
      );

      if (secureUser) {
        const isValid = SecurityUtils.verifyPassword(
          formData.password,
          secureUser.passwordHash,
          secureUser.salt
        );

        if (isValid) {
          // Update last login
          secureUser.lastLogin = new Date().toISOString();
          const updatedUsers = users.map((u: UserData) => 
            u.id === secureUser.id ? secureUser : u
          );
          localStorage.setItem("wordAdventureUsers", JSON.stringify(updatedUsers));

          // Set session
          const userSession = {
            id: secureUser.id,
            name: secureUser.name,
            email: secureUser.email,
            age: secureUser.age,
            createdAt: secureUser.createdAt,
            lastLogin: secureUser.lastLogin
          };
          
          localStorage.setItem("currentUser", JSON.stringify(userSession));
          navigate('/app');
          return;
        }
      }

      // Try legacy login and migration
      const legacySuccess = await handleLegacyLogin(users, formData.email, formData.password);
      
      if (!legacySuccess) {
        setError('Invalid email or password');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  // Guest login function
  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest-' + Date.now(),
      name: 'Guest User',
      email: 'guest@wordykids.com',
      age: 8,
      isGuest: true,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem("currentUser", JSON.stringify(guestUser));
    localStorage.setItem("isGuest", "true");
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to continue your learning adventure</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleEnhancedLogin} className="space-y-6">
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
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
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Guest Login */}
        <div className="mt-6">
          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue as Guest
          </button>
        </div>

        {/* Signup Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            🔒 Secure login with encrypted password protection
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;