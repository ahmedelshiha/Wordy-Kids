import React from "react";
import { LogOut, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface DynamicAuthButtonProps {
  variant?: "sidebar" | "mobile";
  className?: string;
  onAction?: () => void; // Called when button is clicked (for closing menus, etc.)
}

export const DynamicAuthButton: React.FC<DynamicAuthButtonProps> = ({
  variant = "sidebar",
  className = "",
  onAction,
}) => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onAction) onAction();

    if (isGuest) {
      // Navigate to signup for guest users
      navigate("/signup");
    } else {
      // Sign out for authenticated users
      logout();
    }
  };

  // Determine button content based on user status
  const getButtonContent = () => {
    if (isGuest) {
      return {
        icon: <span className="text-lg animate-sparkle">✨</span>,
        text: "Enter Magic Portal",
        subtitle: "Start your word adventure!",
        bgGradient: "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500",
        hoverEffect: "hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 hover:scale-105",
        borderColor: "border-yellow-300",
        iconBg: "bg-white/20 backdrop-blur-sm",
        sparkles: true,
      };
    } else {
      return {
        icon: <span className="text-lg">🚪</span>,
        text: "Exit Portal",
        subtitle: "See you later, adventurer!",
        bgGradient: "bg-gradient-to-r from-orange-400 to-red-500",
        hoverEffect: "hover:from-orange-500 hover:to-red-600 hover:scale-105",
        borderColor: "border-orange-300",
        iconBg: "bg-white/20 backdrop-blur-sm",
        sparkles: false,
      };
    }
  };

  const content = getButtonContent();

  if (variant === "mobile") {
    return (
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-3 p-4 rounded-2xl ${content.bgGradient} text-white transition-all duration-300 transform ${content.hoverEffect} border-2 ${content.borderColor} shadow-xl animate-kid-pulse-glow ${className}`}
      >
        <div className={`p-3 rounded-xl ${content.iconBg} shadow-lg relative`}>
          {content.icon}
          {content.sparkles && (
            <div className="absolute -top-1 -right-1 text-xs animate-kid-magic-sparkle">
              ⭐
            </div>
          )}
        </div>
        <div className="text-left flex-1">
          <span className="font-kid-friendly font-bold text-lg block text-shadow">
            {content.text}
          </span>
          <div className="text-sm text-yellow-200 font-kid-friendly mt-1">
            {content.subtitle}
          </div>
        </div>
        {content.sparkles && (
          <div className="flex flex-col gap-1">
            <span className="text-lg animate-gentle-bounce">🌈</span>
            <span className="text-sm animate-sparkle animation-delay-200">✨</span>
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-4 p-5 rounded-2xl ${content.bgGradient} text-white transition-all duration-300 transform ${content.hoverEffect} border-3 ${content.borderColor} shadow-2xl animate-kid-pulse-glow ${className}`}
    >
      <div className={`p-3 rounded-xl ${content.iconBg} shadow-lg relative`}>
        {content.icon}
        {content.sparkles && (
          <div className="absolute -top-1 -right-1 text-sm animate-kid-magic-sparkle">
            ⭐
          </div>
        )}
      </div>
      <div className="text-left flex-1">
        <span className="font-kid-friendly font-bold text-xl block text-shadow">
          {content.text}
        </span>
        <span className="text-base text-yellow-200 font-kid-friendly block mt-1">
          {content.subtitle}
        </span>
      </div>
      {content.sparkles && (
        <div className="flex flex-col gap-2">
          <span className="text-2xl animate-gentle-bounce">🌈</span>
          <span className="text-lg animate-sparkle animation-delay-200">✨</span>
          <span className="text-sm animate-gentle-float animation-delay-100">🌟</span>
        </div>
      )}
    </button>
  );
};

export default DynamicAuthButton;
