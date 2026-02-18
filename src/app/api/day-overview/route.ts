import { NextResponse } from "next/server";

type OverviewEvent = {
  time: string;
  title: string;
  impact: "High" | "Medium" | "Low";
  consensus: string;
  previous: string;
  currency?: string;
};

type OverviewHoliday = {
  title: string;
  currency: string;
};

type Body = {
  date: string;
  riskMode: "Risk-on" | "Risk-off";
  events: OverviewEvent[];
  holidays?: OverviewHoliday[];
};

let overviewCache:
  | {
    key: string;
    fetchedAt: number;
    overview: string;
  }
  | undefined;

let inflight: Promise<string> | undefined;

const CACHE_HEADERS = {
  "Cache-Control": "private, max-age=0, s-maxage=300, stale-while-revalidate=1800",
};

function buildCacheKey(body: Body, model: string) {
  const titles = body.events
    .slice(0, 12)
    .map((e) => `${e.time}|${e.currency ?? ""}|${e.title}`)
    .join(";");
  const hols = (body.holidays ?? [])
    .map((h) => h.title)
    .join(";");
  return `${model}::${body.date}::${body.riskMode}::${titles}::${hols}`;
}

function isOverviewComplete(text: string) {
  const t = text.trim();
  if (!t) return false;
  const required = [
    "DATE:",
    "OVERVIEW:",
    "SCENARIOS:",
  ];
  if (!required.every((k) => t.includes(k))) return false;

  // Avoid caching obviously cut off outputs
  if (!/[.!?\]]\s*$/.test(t)) return false;
  if (/\b(a|an|the|and|or|to|of)\s*$/.test(t.toLowerCase())) return false;

  return true;
}

