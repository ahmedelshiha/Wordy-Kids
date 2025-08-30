import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniGameShellProps {
  title: string;
  reducedMotion?: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

export const MiniGameShell: React.FC<MiniGameShellProps> = ({
  title,
  reducedMotion = false,
  children,
  onClose,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative w-full max-w-md rounded-3xl border-2 border-white/60 shadow-2xl",
          "bg-gradient-to-br from-educational-blue-light to-educational-purple-light",
          "backdrop-blur-md overflow-hidden",
        )}
      >
        <header className="flex items-center justify-between p-4 bg-white/60">
          <h2 className="text-lg font-extrabold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white text-gray-700 flex items-center justify-center border border-gray-200"
            aria-label="Close mini game"
          >
            <X className="w-5 h-5" />
          </button>
        </header>
        <div
          className={cn(
            "p-4",
            !reducedMotion && "animate-gentle-breath min-h-[360px]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
