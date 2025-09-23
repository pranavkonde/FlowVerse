'use client';

import { useState, useEffect } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Reddit, MessageCircle, Settings, Copy, Check, X } from 'lucide-react';
import { SocialShareData, SocialPlatform } from '@/types/social';
import { socialService } from '@/services/SocialService';

interface SocialShareProps {
  isVisible: boolean;
  onToggle: () => void;
  shareData?: SocialShareData;
  onShareComplete?: (results: { platform: string; success: boolean }[]) => void;
}

export default function SocialShare({ isVisible, onToggle, shareData, onShareComplete }: SocialShareProps) {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [customShareData, setCustomShareData] = useState<SocialShareData>({
    type: 'custom',
    title: '',
    description: '',
    hashtags: []
  });
  const [isSharing, setIsSharing] = useState(false);
  const [shareResults, setShareResults] = useState<{ platform: string; success: boolean }[]>([]);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    socialService.init();
    setPlatforms(socialService.getConfig().platforms);
  }, []);

  const currentData = shareData || customShareData;

  const getPlatformIcon = (platformId: string) => {
    switch (platformId) {
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'reddit': return <Reddit className="w-5 h-5" />;
      case 'discord': return <MessageCircle className="w-5 h-5" />;
      default: return <Share2 className="w-5 h-5" />;
    }
  };

  const handleShareToPlatform = async (platform: SocialPlatform) => {
    setIsSharing(true);
    try {
      const success = await socialService.shareToPlatform(platform, currentData);
      setShareResults(prev => [...prev, { platform: platform.id, success }]);
    } catch (error) {
      console.error('Error sharing:', error);
      setShareResults(prev => [...prev, { platform: platform.id, success: false }]);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareToAll = async () => {
    setIsSharing(true);
    setShareResults([]);
    try {
      const results = await socialService.shareToAllEnabled(currentData);
      setShareResults(results);
      onShareComplete?.(results);
    } catch (error) {
      console.error('Error sharing to all platforms:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = socialService.generateShareText(currentData);
      await navigator.clipboard.writeText(text);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const togglePlatform = (platformId: string) => {
    const updatedPlatforms = platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, enabled: !platform.enabled }
        : platform
    );
    setPlatforms(updatedPlatforms);
    socialService.updateConfig({ platforms: updatedPlatforms });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-xl font-bold">Share to Social Media</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-400 hover:text-white transition-colors p-2"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Share Content Preview */}
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2">Share Preview</h3>
            <div className="text-slate-300 text-sm whitespace-pre-wrap">
              {socialService.generateShareText(currentData)}
            </div>
          </div>

          {/* Custom Share Data (if no shareData provided) */}
          {!shareData && (
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={customShareData.title}
                  onChange={(e) => setCustomShareData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter share title..."
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Description</label>
                <textarea
                  value={customShareData.description}
                  onChange={(e) => setCustomShareData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none h-24 resize-none"
                  placeholder="Enter share description..."
                />
              </div>
            </div>
          )}

          {/* Platform Settings */}
          {showSettings && (
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-3">Platform Settings</h3>
              <div className="space-y-2">
                {platforms.map(platform => (
                  <div key={platform.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <span className="text-white">{platform.name}</span>
                    </div>
                    <button
                      onClick={() => togglePlatform(platform.id)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        platform.enabled ? 'bg-blue-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        platform.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {platforms.filter(p => p.enabled).map(platform => (
                <button
                  key={platform.id}
                  onClick={() => handleShareToPlatform(platform)}
                  disabled={isSharing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: platform.color }}
                >
                  {getPlatformIcon(platform.id)}
                  {platform.name}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleShareToAll}
                disabled={isSharing}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 hover:from-blue-600 hover:to-purple-700"
              >
                {isSharing ? 'Sharing...' : 'Share to All Platforms'}
              </button>
              
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center gap-2 bg-slate-600 text-white py-3 px-4 rounded-lg font-medium transition-colors hover:bg-slate-500"
              >
                {copiedToClipboard ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copiedToClipboard ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
          </div>

          {/* Share Results */}
          {shareResults.length > 0 && (
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-3">Share Results</h3>
              <div className="space-y-2">
                {shareResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-300 capitalize">{result.platform}</span>
                    <div className={`flex items-center gap-2 ${
                      result.success ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.success ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Success</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          <span className="text-sm">Failed</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
