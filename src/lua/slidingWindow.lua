local key = KEYS[1]

local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local max = tonumber(ARGV[3])
local member = ARGV[4]

redis.call("ZREMRANGEBYSCORE", key, 0, now - window)

local count = redis.call("ZCARD", key)

if count >= max then
    local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
    local retryAfter = math.ceil((tonumber(oldest[2]) + window - now) / 1000)

    return {
        0,
        count,
        retryAfter
    }
end

redis.call("ZADD", key, now, member)
redis.call("EXPIRE", key, math.ceil(window / 1000))

return {
    1,
    count + 1,
    0
}