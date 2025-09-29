import { EventEmitter } from 'events';
import { TradeOffer } from './TradingService';

interface TradePattern {
  userId: string;
  trades: {
    offerId: string;
    timestamp: number;
    value: number;
    partner: string;
  }[];
}

interface SuspiciousActivity {
  userId: string;
  type: 'high_frequency' | 'value_transfer' | 'circular_trading' | 'multiple_accounts';
  details: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

export class TradeMonitoringService {
  private static instance: TradeMonitoringService;
  private eventEmitter: EventEmitter;
  private tradePatterns: Map<string, TradePattern>;
  private suspiciousActivities: SuspiciousActivity[];
  private readonly MONITORING_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
  private readonly THRESHOLDS = {
    maxTradesPerHour: 10,
    maxValueTransferRatio: 5,
    minTimeBetweenTrades: 60 * 1000, // 1 minute
    maxCircularTradeSize: 3
  };

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.tradePatterns = new Map();
    this.suspiciousActivities = [];
  }

  static getInstance(): TradeMonitoringService {
    if (!TradeMonitoringService.instance) {
      TradeMonitoringService.instance = new TradeMonitoringService();
    }
    return TradeMonitoringService.instance;
  }

  async monitorTrade(offer: TradeOffer): Promise<boolean> {
    try {
      // Update trade patterns
      this.updateTradePatterns(offer);

      // Run all checks
      const checks = await Promise.all([
        this.checkHighFrequencyTrading(offer),
        this.checkValueTransfer(offer),
        this.checkCircularTrading(offer),
        this.checkMultipleAccounts(offer)
      ]);

      // If any check returns true, the trade is suspicious
      const isSuspicious = checks.some(result => result);

      if (isSuspicious) {
        this.eventEmitter.emit('suspiciousActivity', {
          offerId: offer.id,
          checks
        });
      }

      return !isSuspicious;
    } catch (error) {
      console.error('Error monitoring trade:', error);
      return false;
    }
  }

  private updateTradePatterns(offer: TradeOffer): void {
    const now = Date.now();
    const tradeValue = this.calculateTradeValue(offer);

    // Update initiator's pattern
    this.updateUserPattern(offer.initiatorId, {
      offerId: offer.id,
      timestamp: now,
      value: tradeValue,
      partner: offer.recipientId
    });

    // Update recipient's pattern
    this.updateUserPattern(offer.recipientId, {
      offerId: offer.id,
      timestamp: now,
      value: tradeValue,
      partner: offer.initiatorId
    });

    // Clean up old patterns
    this.cleanupOldPatterns();
  }

  private updateUserPattern(userId: string, trade: { offerId: string; timestamp: number; value: number; partner: string }): void {
    let pattern = this.tradePatterns.get(userId);
    if (!pattern) {
      pattern = { userId, trades: [] };
      this.tradePatterns.set(userId, pattern);
    }

    pattern.trades.push(trade);
  }

  private async checkHighFrequencyTrading(offer: TradeOffer): Promise<boolean> {
    const initiatorPattern = this.tradePatterns.get(offer.initiatorId);
    const recipientPattern = this.tradePatterns.get(offer.recipientId);

    if (!initiatorPattern || !recipientPattern) return false;

    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);

    // Count trades in the last hour
    const initiatorTradesLastHour = initiatorPattern.trades.filter(t => t.timestamp > hourAgo).length;
    const recipientTradesLastHour = recipientPattern.trades.filter(t => t.timestamp > hourAgo).length;

    if (initiatorTradesLastHour > this.THRESHOLDS.maxTradesPerHour ||
        recipientTradesLastHour > this.THRESHOLDS.maxTradesPerHour) {
      this.addSuspiciousActivity({
        userId: initiatorTradesLastHour > this.THRESHOLDS.maxTradesPerHour ? offer.initiatorId : offer.recipientId,
        type: 'high_frequency',
        details: 'Excessive trading frequency detected',
        severity: 'medium',
        timestamp: now
      });
      return true;
    }

    return false;
  }

  private async checkValueTransfer(offer: TradeOffer): Promise<boolean> {
    const initiatorValue = this.calculateSideValue(offer.initiatorItems, offer.initiatorTokens);
    const recipientValue = this.calculateSideValue(offer.recipientItems, offer.recipientTokens);

    const ratio = Math.max(initiatorValue, recipientValue) / Math.min(initiatorValue, recipientValue);

    if (ratio > this.THRESHOLDS.maxValueTransferRatio) {
      this.addSuspiciousActivity({
        userId: initiatorValue > recipientValue ? offer.initiatorId : offer.recipientId,
        type: 'value_transfer',
        details: 'Suspicious value transfer detected',
        severity: 'high',
        timestamp: Date.now()
      });
      return true;
    }

    return false;
  }

  private async checkCircularTrading(offer: TradeOffer): Promise<boolean> {
    const initiatorPattern = this.tradePatterns.get(offer.initiatorId);
    if (!initiatorPattern) return false;

    const recentTrades = new Set<string>();
    let currentUserId = offer.initiatorId;
    let depth = 0;

    while (depth < this.THRESHOLDS.maxCircularTradeSize) {
      const pattern = this.tradePatterns.get(currentUserId);
      if (!pattern) break;

      const lastTrade = pattern.trades[pattern.trades.length - 1];
      if (!lastTrade || recentTrades.has(lastTrade.partner)) {
        if (recentTrades.has(offer.initiatorId)) {
          this.addSuspiciousActivity({
            userId: offer.initiatorId,
            type: 'circular_trading',
            details: 'Circular trading pattern detected',
            severity: 'high',
            timestamp: Date.now()
          });
          return true;
        }
        break;
      }

      recentTrades.add(lastTrade.partner);
      currentUserId = lastTrade.partner;
      depth++;
    }

    return false;
  }

  private async checkMultipleAccounts(offer: TradeOffer): Promise<boolean> {
    const initiatorPattern = this.tradePatterns.get(offer.initiatorId);
    if (!initiatorPattern) return false;

    // Check if the same IP or device is used across multiple accounts
    // This would require additional user session/device tracking
    // Placeholder for future implementation

    return false;
  }

  private calculateTradeValue(offer: TradeOffer): number {
    return this.calculateSideValue(offer.initiatorItems, offer.initiatorTokens) +
           this.calculateSideValue(offer.recipientItems, offer.recipientTokens);
  }

  private calculateSideValue(items: any[], tokens: number): number {
    const itemValue = items.reduce((total, item) => {
      return total + (item.value || 0) * (item.quantity || 1);
    }, 0);
    return itemValue + tokens;
  }

  private cleanupOldPatterns(): void {
    const now = Date.now();
    for (const [userId, pattern] of this.tradePatterns.entries()) {
      pattern.trades = pattern.trades.filter(trade => 
        now - trade.timestamp <= this.MONITORING_WINDOW
      );

      if (pattern.trades.length === 0) {
        this.tradePatterns.delete(userId);
      }
    }
  }

  private addSuspiciousActivity(activity: SuspiciousActivity): void {
    this.suspiciousActivities.push(activity);
    this.eventEmitter.emit('suspiciousActivityDetected', activity);
  }

  async getSuspiciousActivities(userId?: string): Promise<SuspiciousActivity[]> {
    if (userId) {
      return this.suspiciousActivities.filter(activity => activity.userId === userId);
    }
    return this.suspiciousActivities;
  }

  onSuspiciousActivity(callback: (activity: SuspiciousActivity) => void): void {
    this.eventEmitter.on('suspiciousActivityDetected', callback);
  }
}

export const tradeMonitoringService = TradeMonitoringService.getInstance();
