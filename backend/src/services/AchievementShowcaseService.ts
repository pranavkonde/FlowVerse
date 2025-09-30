import { EventEmitter } from 'events';
import { AchievementService } from './AchievementService';
import { SocialService } from './SocialService';
import { LeaderboardService } from './LeaderboardService';

export interface Showcase {
  id: string;
  userId: string;
  title: string;
  description: string;
  achievements: ShowcaseAchievement[];
  layout: 'grid' | 'list' | 'timeline';
  theme: ShowcaseTheme;
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShowcaseAchievement {
  id: string;
  achievementId: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  customDescription?: string;
  customStyle?: {
    borderColor?: string;
    backgroundColor?: string;
    glowEffect?: boolean;
    animation?: string;
  };
}

export interface ShowcaseTheme {
  id: string;
  name: string;
  backgroundColor: string;
  backgroundImage?: string;
  borderStyle: string;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  effects: {
    particles?: boolean;
    glow?: boolean;
    parallax?: boolean;
    animation?: string;
  };
}

export class AchievementShowcaseService extends EventEmitter {
  private static instance: AchievementShowcaseService;
  private showcases: Map<string, Showcase> = new Map();
  private userShowcases: Map<string, Set<string>> = new Map();
  private showcaseViews: Map<string, Set<string>> = new Map(); // showcaseId -> Set of userIds
  private showcaseLikes: Map<string, Set<string>> = new Map(); // showcaseId -> Set of userIds

  private readonly DEFAULT_THEMES: ShowcaseTheme[] = [
    {
      id: 'classic',
      name: 'Classic',
      backgroundColor: '#1a1a1a',
      borderStyle: 'solid',
      fontFamily: 'Arial',
      primaryColor: '#ffffff',
      secondaryColor: '#cccccc',
      accentColor: '#ffd700',
      effects: {}
    },
    {
      id: 'neon',
      name: 'Neon Dreams',
      backgroundColor: '#000000',
      borderStyle: 'glow',
      fontFamily: 'Cyberpunk',
      primaryColor: '#00ff00',
      secondaryColor: '#ff00ff',
      accentColor: '#00ffff',
      effects: {
        glow: true,
        particles: true
      }
    },
    {
      id: 'royal',
      name: 'Royal',
      backgroundColor: '#2c1810',
      backgroundImage: '/assets/themes/royal_pattern.png',
      borderStyle: 'ornate',
      fontFamily: 'Serif',
      primaryColor: '#ffd700',
      secondaryColor: '#c0c0c0',
      accentColor: '#8b0000',
      effects: {
        parallax: true
      }
    }
  ];

  private constructor(
    private achievementService: AchievementService,
    private socialService: SocialService,
    private leaderboardService: LeaderboardService
  ) {
    super();
  }

  static getInstance(
    achievementService: AchievementService,
    socialService: SocialService,
    leaderboardService: LeaderboardService
  ): AchievementShowcaseService {
    if (!AchievementShowcaseService.instance) {
      AchievementShowcaseService.instance = new AchievementShowcaseService(
        achievementService,
        socialService,
        leaderboardService
      );
    }
    return AchievementShowcaseService.instance;
  }

  async createShowcase(
    userId: string,
    data: {
      title: string;
      description: string;
      layout: Showcase['layout'];
      themeId: string;
      isPublic: boolean;
    }
  ): Promise<Showcase> {
    const theme = this.DEFAULT_THEMES.find(t => t.id === data.themeId) || this.DEFAULT_THEMES[0];

    const showcase: Showcase = {
      id: crypto.randomUUID(),
      userId,
      title: data.title,
      description: data.description,
      achievements: [],
      layout: data.layout,
      theme,
      isPublic: data.isPublic,
      likes: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.showcases.set(showcase.id, showcase);
    
    const userShowcases = this.userShowcases.get(userId) || new Set();
    userShowcases.add(showcase.id);
    this.userShowcases.set(userId, userShowcases);

    this.emit('showcaseCreated', showcase);
    return showcase;
  }

  async addAchievementToShowcase(
    showcaseId: string,
    userId: string,
    data: Omit<ShowcaseAchievement, 'id'>
  ): Promise<ShowcaseAchievement> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase || showcase.userId !== userId) {
      throw new Error('Showcase not found or unauthorized');
    }

    const achievement: ShowcaseAchievement = {
      id: crypto.randomUUID(),
      ...data
    };

    showcase.achievements.push(achievement);
    showcase.updatedAt = new Date();
    this.showcases.set(showcaseId, showcase);

    this.emit('achievementAdded', { showcase, achievement });
    return achievement;
  }

