'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Crown, Award, X, Share2 } from 'lucide-react';
import { Achievement, ACHIEVEMENT_CATEGORIES } from '@/types/achievements';
import { achievementService } from '@/services/AchievementService';
import { socialService } from '@/services/SocialService';
import SocialShare from './SocialShare';

interface AchievementSystemProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function AchievementSystem({ isVisible, onToggle }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    setAchievements(achievementService.getAchievements());
    
    // Set up achievement unlock callback
    achievementService.setOnUnlockCallback((achievement) => {
      setNewUnlock(achievement);
      setAchievements(achievementService.getAchievements());
      
      // Auto-share if enabled
      if (socialService.shouldAutoShare('achievement')) {
        const shareData = socialService.createAchievementShareData(achievement);
        socialService.shareToAllEnabled(shareData);
      }
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNewUnlock(null), 5000);
    });
  }, []);

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="w-4 h-4 text-gray-400" />;
      case 'rare': return <Zap className="w-4 h-4 text-blue-400" />;
      case 'epic': return <Award className="w-4 h-4 text-purple-400" />;
      case 'legendary': return <Crown className="w-4 h-4 text-yellow-400" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-400/10';
      case 'rare': return 'border-blue-400 bg-blue-400/10';
      case 'epic': return 'border-purple-400 bg-purple-400/10';
      case 'legendary': return 'border-yellow-400 bg-yellow-400/10';
      default: return 'border-gray-400 bg-gray-400/10';
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const totalPoints = achievementService.getTotalPoints();
  const completionPercentage = achievementService.getCompletionPercentage();
  const rarityStats = achievementService.getRarityStats();

  const handleShareAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowSocialShare(true);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Achievement Unlock Notification */}
      {newUnlock && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className={`bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-2xl border-2 ${getRarityColor(newUnlock.rarity)}`}>
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <div className="font-bold text-lg">Achievement Unlocked!</div>
                <div className="text-sm">{newUnlock.name}</div>
                <div className="text-xs opacity-90">{newUnlock.description}</div>
              </div>
              <button
                onClick={() => setNewUnlock(null)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Achievement Panel */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-slate-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-white text-xl font-bold">Achievements</h2>
              <div className="text-slate-300 text-sm">
                {completionPercentage}% Complete
              </div>
            </div>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="bg-slate-700/50 p-4 border-b border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-medium">Total Points: {totalPoints}</div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-gray-400" />
                  <span className="text-slate-300">{rarityStats.common}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300">{rarityStats.rare}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300">{rarityStats.epic}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-300">{rarityStats.legendary}</span>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex h-96">
            {/* Category Sidebar */}
            <div className="w-48 bg-slate-700/50 p-4 border-r border-slate-600">
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left p-2 rounded transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  All Achievements
                </button>
                {ACHIEVEMENT_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-2 rounded transition-colors flex items-center gap-2 ${
                      selectedCategory === category.id 
                        ? 'bg-blue-500 text-white' 
                        : 'text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Achievements List */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAchievements.map(achievement => {
                  const isUnlocked = achievementService.isUnlocked(achievement.id);
                  const progressPercentage = achievement.maxProgress > 0 
                    ? Math.round((achievement.progress / achievement.maxProgress) * 100) 
                    : 0;

                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isUnlocked 
                          ? getRarityColor(achievement.rarity)
                          : 'border-slate-600 bg-slate-700/50'
                      } ${isUnlocked ? 'opacity-100' : 'opacity-60'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <h3 className={`font-medium ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                              {achievement.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              {getRarityIcon(achievement.rarity)}
                              <span className="text-xs text-slate-400 capitalize">
                                {achievement.rarity}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold">
                            {achievement.points} pts
                          </div>
                          {isUnlocked && (
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-green-400">
                                ✓ Unlocked
                              </div>
                              <button
                                onClick={() => handleShareAchievement(achievement)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Share Achievement"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-3">
                        {achievement.description}
                      </p>
                      
                      {!isUnlocked && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Progress</span>
                            <span>{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-slate-400">
                            {achievement.progress} / {achievement.maxProgress}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Share Modal */}
      {showSocialShare && selectedAchievement && (
        <SocialShare
          isVisible={showSocialShare}
          onToggle={() => setShowSocialShare(false)}
          shareData={socialService.createAchievementShareData(selectedAchievement)}
        />
      )}
    </>
  );
}
