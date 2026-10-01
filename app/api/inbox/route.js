import { NextResponse } from "next/server";

const demoMessages = [
  { id: "wa-1", channel: "WhatsApp", customer: "New inquiry", preview: "Hi, is the black sofa still available?", time: "Just now", unread: true },
  { id: "fb-1", channel: "Facebook", customer: "Facebook customer", preview: "How much is delivery to Kampala?", time: "8 min ago", unread: true },
  { id: "wa-2", channel: "WhatsApp", customer: "Returning customer", preview: "I would like two pieces.", time: "24 min ago", unread: false }
];

export async function GET() {
  return NextResponse.json({ ok: true, messages: demoMessages });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    message: {
      id: crypto.randomUUID(),
      channel: body.channel || "WhatsApp",
      customer: body.customer || "New customer",
      preview: body.message || "",
      time: "Just now",
      unread: true
    }
  }, { status: 201 });
}
