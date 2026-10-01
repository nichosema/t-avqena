import { NextResponse } from "next/server";

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
  console.log("Tavqena social webhook received", JSON.stringify(payload));
  return NextResponse.json({ received: true });
}
