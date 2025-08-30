import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GameRewardOverlayProps {
  show: boolean;
  correct?: boolean;
  message?: string;
}

export const GameRewardOverlay: React.FC<GameRewardOverlayProps> = ({ show, correct = true, message }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="relative" aria-live="polite" aria-atomic="true">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-5xl" aria-hidden>
              {correct ? "✨" : "🌀"}
            </div>
          </motion.div>
          {message && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/80 rounded-full px-3 py-1 text-sm font-bold"
            >
              {message}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};
