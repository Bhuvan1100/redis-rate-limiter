import express from "express";
import { createClient } from "redis";

import {
    FixedWindow,
    createExpressRateLimiter,
} from "redis-traffic-limiter";

const app = express();

/* -------------------------------------------------------
   Redis Client
------------------------------------------------------- */

const redis = createClient();

await redis.connect();

/* -------------------------------------------------------
   Create a Limiter

   Any limiter provided by this package can be used.

   Available Limiters:
   • FixedWindow
   • SlidingWindow
   • TokenBucket
------------------------------------------------------- */

const limiter = new FixedWindow({
    redis,
    window: 60, // Time window in seconds
    max: 5, // Maximum requests allowed
});

/* -------------------------------------------------------
   Create Express Middleware

   Options:

   keyGenerator
   ------------
   Function used to generate the unique identifier for
   rate limiting.

   Default:
       (req) => req.ip

   Examples:

       (req) => req.ip

       (req) => req.user.id

       (req) => req.headers["x-api-key"]


   statusCode
   ----------
   HTTP status code returned when the request exceeds
   the configured limit.

   Default:
       429


   message
   -------
   Message returned in the response body when the client
   is rate limited.

   Default:
       "Too many requests"
------------------------------------------------------- */

const rateLimiter = createExpressRateLimiter(limiter, {
    keyGenerator: (req) => req.ip,
    statusCode: 429,
    message: "Too many requests. Please try again later.",
});

/* -------------------------------------------------------
   Register Middleware

   app.use() applies the middleware to every route.

   You can also register it for individual routes.

   Example:

   app.get("/login", rateLimiter, handler);
------------------------------------------------------- */

app.use(rateLimiter);

/* -------------------------------------------------------
   Example Route
------------------------------------------------------- */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Request allowed.",
        rateLimit: req.rateLimit,
    });
});

/* -------------------------------------------------------
   Start Server
------------------------------------------------------- */

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});