import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

type NewsResponse = {
  headlines: Array<{
    title: string;
    url: string;
    publishedAt: string;
    ago: string;
    source: string;
    topic?: string;
  }>;
  generatedAt: string;
};

type CalendarEvent = {
  time: string;
  currency: string;
  impact: string;
  event: string;
  actual: string;
  forecast: string;
  previous: string;
};

type BankHoliday = {
  date: string;
  country: string;
  holiday: string;
};

type CalendarResponse = {
  events: CalendarEvent[];
  holidays: BankHoliday[];
  tomorrowEvents?: CalendarEvent[];
  generatedAt: string;
};

type MacroIndicator = {
  indicator: string;
  value: string;
  date: string;
  country: string;
};

type MacroDataResponse = {
  data: MacroIndicator[];
  generatedAt: string;
};

type InstrumentData = {
  symbol: string;
  displayName: string;
  bias: "Bullish" | "Bearish" | "Neutral";
  confidence: number;
  summary: string;
  newsDriver?: string;
  technicalLevels?: string;
  macroBackdrop?: string;
  redditSentiment?: string;
};

export type VolatilityPoint = {
  time: number;
  value: number;
};

export type InstrumentVolatility = {
  symbol: string;
  displayName: string;
  currentAtrPct: number;
  points: VolatilityPoint[];
};

export type VolatilityPayload = {
  timeframe: "1H";
  period: 14;
  instruments: InstrumentVolatility[];
};

type InstrumentsResponse = {
  instruments: InstrumentData[];
  generatedAt: string;
  volatility?: VolatilityPayload;
};

type MacroDeskResponse = {
  title?: string;
  bias?: string;
  bullets?: string[];
  notes?: string;
  brief?: string;
  keyThemes?: string[];
  riskSentiment?: string;
  communitySentiment?: string;
  generatedAt: string;
};

const macroDataRawSchema = z.object({
  USD: z
    .object({
      rate: z.string(),
      cpi: z.string(),
      gdp: z.string(),
      unemployment: z.string(),
      lastUpdated: z.string(),
    })
    .optional(),
  EUR: z
    .object({
      rate: z.string(),
      cpi: z.string(),
      gdp: z.string(),
      unemployment: z.string(),
      lastUpdated: z.string(),
    })
    .optional(),
  GBP: z
    .object({
      rate: z.string(),
      cpi: z.string(),
      gdp: z.string(),
      unemployment: z.string(),
      lastUpdated: z.string(),
    })
    .optional(),
  JPY: z
    .object({
      rate: z.string(),
      cpi: z.string(),
      gdp: z.string(),
      unemployment: z.string(),
      lastUpdated: z.string(),
    })
    .optional(),
  generatedAt: z.union([z.string(), z.number()]).optional(),
  fetchedAt: z.string().optional(),
});

const macroDeskSchema = z
  .object({
    title: z.string().optional(),
    bias: z.string().optional(),
    bullets: z.array(z.string()).optional(),
    notes: z.string().optional(),
    brief: z.string().optional(),
    keyThemes: z.array(z.string()).optional(),
    riskSentiment: z.string().optional(),
    generatedAt: z.string().optional(),
  })
  .transform((v): MacroDeskResponse => ({
    title: v.title,
    bias: v.bias,
    bullets: v.bullets ?? v.keyThemes ?? [],
    notes: v.notes ?? v.brief ?? "",
    brief: v.brief ?? v.notes ?? "",
    keyThemes: v.keyThemes ?? v.bullets ?? [],
    riskSentiment: v.riskSentiment ?? v.bias ?? "Neutral",
    generatedAt: v.generatedAt ?? new Date().toISOString(),
  }));

export function useNews() {
  return useQuery({
    queryKey: ["news"],
    queryFn: async (): Promise<NewsResponse> => {
      const res = await fetch("/api/news", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
}

export function useCalendar(timezone: string, includeTomorrow = false) {
  return useQuery({
    queryKey: ["calendar", timezone, includeTomorrow],
    queryFn: async (): Promise<CalendarResponse> => {
      const params = new URLSearchParams({ tz: timezone });
      if (includeTomorrow) params.set("includeTomorrow", "1");
      const res = await fetch(`/api/calendar?${params}`);
      if (!res.ok) throw new Error("Failed to fetch calendar");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useMacroData() {
  return useQuery({
    queryKey: ["macro-data"],
    queryFn: async (): Promise<MacroDataResponse> => {
      const res = await fetch("/api/macro-data");
      if (!res.ok) throw new Error("Failed to fetch macro data");
      const raw = await res.json();
      const parsed = macroDataRawSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error("Invalid macro data payload");
      }

      const rows: MacroIndicator[] = [];
      const append = (country: string, d?: { rate: string; cpi: string; gdp: string; unemployment: string; lastUpdated: string }) => {
        if (!d) return;
        rows.push({ indicator: "Interest Rate", value: d.rate, date: d.lastUpdated, country });
        rows.push({ indicator: "CPI", value: d.cpi, date: d.lastUpdated, country });
        rows.push({ indicator: "GDP Growth", value: d.gdp, date: d.lastUpdated, country });
        rows.push({ indicator: "Unemployment", value: d.unemployment, date: d.lastUpdated, country });
      };

      append("USD", parsed.data.USD);
      append("EUR", parsed.data.EUR);
      append("GBP", parsed.data.GBP);
      append("JPY", parsed.data.JPY);

      const generatedAt =
        typeof parsed.data.generatedAt === "string"
          ? parsed.data.generatedAt
          : parsed.data.fetchedAt ?? new Date().toISOString();

      return { data: rows, generatedAt };
    },
    staleTime: 6 * 60 * 60 * 1000,
    refetchInterval: 6 * 60 * 60 * 1000,
  });
}

export function useInstruments() {
  return useQuery({
    queryKey: ["instruments"],
    queryFn: async (): Promise<InstrumentsResponse> => {
      const res = await fetch("/api/instruments");
      if (!res.ok) throw new Error("Failed to fetch instruments");
      return res.json();
    },
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
}

export type RedditPost = {
  id: string;
  title: string;
  url: string;
  permalink: string;
  author: string;
  score: number;
  numComments: number;
  selftext: string;
  pair: string;
  flair: string;
  publishedAt: string;
  ago: string;
  thumbnail: string | null;
};

type RedditResponse = {
  posts: RedditPost[];
  count: number;
  cached: boolean;
};

export function useRedditPosts() {
  return useQuery({
    queryKey: ["reddit-posts"],
    queryFn: async (): Promise<RedditResponse> => {
      const res = await fetch("/api/reddit", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch Reddit posts");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

export function useMacroDesk() {
  return useQuery({
    queryKey: ["macro-desk"],
    queryFn: async (): Promise<MacroDeskResponse> => {
      const res = await fetch("/api/macro-desk");
      if (!res.ok) throw new Error("Failed to fetch macro desk");
      const raw = await res.json();
      const parsed = macroDeskSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error("Invalid macro desk payload");
      }
      return parsed.data;
    },
    staleTime: 60 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  });
}
