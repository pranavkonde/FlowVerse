import { Achievement, ACHIEVEMENTS } from '@/types/achievements';

export class AchievementService {
  private achievements: Map<string, Achievement> = new Map();
  private unlockedAchievements: Set<string> = new Set();
  private onUnlockCallback?: (achievement: Achievement) => void;

  constructor() {
    this.loadAchievements();
    this.loadUnlockedAchievements();
  }

  private loadAchievements(): void {
    ACHIEVEMENTS.forEach(achievement => {
      this.achievements.set(achievement.id, { ...achievement });
    });
  }

  private loadUnlockedAchievements(): void {
    const stored = localStorage.getItem('freeflow_unlocked_achievements');
    if (stored) {
      try {
        const unlocked = JSON.parse(stored);
        this.unlockedAchievements = new Set(unlocked);
      } catch (error) {
        console.error('Failed to load unlocked achievements:', error);
      }
    }
  }

  private saveUnlockedAchievements(): void {
    localStorage.setItem(
      'freeflow_unlocked_achievements',
      JSON.stringify(Array.from(this.unlockedAchievements))
    );
  }

  private saveAchievementProgress(achievementId: string, progress: number): void {
    const stored = localStorage.getItem('freeflow_achievement_progress');
    let progressData: Record<string, number> = {};
    
    if (stored) {
      try {
        progressData = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load achievement progress:', error);
      }
    }
    
    progressData[achievementId] = progress;
    localStorage.setItem('freeflow_achievement_progress', JSON.stringify(progressData));
  }

  private loadAchievementProgress(): void {
    const stored = localStorage.getItem('freeflow_achievement_progress');
    if (stored) {
      try {
        const progressData: Record<string, number> = JSON.parse(stored);
        Object.entries(progressData).forEach(([achievementId, progress]) => {
          const achievement = this.achievements.get(achievementId);
          if (achievement) {
            achievement.progress = progress;
          }
        });
      } catch (error) {
        console.error('Failed to load achievement progress:', error);
      }
    }
  }

  public updateProgress(type: string, value: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    
    this.achievements.forEach(achievement => {
      if (this.unlockedAchievements.has(achievement.id)) return;
      
      let updated = false;
      achievement.requirements.forEach(requirement => {
        if (requirement.type === type) {
          requirement.current = Math.min(requirement.current + value, requirement.value);
          updated = true;
        }
      });
      
      if (updated) {
        // Calculate overall progress
        const totalProgress = achievement.requirements.reduce((sum, req) => sum + req.current, 0);
        const maxProgress = achievement.requirements.reduce((sum, req) => sum + req.value, 0);
        achievement.progress = totalProgress;
        achievement.maxProgress = maxProgress;
        
        this.saveAchievementProgress(achievement.id, achievement.progress);
        
        // Check if achievement is unlocked
        const isUnlocked = achievement.requirements.every(req => req.current >= req.value);
        if (isUnlocked) {
          this.unlockAchievement(achievement);
          newlyUnlocked.push(achievement);
        }
      }
    });
    
    return newlyUnlocked;
  }

  private unlockAchievement(achievement: Achievement): void {
    this.unlockedAchievements.add(achievement.id);
    achievement.unlockedAt = new Date();
    this.saveUnlockedAchievements();
    
    if (this.onUnlockCallback) {
      this.onUnlockCallback(achievement);
    }
  }

  public getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  public getUnlockedAchievements(): Achievement[] {
    return Array.from(this.achievements.values())
      .filter(achievement => this.unlockedAchievements.has(achievement.id));
  }

  public getAchievementsByCategory(category: string): Achievement[] {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.category === category);
  }

  public getAchievementById(id: string): Achievement | undefined {
    return this.achievements.get(id);
  }

  public isUnlocked(achievementId: string): boolean {
    return this.unlockedAchievements.has(achievementId);
  }

  public getTotalPoints(): number {
    return this.getUnlockedAchievements()
      .reduce((total, achievement) => total + achievement.points, 0);
  }

  public getCompletionPercentage(): number {
    const total = this.achievements.size;
    const unlocked = this.unlockedAchievements.size;
    return total > 0 ? Math.round((unlocked / total) * 100) : 0;
  }

  public getRarityStats(): Record<string, number> {
    const stats: Record<string, number> = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    };
    
    this.getUnlockedAchievements().forEach(achievement => {
      stats[achievement.rarity]++;
    });
    
    return stats;
  }

  public getRecentUnlocks(limit: number = 5): Achievement[] {
    return this.getUnlockedAchievements()
      .filter(achievement => achievement.unlockedAt)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
      .slice(0, limit);
  }

  public setOnUnlockCallback(callback: (achievement: Achievement) => void): void {
    this.onUnlockCallback = callback;
  }

  public resetProgress(): void {
    this.unlockedAchievements.clear();
    this.achievements.forEach(achievement => {
      achievement.progress = 0;
      achievement.unlockedAt = undefined;
      achievement.requirements.forEach(req => {
        req.current = 0;
      });
    });
    
    localStorage.removeItem('freeflow_unlocked_achievements');
    localStorage.removeItem('freeflow_achievement_progress');
  }
}

// Singleton instance
export const achievementService = new AchievementService();
