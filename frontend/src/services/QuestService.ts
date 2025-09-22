import { Quest, QuestChain, QuestLog, QuestNotification, QuestStats, QuestFilters } from '@/types/quests';

class QuestService {
  private quests: Quest[] = [];
  private questChains: QuestChain[] = [];
  private notifications: QuestNotification[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock quests
    this.quests = [
      {
        id: 'quest1',
        title: 'First Steps in Free Flow',
        description: 'Welcome to Free Flow! Complete your first exploration of the city.',
        type: 'story',
        category: 'exploration',
        difficulty: 'easy',
        status: 'available',
        requirements: [
          {
            type: 'level',
            value: 1,
            description: 'Be at least level 1',
            isMet: true
          }
        ],
        rewards: [
          {
            type: 'experience',
            value: 'xp',
            amount: 100,
            description: '100 Experience Points',
            icon: '⭐'
          },
          {
            type: 'coins',
            value: 'coins',
            amount: 50,
            description: '50 Coins',
            icon: '💰'
          }
        ],
        objectives: [
          {
            id: 'obj1',
            description: 'Visit the Central Plaza',
            type: 'visit',
            target: 'central_plaza',
            current: 0,
            isCompleted: false,
            isOptional: false
          },
          {
            id: 'obj2',
            description: 'Talk to 3 NPCs',
            type: 'talk',
            target: 3,
            current: 0,
            isCompleted: false,
            isOptional: false
          }
        ],
        levelRequirement: 1,
        prerequisites: [],
        repeatable: false,
        createdAt: new Date(),
        progress: 0
      },
      {
        id: 'quest2',
        title: 'Daily Trading Challenge',
        description: 'Complete 5 trades in the marketplace today.',
        type: 'daily',
        category: 'trading',
        difficulty: 'medium',
        status: 'available',
        requirements: [
          {
            type: 'level',
            value: 5,
            description: 'Be at least level 5',
            isMet: true
          }
        ],
        rewards: [
          {
            type: 'experience',
            value: 'xp',
            amount: 200,
            description: '200 Experience Points',
            icon: '⭐'
          },
          {
            type: 'coins',
            value: 'coins',
            amount: 100,
            description: '100 Coins',
            icon: '💰'
          },
          {
            type: 'achievement',
            value: 'daily_trader',
            amount: 1,
            description: 'Daily Trader Badge',
            icon: '🏆'
          }
        ],
        objectives: [
          {
            id: 'obj3',
            description: 'Complete 5 trades',
            type: 'trade',
            target: 5,
            current: 0,
            isCompleted: false,
            isOptional: false
          }
        ],
        timeLimit: 1440, // 24 hours
        levelRequirement: 5,
        prerequisites: [],
        repeatable: true,
        cooldown: 24,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        progress: 0
      },
      {
        id: 'quest3',
        title: 'The Lost Artifact',
        description: 'Find the legendary artifact hidden somewhere in the city.',
        type: 'story',
        category: 'exploration',
        difficulty: 'hard',
        status: 'locked',
        requirements: [
          {
            type: 'level',
            value: 10,
            description: 'Be at least level 10',
            isMet: false
          },
          {
            type: 'quest',
            value: 'quest1',
            description: 'Complete "First Steps in Free Flow"',
            isMet: true
          }
        ],
        rewards: [
          {
            type: 'experience',
            value: 'xp',
            amount: 500,
            description: '500 Experience Points',
            icon: '⭐'
          },
          {
            type: 'items',
            value: 'legendary_artifact',
            amount: 1,
            description: 'Legendary Artifact',
            icon: '🏺'
          },
          {
            type: 'achievement',
            value: 'artifact_hunter',
            amount: 1,
            description: 'Artifact Hunter Badge',
            icon: '🏆'
          }
        ],
        objectives: [
          {
            id: 'obj4',
            description: 'Search 10 different locations',
            type: 'explore',
            target: 10,
            current: 0,
            isCompleted: false,
            isOptional: false
          },
          {
            id: 'obj5',
            description: 'Find the artifact',
            type: 'collect',
            target: 'legendary_artifact',
            current: 0,
            isCompleted: false,
            isOptional: false
          }
        ],
        levelRequirement: 10,
        prerequisites: ['quest1'],
        repeatable: false,
        createdAt: new Date(),
        progress: 0
      }
    ];

    // Mock quest chains
    this.questChains = [
      {
        id: 'chain1',
        name: 'The Newcomer\'s Journey',
        description: 'A series of quests to help new players get started',
        quests: ['quest1', 'quest2'],
        currentQuest: 0,
        isCompleted: false,
        rewards: [
          {
            type: 'achievement',
            value: 'journey_complete',
            amount: 1,
            description: 'Journey Complete Badge',
            icon: '🏆'
          }
        ],
        theme: 'beginner',
        icon: '🌟'
      }
    ];
  }

