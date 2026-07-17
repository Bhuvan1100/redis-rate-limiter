import BaseLimiter from "./BaseLimiter.js";
import { loadLuaScript } from "../lua/loadLuaScript.js";

class TokenBucket extends BaseLimiter {

    constructor({ redis, capacity, refillRate, interval }) {
        super({ redis });

        this.validatePositiveInteger(capacity, "capacity");
        this.validatePositiveInteger(refillRate, "refillRate");
        this.validatePositiveInteger(interval, "interval");

        this.capacity = capacity;
        this.refillRate = refillRate;
        this.interval = interval;

        this.scriptSha = null;
    }

    async getScriptSha() {
        if (!this.scriptSha) {
            this.scriptSha = await loadLuaScript(
                this.redis,
                "tokenBucket.lua"
            );
        }

        return this.scriptSha;
    }

    async consume(key) {

        const tokenKey = `${key}:tokens`;
        const timeKey = `${key}:lastRefill`;
        const now = Date.now();

        let sha = await this.getScriptSha();

        try {
            const [allowed, remaining, retryAfter] = await this.redis.evalSha(
                sha,
                {
                    keys: [tokenKey, timeKey],
                    arguments: [
                        this.capacity.toString(),
                        this.refillRate.toString(),
                        this.interval.toString(),
                        now.toString()
                    ]
                }
            );

            if (allowed === 1) {
                return this.createResponse({
                    allowed: true,
                    limit: this.capacity,
                    remaining
                });
            }

            return this.createResponse({
                allowed: false,
                limit: this.capacity,
                remaining: 0,
                retryAfter
            });

        } catch (err) {
            if (err.message.includes("NOSCRIPT")) {
                this.scriptSha = null;

                sha = await this.getScriptSha();

                const [allowed, remaining, retryAfter] = await this.redis.evalSha(
                    sha,
                    {
                        keys: [tokenKey, timeKey],
                        arguments: [
                            this.capacity.toString(),
                            this.refillRate.toString(),
                            this.interval.toString(),
                            now.toString()
                        ]
                    }
                );

                if (allowed === 1) {
                    return this.createResponse({
                        allowed: true,
                        limit: this.capacity,
                        remaining
                    });
                }

                return this.createResponse({
                    allowed: false,
                    limit: this.capacity,
                    remaining: 0,
                    retryAfter
                });
            }

            throw err;
        }
    }
}

export default TokenBucket;