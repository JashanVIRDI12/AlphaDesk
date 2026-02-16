import { NextResponse } from "next/server";
import { createUser } from "@/lib/users";
import { sendCredentialEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fullName, email, phone, organization } = body as {
            fullName?: string;
            email?: string;
            phone?: string;
            organization?: string;
        };

        // ── Validation ──
        if (!fullName?.trim()) {
            return NextResponse.json(
                { error: "Full name is required." },
                { status: 400 },
            );
        }

        if (!email?.trim() || !/\S+@\S+\.\S+/.test(email)) {
            return NextResponse.json(
                { error: "A valid email address is required." },
                { status: 400 },
            );
        }

        // ── Create user ──
        let result;
        try {
            result = createUser({
                fullName: fullName.trim(),
                email: email.trim(),
                phone: phone?.trim() || "",
                organization: organization?.trim() || "",
            });
        } catch (err) {
            if (err instanceof Error && err.message === "EMAIL_EXISTS") {
                return NextResponse.json(
                    {
                        error:
                            "An account with this email already exists. Please sign in with your existing credentials.",
                    },
                    { status: 409 },
                );
            }
            throw err;
        }

        const { user, plainAccessCode } = result;

        // ── Send email ──
        const emailResult = await sendCredentialEmail({
            to: user.email,
            fullName: user.fullName,
            terminalId: user.terminalId,
            accessCode: plainAccessCode,
            organization: user.organization || undefined,
        });

        // ── Response ──
        return NextResponse.json({
            success: true,
            terminalId: user.terminalId,
            accessCode: plainAccessCode,
            email: user.email,
            fullName: user.fullName,
            emailSent: emailResult.sent,
        });
    } catch (err) {
        console.error("Registration error:", err);
        return NextResponse.json(
            { error: "Internal server error. Please try again." },
            { status: 500 },
        );
    }
}
