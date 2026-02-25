const express = require("express");
const router = express.Router();
const axios = require("axios");
const AI_URL = process.env.AI_URL;

// ✅ Slug Generator
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ✅ Random SKU Generator (fallback)
function generateSKU(name) {
  const prefix = name.substring(0, 4).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${random}`;
}

router.post("/generate-description", async (req, res) => {
  try {
    const { productName, shortDescription } = req.body;

    if (!productName) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    const prompt = `
        You are a backend JSON API.

        You MUST follow ALL rules below.

        RULES:
        1. Output must be valid parsable JSON.
        2. Output must start with { and end with }.
        3. Do NOT add any explanation.
        4. Do NOT add any text before or after JSON.
        5. Do NOT rename keys.
        6. Do NOT use snake_case.
        7. All keys must be camelCase exactly as given.
        8. All values must be filled. No empty string allowed.
        9. Generate realistic ecommerce SEO optimized content.

        REQUIRED JSON FORMAT:

        {
        "shortDescription": "string",
        "productDescription": "string",
        "sku": "string",
        "metaTitle": "string",
        "metaDescription": "string",
        "metaKeywords": "string"
        }

        DATA:
        Product Name: ${productName}
        Short Description Input: ${shortDescription || "Not provided"}

        IMPORTANT:
        - shortDescription = 15-25 words
        - productDescription = 120-180 words
        - metaTitle = max 60 characters
        - metaDescription = max 160 characters
        - metaKeywords = comma separated SEO keywords
        - sku = 6-10 character alphanumeric code

        Now generate the JSON.
        `;

    const response = await axios.post(AI_URL, {
      model: "phi3:mini",
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 600,
      },
    });
    let aiText = response.data.response;

    console.log("AI RAW RESPONSE:", aiText);

    // ✅ Extract JSON safely (if AI adds extra text)
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({
        success: false,
        message: "AI did not return valid JSON structure",
        raw: aiText,
      });
    }

    let parsedData;

    try {
      parsedData = JSON.parse(jsonMatch[0]);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "AI JSON parse failed",
        raw: aiText,
      });
    }

    // ✅ Normalize keys (AI-proof mapping)
    const normalizedData = {
      shortDescription:
        parsedData.shortDescription ||
        parsedData.short_description ||
        parsedData.shortDescripion ||
        "",

      productDescription:
        parsedData.productDescription ||
        parsedData.product_desc ||
        parsedData.productDescripion ||
        "",

      sku: parsedData.sku || generateSKU(productName),

      metaTitle: parsedData.metaTitle || parsedData.meta_title || productName,

      metaDescription:
        parsedData.metaDescription ||
        parsedData.meta_description ||
        parsedData.metaDescripion ||
        "",

      metaKeywords:
        parsedData.metaKeywords || parsedData.meta_keywords || productName,

      slug: generateSlug(productName), // ✅ Auto slug added
    };

    return res.json({
      success: true,
      data: [normalizedData],
    });
  } catch (error) {
    console.error("AI ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "AI generation failed",
    });
  }
});

router.post("/generate-blog", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Blog title required",
      });
    }

    // ✅ Strong & Controlled Prompt
    const prompt = `
You are a professional SEO blog writer.

Return ONLY raw valid JSON.
Do NOT use markdown.
Do NOT wrap in \`\`\`.

Strictly return this format:

{
  "content": "FULL BLOG HERE"
}

Write a detailed 250-350 word SEO optimized blog about:

"${title}"

Requirements:
- Minimum 250 words
- Use engaging introduction
- Use 3-4 short paragraphs
- Add small FAQ section at end
- Do NOT return short title
- Do NOT summarize
- Write full detailed blog content inside content field
`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "phi3:mini",
      prompt,
      stream: false,
      options: {
        temperature: 0.4,
        num_predict: 500,
      },
    });

    if (!response.data || !response.data.response) {
      return res.status(500).json({
        success: false,
        message: "Empty response from AI",
      });
    }

    let aiText = response.data.response.trim();

    // ✅ Remove markdown wrappers if present
    aiText = aiText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // ✅ Extract JSON safely (first { to last })
    const firstBrace = aiText.indexOf("{");
    const lastBrace = aiText.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON format",
        raw: aiText,
      });
    }

    const jsonString = aiText.substring(firstBrace, lastBrace + 1);

    let parsed;

    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "JSON parsing failed",
        raw: jsonString,
      });
    }

    if (!parsed.content) {
      return res.status(500).json({
        success: false,
        message: "AI did not return blog content",
        raw: parsed,
      });
    }

    return res.json({
      success: true,
      data: {
        content: parsed.content,
      },
    });
  } catch (error) {
    console.error("BLOG GENERATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Blog generation failed",
      error: error.message,
    });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const systemPrompt = `
You are an AI assistant for an ecommerce website.

Your role:
- Help customers find products
- Suggest relevant products
- Answer questions about pricing, offers, discounts
- Explain shipping and delivery time
- Help with returns and refunds
- Be polite, short and professional
- Always respond like a shopping assistant

If user greets → respond friendly.
If user asks unrelated question → politely say you assist only with shopping.
Keep answers short and helpful.
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3:mini",
        prompt: systemPrompt + "\nCustomer: " + message + "\nAssistant:",
        stream: false,
      }),
    });

    const data = await response.json();

    res.json({
      success: true,
      reply: data.response || "No response",
    });
  } catch (error) {
    res.json({
      success: false,
      reply: "Server error occurred.",
    });
  }
});

router.post("/generate-coupon-code", async (req, res) => {
  try {
    const systemPrompt = `
    Generate a coupon code.
    Rules:
    - Exactly 10 characters
    - Uppercase letters and numbers only
    - Output only the code
    - Example: SAVE203456
    `;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3:mini",
        prompt: systemPrompt,
        stream: false,
        options: { temperature: 0.2 },
      }),
    });

    const data = await response.json();

    const rawResponse = data.response || "";
    const match = rawResponse.match(/[A-Z0-9]{6}/);
    const couponCode = match ? match[0] : null;

    res.json({
      success: true,
      reply: couponCode || "FAILED",
    });
  } catch (error) {
    res.json({
      success: false,
      reply: "Server error occurred.",
    });
  }
});

module.exports = router;
