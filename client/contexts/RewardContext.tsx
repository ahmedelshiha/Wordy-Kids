import React, { createContext, useState, ReactNode, useContext } from "react";
import { RewardPopup } from "@/components/RewardPopup";

export type Reward = {
  title: string;
  message: string;
  icon: string;
  gemsEarned?: number;
  crownLevel?: "bronze" | "silver" | "gold" | "rainbow";
  streakDays?: number;
  type?: "word" | "category" | "streak" | "game";
};

interface RewardContextType {
  showReward: (reward: Reward) => void;
  isRewardActive: boolean;
}

const RewardContext = createContext<RewardContextType | null>(null);

export const RewardProvider = ({ children }: { children: ReactNode }) => {
  const [reward, setReward] = useState<Reward | null>(null);

  const showReward = (r: Reward) => {
    setReward(r);
  };

  const hideReward = () => {
    setReward(null);
  };

  return (
    <RewardContext.Provider value={{ showReward, isRewardActive: !!reward }}>
      {children}
      {reward && (
        <RewardPopup
          title={reward.title}
          message={reward.message}
          rewardIcon={reward.icon}
          gemsEarned={reward.gemsEarned}
          crownLevel={reward.crownLevel}
          streakDays={reward.streakDays}
          type={reward.type}
          onClose={hideReward}
        />
      )}
    </RewardContext.Provider>
  );
};

export const useReward = () => {
  const ctx = useContext(RewardContext);
  if (!ctx) throw new Error("useReward must be used within RewardProvider");
  return ctx;
};
