import { 
  LandPlot, 
  Building, 
  LandResource, 
  Decoration, 
  LandPermission,
  LandType,
  BuildingType,
  ResourceType,
  DecorationType,
  LAND_EVENTS,
  LAND_NOTIFICATIONS
} from '../types/land';

export class LandService {
  private socket: any;
  private eventListeners: Map<string, Function[]> = new Map();
  private notificationListeners: Map<string, Function[]> = new Map();

  constructor(socket: any) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  // Land Management
  async purchaseLand(landData: Partial<LandPlot>): Promise<LandPlot> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:purchase_land', landData, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async sellLand(landId: string, price: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:sell_land', { landId, price }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async rentLand(landId: string, duration: number, price: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:rent_land', { landId, duration, price }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getLands(filters?: { type?: LandType; isForSale?: boolean; isRentable?: boolean }): Promise<LandPlot[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:get_lands', filters, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getUserLands(): Promise<LandPlot[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:get_user_lands', (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Building Management
  async constructBuilding(landId: string, buildingData: Partial<Building>): Promise<Building> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:construct_building', { landId, buildingData }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async demolishBuilding(buildingId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:demolish_building', { buildingId }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async upgradeBuilding(buildingId: string, upgradeData: Partial<Building>): Promise<Building> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:upgrade_building', { buildingId, upgradeData }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getBuildings(filters?: { type?: BuildingType; category?: string; isConstructed?: boolean }): Promise<Building[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:get_buildings', filters, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getUserBuildings(): Promise<Building[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:get_user_buildings', (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Resource Management
  async harvestResource(resourceId: string, amount: number): Promise<number> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:harvest_resource', { resourceId, amount }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Decoration Management
  async placeDecoration(landId: string, decorationData: Partial<Decoration>): Promise<Decoration> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:place_decoration', { landId, decorationData }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async removeDecoration(decorationId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:remove_decoration', { decorationId }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Permission Management
  async grantPermission(landId: string, permissionData: Partial<LandPermission>): Promise<LandPermission> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:grant_permission', { landId, permissionData }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async revokePermission(permissionId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('land:revoke_permission', { permissionId }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Event Listeners
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Notification Listeners
  onNotification(notification: string, callback: Function): void {
    if (!this.notificationListeners.has(notification)) {
      this.notificationListeners.set(notification, []);
    }
    this.notificationListeners.get(notification)!.push(callback);
  }

  offNotification(notification: string, callback: Function): void {
    const listeners = this.notificationListeners.get(notification);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Private Methods
  private setupSocketListeners(): void {
    // Land Events
    this.socket.on(LAND_EVENTS.LAND_PURCHASED, (data: any) => {
      this.emitEvent(LAND_EVENTS.LAND_PURCHASED, data);
    });

    this.socket.on(LAND_EVENTS.LAND_SOLD, (data: any) => {
      this.emitEvent(LAND_EVENTS.LAND_SOLD, data);
    });

    this.socket.on(LAND_EVENTS.LAND_RENTED, (data: any) => {
      this.emitEvent(LAND_EVENTS.LAND_RENTED, data);
    });

    this.socket.on(LAND_EVENTS.LAND_RENT_EXPIRED, (data: any) => {
      this.emitEvent(LAND_EVENTS.LAND_RENT_EXPIRED, data);
    });

    // Building Events
    this.socket.on(LAND_EVENTS.BUILDING_CONSTRUCTED, (data: any) => {
      this.emitEvent(LAND_EVENTS.BUILDING_CONSTRUCTED, data);
    });

    this.socket.on(LAND_EVENTS.BUILDING_DEMOLISHED, (data: any) => {
      this.emitEvent(LAND_EVENTS.BUILDING_DEMOLISHED, data);
    });

    this.socket.on(LAND_EVENTS.BUILDING_UPGRADED, (data: any) => {
      this.emitEvent(LAND_EVENTS.BUILDING_UPGRADED, data);
    });

    // Resource Events
    this.socket.on(LAND_EVENTS.RESOURCE_HARVESTED, (data: any) => {
      this.emitEvent(LAND_EVENTS.RESOURCE_HARVESTED, data);
    });

    this.socket.on(LAND_EVENTS.RESOURCE_REGENERATED, (data: any) => {
      this.emitEvent(LAND_EVENTS.RESOURCE_REGENERATED, data);
    });

    // Decoration Events
    this.socket.on(LAND_EVENTS.DECORATION_PLACED, (data: any) => {
      this.emitEvent(LAND_EVENTS.DECORATION_PLACED, data);
    });

    this.socket.on(LAND_EVENTS.DECORATION_REMOVED, (data: any) => {
      this.emitEvent(LAND_EVENTS.DECORATION_REMOVED, data);
    });

    // Permission Events
    this.socket.on(LAND_EVENTS.PERMISSION_GRANTED, (data: any) => {
      this.emitEvent(LAND_EVENTS.PERMISSION_GRANTED, data);
    });

    this.socket.on(LAND_EVENTS.PERMISSION_REVOKED, (data: any) => {
      this.emitEvent(LAND_EVENTS.PERMISSION_REVOKED, data);
    });

    // Production Events
    this.socket.on(LAND_EVENTS.PRODUCTION_STARTED, (data: any) => {
      this.emitEvent(LAND_EVENTS.PRODUCTION_STARTED, data);
    });

    this.socket.on(LAND_EVENTS.PRODUCTION_COMPLETED, (data: any) => {
      this.emitEvent(LAND_EVENTS.PRODUCTION_COMPLETED, data);
    });

    // Worker Events
    this.socket.on(LAND_EVENTS.WORKER_HIRED, (data: any) => {
      this.emitEvent(LAND_EVENTS.WORKER_HIRED, data);
    });

    this.socket.on(LAND_EVENTS.WORKER_FIRED, (data: any) => {
      this.emitEvent(LAND_EVENTS.WORKER_FIRED, data);
    });

    this.socket.on(LAND_EVENTS.TASK_ASSIGNED, (data: any) => {
      this.emitEvent(LAND_EVENTS.TASK_ASSIGNED, data);
    });

    this.socket.on(LAND_EVENTS.TASK_COMPLETED, (data: any) => {
      this.emitEvent(LAND_EVENTS.TASK_COMPLETED, data);
    });

    // Upgrade Events
    this.socket.on(LAND_EVENTS.UPGRADE_STARTED, (data: any) => {
      this.emitEvent(LAND_EVENTS.UPGRADE_STARTED, data);
    });

    this.socket.on(LAND_EVENTS.UPGRADE_COMPLETED, (data: any) => {
      this.emitEvent(LAND_EVENTS.UPGRADE_COMPLETED, data);
    });

    // Storage Events
    this.socket.on(LAND_EVENTS.STORAGE_ACCESSED, (data: any) => {
      this.emitEvent(LAND_EVENTS.STORAGE_ACCESSED, data);
    });

    this.socket.on(LAND_EVENTS.STORAGE_UPDATED, (data: any) => {
      this.emitEvent(LAND_EVENTS.STORAGE_UPDATED, data);
    });

    // Achievement Events
    this.socket.on(LAND_EVENTS.ACHIEVEMENT_UNLOCKED, (data: any) => {
      this.emitEvent(LAND_EVENTS.ACHIEVEMENT_UNLOCKED, data);
    });

    this.socket.on(LAND_EVENTS.BADGE_EARNED, (data: any) => {
      this.emitEvent(LAND_EVENTS.BADGE_EARNED, data);
    });

    // Notifications
    this.socket.on(LAND_NOTIFICATIONS.LAND_PURCHASE_OFFER, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.LAND_PURCHASE_OFFER, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.LAND_RENTAL_OFFER, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.LAND_RENTAL_OFFER, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.BUILDING_CONSTRUCTION_COMPLETE, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.BUILDING_CONSTRUCTION_COMPLETE, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.RESOURCE_READY, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.RESOURCE_READY, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.PRODUCTION_COMPLETE, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.PRODUCTION_COMPLETE, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.WORKER_TASK_ASSIGNED, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.WORKER_TASK_ASSIGNED, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.UPGRADE_AVAILABLE, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.UPGRADE_AVAILABLE, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.PERMISSION_REQUEST, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.PERMISSION_REQUEST, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.RENT_EXPIRING, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.RENT_EXPIRING, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.ACHIEVEMENT_UNLOCKED, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.ACHIEVEMENT_UNLOCKED, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.BADGE_EARNED, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.BADGE_EARNED, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.STORAGE_FULL, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.STORAGE_FULL, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.WORKER_EFFICIENCY_LOW, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.WORKER_EFFICIENCY_LOW, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.RESOURCE_DEPLETED, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.RESOURCE_DEPLETED, data);
    });

    this.socket.on(LAND_NOTIFICATIONS.BUILDING_MAINTENANCE_REQUIRED, (data: any) => {
      this.emitNotification(LAND_NOTIFICATIONS.BUILDING_MAINTENANCE_REQUIRED, data);
    });
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  private emitNotification(notification: string, data: any): void {
    const listeners = this.notificationListeners.get(notification);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

export default LandService;
