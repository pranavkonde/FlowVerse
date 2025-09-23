import { SocialShareData, SocialPlatform, SocialShareConfig, SocialShareEvent } from '@/types/social';

class SocialService {
  private config: SocialShareConfig;
  private shareHistory: SocialShareEvent[] = [];

  constructor() {
    this.config = {
      platforms: [
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
      ],
      defaultHashtags: ['#FlowVerse', '#FreeFlow', '#Web3Gaming', '#BlockchainGame'],
      autoShare: false,
      shareOnAchievement: true,
      shareOnHighScore: true,
      shareOnMilestone: true
    };
  }

  getConfig(): SocialShareConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<SocialShareConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  private saveConfig(): void {
    localStorage.setItem('flowverse_social_config', JSON.stringify(this.config));
  }

  private loadConfig(): void {
    const saved = localStorage.getItem('flowverse_social_config');
    if (saved) {
      this.config = { ...this.config, ...JSON.parse(saved) };
    }
  }

  generateShareText(data: SocialShareData): string {
    let text = data.title;
    
    if (data.description) {
      text += `\n\n${data.description}`;
    }

    if (data.gameData) {
      const gameInfo = [];
      if (data.gameData.score) gameInfo.push(`Score: ${data.gameData.score}`);
      if (data.gameData.level) gameInfo.push(`Level: ${data.gameData.level}`);
      if (data.gameData.time) gameInfo.push(`Time: ${data.gameData.time}`);
      if (data.gameData.location) gameInfo.push(`Location: ${data.gameData.location}`);
      
      if (gameInfo.length > 0) {
        text += `\n\n${gameInfo.join(' | ')}`;
      }
    }

    // Add hashtags
    const hashtags = data.hashtags || this.config.defaultHashtags;
    if (hashtags.length > 0) {
      text += `\n\n${hashtags.join(' ')}`;
    }

    return text;
  }

  generateShareUrl(platform: SocialPlatform, data: SocialShareData): string {
    const text = this.generateShareText(data);
    const encodedText = encodeURIComponent(text);
    const encodedUrl = data.url ? encodeURIComponent(data.url) : '';

    switch (platform.id) {
      case 'twitter':
        return `${platform.shareUrl}?text=${encodedText}${encodedUrl ? `&url=${encodedUrl}` : ''}`;
      
      case 'facebook':
        return `${platform.shareUrl}?u=${encodedUrl}&quote=${encodedText}`;
      
      case 'linkedin':
        return `${platform.shareUrl}?url=${encodedUrl}&title=${encodeURIComponent(data.title)}&summary=${encodeURIComponent(data.description)}`;
      
      case 'reddit':
        return `${platform.shareUrl}?url=${encodedUrl}&title=${encodeURIComponent(data.title)}&text=${encodedText}`;
      
      case 'discord':
        // Discord doesn't have a direct share URL, so we'll copy to clipboard
        return '';
      
      default:
        return '';
    }
  }

  async shareToPlatform(platform: SocialPlatform, data: SocialShareData): Promise<boolean> {
    try {
      const shareEvent: SocialShareEvent = {
        id: Date.now().toString(),
        timestamp: new Date(),
        platform: platform.id,
        data,
        success: false
      };

      if (platform.id === 'discord') {
        // Copy to clipboard for Discord
        const text = this.generateShareText(data);
        await navigator.clipboard.writeText(text);
        shareEvent.success = true;
      } else {
        const shareUrl = this.generateShareUrl(platform, data);
        if (shareUrl) {
          window.open(shareUrl, '_blank', 'width=600,height=400');
          shareEvent.success = true;
        }
      }

      this.shareHistory.push(shareEvent);
      this.saveShareHistory();
      return shareEvent.success;
    } catch (error) {
      console.error('Error sharing to platform:', error);
      const shareEvent: SocialShareEvent = {
        id: Date.now().toString(),
        timestamp: new Date(),
        platform: platform.id,
        data,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      this.shareHistory.push(shareEvent);
      this.saveShareHistory();
      return false;
    }
  }

  async shareToAllEnabled(data: SocialShareData): Promise<{ platform: string; success: boolean }[]> {
    const results = [];
    const enabledPlatforms = this.config.platforms.filter(p => p.enabled);

    for (const platform of enabledPlatforms) {
      const success = await this.shareToPlatform(platform, data);
      results.push({ platform: platform.id, success });
    }

    return results;
  }

  getShareHistory(): SocialShareEvent[] {
    return this.shareHistory;
  }

  private saveShareHistory(): void {
    localStorage.setItem('flowverse_social_history', JSON.stringify(this.shareHistory));
  }

  private loadShareHistory(): void {
    const saved = localStorage.getItem('flowverse_social_history');
    if (saved) {
      this.shareHistory = JSON.parse(saved).map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }));
    }
  }

  shouldAutoShare(type: 'achievement' | 'highScore' | 'milestone'): boolean {
    if (!this.config.autoShare) return false;
    
    switch (type) {
      case 'achievement':
        return this.config.shareOnAchievement;
      case 'highScore':
        return this.config.shareOnHighScore;
      case 'milestone':
        return this.config.shareOnMilestone;
      default:
        return false;
    }
  }

  createAchievementShareData(achievement: any): SocialShareData {
    return {
      type: 'achievement',
      title: `🏆 Achievement Unlocked: ${achievement.name}`,
      description: achievement.description,
      gameData: {
        achievement: achievement.name,
        level: achievement.rarity
      },
      hashtags: ['#Achievement', '#FlowVerse', '#Gaming']
    };
  }

  createScoreShareData(score: number, level: number, gameMode: string): SocialShareData {
    return {
      type: 'score',
      title: `🎮 New High Score: ${score.toLocaleString()}`,
      description: `Just achieved a new high score of ${score.toLocaleString()} in ${gameMode}!`,
      gameData: {
        score,
        level,
        time: new Date().toLocaleTimeString()
      },
      hashtags: ['#HighScore', '#FlowVerse', '#Gaming']
    };
  }

  createMilestoneShareData(milestone: string, value: number): SocialShareData {
    return {
      type: 'milestone',
      title: `🎯 Milestone Reached: ${milestone}`,
      description: `Just reached the ${milestone} milestone with ${value.toLocaleString()} points!`,
      gameData: {
        score: value
      },
      hashtags: ['#Milestone', '#FlowVerse', '#Progress']
    };
  }

  // Initialize the service
  init(): void {
    this.loadConfig();
    this.loadShareHistory();
  }
}

export const socialService = new SocialService();
