import BaseLimiter from "./BaseLimiter.js";
import { loadLuaScript } from "../lua/loadLuaScript.js";

class FixedWindow extends BaseLimiter {
    constructor({ redis, window, max }) {
        super({ redis });

        this.validatePositiveInteger(window, "window");
        this.validatePositiveInteger(max, "max");

        this.window = window;
        this.max = max;

        this.scriptSha = null;
    }

    async getScriptSha() {
        if (!this.scriptSha) {
            this.scriptSha = await loadLuaScript(
                this.redis,
                "fixedWindow.lua"
            );
        }

        return this.scriptSha;
    }

    async consume(key) {
        let sha = await this.getScriptSha();

        try {
            const [allowed, count, ttl] = await this.redis.evalSha(sha, {
                keys: [key],
                arguments: [
                    this.window.toString(),
                    this.max.toString()
                ]
            });

            if (allowed === 1) {
                return this.createResponse({
                    allowed: true,
                    limit: this.max,
                    remaining: this.max - count
                });
            }

            return this.createResponse({
                allowed: false,
                limit: this.max,
                remaining: 0,
                retryAfter: ttl
            });
        } catch (err) {
            if (err.message.includes("NOSCRIPT")) {
                this.scriptSha = null;

                sha = await this.getScriptSha();

                const [allowed, count, ttl] = await this.redis.evalSha(sha, {
                    keys: [key],
                    arguments: [
                        this.window.toString(),
                        this.max.toString()
                    ]
                });

                if (allowed === 1) {
                    return this.createResponse({
                        allowed: true,
                        limit: this.max,
                        remaining: this.max - count
                    });
                }

                return this.createResponse({
                    allowed: false,
                    limit: this.max,
                    remaining: 0,
                    retryAfter: ttl
                });
            }

            throw err;
        }
    }
}

export default FixedWindow;