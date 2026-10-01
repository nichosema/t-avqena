import { NextResponse } from "next/server";
import { normalizeSocialEvent } from "../../../lib/social-normalizer";

const inboxUrl = () => {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  return base ? `${base.startsWith("http") ? base : `https://${base}`}/api/inbox` : null;
};

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
  const normalized = normalizeSocialEvent(payload);
  let stored = 0;
  const url = inboxUrl();
  if (url) {
    for (const message of normalized) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(message),
          cache: "no-store"
        });
        if (response.ok) stored += 1;
      } catch (error) {
        console.error("Inbox handoff failed", error);
      }
    }
  }
  console.log("Tavqena normalized social events", JSON.stringify(normalized));
  return NextResponse.json({ received: true, count: normalized.length, stored, messages: normalized });
}
