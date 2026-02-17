import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service — GetTradingBias",
    description: "Terms of Service for GetTradingBias AI trading terminal.",
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

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#07070b] text-zinc-300">
            <LegalNav />

            <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
                    Terms of Service
                </h1>
                <p className="mt-2 text-[13px] text-zinc-600">
                    Last updated: February 16, 2026
                </p>

                <div className="mt-12 space-y-10 text-[14px] leading-relaxed text-zinc-400">
                    {/* 1 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using GetTradingBias (&quot;the Service&quot;), you agree to be
                            bound by these Terms of Service (&quot;Terms&quot;). If you do not agree
                            to these Terms, you may not access or use the Service. We reserve
                            the right to modify these Terms at any time, and your continued
                            use constitutes acceptance of any changes.
                        </p>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            2. Description of Service
                        </h2>
                        <p>
                            GetTradingBias is an AI-powered trading analysis platform that provides
                            real-time news aggregation, technical analysis, macro fundamental
                            data, and AI-generated market commentary for informational
                            purposes. The Service does not execute trades, manage funds, or
                            provide personalised financial advice.
                        </p>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            3. User Accounts
                        </h2>
                        <ul className="ml-4 list-disc space-y-2">
                            <li>
                                You must provide accurate and complete registration information.
                            </li>
                            <li>
                                You are responsible for maintaining the confidentiality of your
                                account credentials.
                            </li>
                            <li>
                                You are responsible for all activities that occur under your
                                account.
                            </li>
                            <li>
                                You must notify us immediately of any unauthorised use of your
                                account.
                            </li>
                            <li>
                                We reserve the right to suspend or terminate accounts that
                                violate these Terms.
                            </li>
                        </ul>
                    </section>

                    {/* 4 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            4. Acceptable Use
                        </h2>
                        <p className="mb-3">You agree not to:</p>
                        <ul className="ml-4 list-disc space-y-2">
                            <li>
                                Use the Service for any unlawful purpose or in violation of
                                any applicable regulations
                            </li>
                            <li>
                                Attempt to gain unauthorised access to the Service or its
                                related systems
                            </li>
                            <li>
                                Reverse-engineer, decompile, or disassemble any part of the
                                Service
                            </li>
                            <li>
                                Scrape, crawl, or use automated tools to extract data from the
                                Service without permission
                            </li>
                            <li>
                                Redistribute, resell, or commercially exploit the AI-generated
                                analysis without written permission
                            </li>
                            <li>
                                Use the Service to manipulate markets or engage in market abuse
                            </li>
                        </ul>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            5. Intellectual Property
                        </h2>
                        <p>
                            All content, features, and functionality of the Service — including
                            but not limited to text, graphics, logos, AI-generated analysis,
                            software, and design — are owned by GetTradingBias and protected by
                            intellectual property laws. You may not copy, modify, distribute,
                            sell, or lease any part of the Service without express written
                            permission.
                        </p>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            6. AI-Generated Content
                        </h2>
                        <p>
                            The Service uses artificial intelligence to generate market
                            analysis, bias assessments, and trading summaries. This content:
                        </p>
                        <ul className="ml-4 mt-2 list-disc space-y-2">
                            <li>Is generated algorithmically and may contain inaccuracies</li>
                            <li>Does not constitute financial advice or recommendations</li>
                            <li>Should not be the sole basis for any trading decision</li>
                            <li>
                                May not reflect the most current market conditions due to
                                caching and processing delays
                            </li>
                        </ul>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            7. Third-Party Content & Services
                        </h2>
                        <p>
                            The Service integrates with third-party services including
                            TradingView (charts), Yahoo Finance (market data), and OpenRouter
                            (AI models). We do not control and are not responsible for the
                            content, accuracy, or availability of these third-party services.
                            Your use of third-party features is subject to their respective
                            terms of service.
                        </p>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            8. Limitation of Liability
                        </h2>
                        <p>
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, GETTRADINGBIAS SHALL NOT BE
                            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                            PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS,
                            DATA, OR GOODWILL, ARISING FROM YOUR USE OF OR INABILITY TO USE
                            THE SERVICE. IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE
                            AMOUNT YOU HAVE PAID US IN THE TWELVE (12) MONTHS PRECEDING THE
                            CLAIM.
                        </p>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            9. Disclaimer of Warranties
                        </h2>
                        <p>
                            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
                            WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT
                            NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                            PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT
                            THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
                        </p>
                    </section>

                    {/* 10 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            10. Indemnification
                        </h2>
                        <p>
                            You agree to indemnify and hold harmless GetTradingBias, its officers,
                            directors, employees, and agents from any claims, damages, losses,
                            or expenses (including legal fees) arising out of your use of the
                            Service, your violation of these Terms, or your violation of any
                            rights of a third party.
                        </p>
                    </section>

                    {/* 11 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            11. Termination
                        </h2>
                        <p>
                            We may suspend or terminate your access to the Service at any time,
                            with or without cause, with or without notice. Upon termination,
                            your right to use the Service immediately ceases. Provisions that
                            by their nature should survive termination will survive.
                        </p>
                    </section>

                    {/* 12 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            12. Governing Law
                        </h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with
                            the laws of India, without regard to its conflict of law
                            provisions. Any disputes arising under these Terms shall be subject
                            to the exclusive jurisdiction of the courts in India.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            Contact Us
                        </h2>
                        <p>
                            If you have questions about these Terms, please reach out
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
