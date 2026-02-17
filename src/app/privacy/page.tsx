import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy — GetTradingBias",
    description: "Privacy Policy for GetTradingBias AI trading terminal.",
};

function LegalNav() {
    return (
        <nav className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#07070b]/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-[15px] font-bold tracking-tight text-zinc-100">
                        GetTradingBias
                    </span>
                </Link>
                <Link
                    href="/"
                    className="flex items-center gap-1.5 text-[13px] text-zinc-500 transition-colors hover:text-zinc-300"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Home
                </Link>
            </div>
        </nav>
    );
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#07070b] text-zinc-300">
            <LegalNav />

            <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
                    Privacy Policy
                </h1>
                <p className="mt-2 text-[13px] text-zinc-600">
                    Last updated: February 16, 2026
                </p>

                <div className="mt-12 space-y-10 text-[14px] leading-relaxed text-zinc-400">
                    {/* 1 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            1. Introduction
                        </h2>
                        <p>
                            GetTradingBias (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting
                            your privacy. This Privacy Policy describes how we collect, use,
                            and share information when you use our AI-powered trading terminal
                            and related services (collectively, the &quot;Service&quot;).
                        </p>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            2. Information We Collect
                        </h2>
                        <h3 className="mb-2 text-[14px] font-medium text-zinc-300">
                            2.1 Account Information
                        </h3>
                        <p className="mb-4">
                            When you create an account, we collect your email address and a
                            hashed version of your password (we never store plaintext
                            passwords). We may also collect your display name if you provide one.
                        </p>

                        <h3 className="mb-2 text-[14px] font-medium text-zinc-300">
                            2.2 Usage Data
                        </h3>
                        <p className="mb-4">
                            We automatically collect information about how you interact with
                            the Service, including pages viewed, features used, timestamps, and
                            device/browser information. This data is used to improve the
                            Service and is not shared with third parties for marketing.
                        </p>

                        <h3 className="mb-2 text-[14px] font-medium text-zinc-300">
                            2.3 AI & Market Data
                        </h3>
                        <p>
                            The Service processes market data, news feeds, and economic
                            indicators to generate AI-powered analysis. We do not collect,
                            store, or have access to your brokerage accounts, trading
                            positions, or financial transactions.
                        </p>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            3. How We Use Your Information
                        </h2>
                        <ul className="ml-4 list-disc space-y-2">
                            <li>Provide, maintain, and improve the Service</li>
                            <li>Authenticate your identity and secure your account</li>
                            <li>Send important service-related communications (e.g., access codes, security alerts)</li>
                            <li>Analyse usage patterns to improve user experience</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    {/* 4 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            4. Third-Party Services
                        </h2>
                        <p>
                            We use the following third-party services to power the platform:
                        </p>
                        <ul className="ml-4 mt-2 list-disc space-y-2">
                            <li>
                                <strong className="text-zinc-300">OpenRouter AI</strong> — For
                                generating AI-powered market analysis. Your personal data is not
                                shared with AI models.
                            </li>
                            <li>
                                <strong className="text-zinc-300">TradingView</strong> — For
                                embedded chart widgets. TradingView&apos;s own privacy policy
                                applies to their widgets.
                            </li>
                            <li>
                                <strong className="text-zinc-300">Yahoo Finance</strong> — For
                                market data and news headlines. No personal data is shared.
                            </li>
                        </ul>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            5. Data Security
                        </h2>
                        <p>
                            We implement industry-standard security measures including
                            encrypted data transmission (HTTPS/TLS), hashed password storage,
                            and secure session management. However, no method of electronic
                            transmission or storage is 100% secure, and we cannot guarantee
                            absolute security.
                        </p>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            6. Cookies & Local Storage
                        </h2>
                        <p>
                            We use session cookies for authentication and local/session storage
                            for caching AI analysis results and calendar data to improve
                            loading performance. These are functional in nature and not used
                            for advertising or tracking.
                        </p>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            7. Data Retention
                        </h2>
                        <p>
                            We retain your account data for as long as your account is active.
                            Cached AI analysis is temporary (typically 1–2 hours) and
                            automatically purged. You may request account deletion at any time
                            by contacting us.
                        </p>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            8. Your Rights
                        </h2>
                        <p>You have the right to:</p>
                        <ul className="ml-4 mt-2 list-disc space-y-2">
                            <li>Access and download your personal data</li>
                            <li>Request correction or deletion of your data</li>
                            <li>Withdraw consent at any time</li>
                            <li>Lodge a complaint with a data protection authority</li>
                        </ul>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            9. Children&apos;s Privacy
                        </h2>
                        <p>
                            The Service is not intended for individuals under the age of 18.
                            We do not knowingly collect personal information from children.
                        </p>
                    </section>

                    {/* 10 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            10. Changes to This Policy
                        </h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will
                            notify you of material changes by posting a notice on the Service
                            or sending an email. Your continued use of the Service after
                            changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            Contact Us
                        </h2>
                        <p>
                            If you have questions about this Privacy Policy, please reach out
                            to us at{" "}
                            <span className="text-zinc-300 font-medium">support@gettradingbias.com</span>.
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.04] bg-[#050508]">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
                    <p className="text-[11px] text-zinc-700">
                        © GetTradingBias. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-[11px] text-zinc-600 hover:text-zinc-400">Privacy</Link>
                        <Link href="/terms" className="text-[11px] text-zinc-600 hover:text-zinc-400">Terms</Link>
                        <Link href="/disclaimer" className="text-[11px] text-zinc-600 hover:text-zinc-400">Disclaimer</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
