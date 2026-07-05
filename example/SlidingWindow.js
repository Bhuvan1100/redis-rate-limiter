import { createClient } from "redis";
import { SlidingWindow } from "../src/index.js";

// Create a Redis client.
const redis = createClient({
    url: "redis://localhost:6379"
});

// Connect to Redis.
await redis.connect();

// Create a Sliding Window limiter.
const limiter = new SlidingWindow({
    redis,
    window: 60000,
    max: 5
});

// Consume one request.
const result = await limiter.consume("user:1");

console.log(result);

// Close Redis connection.
await redis.quit();