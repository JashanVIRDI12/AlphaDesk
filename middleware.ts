import { NextResponse, type NextRequest } from "next/server";

const API_METHODS = new Set(["GET", "POST", "OPTIONS"]);

function getClientIp(req: NextRequest): string {
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

async function kvFetch<T>(command: string, args: string[]): Promise<T | null> {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!baseUrl || !token) return null;

  const url = `${baseUrl}/${[command, ...args].map(encodeURIComponent).join("/")}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { result?: unknown };
  return (json.result as T) ?? null;
}

async function rateLimit(req: NextRequest): Promise<{ ok: boolean; remaining?: number }>{
  // Only enforce when KV is available.
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { ok: true };
  }

  const ip = getClientIp(req);
  const path = req.nextUrl.pathname;
  const bucket = Math.floor(Date.now() / 60000); // 1-minute window
  const key = `rl:${path}:${ip}:${bucket}`;

  const count = (await kvFetch<number>("incr", [key])) ?? 0;
  if (count === 1) {
    // expire after 2 minutes to be safe
    await kvFetch<number>("expire", [key, "120"]);
  }

  const limit = 20;
  return { ok: count <= limit, remaining: Math.max(0, limit - count) };
}

export async function middleware(req: NextRequest) {
  // Method allowlist for API routes
  if (req.nextUrl.pathname.startsWith("/api/") && !API_METHODS.has(req.method)) {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  // Simple rate limit on auth endpoints
  if (
    req.nextUrl.pathname === "/api/auth/register" ||
    req.nextUrl.pathname.startsWith("/api/auth/")
  ) {
    const rl = await rateLimit(req);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            ...(typeof rl.remaining === "number"
              ? { "X-RateLimit-Remaining": String(rl.remaining) }
              : {}),
          },
        },
      );
    }
  }

  const res = NextResponse.next();

  // Ensure security headers are present even for routes that may bypass next.config headers.
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
