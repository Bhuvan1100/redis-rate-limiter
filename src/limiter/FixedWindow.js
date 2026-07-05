class FixedWindow {

    constructor({ redis, window, max }) {
        this.redis = redis;
        this.window = window;
        this.max = max;
    }

    async consume(key) {

        const count = await this.redis.incr(key);

        if (count === 1) {
            await this.redis.expire(key, this.window);
        }

        if (count <= this.max) {
            return {
                allowed: true,
                remaining: this.max - count
            };
        }

        return {
            allowed: false,
            remaining: 0
        };
    }

}

export default FixedWindow;