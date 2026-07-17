import BaseLimiter from "./BaseLimiter.js";
import { loadLuaScript } from "../lua/loadLuaScript.js";

class SlidingWindow extends BaseLimiter {

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
                "slidingWindow.lua"
            );
        }

        return this.scriptSha;
    }

    async consume(key) {

        const now = Date.now();
        const member = `${now}-${Math.random()}`;

        let sha = await this.getScriptSha();

        try {
            const [allowed, count, retryAfter] = await this.redis.evalSha(sha, {
                keys: [key],
                arguments: [
                    now.toString(),
                    this.window.toString(),
                    this.max.toString(),
                    member
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
                retryAfter
            });

        } catch (err) {
            if (err.message.includes("NOSCRIPT")) {
                this.scriptSha = null;

                sha = await this.getScriptSha();

                const [allowed, count, retryAfter] = await this.redis.evalSha(sha, {
                    keys: [key],
                    arguments: [
                        now.toString(),
                        this.window.toString(),
                        this.max.toString(),
                        member
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
                    retryAfter
                });
            }

            throw err;
        }
    }

}

export default SlidingWindow;