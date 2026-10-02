const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function databaseConfigured() {
  return Boolean(url && key);
}

async function request(path, options = {}) {
  if (!databaseConfigured()) throw new Error("Supabase is not configured");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: options.method === "POST" ? "return=representation" : "",
      ...(options.headers || {})
    },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

export async function findCustomer(channel, externalId) {
  const rows = await request(`customers?channel=eq.${encodeURIComponent(channel)}&external_id=eq.${encodeURIComponent(externalId)}&limit=1`);
  return rows?.[0] || null;
}

export async function createCustomer(data) {
  const rows = await request("customers", { method: "POST", body: JSON.stringify(data) });
  return rows?.[0];
}

export async function updateCustomer(id, data) {
  const rows = await request(`customers?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
    headers: { Prefer: "return=representation" }
  });
  return rows?.[0];
}

export async function findMessage(channel, externalMessageId) {
  if (!externalMessageId) return null;
  const rows = await request(`messages?channel=eq.${encodeURIComponent(channel)}&external_message_id=eq.${encodeURIComponent(externalMessageId)}&limit=1`);
  return rows?.[0] || null;
}

export async function createMessage(data) {
  const rows = await request("messages", { method: "POST", body: JSON.stringify(data) });
  return rows?.[0];
}

export async function listInbox() {
  const customers = await request("customers?select=*&order=updated_at.desc");
  const messages = await request("messages?select=*&order=timestamp.desc&limit=500");
  return { customers, messages };
}