function sanitizeOpenRouterError(status: number, rawText: string) {
  if (status === 429) return "rate_limited";
  if (status >= 500) return "provider_unavailable";
  return `openrouter_failed_${status}`;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "google/gemini-3-flash-preview";
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenRouter not configured. Set OPENROUTER_API_KEY in .env and restart.",
      },
      { status: 501, headers: CACHE_HEADERS },
    );
  }

  const body = (await req.json()) as Body;
  const holidays = body.holidays ?? [];
  const hasEvents = body.events.length > 0;
  const hasHolidays = holidays.length > 0;

  if (!hasEvents && !hasHolidays) {
    return NextResponse.json(
      { error: "no_events_or_holidays" },
      { status: 400, headers: CACHE_HEADERS },
    );
  }

  const cacheKey = buildCacheKey(body, model);
  const ttlMs = 24 * 60 * 60 * 1000;
  if (overviewCache && overviewCache.key === cacheKey) {
    if (Date.now() - overviewCache.fetchedAt < ttlMs) {
      return NextResponse.json(
        { overview: overviewCache.overview, cached: true },
        { headers: CACHE_HEADERS },
      );
    }
  }

  if (inflight) {
    const overview = await inflight;
    return NextResponse.json({ overview, cached: true }, { headers: CACHE_HEADERS });
  }

  // Build holiday context line
  const holidayCtx = hasHolidays
    ? `\nBank Holidays today: ${holidays.map((h) => h.title).join(", ")}\n`
    : "";

  let prompt: string;

  if (!hasEvents && hasHolidays) {
    // No high-impact events but there are bank holidays
    prompt =
      `Create a complete, non-truncated FX trading day brief for a quiet holiday day.\n` +
      `Date: ${body.date}\n` +
      `Risk mode: ${body.riskMode}\n` +
      holidayCtx +
      `No high-impact economic events are scheduled today.\n` +
      `\nSTRICT FORMAT (must follow):\n` +
      `DATE: <same date> | RISK: <same risk mode>\n` +
      `OVERVIEW:\n` +
      `- (exactly 3 bullets: mention the bank holiday(s), reduced liquidity, and likely muted momentum. Each one sentence, end with a period)\n` +
      `SCENARIOS:\n` +
      `- Base: <1 sentence about expected quiet session>.\n` +
      `- Upside surprise: <1 sentence about what could cause unexpected moves>.\n` +
      `- Downside surprise: <1 sentence about thin-liquidity risk>.\n` +
      `Do not add any other sections. Do not cut off mid-sentence.`;
  } else {
    // Normal day with events (may also have holidays)
    prompt =
      `Create a complete, non-truncated FX trading day brief.\n` +
      `Date: ${body.date}\n` +
      `Risk mode: ${body.riskMode}\n` +
      holidayCtx +
      `Events (time, ccy, title, consensus, previous):\n` +
      body.events
        .slice(0, 20)
        .map((e) =>
          `- ${e.time} ${e.currency ?? ""} ${e.title} | cons ${e.consensus} | prev ${e.previous
            }`.trim(),
        )
        .join("\n") +
      `\n\nSTRICT FORMAT (must follow):\n` +
      `DATE: <same date> | RISK: <same risk mode>\n` +
      `OVERVIEW:\n` +
      `- (exactly 3 bullets, each one sentence, end with a period)\n` +
      `SCENARIOS:\n` +
      `- Base: <1 sentence>.\n` +
      `- Upside surprise: <1 sentence>.\n` +
      `- Downside surprise: <1 sentence>.\n` +
      `Do not add any other sections. Do not cut off mid-sentence.`;
  }

  const payloadBase = {
    model,
    messages: [
      {
        role: "system" as const,
        content:
          "You are an experienced FX macro strategist. Write concise, complete trading briefs. Never output partial sentences.",
      },
      {
        role: "user" as const,
        content:
          `${prompt}\n\nKeep it short. If space is tight, shorten sentences but keep ALL required sections.`,
      },
    ],
    temperature: 0.2,
  };

  type ChatMessage =
    | { role: "system"; content: string }
    | { role: "user"; content: string }
    | { role: "assistant"; content: string };

  async function callOpenRouter(messages: ChatMessage[], maxTokens: number) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": baseUrl,
        "X-Title": "GetTradingBias",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: payloadBase.temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      const safeCode = sanitizeOpenRouterError(res.status, text);
      console.error(`[day-overview] OpenRouter error ${res.status}:`, text.slice(0, 300));
      throw new Error(safeCode);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return json.choices?.[0]?.message?.content?.trim() ?? "";
  }

  inflight = (async () => {
    let overview = await callOpenRouter(payloadBase.messages, 700);
    if (!overview) overview = await callOpenRouter(payloadBase.messages, 950);

    if (!overview) {
      throw new Error("openrouter_empty_response");
    }

    if (!isOverviewComplete(overview)) {
      const rewritePrompt =
        "Rewrite the SAME brief strictly shorter. Keep DATE, OVERVIEW, and SCENARIOS only, and finish every sentence. Do NOT add anything else.";
      const messages = [
        ...payloadBase.messages,
        { role: "assistant" as const, content: overview },
        { role: "user" as const, content: rewritePrompt },
      ];

      const next = await callOpenRouter(messages, 650);
      if (next && isOverviewComplete(next)) overview = next;
    }

    if (!isOverviewComplete(overview)) {
      const finalPrompt =
        "Try again from scratch. Output MUST contain DATE, OVERVIEW, and SCENARIOS only, and must end with a period. Keep it very short.";
      const messages = [
        payloadBase.messages[0],
        { role: "user" as const, content: `${prompt}\n\n${finalPrompt}` },
      ];
      const next = await callOpenRouter(messages, 1100);
      if (next && isOverviewComplete(next)) overview = next;
    }

    if (!isOverviewComplete(overview)) {
      throw new Error("openrouter_incomplete_response");
    }

    overviewCache = {
      key: cacheKey,
      fetchedAt: Date.now(),
      overview,
    };
    return overview;
  })();

  try {
    const overview = await inflight;
    return NextResponse.json({ overview }, { headers: CACHE_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "openrouter_failed";
    if (message === "rate_limited") {
      if (overviewCache && overviewCache.key === cacheKey) {
        return NextResponse.json(
          { overview: overviewCache.overview, cached: true, stale: true },
          { headers: CACHE_HEADERS },
        );
      }
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429, headers: CACHE_HEADERS },
      );
    }

    if (message === "provider_unavailable") {
      if (overviewCache && overviewCache.key === cacheKey) {
        return NextResponse.json(
          { overview: overviewCache.overview, cached: true, stale: true },
          { headers: CACHE_HEADERS },
        );
      }
      return NextResponse.json(
        { error: "provider_unavailable" },
        { status: 503, headers: CACHE_HEADERS },
      );
    }

    return NextResponse.json({ error: message }, { status: 502, headers: CACHE_HEADERS });
  } finally {
    inflight = undefined;
  }
}
