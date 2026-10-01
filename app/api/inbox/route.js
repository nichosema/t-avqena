import { NextResponse } from "next/server";

const messages = [];
const customers = new Map();

export async function GET() {
  return NextResponse.json({ ok: true, messages, customers: [...customers.values()] });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const message = {
    id: body.id || crypto.randomUUID(),
    messageId: body.messageId || body.id || null,
    channel: body.channel || "Unknown",
    externalId: body.externalId || "unknown",
    customerName: body.customerName || body.customer || `${body.channel || "Social"} customer`,
    text: body.text || body.message || "",
    timestamp: body.timestamp || new Date().toISOString(),
    direction: body.direction || "inbound"
  };
  if (!messages.some(x => message.messageId && x.messageId === message.messageId)) messages.unshift(message);
  const key = `${message.channel}:${message.externalId}`;
  const existing = customers.get(key) || {
    id: crypto.randomUUID(), channel: message.channel, externalId: message.externalId,
    name: message.customerName, status: "New", messages: []
  };
  existing.name = message.customerName || existing.name;
  existing.updatedAt = new Date().toISOString();
  existing.messages.push(message);
  customers.set(key, existing);
  return NextResponse.json({ ok: true, message, customer: existing }, { status: 201 });
}
