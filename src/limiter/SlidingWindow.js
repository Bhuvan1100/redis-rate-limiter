class SlidingWindow {

    constructor({ redis, window, max }) {
        this.redis = redis;
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

            return {
                allowed: false,
                remaining: 0
            };

        }

       
        await this.redis.zAdd(key, {
            score: now,
            value: `${now}-${Math.random()}`
        });

        
        await this.redis.expire(
            key,
            Math.ceil(this.window / 1000)
        );

        return {
            allowed: true,
            remaining: this.max - count - 1
        };

    }

}

export default SlidingWindow;