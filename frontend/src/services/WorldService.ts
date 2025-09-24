import { io, Socket } from 'socket.io-client';
import {
  WorldObject,
  WorldEvent,
  EnvironmentalStory,
  WorldInteraction,
  WorldStats,
  InteractionResult,
  ObjectType,
  InteractionType,
  WorldEventType,
  StoryType
} from '../types/world';

class WorldService {
  private socket: Socket | null = null;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';
  }

  // Initialize socket connection
  initializeSocket(): void {
    if (!this.socket) {
      this.socket = io(this.baseUrl);
      this.setupEventListeners();
    }
  }

  // Setup socket event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('worldObjectUpdate', (object: WorldObject) => {
      this.handleWorldObjectUpdate(object);
    });

    this.socket.on('worldEventTriggered', (event: WorldEvent) => {
      this.handleWorldEventTriggered(event);
    });

    this.socket.on('storyProgress', (story: EnvironmentalStory) => {
      this.handleStoryProgress(story);
    });

    this.socket.on('interactionResult', (result: WorldInteraction) => {
      this.handleInteractionResult(result);
    });
  }

  // Get all world objects in an area
  async getWorldObjects(area?: { x: number; y: number; radius: number }): Promise<WorldObject[]> {
    try {
      const url = area 
        ? `${this.baseUrl}/api/world/objects?x=${area.x}&y=${area.y}&radius=${area.radius}`
        : `${this.baseUrl}/api/world/objects`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch world objects');
      return await response.json();
    } catch (error) {
      console.error('Error fetching world objects:', error);
      return [];
    }
  }

  // Get world object by ID
  async getWorldObject(objectId: string): Promise<WorldObject | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/objects/${objectId}`);
      if (!response.ok) throw new Error('Failed to fetch world object');
      return await response.json();
    } catch (error) {
      console.error('Error fetching world object:', error);
      return null;
    }
  }

  // Interact with a world object
  async interactWithObject(
    objectId: string,
    interactionId: string,
    playerId: string
  ): Promise<InteractionResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/objects/${objectId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interactionId, playerId })
      });
      
      if (!response.ok) throw new Error('Failed to interact with object');
      return await response.json();
    } catch (error) {
      console.error('Error interacting with object:', error);
      return null;
    }
  }

  // Get active world events
  async getActiveWorldEvents(): Promise<WorldEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/events/active`);
      if (!response.ok) throw new Error('Failed to fetch active world events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching active world events:', error);
      return [];
    }
  }

  // Get world event by ID
  async getWorldEvent(eventId: string): Promise<WorldEvent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/events/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch world event');
      return await response.json();
    } catch (error) {
      console.error('Error fetching world event:', error);
      return null;
    }
  }

  // Trigger a world event
  async triggerWorldEvent(eventId: string, playerId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/events/${eventId}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });
      return response.ok;
    } catch (error) {
      console.error('Error triggering world event:', error);
      return false;
    }
  }

  // Get environmental stories
  async getEnvironmentalStories(): Promise<EnvironmentalStory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/stories`);
      if (!response.ok) throw new Error('Failed to fetch environmental stories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching environmental stories:', error);
      return [];
    }
  }

  // Get environmental story by ID
  async getEnvironmentalStory(storyId: string): Promise<EnvironmentalStory | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/stories/${storyId}`);
      if (!response.ok) throw new Error('Failed to fetch environmental story');
      return await response.json();
    } catch (error) {
      console.error('Error fetching environmental story:', error);
      return null;
    }
  }

  // Update story progress
  async updateStoryProgress(storyId: string, playerId: string, progress: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/stories/${storyId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, progress })
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating story progress:', error);
      return false;
    }
  }

  // Get world interactions for a player
  async getPlayerInteractions(playerId: string): Promise<WorldInteraction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/interactions/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch player interactions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching player interactions:', error);
      return [];
    }
  }

  // Get world statistics
  async getWorldStats(): Promise<WorldStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/stats`);
      if (!response.ok) throw new Error('Failed to fetch world stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching world stats:', error);
      return null;
    }
  }

  // Search for objects by type
  async searchObjectsByType(type: ObjectType): Promise<WorldObject[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/objects/search?type=${type}`);
      if (!response.ok) throw new Error('Failed to search objects');
      return await response.json();
    } catch (error) {
      console.error('Error searching objects:', error);
      return [];
    }
  }

  // Search for objects by tags
  async searchObjectsByTags(tags: string[]): Promise<WorldObject[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/objects/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags })
      });
      if (!response.ok) throw new Error('Failed to search objects by tags');
      return await response.json();
    } catch (error) {
      console.error('Error searching objects by tags:', error);
      return [];
    }
  }

  // Get objects near a position
  async getObjectsNearPosition(x: number, y: number, radius: number): Promise<WorldObject[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/objects/near?x=${x}&y=${y}&radius=${radius}`);
      if (!response.ok) throw new Error('Failed to fetch nearby objects');
      return await response.json();
    } catch (error) {
      console.error('Error fetching nearby objects:', error);
      return [];
    }
  }

  // Get interactive objects in an area
  async getInteractiveObjects(area?: { x: number; y: number; radius: number }): Promise<WorldObject[]> {
    try {
      const url = area 
        ? `${this.baseUrl}/api/world/objects/interactive?x=${area.x}&y=${area.y}&radius=${area.radius}`
        : `${this.baseUrl}/api/world/objects/interactive`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch interactive objects');
      return await response.json();
    } catch (error) {
      console.error('Error fetching interactive objects:', error);
      return [];
    }
  }

  // Get collectible objects
  async getCollectibleObjects(): Promise<WorldObject[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/objects/collectible`);
      if (!response.ok) throw new Error('Failed to fetch collectible objects');
      return await response.json();
    } catch (error) {
      console.error('Error fetching collectible objects:', error);
      return [];
    }
  }

  // Get world events by type
  async getWorldEventsByType(type: WorldEventType): Promise<WorldEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/events/type/${type}`);
      if (!response.ok) throw new Error('Failed to fetch world events by type');
      return await response.json();
    } catch (error) {
      console.error('Error fetching world events by type:', error);
      return [];
    }
  }

  // Get environmental stories by type
  async getStoriesByType(type: StoryType): Promise<EnvironmentalStory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/stories/type/${type}`);
      if (!response.ok) throw new Error('Failed to fetch stories by type');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stories by type:', error);
      return [];
    }
  }

  // Get completed stories for a player
  async getCompletedStories(playerId: string): Promise<EnvironmentalStory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/world/stories/completed/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch completed stories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching completed stories:', error);
      return [];
    }
  }

  // Event handlers
  private handleWorldObjectUpdate(object: WorldObject): void {
    window.dispatchEvent(new CustomEvent('worldObjectUpdate', { detail: object }));
  }

  private handleWorldEventTriggered(event: WorldEvent): void {
    window.dispatchEvent(new CustomEvent('worldEventTriggered', { detail: event }));
  }

  private handleStoryProgress(story: EnvironmentalStory): void {
    window.dispatchEvent(new CustomEvent('storyProgress', { detail: story }));
  }

  private handleInteractionResult(result: WorldInteraction): void {
    window.dispatchEvent(new CustomEvent('interactionResult', { detail: result }));
  }

  // Utility methods
  isObjectInteractive(object: WorldObject): boolean {
    return object.properties.isInteractive && object.interactions.length > 0;
  }

  canInteractWithObject(object: WorldObject, interactionId: string): boolean {
    if (!this.isObjectInteractive(object)) return false;
    
    const interaction = object.interactions.find(i => i.id === interactionId);
    if (!interaction) return false;

    // Check cooldown
    if (interaction.cooldown && interaction.lastUsed) {
      const timeSinceLastUse = Date.now() - interaction.lastUsed.getTime();
      if (timeSinceLastUse < interaction.cooldown) return false;
    }

    return true;
  }

  getObjectTypeIcon(type: ObjectType): string {
    const icons = {
      decoration: '🎨',
      furniture: '🪑',
      machine: '⚙️',
      container: '📦',
      portal: '🌀',
      collectible: '💎',
      tool: '🔧',
      weapon: '⚔️',
      armor: '🛡️',
      consumable: '🍎',
      building: '🏠',
      nature: '🌳',
      artifact: '🏺',
      mystery: '❓'
    };
    return icons[type] || '📦';
  }

  getInteractionTypeIcon(type: InteractionType): string {
    const icons = {
      examine: '👁️',
      use: '✋',
      collect: '📥',
      activate: '⚡',
      repair: '🔧',
      upgrade: '⬆️',
      trade: '🤝',
      craft: '🔨',
      destroy: '💥',
      move: '↔️',
      custom: '🎯'
    };
    return icons[type] || '👁️';
  }

  getRarityColor(rarity: string): string {
    const colors = {
      common: 'text-gray-600',
      uncommon: 'text-green-600',
      rare: 'text-blue-600',
      epic: 'text-purple-600',
      legendary: 'text-yellow-600'
    };
    return colors[rarity] || 'text-gray-600';
  }

  getRarityBackground(rarity: string): string {
    const backgrounds = {
      common: 'bg-gray-100',
      uncommon: 'bg-green-100',
      rare: 'bg-blue-100',
      epic: 'bg-purple-100',
      legendary: 'bg-yellow-100'
    };
    return backgrounds[rarity] || 'bg-gray-100';
  }

  formatObjectDescription(object: WorldObject): string {
    let description = object.metadata.description;
    
    if (object.metadata.lore) {
      description += `\n\nLore: ${object.metadata.lore}`;
    }
    
    if (object.properties.health && object.properties.maxHealth) {
      description += `\nHealth: ${object.state.currentHealth}/${object.properties.maxHealth}`;
    }
    
    if (object.properties.durability && object.properties.maxDurability) {
      description += `\nDurability: ${object.state.currentDurability}/${object.properties.maxDurability}`;
    }
    
    return description;
  }

  // Cleanup
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const worldService = new WorldService();
