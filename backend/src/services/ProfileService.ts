import { 
  PlayerProfile, 
  AvatarOption, 
  ThemeOption, 
  CustomizationSettings, 
  SocialFeatures,
  SocialSettings 
} from '../types/profile';

export class ProfileService {
  private profiles: Map<string, PlayerProfile> = new Map();
  private avatarOptions: AvatarOption[] = [];
  private themeOptions: ThemeOption[] = [];

  constructor() {
    this.initializeAvatarOptions();
    this.initializeThemeOptions();
  }

  /**
   * Get player profile
   */
  async getProfile(playerId: string): Promise<PlayerProfile> {
    try {
      if (!this.profiles.has(playerId)) {
        // Initialize default profile for new player
        const defaultProfile: PlayerProfile = {
          playerId,
          displayName: `Player_${playerId.slice(-6)}`,
          bio: 'Welcome to FlowVerse!',
          avatar: {
            id: 'default_avatar',
            name: 'Default Avatar',
            imageUrl: '/images/avatars/default.png',
            customizations: {
              skinColor: '#fdbcb4',
              hairColor: '#8b4513',
              eyeColor: '#000000',
              clothingColor: '#3498db'
            }
          },
          theme: {
            id: 'default_theme',
            name: 'Default Theme',
            primaryColor: '#3498db',
            secondaryColor: '#2c3e50',
            backgroundColor: '#ecf0f1',
            textColor: '#2c3e50'
          },
          socialLinks: {
            discord: '',
            twitter: '',
            twitch: '',
            youtube: ''
          },
          customizationSettings: {
            showOnlineStatus: true,
            showLastSeen: true,
            allowFriendRequests: true,
            allowMessages: true,
            showAchievements: true,
            showStatistics: true
          },
          socialFeatures: {
            friendsCount: 0,
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            likesReceived: 0,
            isVerified: false,
            badges: []
          },
          createdAt: new Date(),
          lastUpdated: new Date()
        };
        this.profiles.set(playerId, defaultProfile);
      }

      return this.profiles.get(playerId)!;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw new Error('Failed to get profile');
    }
  }

