const fetch = require("node-fetch");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.warn("AI_SERVICE: OPENROUTER_API_KEY is not defined");
}

function sanitizeInput(text) {
  if (!text || typeof text !== "string") return "";
  // remove control characters and backticks that could break prompt structure
  return text.replace(/[`\n\r]/g, " ").trim();
}

function extractFirstJsonObject(rawText) {
  if (!rawText || typeof rawText !== "string") return null;
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  return rawText.slice(start, end + 1);
}

function fallbackIntentFromMessage(message) {
  const text = sanitizeInput(message).toLowerCase();
  const orderIdMatch = text.match(/\b\d{1,12}\b/);
  const orderId = orderIdMatch ? orderIdMatch[0] : undefined;

  if (text.includes("cancel") && text.includes("order")) {
    return { intent: "cancel_order", orderId };
  }
  if (
    text.includes("track") ||
    text.includes("status") ||
    text.includes("where is my order")
  ) {
    return { intent: "track_order", orderId };
  }
  if (text.includes("order id") || text.includes("order number")) {
    return { intent: "ask_order_id" };
  }
  if (
    text.includes("find") ||
    text.includes("search") ||
    text.includes("show") ||
    text.includes("looking for") ||
    text.includes("buy")
  ) {
    return { intent: "product_search", query: text };
  }
  return {
    intent: "normal_chat",
    reply:
      "I can help with product search, order tracking, and order cancellation. Please share your request.",
  };
}

async function callModel(messages, options = {}) {
  if (!API_KEY) {
    throw new Error("OPENROUTER_API_KEY missing");
  }

  const payload = {
    model: "meta-llama/llama-3-8b-instruct",
    temperature: 0,
    max_tokens: 150,
    messages,
    ...options,
  };

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    timeout: 10000, // 10s timeout
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`LLM HTTP ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  if (!data.choices || !data.choices.length) {
    throw new Error("empty choices from LLM");
  }
  return data.choices[0].message.content;
}

/**
 * Returns parsed JSON from the model when asked to detect intent.
 */
async function detectIntent(message) {
  const sanitized = sanitizeInput(message);
  const systemPrompt = `You are an ecommerce AI assistant.\n
The customer will send a user message. You must only ever reply with valid JSON, nothing else.\nYou are NOT allowed to invent facts or data. Always operate strictly on the information contained in the user message or additional context provided by the application. If you are unsure, set "intent" to "normal_chat".\n
Allowed intents and output format:\n{
  "intent": "cancel_order|track_order|ask_order_id|confirm_action|normal_chat|product_search",
  "orderId": "optional string if order related",
  "query": "optional search query for product_search",
  "reply": "optional friendly text when appropriate"
}\n
For product_search intent, populate the "query" field with the customer’s search terms.\n
Respond only with JSON and nothing else.`;

  const userMsg = `Customer: ${sanitized}`;
  try {
    const raw = await callModel([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMsg },
    ]);
    const jsonString = extractFirstJsonObject(raw);
    if (!jsonString) {
      throw new Error("No JSON object found in model response");
    }
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("AI_SERVICE.detectIntent fallback", err.message);
    return fallbackIntentFromMessage(message);
  }
}

/**
 * Given a context (typically prepared from database rows) and the original user message,
 * ask the model to craft a response. Context should already be sanitized.
 */
async function generateResponseWithContext(context, userMessage) {
  const sanitized = sanitizeInput(userMessage);
  const systemPrompt = `You are an ecommerce shopping assistant. Use ONLY the information supplied in the context section below when answering. Do NOT hallucinate or attempt to guess any other facts. If you cannot answer with the provided data, say "I don't know".\n
Context:`;

  const messages = [
    { role: "system", content: systemPrompt + "\n" + context },
    { role: "user", content: `Customer: ${sanitized}` },
  ];
  try {
    const raw = await callModel(messages, { max_tokens: 300 });
    // model may still wrap in quotes etc, we just return raw
    return raw;
  } catch (err) {
    console.error(
      "AI_SERVICE.generateResponseWithContext fallback",
      err.message,
    );
    return context === "No matching products found."
      ? "No matching products found for your query. Please share product name, brand, or category."
      : context;
  }
}

module.exports = { detectIntent, generateResponseWithContext };
