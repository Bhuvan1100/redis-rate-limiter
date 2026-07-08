import { createClient } from "redis";
import { SlidingWindow }  from "redis-traffic-limiter";

/* -------------------------------------------------------
   Step 1: Create and connect a Redis client

   The limiter stores request information in Redis, so a
   connected Redis client is required.

   Default Redis URL:
   redis://localhost:6379
------------------------------------------------------- */

const redis = createClient({
    url: "redis://localhost:6379",
});

await redis.connect();

/* -------------------------------------------------------
   Step 2: Create a Sliding Window Limiter

   SlidingWindow Options

   redis
   -----
   A connected Redis client.

   window
   ------
   Time window (in milliseconds).

   max
   ---
   Maximum number of requests allowed within the
   configured time window.
------------------------------------------------------- */

const limiter = new SlidingWindow({
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