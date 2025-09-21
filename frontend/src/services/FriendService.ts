import { Friend, FriendRequest, FriendActivity, FriendStats } from '@/types/friends';

export class FriendService {
  private friends: Map<string, Friend> = new Map();
  private friendRequests: Map<string, FriendRequest> = new Map();
  private activities: FriendActivity[] = [];
  private onUpdateCallback?: () => void;

  constructor() {
    this.loadFriends();
    this.loadFriendRequests();
    this.loadActivities();
  }

  private loadFriends(): void {
    const stored = localStorage.getItem('freeflow_friends');
    if (stored) {
      try {
        const friendsData = JSON.parse(stored);
        friendsData.forEach((friend: any) => {
          friend.lastSeen = new Date(friend.lastSeen);
          friend.friendshipDate = new Date(friend.friendshipDate);
          this.friends.set(friend.id, friend);
        });
      } catch (error) {
        console.error('Failed to load friends:', error);
      }
    }
  }

  private saveFriends(): void {
    const friendsData = Array.from(this.friends.values());
    localStorage.setItem('freeflow_friends', JSON.stringify(friendsData));
  }

  private loadFriendRequests(): void {
    const stored = localStorage.getItem('freeflow_friend_requests');
    if (stored) {
      try {
        const requestsData = JSON.parse(stored);
        requestsData.forEach((request: any) => {
          request.createdAt = new Date(request.createdAt);
          this.friendRequests.set(request.id, request);
        });
      } catch (error) {
        console.error('Failed to load friend requests:', error);
      }
    }
  }

  private saveFriendRequests(): void {
    const requestsData = Array.from(this.friendRequests.values());
    localStorage.setItem('freeflow_friend_requests', JSON.stringify(requestsData));
  }

  private loadActivities(): void {
    const stored = localStorage.getItem('freeflow_friend_activities');
    if (stored) {
      try {
        const activitiesData = JSON.parse(stored);
        this.activities = activitiesData.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
      } catch (error) {
        console.error('Failed to load friend activities:', error);
      }
    }
  }

  private saveActivities(): void {
    localStorage.setItem('freeflow_friend_activities', JSON.stringify(this.activities));
  }

  private notifyUpdate(): void {
    if (this.onUpdateCallback) {
      this.onUpdateCallback();
    }
  }

  // Friend Management
  public addFriend(friend: Omit<Friend, 'friendshipDate'>): void {
    const newFriend: Friend = {
      ...friend,
      friendshipDate: new Date()
    };
    this.friends.set(friend.id, newFriend);
    this.saveFriends();
    this.notifyUpdate();
  }

  public removeFriend(friendId: string): void {
    this.friends.delete(friendId);
    this.saveFriends();
    this.notifyUpdate();
  }

  public updateFriendStatus(friendId: string, status: Friend['status']): void {
    const friend = this.friends.get(friendId);
    if (friend) {
      friend.status = status;
      friend.isOnline = status === 'online';
      friend.lastSeen = new Date();
      this.friends.set(friendId, friend);
      this.saveFriends();
      this.notifyUpdate();
    }
  }

  public updateFriendRoom(friendId: string, roomCode?: string): void {
    const friend = this.friends.get(friendId);
    if (friend) {
      friend.currentRoom = roomCode;
      this.friends.set(friendId, friend);
      this.saveFriends();
      this.notifyUpdate();
    }
  }

  public setFriendFavorite(friendId: string, isFavorite: boolean): void {
    const friend = this.friends.get(friendId);
    if (friend) {
      friend.isFavorite = isFavorite;
      this.friends.set(friendId, friend);
      this.saveFriends();
      this.notifyUpdate();
    }
  }

  public setFriendNotes(friendId: string, notes: string): void {
    const friend = this.friends.get(friendId);
    if (friend) {
      friend.notes = notes;
      this.friends.set(friendId, friend);
      this.saveFriends();
      this.notifyUpdate();
    }
  }

  public blockFriend(friendId: string): void {
    const friend = this.friends.get(friendId);
    if (friend) {
      friend.isBlocked = true;
      this.friends.set(friendId, friend);
      this.saveFriends();
      this.notifyUpdate();
    }
  }

