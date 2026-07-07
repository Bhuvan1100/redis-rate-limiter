# Redis Traffic Limiter

A lightweight Redis-based rate limiter for Node.js using Redis.

Currently supported algorithms:

* ✅ Fixed Window
* ✅ Sliding Window
* ✅ Token Bucket

---

## What's New in v1.1.0

### Added

* ✅ Token Bucket rate limiting algorithm.

### Improved

* Introduced a shared `BaseLimiter` for cleaner architecture.
* Added constructor validation with clear error messages for invalid configuration.
* Standardized the response object across all algorithms.

All limiters now return the same response format:

```js
{
    allowed: true,
    limit: 100,
    remaining: 99,
    retryAfter: null,
    resetTime: null
}
```

> **Note:** `retryAfter` and `resetTime` are currently `null` and will be fully implemented in future releases.

---

## Prerequisites

Before using this package, make sure you have:

* Node.js
* Redis Server

---

## Install Redis

### Ubuntu

```bash
sudo apt update
sudo apt install redis-server
```

Start Redis

```bash
redis-server
```

### Windows

Run Redis using Docker:

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis
```

---

## Installation

Install the package along with the official Redis client.

```bash
npm install redis-traffic-limiter redis
```

---

## Create a Redis Client

```js
import { createClient } from "redis";

const redis = createClient({
    url: "redis://localhost:6379"
});

await redis.connect();
```

Pass the connected Redis client while creating the limiter.

---

## Usage

Example programs are available in the `examples/` directory.

* `examples/fixed.js`
* `examples/sliding.js`
* `examples/tokenBucket.js`

Run them using:

```bash
node examples/fixed.js
```

or

```bash
node examples/sliding.js
```

or

```bash
node examples/tokenBucket.js
```

---

## Supported Algorithms

### Fixed Window

```js
import { FixedWindow } from "redis-traffic-limiter";

const limiter = new FixedWindow({
    redis,
    window: 60000,
    max: 100
});
```

---

### Sliding Window

```js
import { SlidingWindow } from "redis-traffic-limiter";

const limiter = new SlidingWindow({
    redis,
    window: 60000,
    max: 100
});
```

---

### Token Bucket

```js
import { TokenBucket } from "redis-traffic-limiter";

const limiter = new TokenBucket({
    redis,
    capacity: 100,
    refillRate: 10,
    interval: 60
});
```

Where:

* `capacity` – Maximum number of tokens the bucket can hold.
* `refillRate` – Number of tokens added every interval.
* `interval` – Refill interval in seconds.

---

## Response Format

Every limiter returns a standardized response object.

```js
{
    allowed: true,
    limit: 100,
    remaining: 99,
    retryAfter: null,
    resetTime: null
}
```

---

## Notes

* The package expects a **connected node-redis client**.
* Redis connections are managed by your application.
* `window` is specified in **milliseconds**.
* `interval` for the Token Bucket algorithm is specified in **seconds**.
* Currently supports the official **node-redis** client only.
* Support for additional Redis clients (e.g. ioredis), Express middleware, Lua scripts for atomic operations, and additional features are planned for future releases.

---

## License

MIT
