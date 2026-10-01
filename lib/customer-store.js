const CUSTOMERS_KEY = "tavqena_customers";
const INBOX_KEY = "tavqena_inbox";

export function upsertCustomer(customer) {
  const customers = readLocal(CUSTOMERS_KEY);
  const identity = `${customer.channel || ""}:${customer.externalId || ""}`;
  const index = customers.findIndex(c => `${c.channel || ""}:${c.externalId || ""}` === identity);
  const existing = index >= 0 ? customers[index] : null;
  const next = {
    id: existing?.id || customer.id || crypto.randomUUID(),
    channel: customer.channel || existing?.channel || "Unknown",
    externalId: customer.externalId || existing?.externalId || "unknown",
    product: customer.product || existing?.product || "Not detected",
    price: customer.price || existing?.price || "Not detected",
    budget: customer.budget || existing?.budget || "Not stated",
    quantity: customer.quantity || existing?.quantity || "Not stated",
    location: customer.location || existing?.location || "Not detected",
    requirements: customer.requirements || existing?.requirements || "Not detected",
    status: existing?.status || "New",
    name: customer.name || existing?.name || `${customer.channel || "Social"} customer`,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [...(existing?.messages || []), ...(customer.messages || [])],
    notes: existing?.notes || ""
  };
  if (index >= 0) customers[index] = next; else customers.unshift(next);
  writeLocal(CUSTOMERS_KEY, customers);
  return next;
}

export function addInboxMessage(message) {
  const inbox = readLocal(INBOX_KEY);
  if (message.messageId && inbox.some(x => x.messageId === message.messageId)) return inbox;
  inbox.unshift({ ...message, receivedAt: new Date().toISOString() });
  writeLocal(INBOX_KEY, inbox.slice(0, 500));
  return inbox;
}

function readLocal(key) {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function writeLocal(key, value) {
  if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}