  async updateAchievementInShowcase(
    showcaseId: string,
    achievementId: string,
    userId: string,
    updates: Partial<Omit<ShowcaseAchievement, 'id' | 'achievementId'>>
  ): Promise<ShowcaseAchievement> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase || showcase.userId !== userId) {
      throw new Error('Showcase not found or unauthorized');
    }

    const achievement = showcase.achievements.find(a => a.id === achievementId);
    if (!achievement) {
      throw new Error('Achievement not found in showcase');
    }

    Object.assign(achievement, updates);
    showcase.updatedAt = new Date();
    this.showcases.set(showcaseId, showcase);

    this.emit('achievementUpdated', { showcase, achievement });
    return achievement;
  }

  async removeAchievementFromShowcase(
    showcaseId: string,
    achievementId: string,
    userId: string
  ): Promise<boolean> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase || showcase.userId !== userId) {
      throw new Error('Showcase not found or unauthorized');
    }

    const index = showcase.achievements.findIndex(a => a.id === achievementId);
    if (index === -1) {
      return false;
    }

    showcase.achievements.splice(index, 1);
    showcase.updatedAt = new Date();
    this.showcases.set(showcaseId, showcase);

    this.emit('achievementRemoved', { showcase, achievementId });
    return true;
  }

  async updateShowcase(
    showcaseId: string,
    userId: string,
    updates: Partial<Pick<Showcase, 'title' | 'description' | 'layout' | 'isPublic'>>
  ): Promise<Showcase> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase || showcase.userId !== userId) {
      throw new Error('Showcase not found or unauthorized');
    }

    Object.assign(showcase, updates);
    showcase.updatedAt = new Date();
    this.showcases.set(showcaseId, showcase);

    this.emit('showcaseUpdated', showcase);
    return showcase;
  }

  async deleteShowcase(showcaseId: string, userId: string): Promise<boolean> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase || showcase.userId !== userId) {
      throw new Error('Showcase not found or unauthorized');
    }

    this.showcases.delete(showcaseId);
    
    const userShowcases = this.userShowcases.get(userId);
    if (userShowcases) {
      userShowcases.delete(showcaseId);
    }

    this.emit('showcaseDeleted', { showcaseId, userId });
    return true;
  }

  async getShowcase(showcaseId: string): Promise<Showcase | null> {
    return this.showcases.get(showcaseId) || null;
  }

  async getUserShowcases(userId: string): Promise<Showcase[]> {
    const showcaseIds = this.userShowcases.get(userId) || new Set();
    return Array.from(showcaseIds)
      .map(id => this.showcases.get(id))
      .filter((showcase): showcase is Showcase => showcase !== undefined);
  }

  async getPublicShowcases(limit: number = 10, offset: number = 0): Promise<Showcase[]> {
    return Array.from(this.showcases.values())
      .filter(showcase => showcase.isPublic)
      .sort((a, b) => b.likes - a.likes || b.views - a.views)
      .slice(offset, offset + limit);
  }

  async viewShowcase(showcaseId: string, viewerId: string): Promise<void> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase) return;

    const views = this.showcaseViews.get(showcaseId) || new Set();
    if (!views.has(viewerId)) {
      views.add(viewerId);
      this.showcaseViews.set(showcaseId, views);
      showcase.views = views.size;
      this.showcases.set(showcaseId, showcase);
      this.emit('showcaseViewed', { showcaseId, viewerId });
    }
  }

  async likeShowcase(showcaseId: string, likerId: string): Promise<boolean> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase) return false;

    const likes = this.showcaseLikes.get(showcaseId) || new Set();
    if (!likes.has(likerId)) {
      likes.add(likerId);
      this.showcaseLikes.set(showcaseId, likes);
      showcase.likes = likes.size;
      this.showcases.set(showcaseId, showcase);
      this.emit('showcaseLiked', { showcaseId, likerId });
      return true;
    }
    return false;
  }

  async unlikeShowcase(showcaseId: string, likerId: string): Promise<boolean> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase) return false;

    const likes = this.showcaseLikes.get(showcaseId);
    if (likes?.has(likerId)) {
      likes.delete(likerId);
      this.showcaseLikes.set(showcaseId, likes);
      showcase.likes = likes.size;
      this.showcases.set(showcaseId, showcase);
      this.emit('showcaseUnliked', { showcaseId, likerId });
      return true;
    }
    return false;
  }

  async getShowcaseThemes(): Promise<ShowcaseTheme[]> {
    return this.DEFAULT_THEMES;
  }

  onShowcaseCreated(callback: (showcase: Showcase) => void) {
    this.on('showcaseCreated', callback);
  }

  onShowcaseUpdated(callback: (showcase: Showcase) => void) {
    this.on('showcaseUpdated', callback);
  }

  onShowcaseDeleted(callback: (data: { showcaseId: string; userId: string }) => void) {
    this.on('showcaseDeleted', callback);
  }

  onAchievementAdded(callback: (data: { showcase: Showcase; achievement: ShowcaseAchievement }) => void) {
    this.on('achievementAdded', callback);
  }

  onAchievementUpdated(callback: (data: { showcase: Showcase; achievement: ShowcaseAchievement }) => void) {
    this.on('achievementUpdated', callback);
  }

  onAchievementRemoved(callback: (data: { showcase: Showcase; achievementId: string }) => void) {
    this.on('achievementRemoved', callback);
  }

  onShowcaseViewed(callback: (data: { showcaseId: string; viewerId: string }) => void) {
    this.on('showcaseViewed', callback);
  }

  onShowcaseLiked(callback: (data: { showcaseId: string; likerId: string }) => void) {
    this.on('showcaseLiked', callback);
  }

  onShowcaseUnliked(callback: (data: { showcaseId: string; likerId: string }) => void) {
    this.on('showcaseUnliked', callback);
  }
}

export const achievementShowcaseService = AchievementShowcaseService.getInstance(
  new AchievementService(),
  new SocialService(),
  new LeaderboardService()
);
