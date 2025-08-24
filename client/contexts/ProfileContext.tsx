import React, { createContext, useContext, ReactNode } from 'react';

interface UserProfile {
  id: string;
  name: string;
  age?: number;
  avatar?: string | { emoji: string; name: string };
  level?: number;
  levelName?: string;
  skillLevel?: number;
  theme?: { gradient: string };
  wordsLearned?: number;
  points?: number;
  streak?: number;
  totalQuizzes?: number;
  accuracy?: number;
  favoriteCategory?: string;
  joinedDate?: string;
  lastActive?: string;
  interests?: string[];
}

interface ProfileContextType {
  currentProfile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
  value: ProfileContextType;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children, value }) => {
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

// Selector hooks for specific profile data to minimize re-renders
export const useProfileSelector = <T,>(selector: (profile: UserProfile | null) => T): T => {
  const { currentProfile } = useProfile();
  return selector(currentProfile);
};

// Common selectors
export const useProfileId = () => useProfileSelector(profile => profile?.id);
export const useProfileName = () => useProfileSelector(profile => profile?.name);
export const useProfileAvatar = () => useProfileSelector(profile => profile?.avatar);
export const useProfileStats = () => useProfileSelector(profile => ({
  wordsLearned: profile?.wordsLearned || 0,
  points: profile?.points || 0,
  streak: profile?.streak || 0,
  accuracy: profile?.accuracy || 0
}));
