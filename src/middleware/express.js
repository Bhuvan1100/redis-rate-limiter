export function createExpressRateLimiter(limiter, options = {}) {
    if (!limiter || typeof limiter.consume !== "function") {
        throw new Error(
            "A valid limiter instance with a consume() method is required."
        );
    }

    const {
        keyGenerator = (req) => req.ip,
        statusCode = 429,
        message = "Too many requests",
        responseHandler,
        skipPaths = [],
    } = options;

    

    if (
        !Number.isInteger(statusCode) ||
        statusCode < 100 ||
        statusCode > 599
    ) {
        throw new Error("statusCode must be a valid HTTP status code.");
    }

    if (typeof message !== "string") {
        throw new Error("message must be a string.");
    }

    if (
        responseHandler !== undefined &&
        typeof responseHandler !== "function"
    ) {
        throw new Error("responseHandler must be a function.");
    }

    return async function expressRateLimiter(req, res, next) {
        if (skipPaths.includes(req.path)) {
            return next();
        }
        try {
            const key = keyGenerator(req);

            const result = await limiter.consume(key);

            req.rateLimit = result;

            res.setHeader("RateLimit-Limit", result.limit);
            res.setHeader("RateLimit-Remaining", result.remaining);

            if (result.resetTime !== null) {
                res.setHeader("RateLimit-Reset", result.resetTime);
            }

            if (!result.allowed) {

                if (result.retryAfter !== null) {
                    res.setHeader("Retry-After", result.retryAfter);
                }

                // User has provided their own response
                if (responseHandler) {
                    return responseHandler(req, res, result, next);
                }

                // Default response
                return res.status(statusCode).json({
                    message,
                    ...result,
                });
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}