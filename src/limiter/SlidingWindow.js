import BaseLimiter from "./BaseLimiter.js";

class SlidingWindow extends BaseLimiter {

    constructor({ redis, window, max }) {
        super({ redis });

        this.validatePositiveInteger(window, "window");
        this.validatePositiveInteger(max, "max");

        this.window = window;
        this.max = max;
    }

    async consume(key) {

        const now = Date.now();

        await this.redis.zRemRangeByScore(
            key,
            0,
            now - this.window
        );

        const count = await this.redis.zCard(key);

        if (count >= this.max) {
            return this.createResponse({
                allowed: false,
                limit: this.max,
                remaining: 0
            });
        }

        await this.redis.zAdd(key, {
            score: now,
            value: `${now}-${Math.random()}`
        });

        await this.redis.expire(
            key,
            Math.ceil(this.window / 1000)
        );

        return this.createResponse({
            allowed: true,
            limit: this.max,
            remaining: this.max - count - 1
        });

    }

}

export default SlidingWindow;