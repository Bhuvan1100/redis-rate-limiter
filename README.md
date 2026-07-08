# Redis Traffic Limiter

A lightweight, Redis-powered rate limiting library for Node.js with a simple, consistent API and multiple rate limiting algorithms.

## Features

* ✅ Fixed Window
* ✅ Sliding Window
* ✅ Token Bucket
* ✅ Shared, consistent API across all algorithms
* ✅ Built-in input validation with descriptive error messages
* ✅ Express middleware support

---

## Current Version

**v1.2.0**

---

## Installation

Install the package along with the official Redis client.

```bash
npm install redis-traffic-limiter redis
```

---

## Prerequisites

Before using this package, make sure you have:

* Node.js
* A running Redis server

---

## Redis Setup

### Ubuntu

```bash
sudo apt update
sudo apt install redis-server
```

Start Redis:

```bash
redis-server
```

### Windows (Docker)

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis
```

---

## Supported Algorithms

The package currently provides the following rate limiting algorithms:

* **Fixed Window**
* **Sliding Window**
* **Token Bucket**

Each limiter exposes the same public API, making it easy to switch between algorithms without changing application code.

---

## Express Middleware

The package also provides Express middleware for seamless integration with Express applications.

The middleware works with any limiter provided by this package and supports configurable options such as:

* Client key generation
* Custom status code
* Custom response message

See the Express example in the `examples/` directory for complete usage.

---

## Standard Response

Every limiter returns the same response structure.

```js
{
    allowed: true,
    limit: 100,
    remaining: 99,
    retryAfter: null,
    resetTime: null
}
```

> **Note:** `retryAfter` and `resetTime` are currently placeholders and will be implemented in future releases.

---

## Examples

The package includes complete examples demonstrating every supported feature.

```
examples/
├── fixed-window.js
├── sliding-window.js
├── token-bucket.js
└── express.js
```

Run any example using Node.js.

```bash
node examples/fixed-window.js
```

---

## Notes

* A connected **node-redis** client is required.
* Redis connections are managed by your application.
* `window` is specified in **milliseconds**.
* `interval` (Token Bucket) is specified in **seconds**.
* Currently supports the official **node-redis** client.

---

## Roadmap

Upcoming improvements include:

* RateLimit and Retry-After headers
* Additional middleware customization
* Automated tests
* Performance improvements
* Lua script support for atomic Redis operations
* Support for additional Redis clients

---

## License

MIT
