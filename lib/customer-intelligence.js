const LOCATION_PATTERNS = [
  /\b(?:deliver(?:y)?|delivery|ship(?:ping)?|located?|location|in|to|at|near)\s+(?:to\s+)?([A-Za-z][A-Za-z .'-]{2,40})/i,
  /\b(?:kampala|ntinda|entebbe|wakiso|masaka|mbarara|jinja|mukono|kira|najjanankumbi|nansana|kawempe|makindye|kololo|bugolobi|muyenga|lubowa|kiira|gayaza|matugga|seeta)\b/i
];

function clean(value) {
  if (!value) return null;
  return value.replace(/[.,!?;:]+$/g, "").replace(/\s+/g, " ").trim() || null;
}

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return clean(match[1] || match[0]);
  }
  return null;
}

export function extractCustomerIntelligence(text = "") {
  const value = String(text).trim();
  if (!value) return {};

  const priceMatch = value.match(/(?:UGX|USh|shs?|ksh|\$|€|£)\s*([\d,]+(?:\.\d+)?(?:\s*[kKmM])?)/i)
    || value.match(/\b([\d,]+(?:\.\d+)?)\s*(?:UGX|USh|shs?)\b/i);
  const budgetMatch = value.match(/\b(?:budget|spend|afford|up to|max(?:imum)?)\s*(?:is|of|around|about)?\s*(?:UGX|USh|shs?|\$|€|£)?\s*([\d,]+(?:\.\d+)?(?:\s*[kKmM])?)/i);
  const quantityMatch = value.match(/\b(?:qty|quantity|need|want|buy|looking for|order)\s*(?:of\s*)?(\d+)\b/i)
    || value.match(/\b(\d+)\s*(?:pcs?|pieces?|items?|units?)\b/i);
  const productMatch = value.match(/\b(?:for|need|want|looking for|buy|purchase|order)\s+(?:a|an|the|some)?\s*([A-Za-z0-9][A-Za-z0-9 &'\/-]{2,60}?)(?=\s+(?:for|at|in|to|near|under|with|and|delivered?|delivery|shipping)\b|[?.!,]|$)/i);
  const location = firstMatch(value, LOCATION_PATTERNS);

  const requirements = [];
  if (/deliver|delivery|ship|shipping/i.test(value)) requirements.push("Delivery requested");
  if (/install|installation/i.test(value)) requirements.push("Installation requested");
  if (/urgent|today|asap|tomorrow/i.test(value)) requirements.push("Urgent timing");
  if (/new|brand new/i.test(value)) requirements.push("New item requested");
  if (/used|second hand|second-hand/i.test(value)) requirements.push("Used item requested");

  const result = {
    product: clean(productMatch?.[1]),
    price: clean(priceMatch?.[1]),
    budget: clean(budgetMatch?.[1]),
    quantity: quantityMatch ? Number(quantityMatch[1]) : null,
    location,
    requirements: requirements.length ? requirements.join(", ") : null,
    notes: value
  };

  return Object.fromEntries(Object.entries(result).filter(([, v]) => v !== null && v !== ""));
}
