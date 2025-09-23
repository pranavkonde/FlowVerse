export interface SocialShareData {
  type: 'achievement' | 'score' | 'milestone' | 'custom';
  title: string;
  description: string;
  imageUrl?: string;
  gameData?: {
    score?: number;
    level?: number;
    achievement?: string;
    time?: string;
    location?: string;
  };
  hashtags?: string[];
  url?: string;
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  shareUrl: string;
}

export interface SocialShareConfig {
  platforms: SocialPlatform[];
  defaultHashtags: string[];
  autoShare: boolean;
  shareOnAchievement: boolean;
  shareOnHighScore: boolean;
  shareOnMilestone: boolean;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    enabled: true,
    shareUrl: 'https://twitter.com/intent/tweet'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: '#4267B2',
    enabled: true,
    shareUrl: 'https://www.facebook.com/sharer/sharer.php'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0077B5',
    enabled: true,
    shareUrl: 'https://www.linkedin.com/sharing/share-offsite'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: '🤖',
    color: '#FF4500',
    enabled: true,
    shareUrl: 'https://reddit.com/submit'
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '💬',
    color: '#7289DA',
    enabled: true,
    shareUrl: 'https://discord.com/channels'
  }
];

export interface SocialShareEvent {
  id: string;
  timestamp: Date;
  platform: string;
  data: SocialShareData;
  success: boolean;
  error?: string;
}
