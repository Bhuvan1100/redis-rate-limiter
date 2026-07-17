import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptCache = new WeakMap();

export async function loadLuaScript(redis, scriptName) {
    if (!scriptCache.has(redis)) {
        scriptCache.set(redis, new Map());
    }

    const redisCache = scriptCache.get(redis);

    if (redisCache.has(scriptName)) {
        return redisCache.get(scriptName);
    }

    const script = await fs.readFile(
        path.join(__dirname, scriptName),
        "utf8"
    );

    const sha = await redis.scriptLoad(script);

    redisCache.set(scriptName, sha);

    return sha;
}