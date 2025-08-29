import { Word } from "../types";

export interface ThemeConfig {
  bg: string;
  icon: string;
  text: string;
  color: string;
  border: string;
}

export function getJungleDifficultyTheme(difficulty: string): ThemeConfig {
  switch (difficulty) {
    case "easy":
      return {
        bg: "bg-gradient-to-r from-jungle-light to-jungle",
        icon: "🌱",
        text: "🌱 Jungle Sprout",
        color: "text-white",
        border: "border-jungle-light",
      };
    case "medium":
      return {
        bg: "bg-gradient-to-r from-sunshine to-bright-orange",
        icon: "🌟",
        text: "🌟 Jungle Explorer",
        color: "text-white",
        border: "border-sunshine",
      };
    case "hard":
      return {
        bg: "bg-gradient-to-r from-coral-red to-red-600",
        icon: "🔥",
        text: "🔥 Jungle Master",
        color: "text-white",
        border: "border-coral-red",
      };
    default:
      return {
        bg: "bg-gradient-to-r from-jungle to-jungle-dark",
        icon: "🗺️",
        text: "🗺️ Explorer",
        color: "text-white",
        border: "border-jungle",
      };
  }
}

export function getRarityColor(rarity: string = "common"): string {
  const rarityStyles = {
    mythical: "from-pink-500 via-purple-500 to-indigo-500 border-pink-400/50",
    legendary: "from-yellow-500 via-orange-500 to-red-500 border-yellow-400/50",
    epic: "from-purple-500 via-indigo-500 to-blue-500 border-purple-400/50",
    rare: "from-blue-500 via-cyan-500 to-teal-500 border-blue-400/50",
    common: "from-green-500 via-emerald-500 to-green-600 border-green-400/50",
  };
  return rarityStyles[rarity as keyof typeof rarityStyles] || rarityStyles.common;
}

export function getJungleCategoryColor(category: string): string {
  const jungleColors = {
    animals: "from-jungle via-green-500 to-emerald-600",
    food: "from-sunshine via-orange-500 to-yellow-600",
    nature: "from-jungle-dark via-green-600 to-jungle",
    objects: "from-purple-500 via-violet-500 to-purple-600",
    body: "from-pink-500 via-rose-500 to-pink-600",
    clothes: "from-indigo-500 via-blue-500 to-indigo-600",
    family: "from-sunshine-dark via-amber-500 to-yellow-500",
    feelings: "from-coral-red via-red-500 to-rose-600",
    colors: "from-playful-purple via-purple-500 to-violet-500",
    numbers: "from-sky via-blue-500 to-cyan-500",
  };
  return jungleColors[category as keyof typeof jungleColors] || "from-jungle via-green-500 to-emerald-600";
}

export function getRarityBadgeStyle(rarity: string): string {
  switch (rarity) {
    case "mythical":
      return "bg-gradient-to-r from-pink-200 to-purple-200 border-pink-400 text-purple-800";
    case "legendary":
      return "bg-gradient-to-r from-yellow-200 to-orange-200 border-yellow-400 text-orange-800";
    case "epic":
      return "bg-gradient-to-r from-purple-200 to-indigo-200 border-purple-400 text-indigo-800";
    case "rare":
      return "bg-gradient-to-r from-blue-200 to-cyan-200 border-blue-400 text-cyan-800";
    default:
      return "bg-gray-200 border-gray-400 text-gray-800";
  }
}

export function getDifficultyStars(difficulty: string): number {
  switch (difficulty) {
    case "easy":
      return 1;
    case "medium":
      return 2;
    case "hard":
      return 3;
    default:
      return 1;
  }
}

export function getCardBackgroundGradient(word: Word): string {
  if (word.rarity) {
    return `bg-gradient-to-br ${getRarityColor(word.rarity)}`;
  }
  return `bg-gradient-to-br ${getJungleCategoryColor(word.category)}`;
}

