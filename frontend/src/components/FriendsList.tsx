'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, MoreVertical, Star, MessageCircle, UserX, Shield } from 'lucide-react';
import { Friend, FriendRequest } from '@/types/friends';
import { friendService } from '@/services/FriendService';

interface FriendsListProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function FriendsList({ isVisible, onToggle }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  useEffect(() => {
    updateFriends();
    updateRequests();
    
    friendService.setOnUpdateCallback(() => {
      updateFriends();
      updateRequests();
    });
  }, []);

  const updateFriends = () => {
    setFriends(friendService.getFriends());
  };

  const updateRequests = () => {
    setFriendRequests(friendService.getPendingRequests());
  };

  const handleAcceptRequest = (requestId: string) => {
    friendService.acceptFriendRequest(requestId);
  };

  const handleDeclineRequest = (requestId: string) => {
    friendService.declineFriendRequest(requestId);
  };

  const handleRemoveFriend = (friendId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      friendService.removeFriend(friendId);
    }
  };

  const handleBlockFriend = (friendId: string) => {
    if (confirm('Are you sure you want to block this friend?')) {
      friendService.blockFriend(friendId);
    }
  };

  const handleToggleFavorite = (friendId: string) => {
    const friend = friendService.getFriendById(friendId);
    if (friend) {
      friendService.setFriendFavorite(friendId, !friend.isFavorite);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredFriends = searchQuery 
    ? friendService.searchFriends(searchQuery)
    : friends;

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 w-80 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700 z-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-medium">Friends</h2>
            <div className="text-slate-400 text-sm">
              {friends.length} friends
            </div>
          </div>
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeTab === 'friends' 
                ? 'bg-blue-500 text-white' 
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeTab === 'requests' 
                ? 'bg-blue-500 text-white' 
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Requests ({friendRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeTab === 'search' 
                ? 'bg-blue-500 text-white' 
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Search
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'friends' && (
          <div className="space-y-2">
            {filteredFriends.length === 0 ? (
              <div className="text-slate-400 text-center py-8">
                {searchQuery ? 'No friends found' : 'No friends yet'}
              </div>
            ) : (
              filteredFriends.map(friend => (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-slate-700/50 transition-colors"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {friend.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(friend.status)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">
                        {friend.username}
                      </span>
                      {friend.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      )}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {friend.isOnline ? 'Online' : `Last seen ${friend.lastSeen.toLocaleDateString()}`}
                      {friend.currentRoom && ` • In ${friend.currentRoom}`}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedFriend(friend)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button className="p-1 text-slate-400 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {/* Dropdown menu would go here */}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-3">
            {friendRequests.length === 0 ? (
              <div className="text-slate-400 text-center py-8">
                No pending requests
              </div>
            ) : (
              friendRequests.map(request => (
                <div key={request.id} className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {request.fromUsername.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">
                        {request.fromUsername}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {request.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {request.message && (
                    <div className="text-slate-300 text-sm mb-3">
                      "{request.message}"
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(request.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="text-slate-400 text-sm">
              Search by username or notes
            </div>
          </div>
        )}
      </div>

      {/* Add Friend Button */}
      <div className="p-4 border-t border-slate-700">
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Friend
        </button>
      </div>
    </div>
  );
}
