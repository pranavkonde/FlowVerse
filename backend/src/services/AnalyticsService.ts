import { Player } from '../types/game';

export interface AnalyticsData {
  timestamp: Date;
  event: string;
  playerId?: string;
  roomCode?: string;
  data: any;
}

export interface GameMetrics {
  totalPlayers: number;
  activeRooms: number;
  averagePlayersPerRoom: number;
  peakConcurrentPlayers: number;
  totalGamesPlayed: number;
  averageGameDuration: number;
  mostPopularRooms: Array<{ roomCode: string; playerCount: number }>;
  playerRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

export class AnalyticsService {
  private events: AnalyticsData[] = [];
  private playerSessions: Map<string, { startTime: Date; lastActivity: Date }> = new Map();
  private roomMetrics: Map<string, { startTime: Date; playerCount: number }> = new Map();
  private peakPlayers: number = 0;

  trackEvent(event: string, playerId?: string, roomCode?: string, data: any = {}): void {
    const analyticsData: AnalyticsData = {
      timestamp: new Date(),
      event,
      playerId,
      roomCode,
      data
    };

    this.events.push(analyticsData);
    
    // Keep only last 10000 events to prevent memory issues
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }

    console.log(`Analytics: ${event}`, { playerId, roomCode, data });
  }

  trackPlayerJoin(playerId: string, roomCode: string): void {
    this.playerSessions.set(playerId, {
      startTime: new Date(),
      lastActivity: new Date()
    });

    this.trackEvent('player_join', playerId, roomCode, {
      timestamp: new Date()
    });
  }

  trackPlayerLeave(playerId: string, roomCode: string): void {
    const session = this.playerSessions.get(playerId);
    if (session) {
      const sessionDuration = new Date().getTime() - session.startTime.getTime();
      this.trackEvent('player_leave', playerId, roomCode, {
        sessionDuration,
        timestamp: new Date()
      });
      this.playerSessions.delete(playerId);
    }
  }

  trackPlayerActivity(playerId: string, activity: string, data: any = {}): void {
    const session = this.playerSessions.get(playerId);
    if (session) {
      session.lastActivity = new Date();
    }

    this.trackEvent('player_activity', playerId, undefined, {
      activity,
      ...data,
      timestamp: new Date()
    });
  }

  trackRoomCreated(roomCode: string, maxPlayers: number): void {
    this.roomMetrics.set(roomCode, {
      startTime: new Date(),
      playerCount: 0
    });

    this.trackEvent('room_created', undefined, roomCode, {
      maxPlayers,
      timestamp: new Date()
    });
  }

  trackRoomDestroyed(roomCode: string, playerCount: number): void {
    const roomData = this.roomMetrics.get(roomCode);
    if (roomData) {
      const roomDuration = new Date().getTime() - roomData.startTime.getTime();
      this.trackEvent('room_destroyed', undefined, roomCode, {
        duration: roomDuration,
        finalPlayerCount: playerCount,
        timestamp: new Date()
      });
      this.roomMetrics.delete(roomCode);
    }
  }

  updateRoomPlayerCount(roomCode: string, playerCount: number): void {
    const roomData = this.roomMetrics.get(roomCode);
    if (roomData) {
      roomData.playerCount = playerCount;
      this.peakPlayers = Math.max(this.peakPlayers, playerCount);
    }
  }

