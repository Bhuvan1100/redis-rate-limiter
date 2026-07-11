# Redis Traffic Limiter

A lightweight, Redis-powered rate limiting library for Node.js that provides multiple rate limiting algorithms with a consistent API.

The package is designed to be simple to integrate, easy to switch between algorithms, and flexible enough for production applications.

---

# Features

* ✅ Fixed Window Rate Limiter
* ✅ Sliding Window Rate Limiter
* ✅ Token Bucket Rate Limiter
* ✅ Shared API across all algorithms
* ✅ Standardized response object
* ✅ Built-in validation with descriptive error messages
* ✅ Express middleware
* ✅ Automatic RateLimit headers
* ✅ Retry-After header support
* ✅ Custom response handler
* ✅ Skip specific Express routes
* ✅ Official node-redis support

---

# Current Version

**v1.3.0**

---

# Installation

Install the package together with the official Redis client.

```bash
npm install redis-traffic-limiter redis
```

---

# Requirements

Before using this package you should have:

* Node.js
* A running Redis server

---

# Redis Setup

## Ubuntu

Install Redis

```bash
sudo apt update
sudo apt install redis-server
```

Start Redis

```bash
redis-server
```

---

## Windows (Docker)

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis
```

Verify Redis is running

```bash
redis-cli ping
```

Expected output

```text
PONG
```

---

# Supported Algorithms

The package currently provides three rate limiting algorithms.

## Fixed Window

Counts requests inside a fixed time window.

Best suited for:

* Simple APIs
* Internal services
* Lightweight applications

---

## Sliding Window

Tracks individual requests inside a moving time window.

Best suited for:

* Public APIs
* More accurate rate limiting
* Smoother traffic control

---

## Token Bucket

Uses tokens that refill over time.

Best suited for:

* Burst traffic
* Login APIs
* Public-facing endpoints

---

Every limiter exposes the same public API, allowing you to switch algorithms without changing your application code.

---

# Express Middleware

The package includes built-in Express middleware that works with every limiter.

Supported middleware options include:

* Custom client key generation
* Custom HTTP status code
* Custom response message
* Custom blocked response handler
* Skip selected routes
* Automatic RateLimit headers
* Automatic Retry-After header

See:

```
examples/express.js
```

for a complete example.

---

# Standard Response

Every limiter returns the same response object.

```javascript
{
    allowed: true,
    limit: 100,
    remaining: 99,
    retryAfter: null,
    resetTime: null
}
```

## Fields

| Field      | Description                                                          |
| ---------- | -------------------------------------------------------------------- |
| allowed    | Whether the current request is allowed                               |
| limit      | Maximum requests/tokens allowed                                      |
| remaining  | Remaining requests/tokens available                                  |
| retryAfter | Seconds until another request can be made (null when not applicable) |
| resetTime  | Reserved for future versions                                         |

---

# RateLimit Headers

The Express middleware automatically sets the appropriate HTTP headers.

When available:

```
RateLimit-Limit
RateLimit-Remaining
RateLimit-Reset
Retry-After
```

Headers are added automatically—no configuration is required.

---

# Examples

Complete working examples are included.

```
examples/
├── fixed-window.js
├── sliding-window.js
├── token-bucket.js
└── express.js
```

Run an example

```bash
node examples/fixed-window.js
```

---

# Package Structure

```
src/
├── limiter/
│   ├── BaseLimiter.js
│   ├── FixedWindow.js
│   ├── SlidingWindow.js
│   └── TokenBucket.js
│
├── middleware/
│   └── express.js
│
└── index.js
```

---

# Notes

* A connected **node-redis** client is required.
* Redis connections are managed by your application.
* Fixed Window `window` is specified in **seconds**.
* Sliding Window `window` is specified in **milliseconds**.
* Token Bucket `interval` is specified in **seconds**.
* Currently supports the official **node-redis** client.

---

# Error Handling

The package validates configuration during construction and throws descriptive errors for invalid input.

Examples include:

* Invalid Redis client
* Missing Redis client
* Invalid window size
* Invalid capacity
* Invalid refill rate
* Invalid interval
* Invalid middleware configuration

---

# Design Goals

This package focuses on:

* Consistent APIs
* Minimal configuration
* Clear architecture
* Predictable behavior
* Easy algorithm switching
* Express-first developer experience

---

# Roadmap

Planned improvements include:

* Reset time support
* Skip successful requests
* Skip failed requests
* Additional middleware customization
* Automated tests
* Lua scripts for atomic Redis operations
* Support for additional Redis clients
* Additional rate limiting algorithms

---

# Contributing

Issues, feature requests, and pull requests are welcome.

If you discover a bug or have an idea for improving the package, feel free to open an issue.

---

# License

MIT
