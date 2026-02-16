import nodemailer from "nodemailer";

/* ──── types ──── */

interface CredentialEmailParams {
  to: string;
  fullName: string;
  terminalId: string;
  accessCode: string;
  organization?: string;
}

/* ──── transporter ──── */

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/* ──── email template ──── */

function buildCredentialEmail(params: CredentialEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Your AlphaDesk Terminal Credentials`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#09090b; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:520px; margin:0 auto; padding:40px 20px;">
    
    <!-- Header -->
    <div style="text-align:center; margin-bottom:32px;">
      <div style="display:inline-block; padding:8px 16px; border:1px solid rgba(255,255,255,0.1); border-radius:12px; background:rgba(255,255,255,0.03);">
        <span style="color:#a1a1aa; font-size:11px; letter-spacing:2px; text-transform:uppercase;">AlphaDesk</span>
      </div>
    </div>

    <!-- Main Card -->
    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:32px; margin-bottom:20px;">
      
      <h1 style="color:#fafafa; font-size:20px; font-weight:600; margin:0 0 8px;">
        Welcome, ${params.fullName}
      </h1>
      <p style="color:#71717a; font-size:14px; line-height:1.6; margin:0 0 28px;">
        Your institutional trading terminal access has been provisioned. Use the credentials below to sign in.
      </p>

      <!-- Terminal ID -->
      <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px; margin-bottom:12px;">
        <div style="color:#71717a; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:8px;">Terminal ID</div>
        <div style="color:#fafafa; font-size:22px; font-weight:700; font-family:'Courier New',monospace; letter-spacing:2px;">
          ${params.terminalId}
        </div>
      </div>

      <!-- Access Code -->
      <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px; margin-bottom:24px;">
        <div style="color:#71717a; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:8px;">Access Code</div>
        <div style="color:#fafafa; font-size:22px; font-weight:700; font-family:'Courier New',monospace; letter-spacing:2px;">
          ${params.accessCode}
        </div>
      </div>

      <!-- CTA Button -->
      <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}" 
         style="display:block; text-align:center; padding:14px 24px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fafafa; text-decoration:none; font-size:14px; font-weight:500;">
        Sign in to Terminal →
      </a>
    </div>

    <!-- Warning -->
    <div style="background:rgba(234,179,8,0.04); border:1px solid rgba(234,179,8,0.1); border-radius:12px; padding:14px 16px; margin-bottom:20px;">
      <p style="color:rgba(234,179,8,0.7); font-size:12px; line-height:1.5; margin:0;">
        <strong style="color:rgba(234,179,8,0.9);">Security Notice:</strong> 
        Keep your credentials secure. Do not share your access code with anyone. 
        AlphaDesk will never ask for your access code via email or phone.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding-top:12px;">
      <p style="color:#3f3f46; font-size:11px; margin:0;">
        256-bit TLS encrypted · Institutional grade security
      </p>
      <p style="color:#27272a; font-size:10px; margin:8px 0 0;">
        © ${new Date().getFullYear()} AlphaDesk. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>`;

  const text = `
AlphaDesk — Terminal Credentials

Welcome, ${params.fullName}

Your institutional trading terminal access has been provisioned.

Terminal ID: ${params.terminalId}
Access Code: ${params.accessCode}

Sign in at: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}

Security Notice: Keep your credentials secure. Do not share your access code with anyone.

© ${new Date().getFullYear()} AlphaDesk
`;

  return { subject, html, text };
}

/* ──── send ──── */

export async function sendCredentialEmail(
  params: CredentialEmailParams,
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("──────────────────────────────────────────");
    console.log("📧 EMAIL NOT CONFIGURED — Credentials:");
    console.log(`   To: ${params.to}`);
    console.log(`   Name: ${params.fullName}`);
    console.log(`   Terminal ID: ${params.terminalId}`);
    console.log(`   Access Code: ${params.accessCode}`);
    console.log("──────────────────────────────────────────");
    console.log("To enable email delivery, add these to .env:");
    console.log("   SMTP_HOST=smtp.gmail.com");
    console.log("   SMTP_PORT=587");
    console.log("   SMTP_USER=your-email@gmail.com");
    console.log("   SMTP_PASS=your-app-password");
    console.log("   SMTP_FROM=AlphaDesk <your-email@gmail.com>");
    console.log("──────────────────────────────────────────");
    return { sent: false, error: "SMTP not configured" };
  }

  const { subject, html, text } = buildCredentialEmail(params);
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from,
      to: params.to,
      subject,
      html,
      text,
    });
    console.log(`📧 Credentials emailed to ${params.to}`);
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`📧 Email failed: ${message}`);
    return { sent: false, error: message };
  }
}
