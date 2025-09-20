export class RateLimitService {
  private requests: Map<string, number[]> = new Map();
  private limits: Map<string, { max: number; window: number }> = new Map();

  constructor() {
    // Set default rate limits
    this.setLimit('voice-command', { max: 10, window: 60000 }); // 10 per minute
    this.setLimit('api-call', { max: 100, window: 60000 }); // 100 per minute
    this.setLimit('blockchain', { max: 5, window: 60000 }); // 5 per minute
  }

  setLimit(key: string, limit: { max: number; window: number }): void {
    this.limits.set(key, limit);
  }

  isAllowed(key: string, identifier: string): boolean {
    const limit = this.limits.get(key);
    if (!limit) return true;

    const now = Date.now();
    const windowStart = now - limit.window;
    const requestKey = `${key}:${identifier}`;
    
    const requests = this.requests.get(requestKey) || [];
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= limit.max) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(requestKey, validRequests);
    return true;
  }

  getRemainingRequests(key: string, identifier: string): number {
    const limit = this.limits.get(key);
    if (!limit) return Infinity;

    const now = Date.now();
    const windowStart = now - limit.window;
    const requestKey = `${key}:${identifier}`;
    
    const requests = this.requests.get(requestKey) || [];
    const validRequests = requests.filter(time => time > windowStart);
    
    return Math.max(0, limit.max - validRequests.length);
  }

  getResetTime(key: string, identifier: string): number {
    const limit = this.limits.get(key);
    if (!limit) return 0;

    const requestKey = `${key}:${identifier}`;
    const requests = this.requests.get(requestKey) || [];
    
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    return oldestRequest + limit.window;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const limit = this.limits.get(key.split(':')[0]);
      if (limit) {
        const windowStart = now - limit.window;
        const validRequests = requests.filter(time => time > windowStart);
        if (validRequests.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, validRequests);
        }
      }
    }
  }
}
