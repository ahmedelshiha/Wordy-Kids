import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TreePine,
  Crown,
  Star,
  Heart,
  Shuffle,
  Settings,
  Monitor,
  Smartphone,
  Volume2,
  Zap,
} from "lucide-react";
import { JungleAdventureWordCard } from "@/components/JungleAdventureWordCard";

// Sample jungle adventure words for demo
const jungleWords = [
  {
    id: 1,
    word: "Adventure",
    pronunciation: "/ədˈventʃər/",
    definition:
      "An exciting or unusual experience, especially a journey to explore new places!",
    example:
      "The brave explorer went on a jungle adventure to find hidden treasures.",
    funFact:
      "The word 'adventure' comes from Latin meaning 'to arrive' - just like arriving at new discoveries!",
    emoji: "🌿",
    category: "exploration",
    difficulty: "medium" as const,
    masteryLevel: 75,
  },
  // ...rest omitted in backup
];

export function JungleAdventureWordCardDemo() {
  const [showDemo, setShowDemo] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [adventureStats, setAdventureStats] = useState({
    wordsExplored: 0,
    adventureLevel: 1,
    explorerXP: 0,
    badges: ["first-explorer"],
  });

  const currentWord = jungleWords[currentWordIndex];

  const handleWordMastered = (
    wordId: number,
    rating: "easy" | "medium" | "hard",
  ) => {
    console.log(`Jungle word mastered: ${wordId} with rating: ${rating}`);
    setAdventureStats((prev) => ({
      ...prev,
      wordsExplored: prev.wordsExplored + 1,
      explorerXP:
        prev.explorerXP +
        (rating === "easy" ? 100 : rating === "medium" ? 60 : 30),
      adventureLevel:
        Math.floor(
          (prev.explorerXP +
            (rating === "easy" ? 100 : rating === "medium" ? 60 : 30)) /
            200,
        ) + 1,
    }));
  };

  return null;
}
