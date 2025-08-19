import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";

const avatars = [
  {
    id: "cat",
    emoji: "🐱",
    name: "Whiskers",
    personality: "Curious & Playful",
  },
  { id: "dog", emoji: "🐶", name: "Buddy", personality: "Loyal & Energetic" },
  { id: "lion", emoji: "🦁", name: "Leo", personality: "Brave & Bold" },
  {
    id: "unicorn",
    emoji: "🦄",
    name: "Sparkle",
    personality: "Magical & Creative",
  },
  { id: "dragon", emoji: "🐉", name: "Flame", personality: "Wise & Powerful" },
  { id: "bear", emoji: "🐻", name: "Honey", personality: "Gentle & Strong" },
  { id: "rabbit", emoji: "🐰", name: "Hoppy", personality: "Quick & Clever" },
  { id: "panda", emoji: "🐼", name: "Bamboo", personality: "Calm & Peaceful" },
  { id: "fox", emoji: "🦊", name: "Foxy", personality: "Smart & Sneaky" },
  { id: "penguin", emoji: "🐧", name: "Waddle", personality: "Cool & Fun" },
  { id: "elephant", emoji: "🐘", name: "Memory", personality: "Smart & Kind" },
  { id: "owl", emoji: "🦉", name: "Wise", personality: "Thoughtful & Clever" },
];

const colorThemes = [
  {
    id: "ocean",
    name: "Ocean Blue",
    gradient: "from-blue-400 to-cyan-500",
    accent: "text-blue-600",
  },
  {
    id: "sunset",
    name: "Sunset Orange",
    gradient: "from-orange-400 to-red-500",
    accent: "text-orange-600",
  },
  {
    id: "forest",
    name: "Forest Green",
    gradient: "from-green-400 to-emerald-500",
    accent: "text-green-600",
  },
  {
    id: "purple",
    name: "Royal Purple",
    gradient: "from-purple-400 to-violet-500",
    accent: "text-purple-600",
  },
  {
    id: "pink",
    name: "Pretty Pink",
    gradient: "from-pink-400 to-rose-500",
    accent: "text-pink-600",
  },
  {
    id: "golden",
    name: "Golden Sun",
    gradient: "from-yellow-400 to-orange-500",
    accent: "text-yellow-600",
  },
];

const interests = [
  { id: "animals", name: "Animals", emoji: "🐾" },
  { id: "space", name: "Space", emoji: "🚀" },
  { id: "nature", name: "Nature", emoji: "🌺" },
  { id: "food", name: "Food", emoji: "🍎" },
  { id: "sports", name: "Sports", emoji: "⚽" },
  { id: "music", name: "Music", emoji: "🎵" },
  { id: "art", name: "Art", emoji: "🎨" },
  { id: "books", name: "Books", emoji: "📚" },
  { id: "science", name: "Science", emoji: "🔬" },
];

interface AvatarCustomizationProps {
  onCreateProfile: (profile: any) => void;
  onBack: () => void;
}