  // Get quest log
  getQuestLog(): QuestLog {
    const activeQuests = this.quests.filter(q => q.status === 'active');
    const completedQuests = this.quests.filter(q => q.status === 'completed');
    const availableQuests = this.quests.filter(q => q.status === 'available');
    const dailyQuests = this.quests.filter(q => q.type === 'daily');
    const weeklyQuests = this.quests.filter(q => q.type === 'weekly');

    return {
      activeQuests,
      completedQuests,
      availableQuests,
      questChains: this.questChains,
      dailyQuests,
      weeklyQuests,
      totalQuestsCompleted: completedQuests.length,
      totalExperienceEarned: completedQuests.reduce((sum, q) => 
        sum + q.rewards.filter(r => r.type === 'experience').reduce((s, r) => s + r.amount, 0), 0),
      favoriteQuestType: this.getFavoriteQuestType(),
      longestQuestChain: Math.max(...this.questChains.map(c => c.quests.length))
    };
  }

  // Get quests with filters
  getQuests(filters?: QuestFilters): Quest[] {
    let filteredQuests = [...this.quests];

    if (filters) {
      if (filters.type) {
        filteredQuests = filteredQuests.filter(q => q.type === filters.type);
      }

      if (filters.category) {
        filteredQuests = filteredQuests.filter(q => q.category === filters.category);
      }

      if (filters.difficulty) {
        filteredQuests = filteredQuests.filter(q => q.difficulty === filters.difficulty);
      }

      if (filters.status) {
        filteredQuests = filteredQuests.filter(q => q.status === filters.status);
      }

      if (filters.levelRange) {
        filteredQuests = filteredQuests.filter(q => 
          q.levelRequirement >= filters.levelRange!.min && 
          q.levelRequirement <= filters.levelRange!.max
        );
      }

      if (filters.timeRemaining) {
        const now = Date.now();
        filteredQuests = filteredQuests.filter(q => {
          if (!q.expiresAt) return true;
          const timeLeft = q.expiresAt.getTime() - now;
          const hoursLeft = timeLeft / (1000 * 60 * 60);

          switch (filters.timeRemaining) {
            case 'urgent': return hoursLeft < 1;
            case 'soon': return hoursLeft < 6;
            case 'plenty': return hoursLeft > 6;
            default: return true;
          }
        });
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredQuests = filteredQuests.filter(q => 
          q.title.toLowerCase().includes(query) ||
          q.description.toLowerCase().includes(query)
        );
      }
    }

    return filteredQuests;
  }

  // Start a quest
  startQuest(questId: string): boolean {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest || quest.status !== 'available') return false;

    // Check requirements
    const allRequirementsMet = quest.requirements.every(req => req.isMet);
    if (!allRequirementsMet) return false;

    quest.status = 'active';
    quest.progress = 0;

    this.addNotification({
      type: 'quest_started',
      questId: quest.id,
      title: 'Quest Started',
      message: `You started "${quest.title}"`,
      isRead: false,
      createdAt: new Date()
    });

