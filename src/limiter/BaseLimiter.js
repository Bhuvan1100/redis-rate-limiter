class BaseLimiter {
    constructor({ redis }) {
        this.validateRedis(redis);
        this.redis = redis;
    }

    validateRedis(redis) {
        if (!redis) {
            throw new Error("A connected Redis client is required.");
        }

        if (
            typeof redis.get !== "function" ||
            typeof redis.set !== "function"
        ) {
            throw new Error("Invalid Redis client provided.");
        }
    }

    validatePositiveInteger(value, name) {
        if (!Number.isInteger(value) || value <= 0) {
            throw new Error(`${name} must be a positive integer.`);
        }
    }


    createResponse({
        allowed,
        limit,
        remaining,
        retryAfter = null,
        resetTime = null
    }) {
        return {
            allowed,
            limit,
            remaining,
            retryAfter,
            resetTime
        };
    }
}

export default BaseLimiter;