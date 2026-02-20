import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GetTradingBias — AI-Powered Forex Trading Terminal & Currency Analysis Platform",
    template: "%s | GetTradingBias",
  },
  description:
    "Professional forex trading terminal with AI-powered currency analysis, real-time FX news, technical indicators, and macro fundamentals. Trade EUR/USD, GBP/USD, USD/JPY with institutional-grade insights.",
  keywords: [
    "forex trading platform",
    "FX trading terminal",
    "currency trading analysis",
    "AI forex signals",
    "real-time forex news",
    "technical analysis forex",
    "EUR/USD analysis",
    "GBP/USD trading",
    "USD/JPY signals",
    "forex macro analysis",
    "institutional forex trading",
    "currency pair analysis",
    "forex AI platform",
    "trading bias indicator",
    "FX market intelligence",
  ],
  authors: [{ name: "GetTradingBias" }],
  creator: "GetTradingBias",
  publisher: "GetTradingBias",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gettradingbias.com",
    siteName: "GetTradingBias",
    title: "GetTradingBias — AI-Powered Forex Trading Terminal",
    description:
      "Professional forex trading terminal with AI-powered currency analysis, real-time FX news, and institutional-grade insights for EUR/USD, GBP/USD, USD/JPY trading.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetTradingBias — AI-Powered Forex Trading Terminal",
    description:
      "Professional forex trading terminal with AI-powered currency analysis and real-time FX market intelligence.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
  metadataBase: new URL("https://gettradingbias.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-0RKN1FKFV5"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-0RKN1FKFV5');`}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSessionProvider>
          <QueryProvider>
            <ThemeProvider>
              <TooltipProvider delayDuration={250}>
                {children}
                <Analytics />
              </TooltipProvider>
            </ThemeProvider>
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
