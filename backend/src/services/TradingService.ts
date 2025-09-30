import { EventEmitter } from 'events';
import { InventoryItem } from './InventoryService';

export interface TradeOffer {
  id: string;
  initiatorId: string;
  recipientId: string;
  initiatorItems: InventoryItem[];
  recipientItems: InventoryItem[];
  initiatorTokens: number;
  recipientTokens: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  initiatorAccepted: boolean;
  recipientAccepted: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export class TradingService {
  private static instance: TradingService;
  private eventEmitter: EventEmitter;
  private activeOffers: Map<string, TradeOffer>;
  private readonly OFFER_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.activeOffers = new Map();
  }

  static getInstance(): TradingService {
    if (!TradingService.instance) {
      TradingService.instance = new TradingService();
    }
    return TradingService.instance;
  }

  async createTradeOffer(
    initiatorId: string,
    recipientId: string,
    initiatorItems: InventoryItem[],
    initiatorTokens: number = 0
  ): Promise<TradeOffer> {
    const offer: TradeOffer = {
      id: crypto.randomUUID(),
      initiatorId,
      recipientId,
      initiatorItems,
      recipientItems: [],
      initiatorTokens,
      recipientTokens: 0,
      status: 'pending',
      initiatorAccepted: false,
      recipientAccepted: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.OFFER_EXPIRY_TIME)
    };

    this.activeOffers.set(offer.id, offer);
    this.eventEmitter.emit('offerCreated', { offer });

    // Set expiry timeout
    setTimeout(() => {
      this.expireOffer(offer.id);
    }, this.OFFER_EXPIRY_TIME);

    return offer;
  }

  async getTradeOffer(offerId: string): Promise<TradeOffer | null> {
    return this.activeOffers.get(offerId) || null;
  }

  async getUserActiveOffers(userId: string): Promise<TradeOffer[]> {
    return Array.from(this.activeOffers.values()).filter(
      offer =>
        (offer.initiatorId === userId || offer.recipientId === userId) &&
        offer.status === 'pending'
    );
  }

  async updateRecipientOffer(
    offerId: string,
    recipientItems: InventoryItem[],
    recipientTokens: number = 0
  ): Promise<TradeOffer | null> {
    const offer = this.activeOffers.get(offerId);
    if (!offer || offer.status !== 'pending') {
      return null;
    }

    offer.recipientItems = recipientItems;
    offer.recipientTokens = recipientTokens;
    offer.initiatorAccepted = false;
    offer.recipientAccepted = false;

    this.eventEmitter.emit('offerUpdated', { offer });
    return offer;
  }

  async acceptOffer(offerId: string, userId: string): Promise<boolean> {
    const offer = this.activeOffers.get(offerId);
    if (!offer || offer.status !== 'pending') {
      return false;
    }

    if (userId === offer.initiatorId) {
      offer.initiatorAccepted = true;
    } else if (userId === offer.recipientId) {
      offer.recipientAccepted = true;
    } else {
      return false;
    }

    // Check if both parties have accepted
    if (offer.initiatorAccepted && offer.recipientAccepted) {
      offer.status = 'completed';
      this.eventEmitter.emit('offerCompleted', { offer });
    } else {
      this.eventEmitter.emit('offerAccepted', { offer, userId });
    }

    return true;
  }

  async rejectOffer(offerId: string, userId: string): Promise<boolean> {
    const offer = this.activeOffers.get(offerId);
    if (!offer || offer.status !== 'pending') {
      return false;
    }

    if (userId !== offer.initiatorId && userId !== offer.recipientId) {
      return false;
    }

    offer.status = 'rejected';
    this.eventEmitter.emit('offerRejected', { offer, userId });
    return true;
  }

  async cancelOffer(offerId: string, userId: string): Promise<boolean> {
    const offer = this.activeOffers.get(offerId);
    if (!offer || offer.status !== 'pending' || offer.initiatorId !== userId) {
      return false;
    }

    offer.status = 'cancelled';
    this.eventEmitter.emit('offerCancelled', { offer });
    return true;
  }

  private async expireOffer(offerId: string): Promise<void> {
    const offer = this.activeOffers.get(offerId);
    if (offer && offer.status === 'pending') {
      offer.status = 'cancelled';
      this.eventEmitter.emit('offerExpired', { offer });
    }
  }

  onOfferCreated(callback: (data: { offer: TradeOffer }) => void): void {
    this.eventEmitter.on('offerCreated', callback);
  }

  onOfferUpdated(callback: (data: { offer: TradeOffer }) => void): void {
    this.eventEmitter.on('offerUpdated', callback);
  }

  onOfferAccepted(callback: (data: { offer: TradeOffer; userId: string }) => void): void {
    this.eventEmitter.on('offerAccepted', callback);
  }

  onOfferCompleted(callback: (data: { offer: TradeOffer }) => void): void {
    this.eventEmitter.on('offerCompleted', callback);
  }

  onOfferRejected(callback: (data: { offer: TradeOffer; userId: string }) => void): void {
    this.eventEmitter.on('offerRejected', callback);
  }

  onOfferCancelled(callback: (data: { offer: TradeOffer }) => void): void {
    this.eventEmitter.on('offerCancelled', callback);
  }

  onOfferExpired(callback: (data: { offer: TradeOffer }) => void): void {
    this.eventEmitter.on('offerExpired', callback);
  }
}

export const tradingService = TradingService.getInstance();