  public unblockFriend(friendId: string): void {
    const friend = this.friends.get(friendId);
    if (friend) {
      friend.isBlocked = false;
      this.friends.set(friendId, friend);
      this.saveFriends();
      this.notifyUpdate();
    }
  }

  // Friend Requests
  public sendFriendRequest(request: Omit<FriendRequest, 'id' | 'createdAt' | 'status'>): string {
    const newRequest: FriendRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      status: 'pending'
    };
    this.friendRequests.set(newRequest.id, newRequest);
    this.saveFriendRequests();
    this.notifyUpdate();
    return newRequest.id;
  }

  public acceptFriendRequest(requestId: string): void {
    const request = this.friendRequests.get(requestId);
    if (request && request.status === 'pending') {
      request.status = 'accepted';
      this.friendRequests.set(requestId, request);
      this.saveFriendRequests();
      
      // Add to friends list
      this.addFriend({
        id: request.fromUserId,
        username: request.fromUsername,
        avatar: request.fromAvatar,
        status: 'offline',
        lastSeen: new Date(),
        isOnline: false,
        level: 1,
        achievements: 0,
        mutualFriends: 0,
        isBlocked: false,
        isFavorite: false
      });
      
      this.notifyUpdate();
    }
  }

  public declineFriendRequest(requestId: string): void {
    const request = this.friendRequests.get(requestId);
    if (request && request.status === 'pending') {
      request.status = 'declined';
      this.friendRequests.set(requestId, request);
      this.saveFriendRequests();
      this.notifyUpdate();
    }
  }

  // Activities
  public addActivity(activity: Omit<FriendActivity, 'id' | 'timestamp'>): void {
    const newActivity: FriendActivity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    this.activities.unshift(newActivity);
    
    // Keep only last 100 activities
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(0, 100);
    }
    
    this.saveActivities();
    this.notifyUpdate();
  }

  // Getters
  public getFriends(): Friend[] {
    return Array.from(this.friends.values())
      .filter(friend => !friend.isBlocked)
      .sort((a, b) => {
        if (a.isOnline !== b.isOnline) return b.isOnline ? 1 : -1;
        if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
        return a.username.localeCompare(b.username);
      });
  }

  public getOnlineFriends(): Friend[] {
    return this.getFriends().filter(friend => friend.isOnline);
  }

  public getFavoriteFriends(): Friend[] {
    return this.getFriends().filter(friend => friend.isFavorite);
  }

  public getFriendById(id: string): Friend | undefined {
    return this.friends.get(id);
  }

  public getPendingRequests(): FriendRequest[] {
    return Array.from(this.friendRequests.values())
      .filter(request => request.status === 'pending')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public getRecentActivities(limit: number = 20): FriendActivity[] {
    return this.activities.slice(0, limit);
  }

  public getStats(): FriendStats {
    const friends = this.getFriends();
    const onlineFriends = this.getOnlineFriends();
    const pendingRequests = this.getPendingRequests();
    const recentActivity = this.getRecentActivities(10);
    
    const topFriends = friends
      .sort((a, b) => b.achievements - a.achievements)
      .slice(0, 5);
    
    const mutualConnections: Record<string, number> = {};
    friends.forEach(friend => {
      mutualConnections[friend.id] = friend.mutualFriends;
    });

    return {
      totalFriends: friends.length,
      onlineFriends: onlineFriends.length,
      pendingRequests: pendingRequests.length,
      recentActivity,
      topFriends,
      mutualConnections
    };
  }

  public searchFriends(query: string): Friend[] {
    const friends = this.getFriends();
    const lowercaseQuery = query.toLowerCase();
    
    return friends.filter(friend => 
      friend.username.toLowerCase().includes(lowercaseQuery) ||
      (friend.notes && friend.notes.toLowerCase().includes(lowercaseQuery))
    );
  }

  public setOnUpdateCallback(callback: () => void): void {
    this.onUpdateCallback = callback;
  }

  public clearAllData(): void {
    this.friends.clear();
    this.friendRequests.clear();
    this.activities = [];
    
    localStorage.removeItem('freeflow_friends');
    localStorage.removeItem('freeflow_friend_requests');
    localStorage.removeItem('freeflow_friend_activities');
    
    this.notifyUpdate();
  }
}

// Singleton instance
export const friendService = new FriendService();
