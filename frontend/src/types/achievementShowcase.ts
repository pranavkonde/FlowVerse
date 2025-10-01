export interface AchievementShowcase {
  id: string;
  userId: string;
  title: string;
  description: string;
  achievements: ShowcaseAchievement[];
  layout: ShowcaseLayout;
  theme: ShowcaseTheme;
  visibility: ShowcaseVisibility;
  likes: number;
  views: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShowcaseAchievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  progress: number;
  completedAt: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

export type AchievementCategory =
  | 'COMBAT'
  | 'CRAFTING'
  | 'EXPLORATION'
  | 'SOCIAL'
  | 'COLLECTION'
  | 'EVENTS'
  | 'FARMING'
  | 'FISHING'
  | 'TRADING'
  | 'SPECIAL';

export type AchievementRarity =
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY'
  | 'MYTHIC';

export type ShowcaseLayout =
  | 'GRID'
  | 'MASONRY'
  | 'TIMELINE'
  | 'CAROUSEL'
  | 'CUSTOM';

export type ShowcaseTheme =
  | 'DEFAULT'
  | 'DARK'
  | 'LIGHT'
  | 'NEON'
  | 'RETRO'
  | 'NATURE'
  | 'SPACE';

export type ShowcaseVisibility =
  | 'PUBLIC'
  | 'FRIENDS'
  | 'PRIVATE';

export interface ShowcaseStats {
  totalShowcases: number;
  totalAchievements: number;
  rarityDistribution: Record<AchievementRarity, number>;
  categoryDistribution: Record<AchievementCategory, number>;
  mostViewedShowcase: string;
  mostLikedShowcase: string;
  totalViews: number;
  totalLikes: number;
}

export interface ShowcaseComment {
  id: string;
  showcaseId: string;
  userId: string;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShowcaseFilter {
  categories?: AchievementCategory[];
  rarities?: AchievementRarity[];
  layout?: ShowcaseLayout;
  theme?: ShowcaseTheme;
  featured?: boolean;
  sortBy?: 'recent' | 'popular' | 'likes' | 'views';
}