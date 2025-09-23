'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageCircle, 
  MapPin, 
  Heart, 
  Brain, 
  Smile, 
  Frown, 
  Meh,
  Angry,
  Zap,
  X,
  Send,
  Eye,
  EyeOff,
  Settings,
  Trophy,
  ShoppingBag,
  BookOpen
} from 'lucide-react';
import { 
  NPC, 
  NPCConversation, 
  NPC_EVENTS 
} from '@/types/npcs';
import { npcService } from '@/services/NPCService';

interface AINPCsProps {
  isVisible: boolean;
  onToggle: () => void;
  userId: string;
  playerPosition?: { x: number; y: number };
}

export default function AINPCs({ isVisible, onToggle, userId, playerPosition }: AINPCsProps) {
  const [npcs, setNPCs] = useState<NPC[]>([]);
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [currentConversation, setCurrentConversation] = useState<NPCConversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'conversation' | 'map'>('list');
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [showOnlyNearby, setShowOnlyNearby] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      initializeNPCs();
    }
  }, [isVisible]);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const initializeNPCs = async () => {
    try {
      await npcService.initialize();
      setNPCs(npcService.getNPCs());
      
      // Set up event listeners
      const handleNPCInteraction = (data: any) => {
        if (data.npc) {
          setNPCs(npcService.getNPCs());
        }
      };

      const handleConversationStart = (data: any) => {
        setCurrentConversation(data.conversation);
        setActiveTab('conversation');
      };

      const handleConversationEnd = (data: any) => {
        setCurrentConversation(null);
        setActiveTab('list');
      };

      const handleDialogue = (data: any) => {
        if (currentConversation && data.conversation?.id === currentConversation.id) {
          setCurrentConversation(npcService.getConversation(currentConversation.id));
        }
      };

      npcService.on(NPC_EVENTS.NPC_INTERACTION_START, handleConversationStart);
      npcService.on(NPC_EVENTS.NPC_INTERACTION_END, handleConversationEnd);
      npcService.on(NPC_EVENTS.NPC_DIALOGUE, handleDialogue);
      npcService.on(NPC_EVENTS.NPC_MOOD_CHANGED, handleNPCInteraction);

      return () => {
        npcService.off(NPC_EVENTS.NPC_INTERACTION_START, handleConversationStart);
        npcService.off(NPC_EVENTS.NPC_INTERACTION_END, handleConversationEnd);
        npcService.off(NPC_EVENTS.NPC_DIALOGUE, handleDialogue);
        npcService.off(NPC_EVENTS.NPC_MOOD_CHANGED, handleNPCInteraction);
      };
    } catch (error) {
      console.error('Failed to initialize NPCs:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartConversation = (npc: NPC) => {
    try {
      const conversation = npcService.startConversation(npc.id, userId);
      setCurrentConversation(conversation);
      setSelectedNPC(npc);
      setActiveTab('conversation');
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleEndConversation = () => {
    if (currentConversation) {
      npcService.endConversation(currentConversation.id);
      setCurrentConversation(null);
      setSelectedNPC(null);
      setActiveTab('list');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && currentConversation) {
      npcService.sendMessage(currentConversation.id, messageInput.trim(), 'player');
      setMessageInput('');
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile className="w-4 h-4 text-green-400" />;
      case 'sad': return <Frown className="w-4 h-4 text-blue-400" />;
      case 'angry': return <Angry className="w-4 h-4 text-red-400" />;
      case 'excited': return <Zap className="w-4 h-4 text-yellow-400" />;
      default: return <Meh className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'merchant': return <ShoppingBag className="w-4 h-4 text-yellow-400" />;
      case 'quest_giver': return <Trophy className="w-4 h-4 text-purple-400" />;
      case 'guard': return <Users className="w-4 h-4 text-blue-400" />;
      case 'citizen': return <Users className="w-4 h-4 text-green-400" />;
      case 'guide': return <BookOpen className="w-4 h-4 text-orange-400" />;
      default: return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'merchant': return 'border-yellow-400 bg-yellow-400/10';
      case 'quest_giver': return 'border-purple-400 bg-purple-400/10';
      case 'guard': return 'border-blue-400 bg-blue-400/10';
      case 'citizen': return 'border-green-400 bg-green-400/10';
      case 'guide': return 'border-orange-400 bg-orange-400/10';
      default: return 'border-gray-400 bg-gray-400/10';
    }
  };

  const filteredNPCs = npcs.filter(npc => {
    if (filterType !== 'all' && npc.type !== filterType) return false;
    if (showOnlyNearby && playerPosition) {
      const distance = Math.sqrt(
        Math.pow(npc.location.x - playerPosition.x, 2) + 
        Math.pow(npc.location.y - playerPosition.y, 2)
      );
      return distance <= 100; // Within 100 units
    }
    return true;
  });

  const renderNPCCard = (npc: NPC) => (
    <div 
      key={npc.id} 
      className={`p-4 rounded-lg border ${getTypeColor(npc.type)} hover:opacity-80 transition-opacity cursor-pointer`}
      onClick={() => setSelectedNPC(npc)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{npc.appearance.avatar}</div>
          <div>
            <h3 className="text-white font-medium text-lg">{npc.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {getTypeIcon(npc.type)}
              <span className="capitalize">{npc.type.replace('_', ' ')}</span>
              <span>•</span>
              <span>Level {npc.stats.level}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getMoodIcon(npc.personality.mood)}
          <span className="text-xs text-slate-400 capitalize">{npc.personality.mood}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{npc.location.area}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          <span>{npc.personality.friendliness}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Brain className="w-4 h-4" />
          <span>{npc.personality.intelligence}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-300">
          {npc.quests.length} quests available
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStartConversation(npc);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
        >
          <MessageCircle className="w-4 h-4" />
          Talk
        </button>
      </div>
    </div>
  );

  const renderConversation = () => {
    if (!currentConversation || !selectedNPC) return null;

    return (
      <div className="space-y-4">
        {/* Conversation Header */}
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{selectedNPC.appearance.avatar}</div>
              <div>
                <h3 className="text-white font-medium text-lg">{selectedNPC.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  {getMoodIcon(selectedNPC.personality.mood)}
                  <span className="capitalize">{selectedNPC.personality.mood}</span>
                  <span>•</span>
                  <span>{selectedNPC.personality.friendliness}% friendly</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleEndConversation}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-slate-800 rounded-lg h-64 overflow-y-auto p-4 space-y-3">
          {currentConversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.speaker === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  message.speaker === 'player'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                <div className="text-sm">{message.message}</div>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    );
  };

  const renderMap = () => (
    <div className="space-y-4">
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <h3 className="text-white font-medium text-lg mb-3">NPC Locations</h3>
        <div className="grid grid-cols-2 gap-4">
          {npcs.map(npc => (
            <div key={npc.id} className="flex items-center gap-3 p-2 bg-slate-800 rounded">
              <div className="text-xl">{npc.appearance.avatar}</div>
              <div>
                <div className="text-white text-sm font-medium">{npc.name}</div>
                <div className="text-slate-400 text-xs">{npc.location.area}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-xl font-bold">AI NPCs</h2>
            <div className="text-slate-400 text-sm">
              {filteredNPCs.length} NPCs found
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-400 hover:text-white transition-colors p-2"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-slate-700/50 p-4 border-b border-slate-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-slate-300 text-sm">Filter by type:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-600 text-white px-2 py-1 rounded text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="merchant">Merchants</option>
                  <option value="quest_giver">Quest Givers</option>
                  <option value="guard">Guards</option>
                  <option value="citizen">Citizens</option>
                  <option value="guide">Guides</option>
                </select>
              </div>
              <button
                onClick={() => setShowOnlyNearby(!showOnlyNearby)}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                  showOnlyNearby 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-600 text-slate-300'
                }`}
              >
                {showOnlyNearby ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Show Only Nearby
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-slate-700/50 p-4 border-b border-slate-600">
          <div className="flex gap-2">
            {['list', 'conversation', 'map'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'list' && (
            <div className="space-y-4">
              {filteredNPCs.map(renderNPCCard)}
            </div>
          )}
          
          {activeTab === 'conversation' && renderConversation()}
          
          {activeTab === 'map' && renderMap()}
        </div>
      </div>
    </div>
  );
}
