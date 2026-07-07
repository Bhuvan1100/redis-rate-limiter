import { createClient } from "redis";
import { TokenBucket } from "../src";

// Create a Redis client.
const redis = createClient({
    url: "redis://localhost:6379"
});

// Connect to Redis.
await redis.connect();

const limiter = new TokenBucket({
    redis,
    capacity: 10,
    refillRate: 5,
    interval: 60
});

for (let i = 1; i <= 12; i++) {
    const result = await limiter.consume("user:1");
    console.log(i, result);
}