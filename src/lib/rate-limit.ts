/**
 * Simple in-memory rate limiter (per IP).
 * Works in both Edge and Node runtimes — no external dependency.
 */

type BucketEntry = { count: number; resetAt: number };

const store = new Map<string, BucketEntry>();

// Prune expired entries every 5 minutes to avoid unbounded growth.
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
            if (entry.resetAt <= now) store.delete(key);
        }
    }, 5 * 60 * 1000);
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * @param key      Unique bucket key — typically `${route}:${ip}`
 * @param limit    Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(
    key: string,
    limit: number,
    windowMs: number,
): RateLimitResult {
    const now = Date.now();
    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
        entry = { count: 1, resetAt: now + windowMs };
        store.set(key, entry);
        return { allowed: true, remaining: limit - 1, resetAt: entry.resetAt };
    }

    entry.count += 1;
    const remaining = Math.max(0, limit - entry.count);
    return {
        allowed: entry.count <= limit,
        remaining,
        resetAt: entry.resetAt,
    };
}

/** Extract best-effort client IP from a Next.js Request */
export function getClientIp(req: Request): string {
    const headers = req.headers;
    return (
        headers.get("x-real-ip") ??
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown"
    );
}
