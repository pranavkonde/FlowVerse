import { EventEmitter } from 'events';
import {
  AchievementShowcase,
  ShowcaseAchievement,
  ShowcaseStats,
  ShowcaseComment,
  ShowcaseFilter,
  ShowcaseLayout,
  ShowcaseTheme,
  ShowcaseVisibility,
  AchievementCategory,
  AchievementRarity
} from '../types/achievementShowcase';

export class AchievementShowcaseService extends EventEmitter {
  private showcases: Map<string, AchievementShowcase> = new Map();
  private comments: Map<string, ShowcaseComment[]> = new Map();
  private userStats: Map<string, ShowcaseStats> = new Map();

  constructor() {
    super();
    this.startFeaturedRotation();
  }

  private startFeaturedRotation(): void {
    // Rotate featured showcases daily
    setInterval(() => {
      const showcases = Array.from(this.showcases.values());
      const currentFeatured = showcases.filter(s => s.featured);
      const nonFeatured = showcases.filter(s => !s.featured && s.visibility === 'PUBLIC');

      // Unfeature current featured showcases
      currentFeatured.forEach(showcase => {
        showcase.featured = false;
        this.showcases.set(showcase.id, showcase);
      });

      // Feature new showcases
      const newFeatured = nonFeatured
        .sort((a, b) => (b.likes + b.views) - (a.likes + a.views))
        .slice(0, 5);

      newFeatured.forEach(showcase => {
        showcase.featured = true;
        this.showcases.set(showcase.id, showcase);
        this.emit('showcase:featured', { showcaseId: showcase.id });
      });
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }

  public async createShowcase(
    userId: string,
    data: Partial<AchievementShowcase>
  ): Promise<AchievementShowcase> {
    const showcase: AchievementShowcase = {
      id: `SHOWCASE-${Date.now()}`,
      userId,
      title: data.title || 'My Achievement Showcase',
      description: data.description || '',
      achievements: data.achievements || [],
      layout: data.layout || 'GRID',
      theme: data.theme || 'DEFAULT',
      visibility: data.visibility || 'PUBLIC',
      likes: 0,
      views: 0,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.showcases.set(showcase.id, showcase);
    this.updateUserStats(userId);
    this.emit('showcase:created', { showcaseId: showcase.id });

    return showcase;
  }

  public async updateShowcase(
    userId: string,
    showcaseId: string,
    updates: Partial<AchievementShowcase>
  ): Promise<AchievementShowcase> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase || showcase.userId !== userId) {
      throw new Error('Showcase not found or unauthorized');
    }

    const updatedShowcase = {
      ...showcase,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.showcases.set(showcaseId, updatedShowcase);
    this.emit('showcase:updated', { showcaseId });

    return updatedShowcase;
  }

  public async addAchievement(
    userId: string,
    showcaseId: string,
    achievement: ShowcaseAchievement
  ): Promise<AchievementShowcase> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase || showcase.userId !== userId) {
      throw new Error('Showcase not found or unauthorized');
    }

    showcase.achievements.push(achievement);
    showcase.updatedAt = new Date().toISOString();

    this.showcases.set(showcaseId, showcase);
    this.updateUserStats(userId);
    this.emit('showcase:achievement-added', { showcaseId, achievementId: achievement.id });

    return showcase;
  }

