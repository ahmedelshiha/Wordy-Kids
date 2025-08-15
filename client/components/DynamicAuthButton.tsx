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
        icon: <UserPlus className="w-5 h-5 text-green-600" />,
        text: "Sign Up",
        bgColor: "bg-green-100",
        hoverBg: "hover:bg-green-50",
        borderColor: "border-green-200",
        iconBg: "bg-green-100",
      };
    } else {
      return {
        icon: <LogOut className="w-5 h-5 text-red-600" />,
        text: "Sign Out",
        bgColor: "bg-red-100",
        hoverBg: "hover:bg-red-50",
        borderColor: "border-red-200",
        iconBg: "bg-red-100",
      };
    }
  };

  const content = getButtonContent();

  if (variant === "mobile") {
    return (
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-3 p-3 rounded-xl bg-white text-gray-700 transition-all border ${content.borderColor} ${content.hoverBg} ${className}`}
      >
        <div className={`p-2 rounded-lg ${content.iconBg}`}>{content.icon}</div>
        <span className="font-semibold text-left">
          {content.text}
          {isGuest && (
            <div className="text-xs text-gray-500 mt-1">
              Create your account to save progress
            </div>
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-white text-gray-700 transition-all border ${content.borderColor} ${content.hoverBg} ${className}`}
    >
      <div className={`p-2 rounded-xl ${content.iconBg}`}>{content.icon}</div>
      <div className="text-left">
        <span className="font-semibold block">{content.text}</span>
        {isGuest && (
          <span className="text-xs text-gray-500 block mt-1">
            Create your account to save progress
          </span>
        )}
      </div>
    </button>
  );
};

export default DynamicAuthButton;
