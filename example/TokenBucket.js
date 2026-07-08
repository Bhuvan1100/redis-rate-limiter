import { createClient } from "redis";
import { TokenBucket }  from "redis-traffic-limiter";

/* -------------------------------------------------------
   Step 1: Create and connect a Redis client

   The Token Bucket limiter stores token information in
   Redis, so a connected Redis client is required.

   Default Redis URL:
   redis://localhost:6379
------------------------------------------------------- */

const redis = createClient({
    url: "redis://localhost:6379",
});

await redis.connect();

/* -------------------------------------------------------
   Step 2: Create a Token Bucket Limiter

   TokenBucket Options

   redis
   -----
   A connected Redis client.

   capacity
   --------
   Maximum number of tokens the bucket can hold.

   refillRate
   ----------
   Number of tokens added after each refill interval.

   interval
   --------
   Refill interval (in seconds).
------------------------------------------------------- */

const limiter = new TokenBucket({
    redis,
    capacity: 10, // Bucket starts with 10 tokens
    refillRate: 5, // Add 5 tokens every interval
    interval: 60, // Refill every 60 seconds
});

/* -------------------------------------------------------
   Step 3: Consume Requests

   Each request consumes one token.

   Once all tokens are exhausted, additional requests
   will be rejected until the bucket is refilled.
------------------------------------------------------- */

for (let i = 1; i <= 12; i++) {
    const result = await limiter.consume("user:1");

    console.log(`Request ${i}:`, result);
}

/*
Example Output

Request 1:
{
    allowed: true,
    limit: 10,
    remaining: 9,
    retryAfter: null,
    resetTime: null
}

...

Request 10:
{
    allowed: true,
    limit: 10,
    remaining: 0,
    retryAfter: null,
    resetTime: null
}

Request 11:
{
    allowed: false,
    limit: 10,
    remaining: 0,
    retryAfter: null,
    resetTime: null
}
*/

/* -------------------------------------------------------
   Step 4: Close the Redis connection

   Always close the connection before your application
   exits to free resources.
------------------------------------------------------- */

await redis.quit();