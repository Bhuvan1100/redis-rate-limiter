local key = KEYS[1]

local window = tonumber(ARGV[1])
local max = tonumber(ARGV[2])

local count = redis.call("INCR", key)

if count == 1 then
    redis.call("EXPIRE", key, window)
end

if count <= max then
    return {
        1,
        count,
        redis.call("TTL", key)
    }
else
    return {
        0,
        count,
        redis.call("TTL", key)
    }
end