    return true;
  }

  // Complete a quest objective
  completeObjective(questId: string, objectiveId: string): boolean {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest || quest.status !== 'active') return false;

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective || objective.isCompleted) return false;

    objective.current++;
    objective.isCompleted = objective.current >= objective.target;

    // Update quest progress
    const completedObjectives = quest.objectives.filter(obj => obj.isCompleted).length;
    quest.progress = Math.round((completedObjectives / quest.objectives.length) * 100);

    // Check if quest is completed
    const allObjectivesCompleted = quest.objectives.every(obj => obj.isCompleted || obj.isOptional);
    if (allObjectivesCompleted) {
      this.completeQuest(questId);
    }

    this.addNotification({
      type: 'objective_completed',
      questId: quest.id,
      title: 'Objective Completed',
      message: `Completed: ${objective.description}`,
      isRead: false,
      createdAt: new Date()
    });

    return true;
  }

  // Complete a quest
  private completeQuest(questId: string): void {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return;

    quest.status = 'completed';
    quest.completedAt = new Date();
    quest.progress = 100;

    this.addNotification({
      type: 'quest_completed',
      questId: quest.id,
      title: 'Quest Completed!',
      message: `Congratulations! You completed "${quest.title}"`,
      isRead: false,
      createdAt: new Date(),
      rewards: quest.rewards
    });

    // Update quest chains
    this.updateQuestChains(questId);
  }

  // Update quest chains
  private updateQuestChains(completedQuestId: string): void {
    this.questChains.forEach(chain => {
      const questIndex = chain.quests.indexOf(completedQuestId);
      if (questIndex !== -1 && questIndex === chain.currentQuest) {
        chain.currentQuest++;
        if (chain.currentQuest >= chain.quests.length) {
          chain.isCompleted = true;
        }
      }
    });
  }

  // Get quest statistics
  getStats(): QuestStats {
    const completedQuests = this.quests.filter(q => q.status === 'completed');
    const totalQuests = this.quests.length;
    const completionRate = totalQuests > 0 ? (completedQuests.length / totalQuests) * 100 : 0;

    const totalExperienceEarned = completedQuests.reduce((sum, q) => 
      sum + q.rewards.filter(r => r.type === 'experience').reduce((s, r) => s + r.amount, 0), 0);

    const averageCompletionTime = completedQuests.length > 0 
      ? completedQuests.reduce((sum, q) => {
          if (q.completedAt && q.createdAt) {
            return sum + (q.completedAt.getTime() - q.createdAt.getTime()) / (1000 * 60);
          }
          return sum;
        }, 0) / completedQuests.length
      : 0;

    const favoriteCategory = this.getFavoriteQuestCategory();
    const favoriteType = this.getFavoriteQuestType();

    return {
      totalQuests,
      completedQuests: completedQuests.length,
      completionRate,
      averageCompletionTime,
      favoriteCategory,
      favoriteType,
      longestStreak: 0, // Would need to track daily
      currentStreak: 0, // Would need to track daily
      totalExperienceEarned,
      totalRewardsEarned: completedQuests.reduce((sum, q) => sum + q.rewards.length, 0),
      questMasterLevel: Math.floor(completedQuests.length / 10) + 1
    };
  }

  // Get notifications
  getNotifications(): QuestNotification[] {
    return this.notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Add notification
  private addNotification(notification: Omit<QuestNotification, 'id'>): void {
    const newNotification: QuestNotification = {
      ...notification,
      id: `notification_${Date.now()}`
    };
    this.notifications.push(newNotification);
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  // Helper methods
  private getFavoriteQuestType(): string {
    const typeCounts = this.quests.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'story';
  }

  private getFavoriteQuestCategory(): string {
    const categoryCounts = this.quests.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'exploration';
  }
}

export const questService = new QuestService();
