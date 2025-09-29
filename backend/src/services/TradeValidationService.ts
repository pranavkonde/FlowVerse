import { InventoryItem } from './InventoryService';
import { TradeOffer } from './TradingService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class TradeValidationService {
  private static instance: TradeValidationService;
  private readonly MAX_ITEMS_PER_TRADE = 12;
  private readonly MAX_TOKENS_PER_TRADE = 1000000;
  private readonly SUSPICIOUS_PATTERNS = {
    maxValueDifference: 10000, // Maximum allowed difference in total value
    maxRarityDifference: 2, // Maximum allowed difference in total rarity score
  };

  private constructor() {}

  static getInstance(): TradeValidationService {
    if (!TradeValidationService.instance) {
      TradeValidationService.instance = new TradeValidationService();
    }
    return TradeValidationService.instance;
  }

  async validateTradeOffer(offer: TradeOffer): Promise<ValidationResult> {
    const errors: string[] = [];

    // Basic validation
    if (!this.validateBasicRequirements(offer, errors)) {
      return { isValid: false, errors };
    }

    // Item validation
    if (!this.validateItems(offer, errors)) {
      return { isValid: false, errors };
    }

    // Token validation
    if (!this.validateTokens(offer, errors)) {
      return { isValid: false, errors };
    }

    // Anti-scam validation
    if (!this.validateAgainstScams(offer, errors)) {
      return { isValid: false, errors };
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateBasicRequirements(offer: TradeOffer, errors: string[]): boolean {
    if (!offer.initiatorId || !offer.recipientId) {
      errors.push('Invalid trade participants');
      return false;
    }

    if (offer.initiatorId === offer.recipientId) {
      errors.push('Cannot trade with yourself');
      return false;
    }

    if (offer.status !== 'pending') {
      errors.push('Trade is no longer pending');
      return false;
    }

    return true;
  }

  private validateItems(offer: TradeOffer, errors: string[]): boolean {
    let isValid = true;

    // Check item count
    if (offer.initiatorItems.length > this.MAX_ITEMS_PER_TRADE) {
      errors.push(`Initiator cannot offer more than ${this.MAX_ITEMS_PER_TRADE} items`);
      isValid = false;
    }

    if (offer.recipientItems.length > this.MAX_ITEMS_PER_TRADE) {
      errors.push(`Recipient cannot offer more than ${this.MAX_ITEMS_PER_TRADE} items`);
      isValid = false;
    }

    // Validate each item
    const validateItemSet = (items: InventoryItem[], role: string) => {
      const seenIds = new Set<string>();
      
      items.forEach(item => {
        // Check for duplicate items
        if (seenIds.has(item.id)) {
          errors.push(`${role} has duplicate item: ${item.name}`);
          isValid = false;
        }
        seenIds.add(item.id);

        // Validate item properties
        if (!this.validateItemProperties(item)) {
          errors.push(`${role} has invalid item: ${item.name}`);
          isValid = false;
        }
      });
    };

    validateItemSet(offer.initiatorItems, 'Initiator');
    validateItemSet(offer.recipientItems, 'Recipient');

    return isValid;
  }

  private validateItemProperties(item: InventoryItem): boolean {
    return (
      item.id !== undefined &&
      item.name !== undefined &&
      item.type !== undefined &&
      item.rarity !== undefined &&
      item.quantity > 0 &&
      (item.quantity === 1 || item.stackable)
    );
  }

  private validateTokens(offer: TradeOffer, errors: string[]): boolean {
    let isValid = true;

    if (offer.initiatorTokens < 0 || offer.recipientTokens < 0) {
      errors.push('Token amounts cannot be negative');
      isValid = false;
    }

    if (offer.initiatorTokens > this.MAX_TOKENS_PER_TRADE) {
      errors.push(`Initiator token amount exceeds maximum (${this.MAX_TOKENS_PER_TRADE})`);
      isValid = false;
    }

    if (offer.recipientTokens > this.MAX_TOKENS_PER_TRADE) {
      errors.push(`Recipient token amount exceeds maximum (${this.MAX_TOKENS_PER_TRADE})`);
      isValid = false;
    }

    return isValid;
  }

  private validateAgainstScams(offer: TradeOffer, errors: string[]): boolean {
    let isValid = true;

    // Calculate total value for both sides
    const initiatorValue = this.calculateTotalValue(offer.initiatorItems, offer.initiatorTokens);
    const recipientValue = this.calculateTotalValue(offer.recipientItems, offer.recipientTokens);

    // Check for suspicious value differences
    const valueDifference = Math.abs(initiatorValue - recipientValue);
    if (valueDifference > this.SUSPICIOUS_PATTERNS.maxValueDifference) {
      errors.push('Suspicious trade value difference detected');
      isValid = false;
    }

    // Calculate rarity scores
    const initiatorRarity = this.calculateRarityScore(offer.initiatorItems);
    const recipientRarity = this.calculateRarityScore(offer.recipientItems);

    // Check for suspicious rarity differences
    const rarityDifference = Math.abs(initiatorRarity - recipientRarity);
    if (rarityDifference > this.SUSPICIOUS_PATTERNS.maxRarityDifference) {
      errors.push('Suspicious rarity difference detected');
      isValid = false;
    }

    return isValid;
  }

  private calculateTotalValue(items: InventoryItem[], tokens: number): number {
    const itemValue = items.reduce((total, item) => {
      const rarityMultiplier = this.getRarityMultiplier(item.rarity);
      return total + (item.quantity * rarityMultiplier * 100);
    }, 0);

    return itemValue + tokens;
  }

  private calculateRarityScore(items: InventoryItem[]): number {
    return items.reduce((score, item) => {
      return score + this.getRarityMultiplier(item.rarity);
    }, 0);
  }

  private getRarityMultiplier(rarity: string): number {
    const multipliers: { [key: string]: number } = {
      common: 1,
      uncommon: 2,
      rare: 4,
      epic: 8,
      legendary: 16
    };
    return multipliers[rarity] || 1;
  }
}

export const tradeValidationService = TradeValidationService.getInstance();
