import { NextResponse } from "next/server";
import { databaseConfigured, findCustomer, createCustomer, updateCustomer, findMessage, createMessage, listInbox } from "../../../lib/supabase";
import { extractCustomerIntelligence } from "../../../lib/customer-intelligence";

export async function GET() {
  if (!databaseConfigured()) return NextResponse.json({ ok: true, configured: false, customers: [], messages: [] });
  try { return NextResponse.json({ ok: true, configured: true, ...(await listInbox()) }); }
  catch (error) { return NextResponse.json({ ok: false, error: error.message }, { status: 500 }); }
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!databaseConfigured()) return NextResponse.json({ ok: false, error: "Supabase is not configured" }, { status: 503 });
  const message = { channel: body.channel || "Unknown", externalId: body.externalId || "unknown", customerName: body.customerName || body.customer || `${body.channel || "Social"} customer`, messageId: body.messageId || body.id || null, text: body.text || body.message || "", timestamp: body.timestamp || new Date().toISOString(), direction: body.direction || "inbound", raw: body.raw || null };
  try {
    const duplicate = await findMessage(message.channel, message.messageId);
    if (duplicate) return NextResponse.json({ ok: true, duplicate: true, message: duplicate });

    let customer = await findCustomer(message.channel, message.externalId);
    const intelligence = message.direction === "inbound" ? extractCustomerIntelligence(message.text) : {};

    if (!customer) {
      customer = await createCustomer({
        channel: message.channel,
        external_id: message.externalId,
        name: message.customerName,
        status: "New",
        ...intelligence
      });
    } else {
      const updates = {};
      if (message.customerName && message.customerName !== customer.name) updates.name = message.customerName;
      for (const [key, value] of Object.entries(intelligence)) {
        if (value !== null && value !== undefined && value !== "" && (!customer[key] || key === "notes")) updates[key] = value;
      }
      if (Object.keys(updates).length) customer = await updateCustomer(customer.id, updates);
    }

    const storedMessage = await createMessage({
      customer_id: customer.id,
      external_message_id: message.messageId,
      channel: message.channel,
      direction: message.direction,
      text: message.text,
      timestamp: message.timestamp,
      raw: message.raw
    });

    return NextResponse.json({ ok: true, customer, intelligence, message: storedMessage }, { status: 201 });
  } catch (error) {
    console.error("Inbox persistence failed", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
