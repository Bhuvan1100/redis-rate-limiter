export  function createExpressRateLimiter(limiter, options = {}) {
    if (!limiter || typeof limiter.consume !== "function") {
        throw new Error(
            "A valid limiter instance with a consume() method is required."
        );
    }

    const {
        keyGenerator = (req) => req.ip,
        statusCode = 429,
        message = "Too many requests",
    } = options;

    if (typeof keyGenerator !== "function") {
        throw new Error("keyGenerator must be a function.");
    }

    if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
        throw new Error("statusCode must be a valid HTTP status code.");
    }

    if (typeof message !== "string") {
        throw new Error("message must be a string.");
    }

    return async function expressRateLimiter(req, res, next) {
        try {
            const key = keyGenerator(req);

            const result = await limiter.consume(key);

            req.rateLimit = result;

            if (!result.allowed) {
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