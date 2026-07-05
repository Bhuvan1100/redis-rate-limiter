import { createClient } from "redis";
import { FixedWindow } from "../src/index.js";

// Create a Redis client.
// By default Redis runs on localhost:6379.
const redis = createClient({
    url: "redis://localhost:6379"
});

// Connect to Redis before using it.
await redis.connect();

// Create a Fixed Window limiter.
// window is in milliseconds.
const limiter = new FixedWindow({
    redis,
    window: 60000,
    max: 5
});

// Consume one request for this user.
const result = await limiter.consume("user:1");

console.log(result);

// Close the Redis connection.
await redis.quit();