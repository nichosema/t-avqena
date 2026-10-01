import { NextResponse } from "next/server";

const channels = new Set(["WhatsApp", "Facebook", "Instagram", "Email"]);

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const channel = body.channel;
  if (!channels.has(channel)) {
    return NextResponse.json({ ok: false, error: "Unsupported channel" }, { status: 400 });
  }

  const envReady = channel === "Email"
    ? Boolean(process.env.EMAIL_WEBHOOK_SECRET)
    : Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET && process.env.META_VERIFY_TOKEN);

  return NextResponse.json({
    ok: true,
    channel,
    status: envReady ? "credentials_ready" : "awaiting_credentials",
    next: envReady ? "Complete OAuth and webhook setup." : "Add the required provider environment variables in your deployment settings."
  });
}
