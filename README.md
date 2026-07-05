# Redis Rate Limiter

A lightweight Redis-based rate limiter for Node.js using Redis.

Currently supported algorithms:

- ✅ Fixed Window
- ✅ Sliding Window

---

## Prerequisites

Before using this package, make sure you have:

- Node.js
- Redis Server

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
npm install redis-rate-limiter redis
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

- `examples/fixed.js`
- `examples/sliding.js`

Run them using:

```bash
node examples/fixed.js
```

or

```bash
node examples/sliding.js
```

---

## Supported Algorithms

- Fixed Window
- Sliding Window

---

## Notes

- The package expects a **connected node-redis client**.
- Redis connections are managed by your application.
- `window` is specified in **milliseconds**.
- Currently supports the official **node-redis** client only.
- Support for additional Redis clients (e.g. ioredis) is planned for future releases.

---

## License

MIT