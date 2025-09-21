export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  isOnline: boolean;
  currentRoom?: string;
  level: number;
  achievements: number;
  mutualFriends: number;
  friendshipDate: Date;
  isBlocked: boolean;
  isFavorite: boolean;
  notes?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromAvatar?: string;
  toUserId: string;
  message?: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}

export interface FriendActivity {
  id: string;
  userId: string;
  username: string;
  type: 'achievement' | 'level_up' | 'room_join' | 'trade' | 'message';
  description: string;
  timestamp: Date;
  data?: any;
}

export interface FriendStats {
  totalFriends: number;
  onlineFriends: number;
  pendingRequests: number;
  recentActivity: FriendActivity[];
  topFriends: Friend[];
  mutualConnections: Record<string, number>;
}
