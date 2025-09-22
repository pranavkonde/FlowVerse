import { Guild, GuildMember, GuildApplication, GuildWar, GuildFilters, GuildNotification, GuildStats } from '@/types/guilds';

class GuildService {
  private guilds: Guild[] = [];
  private applications: GuildApplication[] = [];
  private wars: GuildWar[] = [];
  private notifications: GuildNotification[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock guilds
    this.guilds = [
      {
        id: 'guild1',
        name: 'Crypto Warriors',
        tag: 'CWAR',
        description: 'Elite guild focused on blockchain trading and PvP combat',
        level: 15,
        experience: 125000,
        maxMembers: 50,
        currentMembers: 32,
        members: [],
        leader: {
          id: 'leader1',
          username: 'CryptoKing',
          avatar: '👑',
          role: 'leader',
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastActive: new Date(),
          contribution: 50000,
          level: 25,
          isOnline: true,
          permissions: [],
          stats: {
            totalContribution: 50000,
            weeklyContribution: 2500,
            eventsParticipated: 45,
            eventsWon: 38,
            timeInGuild: 30,
            lastContribution: new Date(),
            favoriteActivity: 'trading',
            achievements: ['guild_founder', 'top_contributor', 'war_hero']
          }
        },
        officers: [],
        treasury: 150000,
        reputation: 95,
        theme: 'cyberpunk',
        icon: '⚔️',
        banner: '🏴',
        color: '#00ff00',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        isPublic: true,
        requirements: {
          minLevel: 10,
          minReputation: 50,
          requiredAchievements: ['first_trade'],
          applicationRequired: true,
          autoAccept: false,
          maxApplicationsPerDay: 3
        },
        stats: {
          totalMembers: 32,
          activeMembers: 28,
          totalContribution: 500000,
          weeklyContribution: 25000,
          guildLevel: 15,
          totalExperience: 125000,
          warsWon: 12,
          warsLost: 3,
          eventsCompleted: 45,
          averageMemberLevel: 18,
          topContributors: [],
          recentActivity: []
        },
        perks: [
          {
            id: 'perk1',
            name: 'Trading Bonus',
            description: '10% bonus to all trading profits',
            level: 1,
            isUnlocked: true,
            cost: 10000,
            benefits: [
              {
                type: 'coins',
                value: 'trading_bonus',
                description: '10% bonus to trading profits'
              }
            ],
            icon: '💰'
          }
        ],
        announcements: [],
        events: []
      },
      {
        id: 'guild2',
        name: 'Flow Explorers',
        tag: 'FEXP',
        description: 'Friendly guild focused on exploration and discovery',
        level: 8,
        experience: 45000,
        maxMembers: 30,
        currentMembers: 18,
        members: [],
        leader: {
          id: 'leader2',
          username: 'ExplorerPro',
          avatar: '🗺️',
          role: 'leader',
          joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          lastActive: new Date(),
          contribution: 25000,
          level: 20,
          isOnline: false,
          permissions: [],
          stats: {
            totalContribution: 25000,
            weeklyContribution: 1500,
            eventsParticipated: 25,
            eventsWon: 20,
            timeInGuild: 15,
            lastContribution: new Date(Date.now() - 2 * 60 * 60 * 1000),
            favoriteActivity: 'exploration',
            achievements: ['guild_founder', 'explorer_master']
          }
        },
        officers: [],
        treasury: 75000,
        reputation: 78,
        theme: 'adventure',
        icon: '🗺️',
        banner: '🏴',
        color: '#4169e1',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        isPublic: true,
        requirements: {
          minLevel: 5,
          minReputation: 25,
          requiredAchievements: [],
          applicationRequired: false,
          autoAccept: true,
          maxApplicationsPerDay: 5
        },
        stats: {
          totalMembers: 18,
          activeMembers: 15,
          totalContribution: 200000,
          weeklyContribution: 12000,
          guildLevel: 8,
          totalExperience: 45000,
          warsWon: 5,
          warsLost: 2,
          eventsCompleted: 28,
          averageMemberLevel: 12,
          topContributors: [],
          recentActivity: []
        },
        perks: [],
        announcements: [],
        events: []
      }
    ];

    // Mock applications
    this.applications = [
      {
        id: 'app1',
        guildId: 'guild1',
        playerId: 'player1',
        playerName: 'NewTrader',
        playerLevel: 12,
        playerReputation: 65,
        message: 'I love trading and want to join an active guild!',
        appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'pending'
      }
    ];
  }

