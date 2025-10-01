import React, { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { PlayerProfile, AvatarOption, ThemeOption } from '../../types/profile';
import './ProfileCustomization.css';

interface ProfileCustomizationProps {
  playerId: string;
  onClose: () => void;
}

export const ProfileCustomization: React.FC<ProfileCustomizationProps> = ({ playerId, onClose }) => {
  const { 
    profile, 
    avatarOptions, 
    themeOptions, 
    loading, 
    error,
    fetchProfile,
    fetchAvatarOptions,
    fetchThemeOptions,
    updateProfile,
    updateAvatar,
    updateTheme,
    updateSocialSettings
  } = useProfile(playerId);

  const [activeTab, setActiveTab] = useState<'basic' | 'avatar' | 'theme' | 'social'>('basic');
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    socialLinks: {
      discord: '',
      twitter: '',
      twitch: '',
      youtube: ''
    }
  });

  useEffect(() => {
    fetchProfile();
    fetchAvatarOptions();
    fetchThemeOptions();
  }, [playerId]);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName,
        bio: profile.bio,
        socialLinks: profile.socialLinks
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(formData);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleAvatarChange = async (avatarId: string, customizations: any) => {
    try {
      await updateAvatar(avatarId, customizations);
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  const handleThemeChange = async (themeId: string, customColors?: any) => {
    try {
      await updateTheme(themeId, customColors);
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const handleSocialSettingsChange = async (settings: any) => {
    try {
      await updateSocialSettings(settings);
    } catch (error) {
      console.error('Failed to update social settings:', error);
    }
  };

  if (loading) {
    return (
      <div className="profile-customization">
        <div className="loading">Loading profile customization...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-customization">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="profile-customization">
      <div className="customization-header">
        <h2>Profile Customization</h2>
        <div className="header-controls">
          <button onClick={onClose} className="close-btn">×</button>
        </div>
      </div>

      <div className="customization-tabs">
        <button 
          className={activeTab === 'basic' ? 'active' : ''}
          onClick={() => setActiveTab('basic')}
        >
          Basic Info
        </button>
        <button 
          className={activeTab === 'avatar' ? 'active' : ''}
          onClick={() => setActiveTab('avatar')}
        >
          Avatar
        </button>
        <button 
          className={activeTab === 'theme' ? 'active' : ''}
          onClick={() => setActiveTab('theme')}
        >
          Theme
        </button>
        <button 
          className={activeTab === 'social' ? 'active' : ''}
          onClick={() => setActiveTab('social')}
        >
          Social
        </button>
      </div>

      <div className="customization-content">
        {activeTab === 'basic' && (
          <BasicInfoTab 
            formData={formData}
            onFormDataChange={setFormData}
            onSave={handleSaveProfile}
          />
        )}
        {activeTab === 'avatar' && (
          <AvatarTab 
            profile={profile}
            avatarOptions={avatarOptions || []}
            onAvatarChange={handleAvatarChange}
          />
        )}
        {activeTab === 'theme' && (
          <ThemeTab 
            profile={profile}
            themeOptions={themeOptions || []}
            onThemeChange={handleThemeChange}
          />
        )}
        {activeTab === 'social' && (
          <SocialTab 
            profile={profile}
            formData={formData}
            onFormDataChange={setFormData}
            onSocialSettingsChange={handleSocialSettingsChange}
          />
        )}
      </div>
    </div>
  );
};

const BasicInfoTab: React.FC<{
  formData: any;
  onFormDataChange: (data: any) => void;
  onSave: () => void;
}> = ({ formData, onFormDataChange, onSave }) => {
  const handleInputChange = (field: string, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="basic-info-tab">
      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="form-group">
          <label>Display Name</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Enter your display name"
            maxLength={50}
          />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            maxLength={500}
            rows={4}
          />
          <div className="character-count">{formData.bio.length}/500</div>
        </div>
        <button onClick={onSave} className="save-btn">
          Save Changes
        </button>
      </div>
    </div>
  );
};

const AvatarTab: React.FC<{
  profile: PlayerProfile | null;
  avatarOptions: AvatarOption[];
  onAvatarChange: (avatarId: string, customizations: any) => void;
}> = ({ profile, avatarOptions, onAvatarChange }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [customizations, setCustomizations] = useState<any>({});

  useEffect(() => {
    if (profile) {
      setSelectedAvatar(profile.avatar.id);
      setCustomizations(profile.avatar.customizations);
    }
  }, [profile]);

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    const avatar = avatarOptions.find(opt => opt.id === avatarId);
    if (avatar) {
      setCustomizations({
        skinColor: avatar.customizations.skinColor[0],
        hairColor: avatar.customizations.hairColor[0],
        eyeColor: avatar.customizations.eyeColor[0],
        clothingColor: avatar.customizations.clothingColor[0]
      });
    }
  };

  const handleCustomizationChange = (type: string, value: string) => {
    setCustomizations({
      ...customizations,
      [type]: value
    });
  };

  const handleApplyChanges = () => {
    onAvatarChange(selectedAvatar, customizations);
  };

  return (
    <div className="avatar-tab">
      <div className="avatar-selection">
        <h3>Choose Avatar</h3>
        <div className="avatar-grid">
          {avatarOptions.map(option => (
            <div 
              key={option.id}
              className={`avatar-option ${selectedAvatar === option.id ? 'selected' : ''}`}
              onClick={() => handleAvatarSelect(option.id)}
            >
              <div className="avatar-preview">
                <img src={option.imageUrl} alt={option.name} />
              </div>
              <div className="avatar-name">{option.name}</div>
              <div className="avatar-category">{option.category}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedAvatar && (
        <div className="avatar-customization">
          <h3>Customize Appearance</h3>
          <div className="customization-grid">
            <div className="customization-group">
              <label>Skin Color</label>
              <div className="color-options">
                {avatarOptions.find(opt => opt.id === selectedAvatar)?.customizations.skinColor.map(color => (
                  <button
                    key={color}
                    className={`color-option ${customizations.skinColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleCustomizationChange('skinColor', color)}
                  />
                ))}
              </div>
            </div>

            <div className="customization-group">
              <label>Hair Color</label>
              <div className="color-options">
                {avatarOptions.find(opt => opt.id === selectedAvatar)?.customizations.hairColor.map(color => (
                  <button
                    key={color}
                    className={`color-option ${customizations.hairColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleCustomizationChange('hairColor', color)}
                  />
                ))}
              </div>
            </div>

            <div className="customization-group">
              <label>Eye Color</label>
              <div className="color-options">
                {avatarOptions.find(opt => opt.id === selectedAvatar)?.customizations.eyeColor.map(color => (
                  <button
                    key={color}
                    className={`color-option ${customizations.eyeColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleCustomizationChange('eyeColor', color)}
                  />
                ))}
              </div>
            </div>

            <div className="customization-group">
              <label>Clothing Color</label>
              <div className="color-options">
                {avatarOptions.find(opt => opt.id === selectedAvatar)?.customizations.clothingColor.map(color => (
                  <button
                    key={color}
                    className={`color-option ${customizations.clothingColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleCustomizationChange('clothingColor', color)}
                  />
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleApplyChanges} className="apply-btn">
            Apply Changes
          </button>
        </div>
      )}
    </div>
  );
};

const ThemeTab: React.FC<{
  profile: PlayerProfile | null;
  themeOptions: ThemeOption[];
  onThemeChange: (themeId: string, customColors?: any) => void;
}> = ({ profile, themeOptions, onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('');

  useEffect(() => {
    if (profile) {
      setSelectedTheme(profile.theme.id);
    }
  }, [profile]);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    onThemeChange(themeId);
  };

  return (
    <div className="theme-tab">
      <h3>Choose Theme</h3>
      <div className="theme-grid">
        {themeOptions.map(option => (
          <div 
            key={option.id}
            className={`theme-option ${selectedTheme === option.id ? 'selected' : ''} ${!option.isUnlocked ? 'locked' : ''}`}
            onClick={() => option.isUnlocked && handleThemeSelect(option.id)}
          >
            <div 
              className="theme-preview"
              style={{
                background: `linear-gradient(135deg, ${option.primaryColor}, ${option.secondaryColor})`
              }}
            >
              <div className="theme-sample">
                <div className="sample-header" style={{ backgroundColor: option.primaryColor }}></div>
                <div className="sample-content" style={{ backgroundColor: option.backgroundColor }}></div>
                <div className="sample-text" style={{ color: option.textColor }}>Sample Text</div>
              </div>
            </div>
            <div className="theme-name">{option.name}</div>
            {!option.isUnlocked && <div className="locked-indicator">🔒</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const SocialTab: React.FC<{
  profile: PlayerProfile | null;
  formData: any;
  onFormDataChange: (data: any) => void;
  onSocialSettingsChange: (settings: any) => void;
}> = ({ profile, formData, onFormDataChange, onSocialSettingsChange }) => {
  const handleSocialLinkChange = (platform: string, value: string) => {
    onFormDataChange({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [platform]: value
      }
    });
  };

  const handleSaveSocialLinks = () => {
    onSocialSettingsChange({ socialLinks: formData.socialLinks });
  };

  return (
    <div className="social-tab">
      <div className="social-links-section">
        <h3>Social Links</h3>
        <div className="social-links-grid">
          <div className="social-link-group">
            <label>Discord</label>
            <input
              type="text"
              value={formData.socialLinks.discord}
              onChange={(e) => handleSocialLinkChange('discord', e.target.value)}
              placeholder="Your Discord username"
            />
          </div>
          <div className="social-link-group">
            <label>Twitter</label>
            <input
              type="text"
              value={formData.socialLinks.twitter}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              placeholder="@yourusername"
            />
          </div>
          <div className="social-link-group">
            <label>Twitch</label>
            <input
              type="text"
              value={formData.socialLinks.twitch}
              onChange={(e) => handleSocialLinkChange('twitch', e.target.value)}
              placeholder="Your Twitch username"
            />
          </div>
          <div className="social-link-group">
            <label>YouTube</label>
            <input
              type="text"
              value={formData.socialLinks.youtube}
              onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
              placeholder="Your YouTube channel"
            />
          </div>
        </div>
        <button onClick={handleSaveSocialLinks} className="save-btn">
          Save Social Links
        </button>
      </div>

      {profile && (
        <div className="social-features-section">
          <h3>Social Features</h3>
          <div className="social-stats">
            <div className="stat-item">
              <span className="stat-number">{profile.socialFeatures.friendsCount}</span>
              <span className="stat-label">Friends</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{profile.socialFeatures.followersCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{profile.socialFeatures.postsCount}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{profile.socialFeatures.likesReceived}</span>
              <span className="stat-label">Likes</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
