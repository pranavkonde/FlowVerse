import { Request, Response } from 'express';
import { ProfileService } from '../services/ProfileService';

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  /**
   * Get player profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;

      const profile = await this.profileService.getProfile(playerId);

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  /**
   * Update player profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { displayName, bio, avatar, theme, socialLinks } = req.body;

      const updatedProfile = await this.profileService.updateProfile(playerId, {
        displayName,
        bio,
        avatar,
        theme,
        socialLinks
      });

      res.json({
        success: true,
        data: updatedProfile
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  /**
   * Get available avatar options
   */
  async getAvatarOptions(req: Request, res: Response): Promise<void> {
    try {
      const options = await this.profileService.getAvatarOptions();

      res.json({
        success: true,
        data: options
      });
    } catch (error) {
      console.error('Error getting avatar options:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get avatar options'
      });
    }
  }

  /**
   * Get available theme options
   */
  async getThemeOptions(req: Request, res: Response): Promise<void> {
    try {
      const options = await this.profileService.getThemeOptions();

      res.json({
        success: true,
        data: options
      });
    } catch (error) {
      console.error('Error getting theme options:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get theme options'
      });
    }
  }

  /**
   * Update avatar appearance
   */
  async updateAvatar(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { avatarId, customizations } = req.body;

      const result = await this.profileService.updateAvatar(playerId, avatarId, customizations);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update avatar'
      });
    }
  }

  /**
   * Get profile customization settings
   */
  async getCustomizationSettings(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;

      const settings = await this.profileService.getCustomizationSettings(playerId);

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error getting customization settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get customization settings'
      });
    }
  }

  /**
   * Update profile theme
   */
  async updateTheme(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { themeId, customColors } = req.body;

      const result = await this.profileService.updateTheme(playerId, themeId, customColors);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update theme'
      });
    }
  }

  /**
   * Get social profile features
   */
  async getSocialFeatures(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;

      const features = await this.profileService.getSocialFeatures(playerId);

      res.json({
        success: true,
        data: features
      });
    } catch (error) {
      console.error('Error getting social features:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get social features'
      });
    }
  }

  /**
   * Update social profile settings
   */
  async updateSocialSettings(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { privacy, visibility, socialLinks } = req.body;

      const result = await this.profileService.updateSocialSettings(playerId, {
        privacy,
        visibility,
        socialLinks
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error updating social settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update social settings'
      });
    }
  }
}
