import { useState, useEffect } from 'react';
import { 
  PlayerProfile, 
  AvatarOption, 
  ThemeOption, 
  CustomizationSettings,
  SocialFeatures 
} from '../types/profile';

interface UseProfileReturn {
  profile: PlayerProfile | null;
  avatarOptions: AvatarOption[] | null;
  themeOptions: ThemeOption[] | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  fetchAvatarOptions: () => Promise<void>;
  fetchThemeOptions: () => Promise<void>;
  updateProfile: (updates: Partial<PlayerProfile>) => Promise<void>;
  updateAvatar: (avatarId: string, customizations: any) => Promise<void>;
  updateTheme: (themeId: string, customColors?: any) => Promise<void>;
  updateSocialSettings: (settings: any) => Promise<void>;
}

export const useProfile = (playerId: string): UseProfileReturn => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [avatarOptions, setAvatarOptions] = useState<AvatarOption[] | null>(null);
  const [themeOptions, setThemeOptions] = useState<ThemeOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const fetchProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/profile/${playerId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setProfile(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvatarOptions = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/profile/avatar-options`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setAvatarOptions(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch avatar options');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching avatar options:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchThemeOptions = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/profile/theme-options`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setThemeOptions(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch theme options');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching theme options:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<PlayerProfile>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/profile/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setProfile(result.data);
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (avatarId: string, customizations: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/profile/${playerId}/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarId, customizations }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh profile to get updated avatar
        await fetchProfile();
      } else {
        throw new Error(result.message || 'Failed to update avatar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error updating avatar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (themeId: string, customColors?: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/profile/${playerId}/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ themeId, customColors }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh profile to get updated theme
        await fetchProfile();
      } else {
        throw new Error(result.message || 'Failed to update theme');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error updating theme:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSocialSettings = async (settings: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/profile/${playerId}/social`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh profile to get updated settings
        await fetchProfile();
      } else {
        throw new Error(result.message || 'Failed to update social settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error updating social settings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch data when playerId changes
  useEffect(() => {
    if (playerId) {
      fetchProfile();
      fetchAvatarOptions();
      fetchThemeOptions();
    }
  }, [playerId]);

  return {
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
    updateSocialSettings,
  };
};
