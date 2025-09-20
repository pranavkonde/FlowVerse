'use client';

import { useState } from 'react';
import { Settings, Volume2, VolumeX, Mic, MicOff, Monitor, Moon, Sun } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  settings: {
    volume: number;
    isMuted: boolean;
    voiceEnabled: boolean;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  onSettingsChange: (settings: Partial<SettingsPanelProps['settings']>) => void;
}

export default function SettingsPanel({ isOpen, onToggle, settings, onSettingsChange }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange({ [key]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </h2>
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Audio Settings */}
          <div>
            <h3 className="text-white font-medium mb-4">Audio</h3>
            <div className="space-y-4">
              {/* Volume Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Volume</span>
                  <div className="flex items-center gap-2">
                    {localSettings.isMuted ? (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-green-400" />
                    )}
                    <span className="text-slate-400 text-sm">{localSettings.volume}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localSettings.volume}
                    onChange={(e) => handleSettingChange('volume', parseInt(e.target.value))}
                    className="flex-1"
                    disabled={localSettings.isMuted}
                  />
                  <button
                    onClick={() => handleSettingChange('isMuted', !localSettings.isMuted)}
                    className={`p-2 rounded transition-colors ${
                      localSettings.isMuted 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {localSettings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Voice Commands */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-300 text-sm">Voice Commands</span>
                  <p className="text-slate-400 text-xs">Enable speech recognition</p>
                </div>
                <button
                  onClick={() => handleSettingChange('voiceEnabled', !localSettings.voiceEnabled)}
                  className={`p-2 rounded transition-colors ${
                    localSettings.voiceEnabled 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-slate-500/20 text-slate-400'
                  }`}
                >
                  {localSettings.voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div>
            <h3 className="text-white font-medium mb-4">Display</h3>
            <div className="space-y-4">
              {/* Theme Selection */}
              <div>
                <span className="text-slate-300 text-sm mb-2 block">Theme</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSettingChange('theme', 'light')}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                      localSettings.theme === 'light'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>
                  <button
                    onClick={() => handleSettingChange('theme', 'dark')}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                      localSettings.theme === 'dark'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-white font-medium mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-300 text-sm">Enable Notifications</span>
                  <p className="text-slate-400 text-xs">Show system notifications</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications', !localSettings.notifications)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    localSettings.notifications 
                      ? 'bg-green-500' 
                      : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    localSettings.notifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div>
            <h3 className="text-white font-medium mb-4">Game</h3>
            <div className="space-y-4">
              <div>
                <span className="text-slate-300 text-sm mb-2 block">Movement Speed</span>
                <input
                  type="range"
                  min="50"
                  max="300"
                  value="200"
                  className="w-full"
                  disabled
                />
                <p className="text-slate-400 text-xs mt-1">Default speed (200)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onToggle}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
          >
            Save Settings
          </button>
          <button
            onClick={() => {
              setLocalSettings(settings);
              onToggle();
            }}
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
