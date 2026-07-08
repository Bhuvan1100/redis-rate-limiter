import { createClient } from "redis";
import { FixedWindow } from "redis-traffic-limiter";

/* -------------------------------------------------------
   Step 1: Create and connect a Redis client

   The limiter stores request counters in Redis, so a
   connected Redis client is required.

   Default Redis URL:
   redis://localhost:6379
------------------------------------------------------- */

const redis = createClient({
    url: "redis://localhost:6379",
});

await redis.connect();

/* -------------------------------------------------------
   Step 2: Create a Rate Limiter

   FixedWindow Options

   redis
   -----
   A connected Redis client.

   window
   ------
   Time window (in milliseconds).

   max
   ---
   Maximum number of requests allowed within each window.
------------------------------------------------------- */

const limiter = new FixedWindow({
    redis,
    window: 60_000, // 60 seconds
    max: 5,          // Allow 5 requests per window
});

/* -------------------------------------------------------
   Step 3: Consume a Request

   consume(key)

   key
   ---
   A unique identifier for the client being rate limited.

   Examples:
   • User ID
   • IP Address
   • API Key
   • Session ID

   The same key will always share the same rate limit.
------------------------------------------------------- */

const result = await limiter.consume("user:1");

/* -------------------------------------------------------
   Step 4: Result

   consume() always returns an object in the format:

   {
       allowed,
       limit,
       remaining,
       retryAfter,
       resetTime
   }
------------------------------------------------------- */

console.log(result);

/*
Example Output

{
    allowed: true,
    limit: 5,
    remaining: 4,
    retryAfter: null,
    resetTime: null
}
*/

/* -------------------------------------------------------
   Step 5: Close the Redis connection

   Always close the connection before your application
   exits to free resources.
------------------------------------------------------- */

await redis.quit();