  /**
   * Update player profile
   */
  async updateProfile(playerId: string, updates: Partial<PlayerProfile>): Promise<PlayerProfile> {
    try {
      const profile = await this.getProfile(playerId);
      
      const updatedProfile: PlayerProfile = {
        ...profile,
        ...updates,
        lastUpdated: new Date()
      };

      this.profiles.set(playerId, updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Get available avatar options
   */
  async getAvatarOptions(): Promise<AvatarOption[]> {
    return this.avatarOptions;
  }

  /**
   * Get available theme options
   */
  async getThemeOptions(): Promise<ThemeOption[]> {
    return this.themeOptions;
  }

  /**
   * Update avatar appearance
   */
  async updateAvatar(playerId: string, avatarId: string, customizations: any): Promise<{ success: boolean; message: string }> {
    try {
      const profile = await this.getProfile(playerId);
      const avatarOption = this.avatarOptions.find(option => option.id === avatarId);
      
      if (!avatarOption) {
        throw new Error('Avatar option not found');
      }

      profile.avatar = {
        id: avatarId,
        name: avatarOption.name,
        imageUrl: avatarOption.imageUrl,
        customizations: {
          ...profile.avatar.customizations,
          ...customizations
        }
      };

      this.profiles.set(playerId, profile);

      return {
        success: true,
        message: 'Avatar updated successfully'
      };
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw new Error('Failed to update avatar');
    }
  }

  /**
   * Get customization settings
   */
  async getCustomizationSettings(playerId: string): Promise<CustomizationSettings> {
    try {
      const profile = await this.getProfile(playerId);
      return profile.customizationSettings;
    } catch (error) {
      console.error('Error getting customization settings:', error);
      throw new Error('Failed to get customization settings');
    }
  }

  /**
   * Update profile theme
   */
  async updateTheme(playerId: string, themeId: string, customColors?: any): Promise<{ success: boolean; message: string }> {
    try {
      const profile = await this.getProfile(playerId);
      const themeOption = this.themeOptions.find(option => option.id === themeId);
      
      if (!themeOption) {
        throw new Error('Theme option not found');
      }

      profile.theme = {
        id: themeId,
        name: themeOption.name,
        primaryColor: customColors?.primaryColor || themeOption.primaryColor,
        secondaryColor: customColors?.secondaryColor || themeOption.secondaryColor,
        backgroundColor: customColors?.backgroundColor || themeOption.backgroundColor,
        textColor: customColors?.textColor || themeOption.textColor
      };

      this.profiles.set(playerId, profile);

      return {
        success: true,
        message: 'Theme updated successfully'
      };
    } catch (error) {
      console.error('Error updating theme:', error);
      throw new Error('Failed to update theme');
    }
  }

  /**
   * Get social features
   */
  async getSocialFeatures(playerId: string): Promise<SocialFeatures> {
    try {
      const profile = await this.getProfile(playerId);
      return profile.socialFeatures;
    } catch (error) {
      console.error('Error getting social features:', error);
      throw new Error('Failed to get social features');
    }
  }

  /**
   * Update social settings
   */
  async updateSocialSettings(playerId: string, settings: Partial<SocialSettings>): Promise<{ success: boolean; message: string }> {
    try {
      const profile = await this.getProfile(playerId);
      
      profile.customizationSettings = {
        ...profile.customizationSettings,
        ...settings
      };

      if (settings.socialLinks) {
        profile.socialLinks = {
          ...profile.socialLinks,
          ...settings.socialLinks
        };
      }

      this.profiles.set(playerId, profile);

      return {
        success: true,
        message: 'Social settings updated successfully'
      };
    } catch (error) {
      console.error('Error updating social settings:', error);
      throw new Error('Failed to update social settings');
    }
  }

  // Helper methods
  private initializeAvatarOptions(): void {
    this.avatarOptions = [
      {
        id: 'default_avatar',
        name: 'Default Avatar',
        imageUrl: '/images/avatars/default.png',
        category: 'basic',
        isUnlocked: true,
        customizations: {
          skinColor: ['#fdbcb4', '#fd9843', '#8d5524', '#c68642'],
          hairColor: ['#8b4513', '#000000', '#ffd700', '#ff69b4'],
          eyeColor: ['#000000', '#8b4513', '#0066cc', '#00cc66'],
          clothingColor: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12']
        }
      },
      {
        id: 'warrior_avatar',
        name: 'Warrior',
        imageUrl: '/images/avatars/warrior.png',
        category: 'class',
        isUnlocked: true,
        customizations: {
          skinColor: ['#fdbcb4', '#fd9843', '#8d5524', '#c68642'],
          hairColor: ['#8b4513', '#000000', '#ffd700', '#ff69b4'],
          eyeColor: ['#000000', '#8b4513', '#0066cc', '#00cc66'],
          clothingColor: ['#8b4513', '#2c3e50', '#e74c3c', '#f39c12']
        }
      },
      {
        id: 'mage_avatar',
        name: 'Mage',
        imageUrl: '/images/avatars/mage.png',
        category: 'class',
        isUnlocked: true,
        customizations: {
          skinColor: ['#fdbcb4', '#fd9843', '#8d5524', '#c68642'],
          hairColor: ['#8b4513', '#000000', '#ffd700', '#ff69b4'],
          eyeColor: ['#000000', '#8b4513', '#0066cc', '#00cc66'],
          clothingColor: ['#9b59b6', '#8e44ad', '#3498db', '#2c3e50']
        }
      },
      {
        id: 'archer_avatar',
        name: 'Archer',
        imageUrl: '/images/avatars/archer.png',
        category: 'class',
        isUnlocked: true,
        customizations: {
          skinColor: ['#fdbcb4', '#fd9843', '#8d5524', '#c68642'],
          hairColor: ['#8b4513', '#000000', '#ffd700', '#ff69b4'],
          eyeColor: ['#000000', '#8b4513', '#0066cc', '#00cc66'],
          clothingColor: ['#27ae60', '#2ecc71', '#f39c12', '#e67e22']
        }
      }
    ];
  }

  private initializeThemeOptions(): void {
    this.themeOptions = [
      {
        id: 'default_theme',
        name: 'Default',
        primaryColor: '#3498db',
        secondaryColor: '#2c3e50',
        backgroundColor: '#ecf0f1',
        textColor: '#2c3e50',
        isUnlocked: true
      },
      {
        id: 'dark_theme',
        name: 'Dark Mode',
        primaryColor: '#e74c3c',
        secondaryColor: '#34495e',
        backgroundColor: '#2c3e50',
        textColor: '#ecf0f1',
        isUnlocked: true
      },
      {
        id: 'nature_theme',
        name: 'Nature',
        primaryColor: '#27ae60',
        secondaryColor: '#2ecc71',
        backgroundColor: '#d5f4e6',
        textColor: '#1e8449',
        isUnlocked: true
      },
      {
        id: 'ocean_theme',
        name: 'Ocean',
        primaryColor: '#3498db',
        secondaryColor: '#5dade2',
        backgroundColor: '#ebf3fd',
        textColor: '#1b4f72',
        isUnlocked: true
      },
      {
        id: 'sunset_theme',
        name: 'Sunset',
        primaryColor: '#e67e22',
        secondaryColor: '#f39c12',
        backgroundColor: '#fef9e7',
        textColor: '#b7950b',
        isUnlocked: true
      },
      {
        id: 'royal_theme',
        name: 'Royal',
        primaryColor: '#9b59b6',
        secondaryColor: '#8e44ad',
        backgroundColor: '#f4ecf7',
        textColor: '#6c3483',
        isUnlocked: false
      }
    ];
  }
}