  // Get all guilds with filters
  getGuilds(filters?: GuildFilters): Guild[] {
    let filteredGuilds = [...this.guilds];

    if (filters) {
      if (filters.name) {
        filteredGuilds = filteredGuilds.filter(g => 
          g.name.toLowerCase().includes(filters.name!.toLowerCase()) ||
          g.tag.toLowerCase().includes(filters.name!.toLowerCase())
        );
      }

      if (filters.level) {
        filteredGuilds = filteredGuilds.filter(g => 
          g.level >= filters.level!.min && g.level <= filters.level!.max
        );
      }

      if (filters.members) {
        filteredGuilds = filteredGuilds.filter(g => 
          g.currentMembers >= filters.members!.min && g.currentMembers <= filters.members!.max
        );
      }

      if (filters.isPublic !== undefined) {
        filteredGuilds = filteredGuilds.filter(g => g.isPublic === filters.isPublic);
      }

      if (filters.theme) {
        filteredGuilds = filteredGuilds.filter(g => g.theme === filters.theme);
      }

      // Sort guilds
      filteredGuilds.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'level':
            comparison = a.level - b.level;
            break;
          case 'members':
            comparison = a.currentMembers - b.currentMembers;
            break;
          case 'reputation':
            comparison = a.reputation - b.reputation;
            break;
          case 'created':
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
        }
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filteredGuilds;
  }

  // Get guild by ID
  getGuild(guildId: string): Guild | null {
    return this.guilds.find(g => g.id === guildId) || null;
  }

  // Create a new guild
  createGuild(guildData: Omit<Guild, 'id' | 'createdAt' | 'members' | 'officers' | 'stats' | 'perks' | 'announcements' | 'events'>): Guild {
    const newGuild: Guild = {
      ...guildData,
      id: `guild_${Date.now()}`,
      createdAt: new Date(),
      members: [],
      officers: [],
      stats: {
        totalMembers: 1,
        activeMembers: 1,
        totalContribution: 0,
        weeklyContribution: 0,
        guildLevel: 1,
        totalExperience: 0,
        warsWon: 0,
        warsLost: 0,
        eventsCompleted: 0,
        averageMemberLevel: guildData.leader.level,
        topContributors: [],
        recentActivity: []
      },
      perks: [],
      announcements: [],
      events: []
    };

    this.guilds.push(newGuild);
    return newGuild;
  }

  // Apply to join a guild
  applyToGuild(guildId: string, application: Omit<GuildApplication, 'id' | 'guildId' | 'appliedAt' | 'status'>): GuildApplication {
    const newApplication: GuildApplication = {
      ...application,
      id: `app_${Date.now()}`,
      guildId,
      appliedAt: new Date(),
      status: 'pending'
    };

    this.applications.push(newApplication);

    // Add notification to guild
    this.addNotification({
      type: 'member_joined',
      guildId,
      title: 'New Application',
      message: `${application.playerName} wants to join your guild`,
      isRead: false,
      createdAt: new Date(),
      priority: 'medium'
    });

    return newApplication;
  }

  // Get applications for a guild
  getGuildApplications(guildId: string): GuildApplication[] {
    return this.applications.filter(app => app.guildId === guildId);
  }

  // Review an application
  reviewApplication(applicationId: string, decision: 'accepted' | 'rejected', reviewerId: string, response?: string): boolean {
    const application = this.applications.find(app => app.id === applicationId);
    if (!application) return false;

    application.status = decision;
    application.reviewedBy = reviewerId;
    application.reviewedAt = new Date();
    if (response) application.response = response;

    if (decision === 'accepted') {
      // Add member to guild
      const guild = this.guilds.find(g => g.id === application.guildId);
      if (guild) {
        const newMember: GuildMember = {
          id: application.playerId,
          username: application.playerName,
          avatar: '👤',
          role: 'member',
          joinedAt: new Date(),
          lastActive: new Date(),
          contribution: 0,
          level: application.playerLevel,
          isOnline: false,
          permissions: [],
          stats: {
            totalContribution: 0,
            weeklyContribution: 0,
            eventsParticipated: 0,
            eventsWon: 0,
            timeInGuild: 0,
            lastContribution: new Date(),
            favoriteActivity: 'none',
            achievements: []
          }
        };

        guild.members.push(newMember);
        guild.currentMembers++;
        guild.stats.totalMembers++;
        guild.stats.activeMembers++;
      }
    }

    return true;
  }

  // Get guild statistics
  getGuildStats(guildId: string): GuildStats | null {
    const guild = this.guilds.find(g => g.id === guildId);
    return guild ? guild.stats : null;
  }

  // Get notifications
  getNotifications(): GuildNotification[] {
    return this.notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Add notification
  private addNotification(notification: Omit<GuildNotification, 'id'>): void {
    const newNotification: GuildNotification = {
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

  // Get guild wars
  getGuildWars(): GuildWar[] {
    return this.wars;
  }

  // Create a guild war
  createGuildWar(warData: Omit<GuildWar, 'id' | 'status' | 'score' | 'winner' | 'participants'>): GuildWar {
    const newWar: GuildWar = {
      ...warData,
      id: `war_${Date.now()}`,
      status: 'scheduled',
      score: {
        guild1: 0,
        guild2: 0
      },
      participants: []
    };

    this.wars.push(newWar);
    return newWar;
  }

  // Join a guild war
  joinGuildWar(warId: string, memberId: string, guildId: string): boolean {
    const war = this.wars.find(w => w.id === warId);
    if (!war || war.status !== 'scheduled') return false;

    const participant: WarParticipant = {
      memberId,
      guildId,
      kills: 0,
      deaths: 0,
      assists: 0,
      objectivesCompleted: 0,
      points: 0,
      isActive: true
    };

    war.participants.push(participant);
    return true;
  }
}

export const guildService = new GuildService();
