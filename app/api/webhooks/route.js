import { NextResponse } from "next/server";
import { normalizeSocialEvent } from "../../../lib/social-normalizer";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = searchParams.get("hub.verify_token");
  if (challenge && verifyToken && verifyToken === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ ok: true, endpoint: "Tavqena social webhook" });
}

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const messages = normalizeSocialEvent(payload);
  console.log("Tavqena normalized social events", JSON.stringify(messages));
  return NextResponse.json({ received: true, count: messages.length, messages });
}
