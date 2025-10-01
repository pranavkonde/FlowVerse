export interface PlayerProfile {
  playerId: string;
  displayName: string;
  bio: string;
  avatar: Avatar;
  theme: Theme;
  socialLinks: SocialLinks;
  customizationSettings: CustomizationSettings;
  socialFeatures: SocialFeatures;
  createdAt: Date;
  lastUpdated: Date;
}

export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  customizations: AvatarCustomizations;
}

export interface AvatarCustomizations {
  skinColor: string;
  hairColor: string;
  eyeColor: string;
  clothingColor: string;
}

export interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface SocialLinks {
  discord: string;
  twitter: string;
  twitch: string;
  youtube: string;
}

export interface CustomizationSettings {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowFriendRequests: boolean;
  allowMessages: boolean;
  showAchievements: boolean;
  showStatistics: boolean;
}

export interface SocialFeatures {
  friendsCount: number;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  likesReceived: number;
  isVerified: boolean;
  badges: string[];
}

export interface AvatarOption {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  isUnlocked: boolean;
  customizations: {
    skinColor: string[];
    hairColor: string[];
    eyeColor: string[];
    clothingColor: string[];
  };
}

export interface ThemeOption {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  isUnlocked: boolean;
}

export interface SocialSettings {
  privacy: 'public' | 'friends' | 'private';
  visibility: 'visible' | 'hidden';
  socialLinks: Partial<SocialLinks>;
}
