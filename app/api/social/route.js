import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    channels: ["WhatsApp", "Facebook Messenger", "Instagram", "Email"],
    status: "ready",
    message: "Social connection endpoints are ready for provider credentials and webhooks."
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const channel = body.channel || "unknown";
  return NextResponse.json({
    ok: true,
    channel,
    mode: "connection-ready",
    message: `Tavqena is ready to receive ${channel} integration credentials.`
  });
}