  public async removeAchievement(
    userId: string,
    showcaseId: string,
    achievementId: string
  ): Promise<AchievementShowcase> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase || showcase.userId !== userId) {
      throw new Error('Showcase not found or unauthorized');
    }

    showcase.achievements = showcase.achievements.filter(
      a => a.id !== achievementId
    );
    showcase.updatedAt = new Date().toISOString();

    this.showcases.set(showcaseId, showcase);
    this.updateUserStats(userId);
    this.emit('showcase:achievement-removed', { showcaseId, achievementId });

    return showcase;
  }

  public async updateAchievementPosition(
    userId: string,
    showcaseId: string,
    achievementId: string,
    position: { x: number; y: number },
    scale?: number,
    rotation?: number
  ): Promise<AchievementShowcase> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase || showcase.userId !== userId) {
      throw new Error('Showcase not found or unauthorized');
    }

    showcase.achievements = showcase.achievements.map(achievement =>
      achievement.id === achievementId
        ? {
            ...achievement,
            position,
            ...(scale !== undefined && { scale }),
            ...(rotation !== undefined && { rotation })
          }
        : achievement
    );
    showcase.updatedAt = new Date().toISOString();

    this.showcases.set(showcaseId, showcase);
    this.emit('showcase:achievement-moved', { showcaseId, achievementId });

    return showcase;
  }

  public async likeShowcase(
    userId: string,
    showcaseId: string
  ): Promise<AchievementShowcase> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase) {
      throw new Error('Showcase not found');
    }

    showcase.likes++;
    this.showcases.set(showcaseId, showcase);
    this.emit('showcase:liked', { showcaseId, userId });

    return showcase;
  }

  public async viewShowcase(
    userId: string,
    showcaseId: string
  ): Promise<AchievementShowcase> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase) {
      throw new Error('Showcase not found');
    }

    showcase.views++;
    this.showcases.set(showcaseId, showcase);
    this.emit('showcase:viewed', { showcaseId, userId });

    return showcase;
  }

  public async addComment(
    userId: string,
    showcaseId: string,
    content: string
  ): Promise<ShowcaseComment> {
    const showcase = this.showcases.get(showcaseId);
    if (!showcase) {
      throw new Error('Showcase not found');
    }

    const comment: ShowcaseComment = {
      id: `COMMENT-${Date.now()}`,
      showcaseId,
      userId,
      content,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const comments = this.comments.get(showcaseId) || [];
    comments.push(comment);
    this.comments.set(showcaseId, comments);

    this.emit('showcase:commented', { showcaseId, commentId: comment.id });

    return comment;
  }

  public async getShowcaseComments(
    showcaseId: string
  ): Promise<ShowcaseComment[]> {
    return this.comments.get(showcaseId) || [];
  }

  public async getUserShowcases(userId: string): Promise<AchievementShowcase[]> {
    return Array.from(this.showcases.values()).filter(
      showcase => showcase.userId === userId
    );
  }

  public async getPublicShowcases(
    filter?: ShowcaseFilter
  ): Promise<AchievementShowcase[]> {
    let showcases = Array.from(this.showcases.values()).filter(
      showcase => showcase.visibility === 'PUBLIC'
    );

    if (filter) {
      if (filter.categories) {
        showcases = showcases.filter(showcase =>
          showcase.achievements.some(a =>
            filter.categories!.includes(a.category)
          )
        );
      }

      if (filter.rarities) {
        showcases = showcases.filter(showcase =>
          showcase.achievements.some(a =>
            filter.rarities!.includes(a.rarity)
          )
        );
      }

      if (filter.layout) {
        showcases = showcases.filter(s => s.layout === filter.layout);
      }

      if (filter.theme) {
        showcases = showcases.filter(s => s.theme === filter.theme);
      }

      if (filter.featured !== undefined) {
        showcases = showcases.filter(s => s.featured === filter.featured);
      }

      if (filter.sortBy) {
        switch (filter.sortBy) {
          case 'recent':
            showcases.sort((a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            break;
          case 'popular':
            showcases.sort((a, b) =>
              (b.likes + b.views) - (a.likes + a.views)
            );
            break;
          case 'likes':
            showcases.sort((a, b) => b.likes - a.likes);
            break;
          case 'views':
            showcases.sort((a, b) => b.views - a.views);
            break;
        }
      }
    }

    return showcases;
  }

  private updateUserStats(userId: string): void {
    const userShowcases = Array.from(this.showcases.values()).filter(
      showcase => showcase.userId === userId
    );

    const stats: ShowcaseStats = {
      totalShowcases: userShowcases.length,
      totalAchievements: userShowcases.reduce(
        (sum, showcase) => sum + showcase.achievements.length,
        0
      ),
      rarityDistribution: {} as Record<AchievementRarity, number>,
      categoryDistribution: {} as Record<AchievementCategory, number>,
      mostViewedShowcase: '',
      mostLikedShowcase: '',
      totalViews: 0,
      totalLikes: 0
    };

    let maxViews = 0;
    let maxLikes = 0;

    userShowcases.forEach(showcase => {
      stats.totalViews += showcase.views;
      stats.totalLikes += showcase.likes;

      if (showcase.views > maxViews) {
        maxViews = showcase.views;
        stats.mostViewedShowcase = showcase.id;
      }

      if (showcase.likes > maxLikes) {
        maxLikes = showcase.likes;
        stats.mostLikedShowcase = showcase.id;
      }

      showcase.achievements.forEach(achievement => {
        stats.rarityDistribution[achievement.rarity] =
          (stats.rarityDistribution[achievement.rarity] || 0) + 1;
        stats.categoryDistribution[achievement.category] =
          (stats.categoryDistribution[achievement.category] || 0) + 1;
      });
    });

    this.userStats.set(userId, stats);
  }

  public async getUserStats(userId: string): Promise<ShowcaseStats> {
    return (
      this.userStats.get(userId) || {
        totalShowcases: 0,
        totalAchievements: 0,
        rarityDistribution: {},
        categoryDistribution: {},
        mostViewedShowcase: '',
        mostLikedShowcase: '',
        totalViews: 0,
        totalLikes: 0
      }
    );
  }
}