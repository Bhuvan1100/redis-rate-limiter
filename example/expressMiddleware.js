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
    window: 60, // Time window (seconds)
    max: 5,     // Maximum requests allowed
});

/* -------------------------------------------------------
   Create Express Middleware

   Every option below is OPTIONAL.

   If an option is omitted, the package automatically
   uses its default value.

   Available Options
   -----------------

   keyGenerator
       Generates the unique identifier used for
       rate limiting.

       Default:
           (req) => req.ip

       Examples:
           (req) => req.ip
           (req) => req.user.id
           (req) => req.headers["x-api-key"]


   statusCode
       HTTP status returned when the request
       exceeds the configured limit.

       Default:
           429


   message
       Default message returned when a request
       is rate limited.

       Default:
           "Too many requests"


   responseHandler
       Allows complete customization of the
       response sent when a request is blocked.

       If omitted, the middleware returns:

       {
           message,
           ...result
       }




   skipPaths
   ---------
   An array of route paths that should bypass
   rate limiting completely.

   Requests to these paths will:

   • Skip the limiter
   • Skip Redis operations
   • Skip rate limit headers
   • Call next() immediately

   Default:
       []

   Example:

       [
           "/health",
           "/metrics",
           "/favicon.ico"
       ]

------------------------------------------------------- */

const rateLimiter = createExpressRateLimiter(limiter, {

    // Default: (req) => req.ip
    keyGenerator: (req) => req.ip,

    // Default: 429
    statusCode: 429,

    // Default: "Too many requests"
    message: "Too many requests. Please try again later.",

    // Optional
    // Remove this option to use the default response.
    responseHandler(req, res, result) {
        return res.status(429).json({
            success: false,
            error: "RATE_LIMIT_EXCEEDED",
            retryAfter: result.retryAfter,
            rateLimit: result,
        });
    },

    // path the limiter will not check or rate limit in any way
    skipPaths: [
        "/health",
        "/metrics",
    ],

});

/* -------------------------------------------------------
   Register Middleware

   Apply globally:

       app.use(rateLimiter);

   Or protect specific routes:

       app.get("/login", rateLimiter, handler);

------------------------------------------------------- */

app.use(rateLimiter);

/* -------------------------------------------------------
   Example Route
------------------------------------------------------- */

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is healthy.",
    });
});



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