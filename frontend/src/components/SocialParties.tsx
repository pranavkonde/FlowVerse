import React, { useState, useEffect } from 'react';
import { Party, PartyStatus, SOCIAL_EVENTS } from '../types/social';
import { useSocket } from '../hooks/useSocket';
import SocialService from '../services/SocialService';

interface SocialPartiesProps {
  onPartySelect?: (party: Party) => void;
}

const SocialParties: React.FC<SocialPartiesProps> = ({ onPartySelect }) => {
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ status?: PartyStatus; isPublic?: boolean; isRecruiting?: boolean }>({});
  
  const socket = useSocket();
  const socialService = new SocialService(socket);

  useEffect(() => {
    loadParties();
    setupEventListeners();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);

  const loadParties = async () => {
    try {
      setLoading(true);
      setError(null);
      const partyList = await socialService.getParties(filters);
      setParties(partyList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load parties');
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    socialService.on(SOCIAL_EVENTS.PARTY_CREATED, (data: any) => {
      setParties(prev => [data, ...prev]);
    });

    socialService.on(SOCIAL_EVENTS.PARTY_UPDATED, (data: any) => {
      setParties(prev => prev.map(party => party.id === data.id ? data : party));
      if (selectedParty?.id === data.id) {
        setSelectedParty(data);
        onPartySelect?.(data);
      }
    });

    socialService.on(SOCIAL_EVENTS.PARTY_JOINED, (data: any) => {
      if (data.partyId === selectedParty?.id) {
        setSelectedParty(prev => prev ? { ...prev, members: [...prev.members, data.member] } : null);
      }
    });

    socialService.on(SOCIAL_EVENTS.PARTY_LEFT, (data: any) => {
      if (data.partyId === selectedParty?.id) {
        setSelectedParty(prev => prev ? { ...prev, members: prev.members.filter(m => m.userId !== data.userId) } : null);
      }
    });
  };

  const cleanupEventListeners = () => {
    // Cleanup would be handled by the service
  };

  const handleJoinParty = async (party: Party) => {
    try {
      setLoading(true);
      await socialService.joinParty(party.id);
      setSelectedParty(party);
      onPartySelect?.(party);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join party');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveParty = async () => {
    if (!selectedParty) return;
    
    try {
      setLoading(true);
      await socialService.leaveParty(selectedParty.id);
      setSelectedParty(null);
      onPartySelect?.(null as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave party');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: { status?: PartyStatus; isPublic?: boolean; isRecruiting?: boolean }) => {
    setFilters(newFilters);
    loadParties();
  };

  const getStatusColor = (status: PartyStatus): string => {
    const colors = {
      recruiting: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      full: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      disbanded: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: PartyStatus): string => {
    const icons = {
      recruiting: '🔍',
      active: '✅',
      full: '🔒',
      inactive: '⏸️',
      disbanded: '❌'
    };
    return icons[status] || '❓';
  };

  const getRoleColor = (role: string): string => {
    const colors = {
      leader: 'bg-purple-100 text-purple-800',
      officer: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800',
      recruit: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getMemberStatusIcon = (status: string): string => {
    const icons = {
      active: '🟢',
      inactive: '🔴',
      away: '🟡',
      busy: '🟠',
      offline: '⚫'
    };
    return icons[status as keyof typeof icons] || '❓';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && parties.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading parties...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-400 mr-2">⚠️</div>
          <div className="text-red-800">{error}</div>
        </div>
        <button 
          onClick={loadParties}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Social Parties</h2>
        <div className="flex space-x-2">
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange({ ...filters, status: e.target.value as PartyStatus || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="recruiting">Recruiting</option>
            <option value="active">Active</option>
            <option value="full">Full</option>
            <option value="inactive">Inactive</option>
            <option value="disbanded">Disbanded</option>
          </select>
          <button
            onClick={() => handleFilterChange({ ...filters, isPublic: !filters.isPublic })}
            className={`px-3 py-2 rounded-md ${
              filters.isPublic 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Public Only
          </button>
          <button
            onClick={() => handleFilterChange({ ...filters, isRecruiting: !filters.isRecruiting })}
            className={`px-3 py-2 rounded-md ${
              filters.isRecruiting 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Recruiting
          </button>
        </div>
      </div>

      {/* Selected Party */}
      {selectedParty && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎊</span>
              <div>
                <h3 className="text-lg font-semibold text-purple-900">{selectedParty.name}</h3>
                <p className="text-purple-700">{selectedParty.description}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedParty.status)}`}>
                    {getStatusIcon(selectedParty.status)} {selectedParty.status}
                  </span>
                  <span className="text-sm text-purple-600">
                    {selectedParty.members.length}/{selectedParty.maxMembers} members
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLeaveParty}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Leave Party
            </button>
          </div>
        </div>
      )}

      {/* Party List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parties.map((party) => (
          <div
            key={party.id}
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
              selectedParty?.id === party.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎊</span>
                <h3 className="font-semibold text-gray-900">{party.name}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(party.status)}`}>
                {getStatusIcon(party.status)} {party.status}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{party.description}</p>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>👥 {party.members.length}/{party.maxMembers} members</span>
                <span>🎯 {party.activities.length} activities</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>👑 {party.leaderName}</span>
                <span>📅 {formatDate(party.createdAt)}</span>
              </div>
            </div>
            
            {/* Party Members Preview */}
            <div className="mb-3">
              <div className="flex items-center space-x-1">
                {party.members.slice(0, 5).map((member, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <span className="text-xs">{getMemberStatusIcon(member.status)}</span>
                    <span className={`px-1 py-0.5 rounded text-xs font-medium ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                ))}
                {party.members.length > 5 && (
                  <span className="text-xs text-gray-500">+{party.members.length - 5} more</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {party.metadata.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleJoinParty(party)}
                disabled={loading || selectedParty?.id === party.id || !party.isRecruiting || party.status === 'full'}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedParty?.id === party.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : !party.isRecruiting || party.status === 'full'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {selectedParty?.id === party.id ? 'Joined' : !party.isRecruiting || party.status === 'full' ? 'Unavailable' : 'Join'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {parties.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🎊</div>
          <p className="text-gray-600">No parties found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default SocialParties;
