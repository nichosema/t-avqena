import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { conversation } = await req.json();
    if (!conversation || conversation.trim().length < 10) {
      return Response.json({ error: "Please provide a longer conversation." }, { status: 400 });
    }

    const prompt = `You are Tavqena, a customer-conversation opportunity intelligence engine.
Use only information in the supplied conversation. Never invent customer names, prices, dates, deal values or intent. Distinguish explicit signals from inference.
Return ONLY valid JSON with this schema:
{"priority":"HIGH|MEDIUM|LOW","headline":"short headline","summary":"2-3 sentences","customer_signal":"explicit or strongly supported signal","recommended_action":"specific next action","friction":"main objection or null","opportunity_value":"explicit value or Not provided","suggested_message":"short natural follow-up message","reasoning":"brief evidence-based explanation"}

Conversation:\n${conversation}`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return Response.json(JSON.parse(response.text));
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Analysis failed. Check GEMINI_API_KEY and your Gemini API quota." },
      { status: 500 }
    );
  }
}
