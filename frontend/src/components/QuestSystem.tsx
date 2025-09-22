'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Target, Trophy, Clock, Star, Lock, CheckCircle, AlertCircle, Zap, Crown, Shield, Sword } from 'lucide-react';
import { Quest, QuestLog, QuestStats, QuestFilters } from '@/types/quests';
import { questService } from '@/services/QuestService';

interface QuestSystemProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function QuestSystem({ isVisible, onToggle }: QuestSystemProps) {
  const [questLog, setQuestLog] = useState<QuestLog | null>(null);
  const [stats, setStats] = useState<QuestStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<'active' | 'available' | 'completed' | 'daily' | 'weekly'>('active');
  const [filters, setFilters] = useState<QuestFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isVisible) {
      loadQuestLog();
      loadStats();
    }
  }, [isVisible]);

  const loadQuestLog = () => {
    const log = questService.getQuestLog();
    setQuestLog(log);
  };

  const loadStats = () => {
    const questStats = questService.getStats();
    setStats(questStats);
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Shield className="w-4 h-4 text-green-400" />;
      case 'medium': return <Sword className="w-4 h-4 text-yellow-400" />;
      case 'hard': return <Zap className="w-4 h-4 text-orange-400" />;
      case 'expert': return <Crown className="w-4 h-4 text-red-400" />;
      default: return <Shield className="w-4 h-4 text-green-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'border-green-400 bg-green-400/10';
      case 'medium': return 'border-yellow-400 bg-yellow-400/10';
      case 'hard': return 'border-orange-400 bg-orange-400/10';
      case 'expert': return 'border-red-400 bg-red-400/10';
      default: return 'border-green-400 bg-green-400/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'weekly': return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'story': return <BookOpen className="w-4 h-4 text-green-400" />;
      case 'event': return <Star className="w-4 h-4 text-yellow-400" />;
      case 'achievement': return <Trophy className="w-4 h-4 text-orange-400" />;
      default: return <Target className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Target className="w-4 h-4 text-blue-400" />;
      case 'active': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'expired': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'locked': return <Lock className="w-4 h-4 text-slate-400" />;
      default: return <Target className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleStartQuest = (questId: string) => {
    const success = questService.startQuest(questId);
    if (success) {
      loadQuestLog();
    }
  };

  const handleCompleteObjective = (questId: string, objectiveId: string) => {
    const success = questService.completeObjective(questId, objectiveId);
    if (success) {
      loadQuestLog();
    }
  };

  const getQuestsForTab = () => {
    if (!questLog) return [];

    switch (selectedTab) {
      case 'active': return questLog.activeQuests;
      case 'available': return questLog.availableQuests;
      case 'completed': return questLog.completedQuests;
      case 'daily': return questLog.dailyQuests;
      case 'weekly': return questLog.weeklyQuests;
      default: return [];
    }
  };

  const formatTimeRemaining = (expiresAt?: Date) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();
    const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
    
    if (hoursLeft < 1) return 'Expires soon!';
    if (hoursLeft < 24) return `${hoursLeft}h left`;
    return `${Math.ceil(hoursLeft / 24)}d left`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <h2 className="text-white text-2xl font-bold">Quest System</h2>
            </div>
            <div className="flex items-center gap-4">
              {stats && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300">Level {stats.questMasterLevel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">{stats.completedQuests} Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">{Math.round(stats.completionRate)}% Rate</span>
                  </div>
                </div>
              )}
              <button
                onClick={onToggle}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-600 rounded-lg p-1">
            {[
              { id: 'active', label: 'Active', count: questLog?.activeQuests.length || 0 },
              { id: 'available', label: 'Available', count: questLog?.availableQuests.length || 0 },
              { id: 'completed', label: 'Completed', count: questLog?.completedQuests.length || 0 },
              { id: 'daily', label: 'Daily', count: questLog?.dailyQuests.length || 0 },
              { id: 'weekly', label: 'Weekly', count: questLog?.weeklyQuests.length || 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-500'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-96">
          {/* Quest List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {getQuestsForTab().map(quest => (
                <div
                  key={quest.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    quest.status === 'active' 
                      ? 'border-yellow-400 bg-yellow-400/10' 
                      : quest.status === 'completed'
                        ? 'border-green-400 bg-green-400/10'
                        : quest.status === 'locked'
                          ? 'border-slate-400 bg-slate-400/10 opacity-60'
                          : 'border-slate-600 bg-slate-700/50'
                  }`}
                >
                  {/* Quest Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(quest.status)}
                      <div>
                        <h3 className="text-white font-bold text-lg">{quest.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          {getTypeIcon(quest.type)}
                          <span className="capitalize">{quest.type}</span>
                          <span>•</span>
                          {getDifficultyIcon(quest.difficulty)}
                          <span className="capitalize">{quest.difficulty}</span>
                          <span>•</span>
                          <span>Level {quest.levelRequirement}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {quest.timeLimit && (
                        <div className="flex items-center gap-1 text-orange-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimeRemaining(quest.expiresAt)}</span>
                        </div>
                      )}
                      {quest.progress > 0 && (
                        <div className="text-yellow-400 text-sm font-medium">
                          {quest.progress}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quest Description */}
                  <p className="text-slate-300 text-sm mb-4">{quest.description}</p>

                  {/* Objectives */}
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Objectives:</h4>
                    <div className="space-y-2">
                      {quest.objectives.map(objective => (
                        <div
                          key={objective.id}
                          className={`flex items-center gap-2 p-2 rounded ${
                            objective.isCompleted 
                              ? 'bg-green-400/20 text-green-300' 
                              : 'bg-slate-600/50 text-slate-300'
                          }`}
                        >
                          {objective.isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-400" />
                          )}
                          <span className="text-sm">{objective.description}</span>
                          <span className="text-xs text-slate-400 ml-auto">
                            {objective.current}/{objective.target}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Rewards:</h4>
                    <div className="flex flex-wrap gap-2">
                      {quest.rewards.map((reward, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-slate-600 px-2 py-1 rounded text-sm"
                        >
                          <span>{reward.icon}</span>
                          <span className="text-slate-300">{reward.amount} {reward.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {quest.status === 'available' && (
                      <button
                        onClick={() => handleStartQuest(quest.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                      >
                        Start Quest
                      </button>
                    )}
                    {quest.status === 'active' && (
                      <button
                        onClick={() => handleCompleteObjective(quest.id, quest.objectives[0].id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                      >
                        Complete Objective
                      </button>
                    )}
                    {quest.status === 'locked' && (
                      <div className="text-slate-400 text-sm">
                        Complete prerequisites to unlock
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {getQuestsForTab().length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-2">No quests found</div>
                <div className="text-slate-500 text-sm">
                  {selectedTab === 'active' 
                    ? 'Start a quest to see it here'
                    : 'Check back later for new quests'
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-700/50 p-4 border-t border-slate-600">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              Complete quests to earn rewards and progress through the game!
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors">
                Quest Chains
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
