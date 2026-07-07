import BaseLimiter from "./BaseLimiter.js";

class FixedWindow extends BaseLimiter {

    constructor({ redis, window, max }) {
        super({ redis });

        this.validatePositiveInteger(window, "window");
        this.validatePositiveInteger(max, "max");

        this.window = window;
        this.max = max;
    }

    async consume(key) {

        const count = await this.redis.incr(key);

        if (count === 1) {
            await this.redis.expire(key, this.window);
        }

        if (count <= this.max) {
            return this.createResponse({
                allowed: true,
                limit: this.max,
                remaining: this.max - count
            });
        }

        return this.createResponse({
            allowed: false,
            limit: this.max,
            remaining: 0
        });
    }

}

export default FixedWindow;