export function AvatarCustomization({
  onCreateProfile,
  onBack,
}: AvatarCustomizationProps) {
  const [childName, setChildName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [selectedTheme, setSelectedTheme] = useState(colorThemes[0]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId],
    );
  };

  const handleCreateProfile = () => {
    const newProfile = {
      id: childName.toLowerCase().replace(/\s+/g, ""),
      name: childName,
      avatar: selectedAvatar,
      theme: selectedTheme,
      interests: selectedInterests,
      level: 1,
      points: 0,
      streak: 0,
      wordsLearned: 0,
      createdAt: new Date(),
    };
    onCreateProfile(newProfile);
  };

  const isValidName = childName.length >= 2;
  const canProceed = step === 1 ? isValidName : true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-jungle-light via-sunshine-light to-light-background p-4 relative overflow-hidden">
      {/* Jungle Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        {/* Large Background Elements */}
        <motion.div
          className="absolute top-10 left-10 text-4xl md:text-6xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🌳
        </motion.div>
        <motion.div
          className="absolute top-20 right-20 text-3xl md:text-5xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🦜
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-20 text-3xl md:text-5xl"
          animate={{ rotate: [0, -15, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          🐵
        </motion.div>
        <motion.div
          className="absolute bottom-10 right-10 text-4xl md:text-6xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          🌿
        </motion.div>

        {/* Additional jungle elements */}
        <motion.div
          className="absolute top-1/3 left-5 text-2xl md:text-4xl"
          animate={{ x: [0, 5, -5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          🦋
        </motion.div>
        <motion.div
          className="absolute top-1/2 right-5 text-2xl md:text-4xl"
          animate={{ rotate: [0, 20, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          🐆
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 left-1/4 text-2xl md:text-3xl"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          🌺
        </motion.div>
        <motion.div
          className="absolute top-1/4 right-1/3 text-2xl md:text-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        >
          🦅
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white/90 border-jungle/30 hover:bg-jungle/10 text-navy font-['Baloo_2']"
          >
            <ArrowLeft className="w-4 h-4" />
            🏠 Back
          </Button>
          <motion.h1
            className="text-2xl md:text-4xl font-bold text-navy font-['Baloo_2'] text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            🌟 Create Your Adventure Profile! 🎯
          </motion.h1>
          <div></div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm font-['Baloo_2'] shadow-lg border-2 ${
                    step >= stepNum
                      ? "bg-gradient-to-r from-jungle to-bright-orange text-white border-white/30"
                      : "bg-white/90 text-navy border-jungle/20"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {stepNum}
                </motion.div>
                {stepNum < 4 && (
                  <div
                    className={`w-8 h-2 mx-2 rounded-full ${
                      step > stepNum ? "bg-gradient-to-r from-jungle to-bright-orange" : "bg-white/50"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-jungle/20 rounded-[24px] overflow-hidden">
          <CardContent className="p-8">
            {/* Step 1: Name */}
            {step === 1 && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-2xl font-bold text-navy font-['Baloo_2']">
                  What's your name, young adventurer?
                </h2>
                <p className="text-navy/70 mb-6 font-['Baloo_2']">
                  This is how your learning buddy will know you!
                </p>
                <div className="max-w-md mx-auto">
                  <Label
                    htmlFor="name"
                    className="text-lg font-semibold text-navy font-['Baloo_2']"
                  >
                    🌟 Your Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name..."
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="text-center text-xl py-3 mt-2 border-2 border-jungle/30 focus:border-jungle focus:ring-jungle/20 rounded-xl bg-white/80 font-['Baloo_2']"
                    maxLength={20}
                  />
                  {childName && (
                    <p className="mt-2 text-jungle font-bold font-['Baloo_2']">
                      Hi {childName}! 🌟 Welcome to the jungle!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Avatar */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎭</div>
                  <h2 className="text-2xl font-bold text-navy font-['Baloo_2']">
                    Choose your learning buddy!
                  </h2>
                  <p className="text-navy/70 font-['Baloo_2']">
                    Pick an animal friend to join you on your jungle adventure!
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {avatars.map((avatar) => (
                    <Card
                      key={avatar.id}
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedAvatar.id === avatar.id
                          ? "ring-4 ring-jungle bg-gradient-to-br from-jungle-light/30 to-sunshine-light/30"
                          : "hover:shadow-lg"
                      }`}
                      onClick={() => setSelectedAvatar(avatar)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2">{avatar.emoji}</div>
                        <div className="font-semibold text-navy font-['Baloo_2']">
                          {avatar.name}
                        </div>
                        <div className="text-xs text-navy/70 mt-1 font-['Baloo_2']">
                          {avatar.personality}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center bg-jungle/10 rounded-lg p-4 border-2 border-jungle/20">
                  <p className="font-bold text-jungle font-['Baloo_2']">
                    🎯 Selected: {selectedAvatar.name} {selectedAvatar.emoji}
                  </p>
                  <p className="text-sm text-navy/70 font-['Baloo_2']">
                    {selectedAvatar.personality}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Color Theme */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <h2 className="text-2xl font-bold text-navy font-['Baloo_2']">
                    Pick your favorite colors!
                  </h2>
                  <p className="text-navy/70 font-['Baloo_2']">
                    Choose a color theme that makes you happy!
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {colorThemes.map((theme) => (
                    <Card
                      key={theme.id}
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedTheme.id === theme.id
                          ? "ring-4 ring-jungle"
                          : "hover:shadow-lg"
                      }`}
                      onClick={() => setSelectedTheme(theme)}
                    >
                      <CardContent className="p-4 text-center">
                        <div
                          className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${theme.gradient} mb-3 shadow-lg`}
                        ></div>
                        <div className={`font-semibold ${theme.accent}`}>
                          {theme.name}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center bg-white/90 rounded-lg p-4 border-2 border-jungle/20">
                  <p className="font-bold text-navy mb-2 font-['Baloo_2']">🎨 Preview:</p>
                  <div
                    className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${selectedTheme.gradient} flex items-center justify-center text-4xl mb-2`}
                  >
                    {selectedAvatar.emoji}
                  </div>
                  <p className={`font-semibold ${selectedTheme.accent}`}>
                    {childName} & {selectedAvatar.name}
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Interests */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">❤️</div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    What do you love learning about?
                  </h2>
                  <p className="text-gray-600">
                    Pick your favorite topics! (Choose as many as you like)
                  </p>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {interests.map((interest) => (
                    <Card
                      key={interest.id}
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedInterests.includes(interest.id)
                          ? "ring-4 ring-educational-green bg-gradient-to-br from-green-50 to-blue-50"
                          : "hover:shadow-lg"
                      }`}
                      onClick={() => handleInterestToggle(interest.id)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-3xl mb-1">{interest.emoji}</div>
                        <div className="text-sm font-semibold text-gray-800">
                          {interest.name}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedInterests.length > 0 && (
                  <div className="text-center bg-educational-green/10 rounded-lg p-4">
                    <p className="font-semibold text-educational-green mb-2">
                      Great choices! You'll love learning about:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {selectedInterests.map((interestId) => {
                        const interest = interests.find(
                          (i) => i.id === interestId,
                        );
                        return (
                          <Badge
                            key={interestId}
                            variant="secondary"
                            className="bg-educational-green/20 text-educational-green"
                          >
                            {interest?.emoji} {interest?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Profile Summary */}
                <div className="bg-white rounded-lg p-6 border-2 border-educational-blue/20">
                  <h3 className="text-lg font-bold text-center mb-4 text-gray-800">
                    Your Adventure Profile 🎉
                  </h3>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${selectedTheme.gradient} flex items-center justify-center text-3xl`}
                    >
                      {selectedAvatar.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{childName}</p>
                      <p className="text-sm text-gray-600">
                        Learning with {selectedAvatar.name}
                      </p>
                      <p className={`text-sm ${selectedTheme.accent}`}>
                        {selectedTheme.name} Theme
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="bg-white/90 border-jungle/30 hover:bg-jungle/10 text-navy font-['Baloo_2'] font-semibold"
              >
                🔙 Previous
              </Button>

              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed}
                  className="bg-gradient-to-r from-jungle to-bright-orange hover:from-jungle-dark hover:to-orange-600 text-white font-['Baloo_2'] font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                >
                  🌟 Next Step
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreateProfile}
                  className="bg-gradient-to-r from-jungle to-bright-orange hover:from-jungle-dark hover:to-orange-600 text-white font-['Baloo_2'] font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                >
                  🎯 Start My Adventure! 🚀
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  );
}
