local tokenKey = KEYS[1]
local timeKey = KEYS[2]

local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local interval = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local storedTokens = redis.call("GET", tokenKey)
local storedLastRefill = redis.call("GET", timeKey)

local tokens
local lastRefill

if not storedTokens or not storedLastRefill then
    tokens = capacity
    lastRefill = now
else
    tokens = tonumber(storedTokens)
    lastRefill = tonumber(storedLastRefill)
end

local elapsed = (now - lastRefill) / 1000
local intervalsPassed = math.floor(elapsed / interval)

if intervalsPassed > 0 then
    tokens = math.min(
        capacity,
        tokens + intervalsPassed * refillRate
    )

    lastRefill = lastRefill + intervalsPassed * interval * 1000
end

if tokens <= 0 then

    local retryAfter = math.ceil(
        interval - (elapsed % interval)
    )

    redis.call("SET", tokenKey, tokens)
    redis.call("SET", timeKey, lastRefill)

    return {
        0,
        tokens,
        retryAfter
    }
end

tokens = tokens - 1

redis.call("SET", tokenKey, tokens)
redis.call("SET", timeKey, lastRefill)

return {
    1,
    tokens,
    0
}