  getGameMetrics(): GameMetrics {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(event => event.timestamp >= last24Hours);
    const activePlayers = Array.from(this.playerSessions.values())
      .filter(session => now.getTime() - session.lastActivity.getTime() < 5 * 60 * 1000).length;
    
    const activeRooms = this.roomMetrics.size;
    const totalPlayers = this.playerSessions.size;
    const averagePlayersPerRoom = activeRooms > 0 ? totalPlayers / activeRooms : 0;
    
    const joinEvents = recentEvents.filter(event => event.event === 'player_join');
    const leaveEvents = recentEvents.filter(event => event.event === 'player_leave');
    const totalGamesPlayed = Math.floor((joinEvents.length + leaveEvents.length) / 2);
    
    const gameDurations = leaveEvents
      .map(event => event.data.sessionDuration)
      .filter(duration => duration && duration > 0);
    const averageGameDuration = gameDurations.length > 0 
      ? gameDurations.reduce((sum, duration) => sum + duration, 0) / gameDurations.length 
      : 0;

    const roomPlayerCounts = Array.from(this.roomMetrics.values())
      .map(room => ({ roomCode: 'unknown', playerCount: room.playerCount }))
      .sort((a, b) => b.playerCount - a.playerCount)
      .slice(0, 5);

    return {
      totalPlayers: activePlayers,
      activeRooms,
      averagePlayersPerRoom: Math.round(averagePlayersPerRoom * 100) / 100,
      peakConcurrentPlayers: this.peakPlayers,
      totalGamesPlayed,
      averageGameDuration: Math.round(averageGameDuration / 1000), // Convert to seconds
      mostPopularRooms: roomPlayerCounts,
      playerRetention: {
        day1: this.calculateRetention(1),
        day7: this.calculateRetention(7),
        day30: this.calculateRetention(30)
      }
    };
  }

  getPlayerAnalytics(playerId: string): {
    totalSessions: number;
    totalPlayTime: number;
    averageSessionDuration: number;
    favoriteRooms: string[];
    activityBreakdown: { [key: string]: number };
  } {
    const playerEvents = this.events.filter(event => event.playerId === playerId);
    const joinEvents = playerEvents.filter(event => event.event === 'player_join');
    const leaveEvents = playerEvents.filter(event => event.event === 'player_leave');
    
    const totalSessions = joinEvents.length;
    const totalPlayTime = leaveEvents.reduce((sum, event) => 
      sum + (event.data.sessionDuration || 0), 0);
    const averageSessionDuration = totalSessions > 0 ? totalPlayTime / totalSessions : 0;
    
    const roomCounts = new Map<string, number>();
    joinEvents.forEach(event => {
      if (event.roomCode) {
        roomCounts.set(event.roomCode, (roomCounts.get(event.roomCode) || 0) + 1);
      }
    });
    
    const favoriteRooms = Array.from(roomCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([roomCode]) => roomCode);
    
    const activityBreakdown: { [key: string]: number } = {};
    playerEvents.forEach(event => {
      if (event.event === 'player_activity' && event.data.activity) {
        activityBreakdown[event.data.activity] = (activityBreakdown[event.data.activity] || 0) + 1;
      }
    });

    return {
      totalSessions,
      totalPlayTime: Math.round(totalPlayTime / 1000), // Convert to seconds
      averageSessionDuration: Math.round(averageSessionDuration / 1000),
      favoriteRooms,
      activityBreakdown
    };
  }

  getEventFrequency(eventType: string, hours: number = 24): Array<{ hour: number; count: number }> {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    const eventCounts = new Map<number, number>();
    
    this.events
      .filter(event => event.event === eventType && event.timestamp >= startTime)
      .forEach(event => {
        const hour = event.timestamp.getHours();
        eventCounts.set(hour, (eventCounts.get(hour) || 0) + 1);
      });
    
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: eventCounts.get(hour) || 0
    }));
  }

  private calculateRetention(days: number): number {
    const now = new Date();
    const targetDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const playersOnTargetDate = new Set(
      this.events
        .filter(event => 
          event.event === 'player_join' && 
          event.timestamp >= targetDate && 
          event.timestamp < new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
        )
        .map(event => event.playerId)
    );
    
    const playersStillActive = Array.from(playersOnTargetDate).filter(playerId => {
      const session = this.playerSessions.get(playerId);
      return session && now.getTime() - session.lastActivity.getTime() < 24 * 60 * 60 * 1000;
    });
    
    return playersOnTargetDate.size > 0 
      ? (playersStillActive.length / playersOnTargetDate.size) * 100 
      : 0;
  }

  cleanupOldData(): void {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    this.events = this.events.filter(event => event.timestamp >= weekAgo);
    
    // Clean up inactive sessions
    const now = new Date();
    for (const [playerId, session] of this.playerSessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > 24 * 60 * 60 * 1000) {
        this.playerSessions.delete(playerId);
      }
    }
    
    console.log('Cleaned up old analytics data');
  }
}
