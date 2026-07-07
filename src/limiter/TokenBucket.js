import BaseLimiter from "./BaseLimiter.js";

class TokenBucket extends BaseLimiter {

    constructor({ redis, capacity, refillRate, interval }) {
        super({ redis });

        this.validatePositiveInteger(capacity, "capacity");
        this.validatePositiveInteger(refillRate, "refillRate");
        this.validatePositiveInteger(interval, "interval");

        this.capacity = capacity;
        this.refillRate = refillRate;
        this.interval = interval;
    }

    async consume(key) {

        const tokenKey = `${key}:tokens`;
        const timeKey = `${key}:lastRefill`;

        const now = Date.now();

        const storedTokens = await this.redis.get(tokenKey);
        const storedLastRefill = await this.redis.get(timeKey);

        let tokens;
        let lastRefill;

        // First request
        if (storedTokens === null || storedLastRefill === null) {
            tokens = this.capacity;
            lastRefill = now;
        } else {
            tokens = Number(storedTokens);
            lastRefill = Number(storedLastRefill);
        }

        // Calculate elapsed time
        const elapsed = (now - lastRefill) / 1000;

        // Number of complete intervals passed
        const intervalsPassed = Math.floor(elapsed / this.interval);

        // Refill tokens
        if (intervalsPassed > 0) {
            tokens = Math.min(
                this.capacity,
                tokens + intervalsPassed * this.refillRate
            );

            lastRefill += intervalsPassed * this.interval * 1000;
        }

        if (tokens <= 0) {

            await this.redis.set(tokenKey, tokens);
            await this.redis.set(timeKey, lastRefill);

            return this.createResponse({
                allowed: false,
                limit: this.capacity,
                remaining: 0
            });
        }

        tokens--;

        await this.redis.set(tokenKey, tokens);
        await this.redis.set(timeKey, lastRefill);

        return this.createResponse({
            allowed: true,
            limit: this.capacity,
            remaining: tokens
        });
    }
}

export default TokenBucket;