'use client';

import { useState, useEffect } from 'react';
import { Users, Crown, Shield, Sword, Trophy, Star, Plus, Search, Filter, Calendar, MessageSquare, Coins, Zap, Target } from 'lucide-react';
import { Guild, GuildMember, GuildApplication, GuildFilters } from '@/types/guilds';
import { guildService } from '@/services/GuildService';

interface GuildSystemProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function GuildSystem({ isVisible, onToggle }: GuildSystemProps) {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [selectedTab, setSelectedTab] = useState<'browse' | 'my-guild' | 'applications' | 'wars'>('browse');
  const [filters, setFilters] = useState<GuildFilters>({
    sortBy: 'level',
    sortOrder: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGuild, setShowCreateGuild] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadGuilds();
    }
  }, [isVisible, filters, searchQuery]);

  const loadGuilds = () => {
    const currentFilters = {
      ...filters,
      name: searchQuery || undefined
    };
    const loadedGuilds = guildService.getGuilds(currentFilters);
    setGuilds(loadedGuilds);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'officer': return <Shield className="w-4 h-4 text-blue-400" />;
      case 'member': return <Users className="w-4 h-4 text-green-400" />;
      case 'recruit': return <Target className="w-4 h-4 text-slate-400" />;
      default: return <Users className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader': return 'text-yellow-400';
      case 'officer': return 'text-blue-400';
      case 'member': return 'text-green-400';
      case 'recruit': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'cyberpunk': return '🤖';
      case 'adventure': return '🗺️';
      case 'fantasy': return '🧙';
      case 'sci-fi': return '🚀';
      case 'medieval': return '⚔️';
      default: return '🏰';
    }
  };

  const handleJoinGuild = (guildId: string) => {
    // This would typically open an application form
    console.log('Joining guild:', guildId);
  };

  const handleViewGuild = (guild: Guild) => {
    setSelectedGuild(guild);
    setSelectedTab('my-guild');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-white text-2xl font-bold">Guild System</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateGuild(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Guild
              </button>
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
              { id: 'browse', label: 'Browse Guilds', icon: <Search className="w-4 h-4" /> },
              { id: 'my-guild', label: 'My Guild', icon: <Users className="w-4 h-4" /> },
              { id: 'applications', label: 'Applications', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'wars', label: 'Guild Wars', icon: <Sword className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-500'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-96">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedTab === 'browse' && (
              <div>
                {/* Search and Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search guilds..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:outline-none"
                  >
                    <option value="level">Sort by Level</option>
                    <option value="members">Sort by Members</option>
                    <option value="reputation">Sort by Reputation</option>
                    <option value="name">Sort by Name</option>
                    <option value="created">Sort by Created</option>
                  </select>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:outline-none"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                {/* Guilds Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {guilds.map(guild => (
                    <div
                      key={guild.id}
                      className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => handleViewGuild(guild)}
                    >
                      {/* Guild Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{guild.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-bold text-lg">{guild.name}</h3>
                            <span className="text-slate-400 text-sm">[{guild.tag}]</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span>Level {guild.level}</span>
                            <span>•</span>
                            <span>{guild.currentMembers}/{guild.maxMembers} members</span>
                            <span>•</span>
                            <span>{guild.reputation} rep</span>
                          </div>
                        </div>
                      </div>

                      {/* Guild Description */}
                      <p className="text-slate-300 text-sm mb-4 line-clamp-2">{guild.description}</p>

                      {/* Guild Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-green-400 font-bold text-lg">{guild.treasury}</div>
                          <div className="text-slate-400 text-xs">Treasury</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400 font-bold text-lg">{guild.stats.warsWon}</div>
                          <div className="text-slate-400 text-xs">Wars Won</div>
                        </div>
                      </div>

                      {/* Guild Theme */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{getThemeIcon(guild.theme)}</span>
                        <span className="text-slate-400 text-sm capitalize">{guild.theme}</span>
                        <div 
                          className="w-4 h-4 rounded-full border-2"
                          style={{ borderColor: guild.color }}
                        />
                      </div>

                      {/* Requirements */}
                      <div className="mb-4">
                        <div className="text-slate-400 text-xs mb-1">Requirements:</div>
                        <div className="text-slate-300 text-xs">
                          Level {guild.requirements.minLevel}+ • {guild.requirements.minReputation} rep
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinGuild(guild.id);
                          }}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                        >
                          Join Guild
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewGuild(guild);
                          }}
                          className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {guilds.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-slate-400 text-lg mb-2">No guilds found</div>
                    <div className="text-slate-500 text-sm">
                      Try adjusting your search or create a new guild
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'my-guild' && selectedGuild && (
              <div>
                {/* Guild Header */}
                <div className="bg-slate-700 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{selectedGuild.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-white text-2xl font-bold">{selectedGuild.name}</h2>
                        <span className="text-slate-400 text-lg">[{selectedGuild.tag}]</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-medium">{selectedGuild.reputation}</span>
                        </div>
                      </div>
                      <p className="text-slate-300 mb-3">{selectedGuild.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Level {selectedGuild.level}</span>
                        <span>•</span>
                        <span>{selectedGuild.currentMembers}/{selectedGuild.maxMembers} members</span>
                        <span>•</span>
                        <span>Founded {new Date(selectedGuild.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guild Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                    <div className="text-green-400 font-bold text-2xl">{selectedGuild.treasury}</div>
                    <div className="text-slate-400 text-sm">Treasury</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                    <div className="text-blue-400 font-bold text-2xl">{selectedGuild.stats.warsWon}</div>
                    <div className="text-slate-400 text-sm">Wars Won</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                    <div className="text-purple-400 font-bold text-2xl">{selectedGuild.stats.eventsCompleted}</div>
                    <div className="text-slate-400 text-sm">Events</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                    <div className="text-yellow-400 font-bold text-2xl">{selectedGuild.stats.averageMemberLevel}</div>
                    <div className="text-slate-400 text-sm">Avg Level</div>
                  </div>
                </div>

                {/* Members */}
                <div className="bg-slate-700 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Members</h3>
                  <div className="space-y-2">
                    {/* Leader */}
                    <div className="flex items-center gap-3 p-3 bg-slate-600 rounded">
                      <div className="text-2xl">{selectedGuild.leader.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{selectedGuild.leader.username}</span>
                          {getRoleIcon(selectedGuild.leader.role)}
                          <span className={`text-sm ${getRoleColor(selectedGuild.leader.role)}`}>
                            {selectedGuild.leader.role}
                          </span>
                        </div>
                        <div className="text-slate-400 text-sm">
                          Level {selectedGuild.leader.level} • {selectedGuild.leader.contribution} contribution
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 text-sm">
                          {selectedGuild.leader.isOnline ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>

                    {/* Members */}
                    {selectedGuild.members.map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-600 rounded">
                        <div className="text-2xl">{member.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{member.username}</span>
                            {getRoleIcon(member.role)}
                            <span className={`text-sm ${getRoleColor(member.role)}`}>
                              {member.role}
                            </span>
                          </div>
                          <div className="text-slate-400 text-sm">
                            Level {member.level} • {member.contribution} contribution
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 text-sm">
                            {member.isOnline ? 'Online' : 'Offline'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'applications' && (
              <div>
                <h3 className="text-white font-bold text-lg mb-4">Guild Applications</h3>
                <div className="text-center py-12">
                  <div className="text-slate-400 text-lg mb-2">No applications</div>
                  <div className="text-slate-500 text-sm">
                    Applications will appear here when players apply to join your guild
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'wars' && (
              <div>
                <h3 className="text-white font-bold text-lg mb-4">Guild Wars</h3>
                <div className="text-center py-12">
                  <div className="text-slate-400 text-lg mb-2">No active wars</div>
                  <div className="text-slate-500 text-sm">
                    Guild wars will be displayed here when available
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-700/50 p-4 border-t border-slate-600">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              Join a guild to unlock team-based gameplay and exclusive rewards!
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors">
                My Applications
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
