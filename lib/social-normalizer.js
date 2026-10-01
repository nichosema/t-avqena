// Convert provider-specific webhook events into one Tavqena conversation shape.
// This lets WhatsApp and Facebook share the same inbox/CRM pipeline.

export function normalizeSocialEvent(payload = {}) {
  if (payload.object === "whatsapp_business_account") return normalizeWhatsApp(payload);
  if (payload.object === "page") return normalizeFacebook(payload);
  return [];
}

function normalizeWhatsApp(payload) {
  const out = [];
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const contacts = value.contacts || [];
      const messages = value.messages || [];
      for (const message of messages) {
        const contact = contacts.find(c => c.wa_id === message.from) || contacts[0] || {};
        out.push({
          id: `whatsapp:${message.id || crypto.randomUUID()}`,
          channel: "WhatsApp",
          externalId: message.from || "unknown",
          customerName: contact.profile?.name || message.from || "WhatsApp customer",
          messageId: message.id || null,
          text: extractWhatsAppText(message),
          timestamp: message.timestamp ? new Date(Number(message.timestamp) * 1000).toISOString() : new Date().toISOString(),
          direction: "inbound",
          raw: message
        });
      }
    }
  }
  return out;
}

function normalizeFacebook(payload) {
  const out = [];
  for (const entry of payload.entry || []) {
    for (const event of entry.messaging || []) {
      if (!event.message) continue;
      out.push({
        id: `facebook:${event.message.mid || crypto.randomUUID()}`,
        channel: "Facebook Messenger",
        externalId: event.sender?.id || "unknown",
        customerName: event.sender?.id || "Facebook customer",
        messageId: event.message.mid || null,
        text: event.message.text || "[Non-text Facebook message]",
        timestamp: event.timestamp ? new Date(event.timestamp).toISOString() : new Date().toISOString(),
        direction: "inbound",
        raw: event
      });
    }
  }
  return out;
}

function extractWhatsAppText(message) {
  if (message.type === "text") return message.text?.body || "";
  if (message.type === "button") return message.button?.text || "[WhatsApp button]";
  if (message.type === "interactive") {
    return message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "[WhatsApp interactive message]";
  }
  return `[WhatsApp ${message.type || "message"}]`;
}
